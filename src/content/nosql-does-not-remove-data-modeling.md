# Why a NoSQL database still needs a data model

Teams often frame the database choice as "old SQL" against "modern NoSQL". I think a more useful frame is three questions. How will the application read and write the data? How consistent must it be? And where should the hard work happen?

A NoSQL database, such as Amazon's DynamoDB, stores records by key and lets each record change shape over time. It does not ask for a fixed table design up front. That can make it look as if no data model is needed. In my work on the data behind a production AI system, the modeling work did not go away. It moved to the data pipeline and the reports. For that kind of system I ask three things. What must happen while the user waits? What can happen later in a pipeline? And what records will let us explain a bad outcome?

## Start with the work the data must do

I use a relational (SQL) database when the main work needs many joins across entities or transactions that change several records at once. Orders, payments, permissions and inventory reservations are common examples. A relational database gives transactions, constraints and joins as built-in features.

I use a non-relational store when most reads and writes go by key and event records can change on their own. A question-and-answer system often works this way. One event starts the interaction. Later events add a response, the retrieved sources, routing decisions, feedback or an escalation. The record shape changes over time, and the user-facing path needs fast, predictable reads and writes.

Neither choice removes modeling work. It changes where the work happens.

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

In practice, large systems often mix stores. A key-value or document store serves the user-facing path. An analytical store handles joins across sources and reporting. A search index serves retrieval. A cache appears only where measurements show a repeated speed problem.

## One system can have three data models

So "the data model" usually means more than the operational store. A production system often has three layers, each designed on purpose:

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

ETL (extract, transform, load) or ELT is the data integration step. It checks source records and combines them into an analytical model. In a reporting tool such as Power BI, the relationships between those tables form a **semantic model**. Measures written in DAX (Power BI's formula language) or a similar language define how the business reads the numbers. A merge in Power BI is a join on the analytical side. DynamoDB itself does not join.

For example, interaction records can be the main fact table, and live-agent and case-creation records can be outcome facts. Grain means what one row stands for, such as one question or one support case. These tables have different grains. So I do not add them into one "session" total just because they share a user or session-like identifier. I keep each grain, and I connect rows only where the identifier, the event order and the match strength support it.

## A shared ID does not prove a link

A NoSQL store does not remove the links between sources. It makes the rules for those links more important.

Suppose an interaction record, a support handoff and a case record each contain a user identifier. That shared field alone does not show that one event caused another. A join I can defend needs the right grain, a compatible identifier and a valid time order. If the question arrived after the downstream event, I cannot attribute that event to the question.

My rule: keep the raw IDs, the source system, the timestamps and a match-strength field in the analytical output. An exact identifier match can be strong. A match on user and time window is weaker. An unmatched row stays unmatched. I do not force it into a chart to make the chart look complete.

## Keep the write log apart from the application timeline

In DynamoDB, the first write of a record and a later update are different operations:

- `PutItem` creates the first version of the item.
- `UpdateItem` saves a later change, such as a response or a status update.

An application timestamp says when the application created or saw an event. It does not prove when the database accepted the write. To investigate a write delay, I match the application event with the related `PutItem` or `UpdateItem` API event, and with any retries, failures and throttling. If these different clocks are treated as one, the incident story can be wrong.

## Avoid full-table scans in a refresh

A costly mistake in report refreshes is to read a whole operational table, load it into a reporting process, and filter it afterward. By then the read cost is already paid.

An incremental pipeline reads only new records. A watermark is the saved point that marks how far the last successful run got:

```text
read last successful watermark
  -> extract records newer than that watermark
  -> validate schema, keys, timestamps, and duplicates
  -> transform and publish the new batch
  -> advance the watermark only after success
```

This design makes retries and restarts easy to explain. It also makes freshness measurable. A job should log its input window, output row count, duration, failures and next watermark. Then "the dashboard is stale" becomes a state someone can diagnose.

Splitting a full backfill across parallel workers can help when a full read is necessary. But more workers can also compete for the same capacity and get throttled. Before adding workers, I measure read capacity, throttled requests, latency, retry count and total completion time. I aim for a safe, predictable refresh, not the highest worker count.

## Split the pipeline into steps that can be retried

A DAG (directed acyclic graph) is the ordered list of steps a scheduler runs. A useful ETL DAG has steps that someone can inspect and retry one at a time:

```text
extract -> validate -> normalize -> deduplicate -> publish -> monitor
```

Each step needs an owner, a contract for its input and output, a rule for what to do on failure, and a record that it finished. Where possible, a step should be idempotent. That means a rerun on the same input window must not create duplicate rows. I think this matters more than the choice of scheduler, whether Airflow, Glue, Databricks or another tool.

## Cache and TTL need written rules

I add a cache only after I measure a repeated read bottleneck. Then I define the cache key, the event that clears an entry, the maximum age of an entry, a target hit rate, and what happens on a miss. Without a rule for clearing entries, a cache becomes a second database that gives old answers.

TTL (time to live) means the store deletes a record after a set time. It has a different purpose. I use it for derived data that can be rebuilt and has a clear expiry rule. I do not use it in place of retention, audit or deletion rules. If a record affects reporting, traceability or user outcomes, someone must decide which store holds the official copy.

Cache data is also different from sign-in data. SSO cookies, access tokens and re-login behavior belong to the identity and application platform, not to an analytical table. A report refresh, or a session ID in an event dataset, does not keep a person signed in.

For an AI request path, a cache might hold a short-lived retrieval result or response. Its key would include the normalized request, the knowledge version and the user's permissions, so one user never sees another user's restricted result. The cache should not hold case status, live-agent records or core conversation history. Those are the official operational records. An ETL watermark or a saved reporting extract is not a cache either. It is lasting pipeline state with a recovery plan.

## Conversation history and the model's KV cache are different things

A chatbot keeps context in two separate places:

```text
Application state
  persist messages, summaries, user preferences, and trace identifiers
  -> fetch the relevant window on the next turn
  -> construct the model prompt

Model-runtime KV cache
  retain transformer attention keys and values for prompt tokens already processed
  -> avoid recomputing those tokens during generation or a reusable prompt prefix
```

The first is the saved conversation. The application owns it and can store it in an operational database. The second is a speed optimization inside the program that runs the model. The KV cache keeps intermediate results for text the model has already read, so it does not compute them again. It is not a conversation database and does not replace message history. It can disappear when a worker restarts or frees memory.

An application does not normally build a KV cache in DynamoDB. If the model provider or a self-hosted engine supports prefix caching, the application gets the speed benefit. It must still save enough conversation state to build the next prompt.

## Caching embeddings at ingestion is a separate step

An embedding is a list of numbers that stands for the meaning of a text chunk. Computing embeddings is expensive. But a system that ingests documents does not automatically have an embedding cache. A deliberate cache uses a hash of the chunk text and the embedding model version as its key:

```text
document version
  -> chunk text
  -> hash(chunk text + embedding model version)
  -> cache hit: reuse vector
  -> cache miss: embed, write vector, record hash
```

This avoids embedding unchanged chunks again. The cache must clear an entry when the chunk text, the embedding model, the chunking rules or the preprocessing rules change. It is separate from a retrieval cache, which stores the search results for a user request against an index that already exists.
