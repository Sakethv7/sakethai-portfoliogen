An evaluation dashboard for an AI assistant shows average scores for relevance, answer correctness and hallucination (made-up facts). In the setups I have seen, people look at it, and nothing changes.

This note proposes a **retrieval quality review**: a short meeting every week. The people who own the assistant open the worst-scoring questions from the last seven days and decide what to fix. They work on real rows, not on a summary report.

The review needs one thing first. People must be able to find the job that produced the scores. On a production assistant I evaluate, I could not.

## A scoring job I could not find

On a production assistant I evaluate, a new dataset shows up in the experiments view every day. Each one carries LLM-as-judge scores for retrieval relevance, answer correctness and hallucination. The results are there. I could not find the job that produces them.

It might be a scheduled notebook, a workflow in another repo, or a script on someone's account. Searching the codebase for the judge prompt, the metric names, or the dataset name did not lead to it. Each of those is a normal way for an evaluation job to end up scattered.

Observability means being able to see what a system did and why. This gap is different from the one in [How fast can you open the trace behind a bad answer?](#/writing/traces-people-can-reach). There the trace exists but takes too long to reach. Here the scores exist, but nobody can say where the job that makes them lives. That causes three problems. Nobody can change a judge prompt they cannot find. Nobody can explain why a metric moved without knowing which judge version computed it. And nobody can trust a dataset when its source is unknown.

I think an evaluation pipeline needs the same basics as the system it measures: an owner, a location, a schedule, and a way to read what it did.

## What every eval run should carry

The fix is small. Every run writes a few facts alongside its scores, so the results point back to their source.

| Field | Why it matters |
|---|---|
| Job name and repo path | The answer to "what produced this?" |
| Schedule and last run time | Tells you if it silently stopped |
| Dataset version and how it was sampled | Separates a real drop from a different sample |
| Judge model and judge prompt version | A score change after a prompt edit is not a quality change |
| Metric definitions, with a link | Each number keeps one meaning |
| Link to the traces for the judged requests | Takes you from a score to its evidence |

Tools already support part of this. In Phoenix, an open-source tracing tool from Arize, [experiments are launched from client code](https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/run-experiments) that names the dataset, the task and the evaluators, then logs the scores per row. That is useful, but it means the experiment name is often your only clue. Put the job name and repo path in that name or in its metadata so a run can be traced to code. That last step is my suggestion. It is not something the tool does for you.

## Make the evaluators visible and configurable

Where do the evaluators live? In one tool, the answer can be a single screen. Langfuse, an open-source tracing and evaluation tool, defines [judge evaluators as rules](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge) in the UI: a filter for which traces to evaluate, a sampling rate, and which evaluators apply. You change what gets judged in one place instead of editing a script.

Whether you use a tool or your own code, two properties matter. The configuration should sit in one findable place, not be spread across notebooks. And changing it should not need a deploy by the one person who remembers how the job works.

The judge itself should also be traceable. Langfuse [records a full trace for every judge execution](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge), so you can open one and read the judge prompt, its output, token usage and latency. If you cannot inspect the judge, you have to trust its scores without evidence. This is the same reason an LLM judge needs a [calibration check against human labels](#/writing/retrieval-vs-generation-failures). The judge is a model too, and it can be wrong.

## Trace the whole path, including latency

A retrieval review needs more than the final score. It needs the steps in order, each with its own timing. The [OpenInference conventions](https://arize-ai.github.io/openinference/spec/semantic_conventions.html), used by Phoenix and others, define span kinds for exactly this: `RETRIEVER`, `RERANKER`, `LLM`, `TOOL` and `AGENT`. A retriever span carries each returned document with its id, content and score. A reranker span carries its input documents, its output documents, the model name and the top-k setting. LLM spans carry token counts.

With those spans in place, you can find where a slow or wrong answer went wrong. You can see whether time went to retrieval, [reranking](#/writing/rerank-before-you-generate), or generation. You can see whether the right document was retrieved and whether it survived to the prompt. If the assistant is an [agent that searches](#/writing/agentic-retrieval), the same trace shows each tool call and the point where it stopped.

This structure lets a reviewer move quickly. A reviewer should be able to move in one direction without a search. The path runs from a low score to its trace. From there it goes to the retrieved and reranked documents and to the judge's own reasoning. The last step is the job and prompt version that produced the score.

## Running the review

Once the pipeline can be found, the meeting is short. Keep it to the same steps each week.

1. **Pull the lowest scoring queries.** Use the last seven days, ranked by relevance and correctness together, plus anything flagged with a thumbs-down.
2. **Sort each one by where it failed.** Use the same buckets as the [retrieval versus generation split](#/writing/retrieval-vs-generation-failures). The buckets are: right chunk never retrieved, right chunk retrieved but ranked low, right chunk present but the answer ignored it, or no document exists.
3. **Spot-check the judge.** Read five or ten rows by hand and note any where you disagree with the score. A rising disagreement rate means the judge needs work, not the assistant.
4. **Assign one owner per bucket.** Content gaps go to the content owner. Ranking issues go to whoever owns retrieval. Judge problems go to whoever owns the eval job, which is why the job needs a named owner.
5. **Write down what changed.** Next week, check whether those queries moved. If they did not, the fix did not work.

## What it costs

A review takes people's time every week, and it only pays off if the buckets lead to action. The metadata and tracing work is a one-off cost. It saves time when someone new asks "where do these numbers come from?" and the answer takes one click.

There is also a privacy cost, the same one as with traces. Reviewers read real user questions, so decide who sees them and for how long before the meeting starts.

## A simple test

Pick a score from today's dashboard. Time how long it takes to find the job that produced it, the judge prompt version, and the traces of the queries it scored. If you can do it in a minute, the setup works. If you cannot, I would fix that before adding another metric.
