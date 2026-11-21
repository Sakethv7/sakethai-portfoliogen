I save many bookmarks, clipped articles and screenshots of slides, and I rarely read most of them again. As the pile grows, it gets harder to use. A chatbot on top of the pile did not help me, because it searches the pile and returns the clutter too.

[SakethWiki](https://github.com/Sakethv7/SakethWiki) is my notes app built the other way. An AI model proposes what to save, and nothing gets in until I review it. Each page changes as my understanding changes. This note covers the five decisions that shaped it, and one I had to undo.

## 1. The notes are the source of truth, not the index

Everything lives as plain Markdown in an Obsidian vault. I can open it, edit it, and read it without the app running. Search and chat use a SQLite index built *from* those files, and the index resyncs when files change.

This choice decides what happens when something breaks. If the index is wrong, I rebuild it from the files. If the notes lived only in the index, a bad write would be permanent. So the notes are the main thing I keep, and search and chat are features built around them.

## 2. Nothing is written without review

When I capture a URL, some text, or a screenshot, a model extracts the key ideas. It doesn't write them to the vault. It puts a proposal in a review queue: which page it belongs on, a summary, tags, links, and sometimes a diagram. I approve, edit, or reject it.

Before summarizing, the extractor has to decide whether the source deserves a page at all:

- **ingest** means it has durable, reusable knowledge
- **source only** means it's mostly news or social context, so only the transferable core is kept
- **reject** means it never reaches the queue

In my use, this first check removes more clutter than better summaries do.

## 3. Pages evolve instead of piling up

My first version appended every new source to the bottom of the page. Pages became long stacks of summaries that never added up to anything.

Now each page starts with a short **current understanding** block, and it gets rewritten each time something new is approved. Before writing, the system classifies how the new source relates to what's already there:

| Relationship | What happens |
|---|---|
| Extends | Adds detail, and understanding stays the same |
| Refines | Sharpens the current understanding |
| Supersedes | Replaces it with something more accurate |
| Contradicts | Both views are kept and flagged for me to resolve |
| Duplicate | Nothing is written |

The sources stay below the block as an evidence trail. The block on top is the part I actually reread.

## 4. Learn from corrections, but slowly

Every approval and rejection is logged as a trace, including what I changed. If the extractor suggests one page and I keep moving the note to another, that's a pattern worth learning.

But one correction does not make a preference. A correction only starts shaping future extractions after it repeats, or after I explicitly approve it. Once a week, a model reads recent traces and writes a few short hints that get added to the extraction prompt. The system adjusts to how I use it. I can check every step, because the raw record is a plain log file.

## 5. Use a model only where rules fail

Fetching and parsing a web page doesn't need a model, so it doesn't use one. Picking which pages need review is a scoring rule over maturity, links, and staleness, because I want to know *why* a page was picked. Merging duplicate pages only happens automatically when the match is unambiguous. Anything weaker is reported, not merged.

Models do the parts that need judgment: extraction, classifying how sources relate, and answering questions. Tasks that change the vault go to a stronger model than tasks that only produce a draft for me to read.

## What I had to undo

The system got too big. I added a self-monitoring layer with its own dashboards, action queues, and evals of the system's own behavior. Each piece made sense on its own. Together they needed more maintenance than the core app they watched.

Retrieval had the same problem. Every chat question rebuilt the index from disk first. If that found nothing, a model read excerpts of every page to choose context. If *that* found nothing, a keyword scan ran over every file.

So I did a lean refactor. Retrieval now has one path and one fallback. The self-monitoring layer is switched off behind a flag, and model telemetry goes to Langfuse instead of home-grown dashboards. The refactor removed code and added no features, and the app works better.

What I took from this: the app has three jobs. It saves a source, updates my understanding, and helps me find it later. I now treat any part that does not help one of those jobs as a cost, even when it is interesting to build.

*Code and design docs: [github.com/Sakethv7/SakethWiki](https://github.com/Sakethv7/SakethWiki). Notes from talks and meetings reach it through [Lekhni](#/writing/lekhni-recording-to-knowledge).*
