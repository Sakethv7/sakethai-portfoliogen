Most evaluation setups produce scores. Fewer produce a habit. A dashboard shows average relevance, answer correctness and hallucination scores, someone glances at it, and nothing changes. The numbers sit in the middle and stay there.

A **retrieval quality review** is the habit. It is a short, regular meeting where the people who own the assistant open the worst-scoring queries from the last week and decide what to fix. It is not a report. It is a working session over real rows.

It only works if one thing is true first: you can find the pipeline that produced the scores. That sounds obvious. It is often not the case.

## The pipeline nobody can find

On a production assistant I evaluate, a new dataset shows up in the experiments view every day. Each one carries LLM-as-judge scores for retrieval relevance, answer correctness and hallucination. The results are there. I could not find the job that produces them.

It might be a scheduled notebook, a workflow in another repo, or a script on someone's account. Searching the codebase for the judge prompt, the metric names, or the dataset name did not lead to it. Each of those is a normal way for an evaluation job to end up scattered.

This is an observability failure, and it is a different one from the missing trace in [Traces nobody opens are not observability](#/writing/traces-people-can-reach). There the trace exists but takes too long to reach. Here the scores exist, but the thing that makes them has no address. You cannot change a judge prompt you cannot locate. You cannot ask why a metric moved if you cannot say which version of the judge computed it. And you cannot trust a dataset whose origin is a guess.

An evaluation pipeline is a production system. It needs the same basics as the thing it measures: an owner, a location, a schedule, and a way to read what it did.

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

Tools already support part of this. In Phoenix, [experiments are launched from client code](https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/run-experiments) that names the dataset, the task and the evaluators, then logs the scores per row. That is useful, but it means the experiment name is often your only clue. Put the job name and repo path in that name or in its metadata so a run can be traced to code. That last step is my suggestion. It is not something the tool does for you.

## Make the evaluators visible and configurable

Where do the evaluators live? In one tool, the answer can be a single screen. Langfuse defines [judge evaluators as rules](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge) in the UI: a filter for which traces to evaluate, a sampling rate, and which evaluators apply. You change what gets judged in one place instead of editing a script.

Whether you use a tool or your own code, two properties matter. The configuration should sit in one findable place, not be spread across notebooks. And changing it should not need a deploy by the one person who remembers how the job works.

The judge itself should also be traceable. Langfuse [records a full trace for every judge execution](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge), so you can open one and read the judge prompt, its output, token usage and latency. A judge you cannot inspect is a source of scores you have to take on faith. This is the same reason an LLM judge needs a [calibration check against human labels](#/writing/retrieval-vs-generation-failures): the judge is a model too, and it can be wrong.

## Trace the whole path, including latency

A retrieval review needs more than the final score. It needs the steps in order, each with its own timing. The [OpenInference conventions](https://arize-ai.github.io/openinference/spec/semantic_conventions.html), used by Phoenix and others, define span kinds for exactly this: `RETRIEVER`, `RERANKER`, `LLM`, `TOOL` and `AGENT`. A retriever span carries each returned document with its id, content and score. A reranker span carries its input documents, its output documents, the model name and the top-k setting. LLM spans carry token counts.

With those in place, a slow answer and a wrong answer both have an address. You can see whether time went to retrieval, [reranking](#/writing/rerank-before-you-generate), or generation. You can see whether the right document was retrieved and whether it survived to the prompt. If the assistant is an [agent that searches](#/writing/agentic-retrieval), the same trace shows each tool call and the point where it stopped.

The point of all this structure is navigation. A reviewer should be able to move in one direction without a search: a low score, to its trace, to the retrieved and reranked documents, to the judge's own reasoning, to the job and prompt version that produced the score.

## Running the review

Once the pipeline can be found, the meeting is short. Keep it to the same steps each week.

1. **Pull the lowest scoring queries.** Use the last seven days, ranked by relevance and correctness together, plus anything flagged with a thumbs-down.
2. **Sort each one by where it failed.** Use the same buckets as the [retrieval versus generation split](#/writing/retrieval-vs-generation-failures): right chunk never retrieved, right chunk retrieved but ranked low, right chunk present but the answer ignored it, or no document exists.
3. **Spot-check the judge.** Read five or ten rows by hand and note any where you disagree with the score. A rising disagreement rate means the judge needs work, not the assistant.
4. **Assign one owner per bucket.** Content gaps go to the content owner. Ranking issues go to whoever owns retrieval. Judge problems go to whoever owns the eval job, which is why the job needs a named owner.
5. **Write down what changed.** Next week, check whether those queries moved. If they did not, the fix did not work.

## What it costs

A review takes people's time every week, and it only pays off if the buckets lead to action. The metadata and tracing work is a one-off cost that pays back when someone new asks "where do these numbers come from?" and the answer takes one click.

There is also a privacy cost, the same one as with traces. Reviewers read real user questions, so decide who sees them and for how long before the meeting starts.

## The test

Pick a score from today's dashboard. Time how long it takes to find the job that produced it, the judge prompt version, and the traces of the queries it scored. If you can do it in a minute, the evaluation is observable. If you cannot, fix that before adding another metric.
