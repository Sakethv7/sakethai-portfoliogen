A classic RAG system searches once, before the model starts. It turns the question into a vector (a list of numbers that stands for its meaning), finds the closest few passages in an index, and gives them to the model. The model gets only those passages. If the right passage ranked sixth and the system kept five, the model answers without it.

Agentic retrieval changes the order. The model gets tools, such as keyword search, a file reader, a link follower or a SQL query. It decides what to look for, reads what it finds, and decides again. The model runs the search in a loop, instead of getting one fixed result.

Coding agents show this most clearly. They do not turn a repository into vectors and fetch the nearest chunks. They search the text for a function name, open the file, follow an import, and search again. For code, that works better than similarity search. This note asks when the same approach helps with other kinds of data.

<figure class="diagram">
<a href="diagrams/agentic-retrieval-loop.svg" target="_blank" rel="noopener"><img src="diagrams/agentic-retrieval-loop.svg" width="900" height="690" alt="Classic RAG retrieves once and answers. Agentic retrieval is a loop: the model decides what to look for, runs a tool, reads the results and decides whether it has enough, and repeats if not. Four failure points are marked: did not search, searched badly, found it but did not open it, and stopped early."></a>
<figcaption>Left, one retrieval decision. Right, the decision repeats after each step, and each step can fail in its own way.</figcaption>
</figure>

## Why a loop can beat top-k

**Exact identifiers.** Embeddings are good at meaning and bad at exact strings. An error code, a product SKU, a policy number, or a function name often retrieves poorly by similarity. A keyword search finds it on the first try.

**Questions that need more than one hop.** "Which team owns the service that failed last Tuesday?" needs two lookups. The second depends on the first. One-shot retrieval can only guess both at once.

**Knowing when to stop.** Top-k always returns k chunks, whether the question needs one or twenty. An agent can read one document and stop, or keep going until it finds what it needs.

**Using the structure that's already there.** Folders, headings, links, and tables carry information. A vector index flattens them into chunks. An agent that can list a directory or follow a link uses that structure instead of throwing it away.

## Where it loses

The loop has costs.

**Latency and cost.** Each step is a model call. A question that took one retrieval and one generation can now take six calls. For a high-volume assistant answering simple lookups, that trade is often wrong.

**Paraphrase.** Keyword tools fail when the user and the document use different words for the same thing. Embeddings (the vectors above) exist to solve that problem. On a large corpus of loosely written documents, removing semantic search makes things worse.

**Unbounded loops.** An agent can keep searching, go in circles, or stop too early with confidence. It needs a step budget and a clear rule for what "enough" looks like.

I ran into a version of this in [SakethWiki](#/writing/review-gated-knowledge-system). When index search found nothing, a model read excerpts of every page to choose context, which is a crude agentic fallback. It worked, but it was slow and hard to reason about. The lean refactor cut retrieval down to one path and one fallback. A model that searches is useful. A model that searches with no limit makes every question slow and expensive.

## Use both

In my view, agents do not replace vector search. Vector search becomes one tool among several. An agent with semantic search, keyword search, and a document reader can pick whichever fits the question. It can use embeddings for fuzzy questions and grep for exact ones.

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

The final answer does not show any of these failures. Only the sequence of tool calls shows them. So agentic retrieval needs better [traces](#/writing/traces-people-can-reach). A one-shot RAG trace has one retrieval step. An agent trace has a path of steps, and the failure is somewhere on that path. This gives a useful metric: at which step, if any, did the agent first touch the document that held the answer?

## Where I'd start

Keep the vector index. Wrap it as a tool, add keyword search and a document reader next to it, and give an agent a step budget. Run both setups on the same ground-truth set and compare them by failure type, not just overall score. Suppose the agent wins on multi-hop and exact-match questions and loses on fuzzy ones. Then you know which questions to send to each setup. I find that more useful than picking one winner.
