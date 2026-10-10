# NoSQL does not remove data modeling

The database choice is not a choice between “old SQL” and “modern NoSQL.” It is a choice about access patterns, consistency requirements, and where the complexity should live.

For a production AI system, the useful question is not “Can DynamoDB scale?” It is: **what must happen on the request path, what can happen later in a data pipeline, and what evidence will let us explain a bad outcome?**

## Start with the work the data must do

Use a relational database when the core workload needs frequent cross-entity joins or multi-record transactions. Orders, payments, permissions, and inventory reservations are common examples. A relational engine gives you transactions, constraints, and joins as first-class behavior.

Use a non-relational operational store when the access pattern is mostly key-oriented and event records can evolve independently. A query-and-response system often has this shape: one event starts the interaction, later events add a response, retrieved sources, routing decisions, feedback, or an escalation. The record shape changes over time, and the request path needs predictable reads and writes.

Neither choice removes modeling work. It changes where that work happens.

```text
Operational request path
  -> write and update interaction events by key
  -> retain stable identifiers and event timestamps

Analytical path
  -> validate the event contract
  -> normalize and enrich records
  -> join to downstream outcomes
  -> publish metrics and review evidence
```

In practice, large systems are often hybrid: an operational key-value or document store for the request path, an analytical store for cross-source joins and reporting, a search index for retrieval, and a cache only where measurements show a repeated latency problem.

## One system can have three data models

Calling the operational store “the data model” is incomplete. A production system commonly has three deliberate layers:

```text
Operational model
  DynamoDB-style items optimized for request-time key access
        -> ETL / ELT
Analytical model
  validated interaction facts, downstream outcome facts, and reusable dimensions
        -> semantic model
Business model
  relationships, measures, filters, and agreed KPI definitions in the reporting layer
```

The ETL or ELT step is **data integration**. It validates and combines source records into an analytical model. In a BI tool, relationships between those tables form a **semantic model**; DAX or equivalent measures define how the business reads it. A Power BI merge is a downstream analytical join, not a DynamoDB join.

For example, interaction records can be the fact base while live-agent and case-creation records are downstream outcome facts. They do not belong in one additive “session” total merely because they share a user or session-shaped identifier. Preserve their different grains, then connect them only where the identifier, event order, and match strength support it.

## An event ID is not automatically a foreign key

NoSQL stores do not make cross-source relationships disappear. They make the relationship contract more important.

Suppose an interaction record, a support handoff, and a case record each contain a user identifier. That shared field is not enough to say one event caused another. A defensible join needs the right event grain, a compatible identifier, and valid time order. If the question arrived after the downstream event, the downstream event cannot be attributed to that question.

The practical rule is simple: retain raw IDs, source system, timestamps, and a match-strength field in the analytical output. An exact identifier match can be strong. A user-and-time-window match is weaker. An unmatched row should remain unmatched instead of being forced into a clean-looking chart.

## Separate the write audit from the application timeline

For DynamoDB-style event storage, an initial record write and a later lifecycle update are different operations:

- `PutItem` creates the initial item.
- `UpdateItem` persists a later change, such as a response or status update.

An application timestamp tells you when the application created or observed an event. It does not, by itself, prove when a database write was accepted. To investigate write delay, correlate the application event with the relevant `PutItem` or `UpdateItem` API event, retries, failures, and throttling. Calling these different clocks the same thing creates false incident narratives.

## A full scan is a batch job, not a query plan

One of the most expensive mistakes in analytical refreshes is to scan a full operational table, load it into a reporting process, and filter afterward. The read cost has already been paid.

An incremental pipeline has a different contract:

```text
read last successful watermark
  -> extract records newer than that watermark
  -> validate schema, keys, timestamps, and duplicates
  -> transform and publish the new batch
  -> advance the watermark only after success
```

This design makes retries and restarts explainable. It also makes freshness measurable. A job should log its input window, output row count, duration, failures, and the next watermark. Those fields turn “the dashboard is stale” into a diagnosable system state.

Segmentation and parallel workers can help when a full backfill is necessary, but they are not free performance. More segments can increase contention and throttle risk. Measure read capacity, throttled requests, latency, retry count, and end-to-end completion time before increasing concurrency. The goal is a safe, predictable refresh—not the highest worker count.

## DAGs make ownership and recovery explicit

A useful ETL DAG has stages that can be inspected and retried independently:

```text
extract -> validate -> normalize -> deduplicate -> publish -> monitor
```

Each stage needs an owner, input/output contract, failure policy, and evidence that it completed. A transformation job should be idempotent whenever possible: rerunning the same input window should not create duplicate facts. That matters more than whether the scheduler is Airflow, Glue, Databricks, or another orchestrator.

## Cache and TTL are policies, not decorations

Cache only after measuring a repeated read bottleneck. Define the key, invalidation event, maximum staleness, hit-rate target, and what happens on a miss. A cache with no invalidation policy is a second, unreliable database.

TTL has a different purpose. Use it for derived or rebuildable state with a clear expiration rule, not as a substitute for retention, audit, or deletion policy. If a record affects reporting, traceability, or user outcomes, its lifecycle needs an explicit source-of-truth decision.

Do not confuse cache state with identity state. SSO cookies, access tokens, and re-login behavior belong to the identity and application platform, not to an analytical table. A report refresh or a session identifier in an event dataset does not keep a person signed in.

For an AI request path, a cache might hold a short-lived, entitlement-safe retrieval result or response keyed by normalized request, knowledge version, and authorization context. It should not treat mutable case status, live-agent interaction records, or core conversation history as disposable cache entries. Those are source-of-truth operational records. An ETL watermark or a materialized reporting extract is also not a cache: it is durable pipeline state with a recovery contract.

## Conversation state is not the model's KV cache

Chatbots maintain context in two separate places:

```text
Application state
  persist messages, summaries, user preferences, and trace identifiers
  -> fetch the relevant window on the next turn
  -> construct the model prompt

Model-runtime KV cache
  retain transformer attention keys and values for prompt tokens already processed
  -> avoid recomputing those tokens during generation or a reusable prompt prefix
```

The first is durable conversation state. It is owned by the application and may be stored in an operational database. The second is an inference optimization inside the model-serving runtime. It is not a conversation database, does not replace message history, and may disappear when a worker restarts or evicts memory.

An application does not normally build a transformer KV cache in DynamoDB. If the model provider or self-hosted inference engine supports prefix caching, the application can benefit from it, but it must still persist enough conversation state to rebuild the next prompt.

## Ingestion caching is a different optimization

Embedding work is expensive, but “we ingest documents” does not prove that an embedding cache exists. A deliberate ingestion cache uses a content hash and embedding-model version as the key:

```text
document version
  -> chunk text
  -> hash(chunk text + embedding model version)
  -> cache hit: reuse vector
  -> cache miss: embed, write vector, record hash
```

This avoids re-embedding unchanged chunks. It must invalidate when the chunk text, embedding model, chunking policy, or preprocessing rules change. That is separate from a retrieval cache, which stores the result of searching an already-indexed corpus for a user request.

## The interview answer

“I choose the database from the access pattern. For transaction-heavy, relationship-rich workflows, I start with a relational database because joins and consistency are native. For high-volume event writes with evolving payloads and predictable key access, I consider NoSQL. Then I design the missing pieces deliberately: identifiers and event-time contracts, downstream analytical joins, idempotent incremental ETL, monitoring, and cache/TTL policy. Most real systems use more than one store.”

That is a system-design answer. It does not worship a database, and it does not pretend that scale removes the need for careful data contracts.
