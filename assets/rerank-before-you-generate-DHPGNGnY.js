const e=`A common RAG pipeline has three steps. Retrieve chunks, pass them to a model, return the answer. When answers come back only partly right, the first instinct is to fix the content. Rewrite the article. Split it differently. Add the missing page.

That work is worth doing. It also has a ceiling. On a production assistant I evaluate, the content keeps improving while relevance, answer-quality and hallucination scores stay average, and so does the ratio of likes to dislikes. Retrieval feeds the model whatever ranks highest, and nothing checks that order. This note is about the missing step: **reranking**. It also covers what published results say about it, including where they push back.

## What reranking is

Retrieval is a fast, rough filter. It embeds the question, compares it to every chunk, and returns the top few by similarity. It has to be fast because it scans the whole index. That speed costs precision, because the question and each chunk are embedded separately and only compared afterward.

A reranker is a second, slower pass over a small set. Retrieve a wide net, then let a model read the question and each chunk *together* and score how well the chunk answers it. Keep the best few and send only those to the generator.

Similarity measures how close two vectors are. A reranker judges whether this passage answers this question. Those are different things, and that gap is where partly right answers come from.

## What the published results say

I looked for engineering write-ups from teams running this at scale. Here is what each one actually reports.

**Anthropic** tested reranking in its [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) work. They retrieved the top 150 chunks, reranked them, and kept the top 20. Contextual embeddings plus contextual BM25 cut the top-20 retrieval failure rate by 49%. Adding reranking on top took the cut to 67%, from 5.7% to 1.9%. That figure is the combined result, so reranking is not the only cause. But it was the last step that added the most on top of an already improved retriever. They also note that reranking adds latency, and that reranking more chunks is a trade between quality and cost.

**Databricks** built reranking into its vector search product and wrote about it in [Reranking in Databricks AI Search](https://www.databricks.com/blog/reranking-mosaic-ai-vector-search-faster-smarter-retrieval-rag-agents). They report an average 15 point gain in recall@10 on enterprise benchmarks, from 74% to 89%, by reranking 50 candidates. This is a vendor measuring its own feature, so read it as a strong signal, not an audit. Its [retrieval quality guide](https://docs.databricks.com/aws/en/vector-search/vector-search-retrieval-quality) says where it fits: RAG agents, where model generation dominates latency, and quality-first applications. It says it is a poor fit for high query rates or search boxes that need answers in under 100 ms.

**Spotify Research** gives the counterweight. In [Zero-Shot Reranking with Large Language Models and Precomputed Ranking Features](https://research.atspotify.com/publications/Zero-Shot-Reranking-with-Large-Language-Models-and-Precomputed-Ranking-Features-Opportunities-and-Limitations), GPT-4 reranking came out up to 16% lower on NDCG@10 than a trained ranking model on a public dataset. On the hard queries, where the baseline put an irrelevant result first, the LLM did better. The authors also call LLM reranking brittle: the same strategy helped or hurt depending on the model and dataset.

**Voyage AI** argues the same point from the other side in [The Case Against LLMs as Rerankers](https://blog.voyageai.com/2025/10/22/the-case-against-llms-as-rerankers/). Across 13 datasets, their purpose-built reranker beat GPT-5, Gemini 2.5 Pro and Qwen 3 32B by roughly 13 to 15% on NDCG@10. They report it as 25 to 60 times cheaper and much faster. With a strong first-stage retriever, one general LLM made ranking slightly worse. This is a reranker vendor, so the same caveat applies.

Two other companies are worth naming for what they do not say. Notion's write-up on its [vector search infrastructure](https://www.notion.com/blog/two-years-of-vector-search-at-notion) does not mention reranking. Uber's [Enhanced Agentic-RAG](https://www.uber.com/us/en/blog/enhanced-agentic-rag/) post does not use the word either. Uber does add a post-processing agent that de-duplicates retrieved chunks and orders them by position in the source document. Together with other changes, it reports a 27% relative gain in acceptable answers and a 60% relative drop in incorrect advice, measured on a curated golden set with an LLM judge. That supports working on what happens between retrieval and generation. It is not evidence for reranking specifically.

## What this changes about the plan

The evidence supports the step. It does not support the shortcut I first assumed, which was one general LLM call to rerank.

Three of the four sources point the same way. Reranking after a wide retrieval reduces missed answers, and the gain shows up even after other retrieval improvements. Two of them say a general LLM is the wrong first tool. A dedicated cross-encoder reranker is cheaper, faster, and in Voyage's tests more accurate. Spotify's result says an LLM reranker earns its keep on the hard queries and can lose on average. So the order to try is: a cross-encoder first, an LLM only where the cross-encoder still fails.

## How reranking helps observability

This is the part I care about most, and it is my own reasoning, not a claim from those sources.

Without a reranker, a retrieval failure is one bucket. The trace shows the retrieved chunks and the answer was wrong. With a reranker, the trace holds two lists: what retrieval returned, and what the reranker kept. That splits the bucket.

- **Right chunk in the wide list, dropped or low after reranking.** The reranker or its cutoff is the problem.
- **Right chunk in the wide list, ranked low before reranking.** Retrieval ordering was the problem, and the reranker is the fix that worked.
- **Right chunk never in the wide list.** Retrieval or content is the problem. This is a [knowledge gap or retrieval failure](#/writing/retrieval-vs-generation-failures), and no reranker can help.

Each of the three has a different owner and a different fix. It also gives a direct measure of the step itself: the rank of the answer-bearing chunk before and after. If that rank does not improve, the reranker is not earning its cost. Databricks points the same way at a smaller scale. It surfaces reranker latency in its query debug output, so the step shows up as its own line in a breakdown.

For this to work, the [trace](#/writing/traces-people-can-reach) has to store both lists and the scores. Otherwise the reranker is one more step you cannot see into.

## How I'd test it

I have not run this yet, so it is a hypothesis for my own system. The check is cheap.

1. Take the queries scored partial or bad. For each one, ask whether the answer-bearing chunk was in a wide retrieval of 30 to 50, and where it ranked.
2. If many sit in the wide list but outside the top few, ranking is the problem and reranking has room to help. If most are missing from the wide list, fix retrieval and content first.
3. Run a cross-encoder reranker over the wide list, keep the top five, and compare against the current top five on the same ground-truth set. Track the three scores and the rank of the right chunk, split by failure type.
4. Only then try an LLM reranker on what the cross-encoder still misses.

## What it costs

**Latency.** It adds a step. Databricks reports reranking 50 results in under a second on typical workloads. Anthropic calls the added latency small but real. Measure it against your own budget.

**Cost.** LLM reranking costs far more per token than a purpose-built reranker, per Voyage. Measure the gain before paying for it on every query.

**A new judge to check.** A reranker is another model making judgments. Spot-check its ordering against human labels, the same way as any LLM judge.

**A wide enough net.** Reranking only promotes what retrieval brought back. Raise the candidate count before judging it.

## Where I'd put it

Chunk well. Retrieve wide. Rerank with a dedicated model. Then generate from a short, ordered list, and log both lists. Content work improves the candidates. Reranking makes sure the best one is used, and makes it visible when it wasn't.

The sources above are the published evidence I found. Numbers come from each source's own benchmark, so none of them is a promise about your data.
`;export{e as default};
