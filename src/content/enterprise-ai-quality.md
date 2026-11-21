*Johnson & Johnson (contract) · Feb 2025 to present*

> Internal system names, team names, metric definitions, and data are left out on purpose. Everything here is described in general terms.

> **In one paragraph.** A large company runs an AI assistant that answers employee questions from its internal articles. About 140,000 employees can use it. It is a RAG system: it searches the articles first, then writes an answer from what it found. I built the data and evaluation work around it. I connect what users asked, what the assistant did, and what happened next, such as a support case or a chat with a live agent. So when an answer is bad, I can show which step failed: the search, the topic label, missing content, the routing, or the handoff to a person. Fixes guided by this analysis raised response and containment rates by 10 percentage points. Correcting the topic labels raised three resolution measures by 3 to 5% each.

## System flow

```text
interaction event + model trace + API payload
  -> schema and event-time validation
  -> lineage-aware analytical join to support-intake outcomes
  -> evaluation, observability, and KPI review
  -> evidence-backed product or content change
```

This is a public systems view, not a diagram of private infrastructure or internal code.

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

An LLM judge is a language model used to grade or label another model's output. Every query gets a label, thousands of them a day. Running an LLM on all of them is slow and expensive, and running only rules misses anything ambiguous. So the pipeline works in layers:

1. **Rules first.** Deterministic classifiers handle the clear cases for almost no cost.
2. **Batch LLM categorization** on AWS Bedrock (Llama 3.2) handles what the rules can't.
3. **Keyword fallback** catches whatever the first two layers leave unlabeled.

The output is a failure-mode label per query: retrieval, taxonomy, or data quality.

### 2. Regression tests before deployment

Prompt changes, model changes, and index changes can all quietly make answers worse. I built LLM regression tests on a ground-truth benchmark. A judge scores each answer's similarity to the expected one, and results are tracked across runs. That makes drift visible over time, not just as a pass/fail on one day. The tests look for regressions in relevance, hallucination, latency, and retrieval quality.

For investigating individual failures, I deployed Arize Phoenix, an open-source tool that records and displays each request's steps, to trace hallucinations, latency spikes, and retrieval degradation.

### 3. Lineage-aware joins, not assumed joins

This is the part that answered "why". I joined traces, DynamoDB interaction records, API payloads, and ServiceNow workflow tables at the row level. A DynamoDB identifier is not automatically a relational foreign key, so the pipeline preserved source grain, identifiers, timestamps, and match strength rather than silently treating a shared field as proof of causality.

For an attributable escalation, the Q&A event had to precede the downstream event. Where exact lineage was absent, the output retained a weaker match path instead of claiming a confirmed join. That made it possible to separate AI failures from routing, knowledge, and intake failures, and to distinguish same-day friction from needs that returned later.

### 4. Schema-aware operational analytics pipeline

I built the analysis path as a maintained data product that others can rely on, not as a one-off copy for a dashboard:

```text
DynamoDB interaction events + API payloads + support-intake events
  -> validate expected fields and timestamp semantics
  -> retain raw identifiers and event grain
  -> Databricks Delta/Parquet validation and transformations
  -> Power BI semantic model, KPI definitions, and lineage notes
  -> business-operations and leadership review
```

This design affects both correctness and cost. In DynamoDB, a Scan reads every item and pays for each read, even for rows a later filter throws away. So I set explicit limits for scan concurrency, page size, retry backoff, throttling and refresh freshness. A reporting copy, or an incremental watermark that reads only new rows, is safer than running more scans in parallel. At the metric layer, each number has a defined grain (what one row stands for) and a source path. So a business stakeholder can question a KPI and still see the evidence behind it.

### 5. Storage follows the access pattern

The operational records are events. The question, the response, the retrieval, the routing and later support details can arrive at different times with different fields. DynamoDB, a NoSQL database, stores that changing interaction data. It is not where the cross-source joins happen. The pipeline moves cleaned records into an analysis layer. There, joins across sources, report measures and KPI definitions are written down and reviewed.

A relational database fits best when entities need frequent joins and transactions across several records. A NoSQL store fits when most reads and writes go by key and records change on their own. Choosing NoSQL does not remove the relational work. It moves that work into data modeling and code. For this system, that meant keeping identifiers and event times, checking the source schema, and joining records only when the evidence supports the link. The note [Why a NoSQL database still needs a data model](#/writing/nosql-does-not-remove-data-modeling) explains this in general terms.

### 6. Write path, extraction path, and monitoring are different concerns

For the DynamoDB write audit, I kept the application timestamps apart from the database operations: `PutItem` for the first record and `UpdateItem` for a later save or status change. So nobody could present a request timestamp as proof of when the database saved the record. An audit that holds up needs the matching API event time, plus the retries, failures and throttling.

For reporting, I treated a full Scan as a limited batch job, not as a free query. A full Scan can read a large table before any filter reduces it. The safer design is an incremental watermark. The job reads the last successful timestamp, pulls newer rows, checks and appends them, and moves the watermark forward only after a successful run. Splitting the work, limiting parallel workers, retrying with backoff and watching read throttling can reduce the load. They do not make an unlimited Scan cheap. I aimed for a predictable refresh cost and fresh dashboards, not for the most parallel workers.

### 7. Access, safety, and per-organization views

The evaluation layer also had to control who could see what, and how the assistant behaved for different groups.

- **Access to data and reports.** I set up read-only access to production tables through IAM roles and OAuth. Report access and role-based filtering run through Power BI service roles, so each reader sees the slice they act on.
- **ETL jobs.** I built ETL pipelines, including AWS Glue jobs that generate Parquet files for automatic ingestion of full and delta data.
- **Guardrails and red-teaming.** I wrote guardrails for the assistant and red-teamed the application.
- **An organization flag.** I used a ServiceNow access rule to derive a flag for each user's organization. Reports, KPIs, and dashboards filter on that flag, so each organization sees its own numbers. The development team also used the same flag to switch the prompt library per organization, and to set organization rules for raising cases on a user's behalf.
- **Handoff functions.** I worked on the case-creation and live-chat functions, the paths a user takes when the assistant cannot help.

One flag drove both the reporting view and the assistant's behavior. So a KPI for an organization measured the same prompt configuration that organization actually used.

## Results

These are results I can share. Each came from work I did with other teams, and I describe each in general terms.

**Missing content.** I scored a sample of one day's answers for relevance, correctness, and hallucination, using the judge pipeline and Arize Phoenix. Splitting the scores by question topic showed gaps in the FAQ coverage for a few HR, payroll, and expense topics. We added content for those topics. We also improved response formatting, article relevance, retrieval quality, and the ground-truth articles. Response and containment rates rose by 10 percentage points.

**Wrong topic labels.** The backend filed some questions under the wrong topic. That skewed the reports the team used to judge the assistant. I fixed the classification. Containment, query resolution, and deflection rates each rose by 3 to 5%.

**Production support.** I triaged, reproduced, and debugged live problems using reporting data, backend data, and session traces. I worked with the development and testing teams to fix them. This included the support period right after an all-employee launch, which is often called hypercare. Over my time on the project I triaged, built, or managed 15 production bug fixes, 7 new features, and 12 reporting and cross-team tasks. I also built role-specific chatbots for a business unit that was separating from the parent company.

## What I learned

**Cheap layers first.** Most queries do not need a model to classify them. Rules in front of the LLM made daily evaluation affordable. The keyword fallback meant the pipeline did not drop unlabeled queries without notice.

**Check the judge.** I trust an LLM judge only as far as it agrees with human labels. So I spot-check its labels against people before anyone makes decisions from them.

**The join did the most work.** The most useful work was not a model. It was connecting four systems that each held part of a session, so one session could be read from start to end.

*Related: [Evaluating retrieval failures separately from generation failures](#/writing/retrieval-vs-generation-failures)*
