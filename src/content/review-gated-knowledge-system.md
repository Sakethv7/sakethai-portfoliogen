Most of what I save, I never read again. Bookmarks, clipped articles, screenshots of slides: they pile up, and the pile gets less useful as it grows. Putting a chatbot on top doesn't fix that. It retrieves from the pile, so it retrieves the noise too.

[SakethWiki](https://github.com/Sakethv7/SakethWiki) is my attempt at the opposite. It's a personal knowledge system where nothing gets in without review, and pages change as my understanding changes. Here are the five decisions that shaped it, and one I had to undo.

## 1. The notes are the source of truth, not the index

Everything lives as plain Markdown in an Obsidian vault. I can open it, edit it, and read it without the app running. Search and chat use a SQLite index built *from* those files, and the index resyncs when files change.

This sounds like a detail, but it decides what happens when something breaks. If the index is wrong, I rebuild it. If the notes were stored only in the index, a bad write would be permanent. The rule I keep coming back to: this is not a RAG app with a wiki attached. The wiki is the product, and retrieval is a service around it.

## 2. Nothing is written without review

When I capture a URL, some text, or a screenshot, a model extracts the key ideas. It doesn't write them to the vault. It puts a proposal in a review queue: which page it belongs on, a summary, tags, links, and sometimes a diagram. I approve, edit, or reject it.

Before summarizing, the extractor has to decide whether the source deserves a page at all:

- **ingest** means it has durable, reusable knowledge
- **source only** means it's mostly news or social context, so only the transferable core is kept
- **reject** means it never reaches the queue

That first question removes more junk than any amount of summarizing.

## 3. Pages evolve instead of piling up

My first version appended every new source to the bottom of the page. Pages became long stacks of summaries that never added up to anything.

Now each page starts with a short **current understanding** block, and it gets rewritten each time something new is approved. Before writing, the system classifies how the new source relates to what's already there:

| Relationship | What happens |
|---|---|
| Extends | Adds detail; understanding stays the same |
| Refines | Sharpens the current understanding |
| Supersedes | Replaces it with something more accurate |
| Contradicts | Both views are kept and flagged for me to resolve |
| Duplicate | Nothing is written |

The sources stay below the block as an evidence trail. The block on top is the part I actually reread.

## 4. Learn from corrections, but slowly

Every approval and rejection is logged as a trace, including what I changed. If the extractor suggests one page and I keep moving the note to another, that's a pattern worth learning.

But one correction isn't a preference. A correction only starts shaping future extractions after it repeats, or after I explicitly approve it. Once a week, a model reads recent traces and writes a few short hints that get added to the extraction prompt. The system improves from how I actually use it, and I can audit every step, because the raw evidence is a plain log file.

## 5. Use a model only where rules fail

Fetching and parsing a web page doesn't need a model, so it doesn't use one. Picking which pages need review is a scoring rule over maturity, links, and staleness, because I want to know *why* a page was picked. Merging duplicate pages only happens automatically when the match is unambiguous. Anything weaker is reported, not merged.

Models do the parts that need judgment: extraction, classifying how sources relate, and answering questions. Tasks that change the vault go to a stronger model than tasks that only produce a draft for me to read.

## What I had to undo

The system got too big. I added a self-monitoring layer with its own dashboards, action queues, and evals of the system's own behavior. Each piece made sense on its own. Together they were more surface to maintain than the core loop they were watching.

Retrieval had the same problem. Every chat question rebuilt the index from disk first. If that found nothing, a model read excerpts of every page to choose context. If *that* found nothing, a keyword scan ran over every file.

So I did a lean refactor. Retrieval now has one path and one fallback. The self-monitoring layer is switched off behind a flag, and model telemetry goes to Langfuse instead of home-grown dashboards. The refactor removed code and added no features, and the tool is better for it.

The lesson I'd pass on: the loop that matters is capture, understand, recall. Anything that doesn't make one of those three better is a cost, even when it's interesting to build.

*Code and design docs: [github.com/Sakethv7/SakethWiki](https://github.com/Sakethv7/SakethWiki). Notes from talks and meetings reach it through [Lekhni](#/writing/lekhni-recording-to-knowledge).*
