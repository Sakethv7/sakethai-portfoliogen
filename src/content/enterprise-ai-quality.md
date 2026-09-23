*Johnson & Johnson (contract) · Feb 2025 to present*

> Internal system names, team names, metric definitions, and data are left out on purpose. Everything here is described in general terms.

## The setting

A production RAG assistant answers questions for roughly 140,000 internal users. It handles knowledge lookups, feeds case management, and supports content governance. When it can't help, people fall back to other channels: filing a ServiceNow case, filling out a form, or asking a live agent.

I own evaluation, analytics, reporting, and observability for it.

## The problem

A single satisfaction score says the assistant is doing well or badly. It can't say *why*. A bad answer can come from at least four different places:

- **Retrieval.** The right document existed but wasn't found or ranked high enough.
- **Routing and taxonomy.** The question was sent down the wrong path or classified into the wrong category.
- **Knowledge gaps.** No document answered the question at all.
- **Downstream intake.** The assistant did its part, but the handoff to a case or an agent failed.

Each one has a different owner and a different fix. Blending them into one number means nobody knows what to change.

## What I built

### 1. A three-layer LLM-as-judge

Every query gets categorized, thousands of them a day. Running an LLM on all of them is slow and expensive, and running only rules misses anything ambiguous. So the pipeline works in layers:

1. **Rules first.** Deterministic classifiers handle the clear cases for almost no cost.
2. **Batch LLM categorization** on AWS Bedrock (Llama 3.2) handles what the rules can't.
3. **Keyword fallback** catches whatever the first two layers leave unlabeled.

The output is a failure-mode label per query: retrieval, taxonomy, or data quality.

### 2. Regression tests before deployment

Prompt changes, model changes, and index changes can all quietly make answers worse. I built LLM regression tests on a ground-truth benchmark. A judge scores each answer's similarity to the expected one, and results are tracked across runs. That makes drift visible over time, not just as a pass/fail on one day. The tests look for regressions in relevance, hallucination, latency, and retrieval quality.

For investigating individual failures, I deployed Arize Phoenix to trace hallucinations, latency spikes, and retrieval degradation.

### 3. Separating failure modes with row-level evidence

This is the part that answered "why". I joined the assistant's traces, DynamoDB interaction records, API payloads, and ServiceNow workflow tables at the row level. With that, a single user session can be followed from question, to answer, to what happened next.

That made it possible to separate AI failures from routing, knowledge, and intake failures. It also enabled spike analysis: when case volume jumped, I could check whether assistant failures came first, and split escalations into same-day friction versus needs that stayed unresolved and came back later.

### 4. A measurement layer people actually used

- DynamoDB-to-Databricks pipelines with schema checks and Delta/Parquet validation
- A Power BI semantic model with containment, query resolution, repeat users, and satisfaction
- KPI definitions and lineage notes, so each number has one meaning and a traceable source
- Weekly leadership reporting built on top of it

## What I learned

**Cheap layers first.** Most queries don't need a model to classify them. Putting rules in front of the LLM made daily evaluation affordable, and the fallback meant the pipeline never silently dropped data.

**A judge needs checking too.** An LLM judge is only as trustworthy as its agreement with human labels. Its labels are worth spot-checking against human judgment before anyone builds decisions on them.

**The join is the product.** The most useful work wasn't a model. It was connecting four systems that each held part of the story, so one session could be read end to end.

*Related: [Evaluating retrieval failures separately from generation failures](#/writing/retrieval-vs-generation-failures)*
