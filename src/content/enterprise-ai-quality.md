*Johnson & Johnson (contract) · Feb 2025 to present*

> Internal system names, team names, metric definitions, and data are left out on purpose. Everything here is described in general terms.

> **In one paragraph.** I designed the data and evaluation layer for an enterprise RAG service used by approximately 140,000 employees. The work links interaction events, model traces, API payloads, and downstream support-intake outcomes at the correct event grain, so a low score can be traced to retrieval, taxonomy, knowledge, routing, or intake rather than treated as one undifferentiated AI failure. Analysis-guided fixes raised response and containment rates by 10%; correcting topic classification raised three resolution measures by 3 to 5% each.

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

### 3. Lineage-aware joins, not assumed joins

This is the part that answered "why". I joined traces, DynamoDB interaction records, API payloads, and ServiceNow workflow tables at the row level. A DynamoDB identifier is not automatically a relational foreign key, so the pipeline preserved source grain, identifiers, timestamps, and match strength rather than silently treating a shared field as proof of causality.

For an attributable escalation, the Q&A event had to precede the downstream event. Where exact lineage was absent, the output retained a weaker match path instead of claiming a confirmed join. That made it possible to separate AI failures from routing, knowledge, and intake failures, and to distinguish same-day friction from needs that returned later.

### 4. Schema-aware operational analytics pipeline

The analytical path was designed as a data product, not a dashboard extract:

```text
DynamoDB interaction events + API payloads + support-intake events
  -> validate expected fields and timestamp semantics
  -> retain raw identifiers and event grain
  -> Databricks Delta/Parquet validation and transformations
  -> Power BI semantic model, KPI definitions, and lineage notes
  -> business-operations and leadership review
```

This matters for both correctness and cost. In DynamoDB, a Scan consumes read capacity for items read before downstream filters remove rows. I treated scan concurrency, page size, backoff, throttling, and refresh freshness as explicit operational constraints; a reporting copy or incremental watermark is safer than simply increasing parallel scans. At the metric layer, each number carried a defined grain and source path so that operational stakeholders could challenge a KPI without losing the evidence behind it.

### 5. Storage follows the access pattern

The operational records were event-shaped: query, response, retrieval, routing, and later support-intake details can arrive at different times and carry different fields. DynamoDB was the operational source for that variable interaction data; it was not the analytical join engine. The pipeline moved normalized records into an analytical layer where cross-source questions, semantic measures, and reporting joins could be made explicit and reviewed.

This distinction matters in system design. A relational store is the default when entities need frequent joins and multi-record transactions. A non-relational store is appropriate when the access pattern is key-oriented and the operational records evolve independently. Choosing NoSQL does not remove relational work; it moves it into data modeling and application or analytical code. For this system, that meant preserving identifiers and event time, validating the source schema, and making joins conditional on evidence rather than assuming they were valid.

### 6. Write path, extraction path, and monitoring are different concerns

For the DynamoDB write audit, I distinguished the application timestamps from the underlying API operations: `PutItem` for the initial record and `UpdateItem` for a later save or lifecycle update. That distinction prevented a request timestamp from being presented as proof of persistence timing. A defensible audit needs the corresponding API event time, retries, failures, and throttling evidence.

For reporting extraction, I treated the full Scan as a bounded batch job rather than a free query. A full Scan can read a large table before local filters reduce it. The safer design is an incremental watermark: read the last successful timestamp, pull newer rows, validate and append them, then advance the watermark only after a successful run. Work segmentation, controlled concurrency, retry/backoff, and read-throttle monitoring can reduce pressure, but they do not make an unbounded Scan cheap. The goal is predictable refresh cost and dashboard freshness, not maximum parallelism.

## Results

These are results I can share. Each came from work I did with other teams, and I describe each in general terms.

**Missing content.** I scored a sample of one day's answers for relevance, correctness, and hallucination, using the judge pipeline and Arize Phoenix. Splitting the scores by question topic showed gaps in the FAQ coverage for a few HR, payroll, and expense topics. We added content for those topics. The assistant found better material, and response and containment rates rose by 10%.

**Wrong topic labels.** The backend filed some questions under the wrong topic. That skewed the reports the team used to judge the assistant. I fixed the classification. Containment, query resolution, and deflection rates each rose by 3 to 5%.

**Production support.** I triaged, reproduced, and debugged live problems using reporting data, backend data, and session traces. I worked with the development and testing teams to fix them. This included the support period right after an all-employee launch, which is often called hypercare. Over my time on the project I triaged, built, or managed 15 production bug fixes, 7 new features, and 12 reporting and cross-team tasks. I also built role-specific chatbots for a business unit that was separating from the parent company.

## What I learned

**Cheap layers first.** Most queries don't need a model to classify them. Putting rules in front of the LLM made daily evaluation affordable, and the fallback meant the pipeline never silently dropped data.

**A judge needs checking too.** An LLM judge is only as trustworthy as its agreement with human labels. Its labels are worth spot-checking against human judgment before anyone builds decisions on them.

**The join is the product.** The most useful work wasn't a model. It was connecting four systems that each held part of the story, so one session could be read end to end.

*Related: [Evaluating retrieval failures separately from generation failures](#/writing/retrieval-vs-generation-failures)*
