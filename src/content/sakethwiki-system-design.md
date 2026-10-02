I wrote a short [build log](#/writing/review-gated-knowledge-system) about the decisions behind SakethWiki. This is the other half: the system design. What are the parts, how does data move, what breaks, and what did each choice cost?

## Where it came from

Two things pushed me to build it.

The first was a note-taking course I was studying. It made one point clear: notes that only pile up don't help you. Notes help when you keep reshaping them as you learn.

The second was Andrej Karpathy's [LLM wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), dated April 4, 2026. His argument is about how most RAG works. A RAG system retrieves raw document chunks at question time, so it rebuilds the same understanding every time. His alternative is a wiki the model maintains, "a persistent, compounding artifact". Three layers: raw sources that never change, wiki pages the model writes, and a schema that says how to behave. Three jobs: ingest new sources, answer questions, and lint the wiki for contradictions, stale claims, and orphan pages.

I liked the argument and wanted to run it for real. SakethWiki is my version. The part I added on my own is the review gate. In my version the model proposes and I decide, because a wiki that quietly absorbs a wrong summary is worse than one that missed an article.

## What it has to do

1. Take in a URL, pasted text, or a screenshot from a laptop or a phone.
2. Turn it into a proposed change to a page, and let me approve it first.
3. Keep each page's current understanding up to date as new sources arrive.
4. Answer questions from my own pages, and show which pages it used.
5. Tell me when the wiki is drifting: contradictions, orphans, thin pages.

It does not have to serve other users, work offline on a phone, or scale past one person's notes. Those non-goals are what keep it small.

## Complexity tier

**Single-process local app.** One FastAPI process, one React front end, and a folder of Markdown files with a SQLite index beside it. There is no queue service, no hosted database, and no vector store to run.

This tier is right because there is one user and the data fits on a laptop. I measured where it would stop being right. My vault has 222 pages across the folders it indexes. I tested bigger vaults by building synthetic ones from copies of my real pages, on this Mac, with lexical search only (embeddings off). These are single runs, and I estimated tokens at four characters each.

| Pages | First full index build | Search per query | Health-check prompt |
|---|---|---|---|
| 100 | 0.2 s | 2 ms | about 30,000 tokens |
| 500 | 5 s | 6 ms | about 148,000 tokens |
| 1,000 | 19 s | 11 ms | about 297,000 tokens |
| 2,000 | 80 s | 23 ms | about 592,000 tokens |

Search and indexing are not the limit. The health check is. It sends the start of every page (up to 1,200 characters each) to one model call, so its prompt grows in a straight line with page count. At about 300 tokens per page it would pass a 200,000-token context window at roughly 650 pages. My real vault already needs about 66,000 tokens for it. The first full index build also grows faster than the page count, but that is a one-time cost, because later writes update one page at a time. If it outgrows the tier, the health check is what breaks first, and the fix is to scan in batches. The index does not need replacing.

## The parts

```
 Browser / iOS Shortcut / Web Clipper
              |
              v
   +---------------------------+
   |  FastAPI backend (:8001)  |
   |  ingest | chat | health   |
   +-----+---------+-----------+
         |         |
         v         v
  Review queue   SQLite index  <-- rebuilt from the vault
  (JSON file)    (memory.db)
         |              ^
   approve / edit       | index on write
         v              |
   +-----------------------------+
   |  Vault: Markdown pages      |   source of truth
   |  cs/ science/ ... meta/     |
   +-----------------------------+
         |
         v
   traces.jsonl  -->  weekly analysis  -->  hints for next ingest
```

*Caption: the vault of Markdown files is the source of truth. The queue sits in front of it, the index sits beside it, and the trace log feeds corrections back into the next capture.*

**Capture.** Fetching and parsing a page uses plain HTTP and an HTML parser, with no model. A model is used only for the part that needs judgment: deciding what is worth keeping. It must choose one of three outcomes. Ingest means the source has durable knowledge. Source-only means keep the transferable core of a news item. Reject means it never reaches the queue.

**Review queue.** A JSON file of proposals, each with a UUID. A proposal holds a title, summary, tags, a suggested page, and links. It survives restarts. An item leaves the queue only when I approve or reject it.

**Writer.** This is the only code that changes the vault. It writes to a temporary file and renames it over the target. On the same filesystem a rename is atomic, so a crash leaves either the old page or the new page, never half of one.

**Evolution.** Each page starts with a short current-understanding block. When a new source is approved, a classifier decides how it relates to that block. It extends it, refines it, supersedes it, contradicts it, or duplicates it. A duplicate writes nothing. A contradiction keeps both views and flags them for me. The block is rewritten each time. The sources below it stay as the evidence trail.

**Identity.** Before anything is stored or retrieved, a shared resolver turns names into canonical slugs, so "retrieval augmented generation" and "rag" are one page. If both pages already exist, the system reports it and does not merge them.

**Index and retrieval.** Pages are chunked into a SQLite index. Search is lexical. Semantic embeddings are opt-in. Chat selects pages with this index and no model call, then a model answers from the chosen chunks.

**Maintenance.** The health check is the lint job from Karpathy's pattern. It looks for inconsistencies, missing links, concepts that deserve a page, and orphans. The scan is cached for 24 hours and re-runs when the page list changes. Fixes that are safe, like adding a link or creating a stub, can be applied from the UI. Merges are conservative: weak matches need an explicit override.

**Traces and preferences.** Every approval or rejection is logged with what I changed. A correction becomes a candidate preference. It starts shaping extraction only after it repeats or I approve it. A weekly pass turns patterns into short prompt hints.

## Two paths through the system

**Capture path.** Source arrives, is parsed, extracted into a proposal, queued, reviewed, classified against the existing page, and written. Then the index entry for that one page is updated, and a trace is appended.

**Query path.** Question arrives, the index returns candidate chunks, an optional rerank runs if embeddings are on, and a model answers from them. If the index returns nothing, one keyword scan runs as a fallback. Chat answers can also be marked as a correction, contradiction, example, or nuance. Those marks go into the trace log as evidence. They never edit a page by themselves.

## What happens when things fail

| Failure | What happens |
|---|---|
| Crash during a write | The rename is atomic, so the page is the old one or the new one. |
| App restarts with items in review | The queue file still has them. |
| Index disagrees with the files | Single-page writes update the index directly. A full re-sync runs at startup and on demand. That covers edits I make in Obsidian or after a git pull. |
| Phone capture is slow | An iOS Shortcut gets an immediate "pending" item. Extraction runs in the background and marks the item as failed if it breaks. The UI polls and shows a spinner. |
| A model returns invalid output | Output has to match a strict format. If it doesn't, a task that touches durable pages falls back to a stronger model. |
| Observability backend is down | Langfuse is optional and non-blocking. A failure there never reaches the caller. |

## Decisions and what each cost

| Decision | What I gave up |
|---|---|
| Markdown files are the source of truth, the index is derived | Slower queries than an index-first design, and a re-sync step for outside edits. |
| Nothing is written without review | Every capture costs me a click, and the queue can back up. |
| A rewritten understanding block, not an append-only page | Rewriting can lose nuance. The sources below are the only backup for it. |
| Deterministic rules for page selection and review priority | Less clever than a model. I accept that because I want to know why a page was picked. |
| Slow learning from corrections | The system takes longer to adapt to a new habit. |
| One process, no services | No concurrent users and no remote access. |

## What I had to take out

I added a self-monitoring layer with its own dashboards, action queues, and evals of the system itself. It became more surface to maintain than the loop it watched. I turned it off behind a flag, moved model telemetry to Langfuse, and collapsed retrieval to one path with one fallback. That change removed code and added no features. I would make the same call again.

## Open problems

- Contradictions are flagged, but resolving them is still manual.
- The scale numbers above come from synthetic vaults built from my own pages. A real vault with 1,000 distinct pages might behave differently.

*Code and design docs: [github.com/Sakethv7/SakethWiki](https://github.com/Sakethv7/SakethWiki). The notes feeding it from talks and calls come from [Lekhni](#/writing/lekhni-system-design).*
