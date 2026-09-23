Classic RAG makes one decision before the model thinks at all. It embeds the question, pulls the top few chunks from a vector index, and hands them over. Whatever came back is all the model gets. If the right chunk ranked sixth, the answer is built without it.

Agentic retrieval flips the order. The model gets tools, such as keyword search, a file reader, a link follower, or a SQL query. It decides what to look for, reads what it finds, and decides again. Retrieval becomes a loop the model drives, not a step that happens to it.

Coding agents are the clearest example. They don't embed a repository and fetch the nearest chunks. They grep for a function name, open the file, follow an import, and grep again. For code, that works better than similarity search, and the reasons carry over to other kinds of data.

## Why a loop can beat top-k

**Exact identifiers.** Embeddings are good at meaning and bad at exact strings. An error code, a product SKU, a policy number, or a function name often retrieves poorly by similarity. A keyword search finds it on the first try.

**Questions that need more than one hop.** "Which team owns the service that failed last Tuesday?" needs two lookups, and the second depends on the first. One-shot retrieval can only guess both at once.

**Knowing when to stop.** Top-k always returns k chunks, whether the question needs one or twenty. An agent can read one document and stop, or keep going until it finds what it needs.

**Using the structure that's already there.** Folders, headings, links, and tables carry information. A vector index flattens them into chunks. An agent that can list a directory or follow a link uses that structure instead of throwing it away.

## Where it loses

The loop isn't free, and it's easy to oversell.

**Latency and cost.** Each step is a model call. A question that took one retrieval and one generation can now take six calls. For a high-volume assistant answering simple lookups, that trade is often wrong.

**Paraphrase.** Keyword tools fail when the user and the document use different words for the same thing. That's exactly the problem embeddings were built to solve. On a large corpus of loosely written documents, removing semantic search makes things worse.

**Unbounded loops.** An agent can keep searching, go in circles, or stop too early with confidence. It needs a step budget and a clear rule for what "enough" looks like.

I ran into a version of this in [SakethWiki](#/writing/review-gated-knowledge-system). When index search found nothing, a model read excerpts of every page to choose context, which is a crude agentic fallback. It worked, but it was slow and hard to reason about. The lean refactor cut retrieval down to one path and one fallback. Letting a model search is useful. Letting it search with no limits is a cost you pay on every question.

## It's not either-or

The useful framing isn't "agents replace vector search." It's "vector search becomes one tool among several." An agent with semantic search, keyword search, and a document reader can pick whichever fits the question. It can use embeddings for fuzzy questions and grep for exact ones.

There's also a third option that skips retrieval entirely. If the corpus is small enough to fit in the context window, you can load all of it. That removes retrieval failures completely, at the cost of tokens on every call and weaker attention on very long inputs. For a few hundred pages of stable reference material, it's worth testing before building any retrieval at all.

A rough rule:

| Corpus | Default |
|---|---|
| Small and stable | Load it into context |
| Structured, full of exact identifiers (code, tickets, configs) | Agent with keyword and file tools |
| Large, loosely written, high query volume | Vector or hybrid search, one shot |
| Mixed | Agent with semantic search as one of its tools |

## New ways to fail

In [separating retrieval from generation failures](#/writing/retrieval-vs-generation-failures), retrieval failure was one bucket: the context didn't have what was needed. With an agent, that bucket splits:

- **Didn't search.** The model answered from memory without calling a tool.
- **Searched badly.** Wrong tool, or a query that couldn't match.
- **Found it, didn't open it.** The right document appeared in results and the agent moved past it.
- **Stopped early.** It found part of the answer and treated it as the whole.

Each has a different fix. The first is a prompt problem. The second is a tool design problem. The last two are about how the agent decides it has enough.

None of these are visible in the final answer. They're only visible in the sequence of tool calls, which is why agentic retrieval raises the bar for [observability](#/writing/traces-people-can-reach). A one-shot RAG trace has one retrieval step. An agent trace has a path, and the path is where the failure lives. A useful metric falls out of it directly: at which step, if any, did the agent first touch the document that held the answer?

## Where I'd start

Don't rip out the vector index. Wrap it as a tool, add keyword search and a document reader next to it, and give an agent a step budget. Run both setups on the same ground-truth set and compare them by failure type, not just overall score. If the agent wins on multi-hop and exact-match questions and loses on fuzzy ones, that tells you when to route to each, which is more useful than picking a winner.
