A common RAG pipeline has three steps. It retrieves passages (chunks) from a document store, passes them to a model, and returns the model's answer. When answers come back only partly right, teams usually fix the content first. They rewrite the article, split it differently, or add the missing page.

That work helps, but it has a limit. On a production assistant I evaluate, the content keeps getting better. The relevance, answer-quality and hallucination scores stay average, and so does the ratio of likes to dislikes. The model gets whatever passages rank highest, and nothing checks that order. This note is about a step that checks it, called **reranking**. It also covers what published results say about reranking, including results against it.

## What reranking is

Retrieval is a fast, rough filter. It embeds the question, compares it to every chunk, and returns the top few by similarity. It has to be fast because it scans the whole index. That speed costs precision, because the question and each chunk are embedded separately and only compared afterward.

A reranker is a second, slower pass over a small set. Retrieve a wide net, then let a model read the question and each chunk *together* and score how well the chunk answers it. Keep the best few and send only those to the generator.

Similarity measures how close two vectors (lists of numbers that stand for text) are. A reranker judges whether this passage answers this question. These are different checks. I think that difference explains many partly right answers.

## What the published results say

I looked for engineering write-ups from teams that run reranking at scale. This is what each one reports.

**Anthropic**, the company that makes Claude, tested reranking in its [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval) work. They retrieved the top 150 chunks, reranked them, and kept the top 20. Contextual embeddings plus contextual BM25 cut the top-20 retrieval failure rate by 49%. Adding reranking on top took the cut to 67%, from 5.7% to 1.9%. That figure is the combined result, so reranking is not the only cause. But it was the last step that added the most on top of an already improved retriever. They also note that reranking adds latency, and that reranking more chunks is a trade between quality and cost.

**Databricks**, a data and AI platform company, built reranking into its vector search product and wrote about it in [Reranking in Databricks AI Search](https://www.databricks.com/blog/reranking-mosaic-ai-vector-search-faster-smarter-retrieval-rag-agents). They report an average 15 point gain in recall@10 on enterprise benchmarks, from 74% to 89%, by reranking 50 candidates. This is a vendor measuring its own feature, so read it as a strong signal, not an audit. Its [retrieval quality guide](https://docs.databricks.com/aws/en/vector-search/vector-search-retrieval-quality) says where it fits: RAG agents, where model generation dominates latency, and quality-first applications. It says it is a poor fit for high query rates or search boxes that need answers in under 100 ms.

**Spotify Research**, the research group of the music streaming company, reports a result against it. GPT-4 reranking came out up to 16% lower on NDCG@10 than a trained ranking model on a public dataset. This is in [Zero-Shot Reranking with Large Language Models and Precomputed Ranking Features](https://research.atspotify.com/publications/Zero-Shot-Reranking-with-Large-Language-Models-and-Precomputed-Ranking-Features-Opportunities-and-Limitations). On the hard queries, where the baseline put an irrelevant result first, the LLM did better. The authors also call LLM reranking brittle: the same strategy helped or hurt depending on the model and dataset.

**Voyage AI**, a company that sells embedding and reranking models, makes a similar argument in [The Case Against LLMs as Rerankers](https://blog.voyageai.com/2025/10/22/the-case-against-llms-as-rerankers/). Across 13 datasets, their purpose-built reranker beat GPT-5, Gemini 2.5 Pro and Qwen 3 32B by roughly 13 to 15% on NDCG@10. They report it as 25 to 60 times cheaper and much faster. With a strong first-stage retriever, one general LLM made ranking slightly worse. This is a reranker vendor, so the same caveat applies.

Two other companies do not mention reranking at all. Notion's write-up on its [vector search infrastructure](https://www.notion.com/blog/two-years-of-vector-search-at-notion) does not mention reranking. Uber's [Enhanced Agentic-RAG](https://www.uber.com/us/en/blog/enhanced-agentic-rag/) post does not use the word either. Uber does add a post-processing agent that de-duplicates retrieved chunks and orders them by position in the source document. Together with other changes, it reports a 27% relative gain in acceptable answers and a 60% relative drop in incorrect advice. It measured both on a curated golden set with an LLM judge. That supports work on the step between retrieval and generation. It is not evidence for reranking itself.

## What this changes about the plan

The evidence supports the step. It does not support the shortcut I first assumed, which was one general LLM call to rerank.

Three of the four sources point the same way. Reranking after a wide retrieval reduces missed answers, and the gain shows up even after other retrieval improvements. Two of them say a general LLM is the wrong first tool. A dedicated cross-encoder reranker is cheaper, faster, and in Voyage's tests more accurate. Spotify's result says an LLM reranker helps on the hard queries but can be worse on average. So the order to try is: a cross-encoder first, an LLM only where the cross-encoder still fails.

<figure class="diagram">
<a href="diagrams/rerank-pipeline-and-triage.svg" target="_blank" rel="noopener"><img src="diagrams/rerank-pipeline-and-triage.svg" width="900" height="610" alt="A pipeline and a triage list. Retrieve a wide set, rerank it with a model that reads the question and each chunk together, keep the best five, then generate. Log both lists and the scores. When an answer is wrong, find where the right chunk was. Dropped after reranking points to the reranker or its cutoff. Low before reranking points to retrieval ordering. Never in the wide list points to retrieval or content."></a>
<figcaption>The two logged lists split one retrieval failure into three owners. This is my own reasoning, not a claim from the sources.</figcaption>
</figure>

## How reranking helps observability

This section is my own reasoning, not a claim from those sources.

Without a reranker, a retrieval failure is one bucket. The trace shows the retrieved chunks and the answer was wrong. With a reranker, the trace holds two lists: what retrieval returned, and what the reranker kept. That splits the bucket.

- **Right chunk in the wide list, dropped or low after reranking.** The reranker or its cutoff is the problem.
- **Right chunk in the wide list, ranked low before reranking.** Retrieval ordering was the problem, and the reranker is the fix that worked.
- **Right chunk never in the wide list.** Retrieval or content is the problem. This is a [knowledge gap or retrieval failure](#/writing/retrieval-vs-generation-failures), and no reranker can help.

Each of the three has a different owner and a different fix. It also gives a direct measure of the step itself: the rank of the answer-bearing chunk before and after. If that rank does not improve, the reranker is not worth its cost. Databricks points the same way at a smaller scale. It surfaces reranker latency in its query debug output, so the step shows up as its own line in a breakdown.

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

My plan is this order: split documents into good chunks, retrieve a wide set, rerank it with a dedicated model, then generate from a short, ordered list. Log both lists. Content work makes the candidates better. Reranking puts the best candidate first, and the logs show when it did not.

The sources above are the published evidence I found. Numbers come from each source's own benchmark, so none of them is a promise about your data.
