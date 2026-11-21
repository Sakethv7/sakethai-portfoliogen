When an AI assistant gives a bad answer, someone has to find out why. The record that shows why is called a trace. This note is about one practical measure: how long it takes to open that trace after someone reports the bad answer.

In my experience, the usual path is slow. Someone asks an engineer, the engineer finds the timestamp, and then searches the logs. When the path takes ten minutes, people open traces during incidents and skip them on other days. I think the other days matter more, because one odd answer is often the first sign of a pattern.

## What a trace needs to hold

A trace is the record of one request as it moved through the system. For a RAG assistant (an assistant that first searches a document store, then writes an answer from what it found), I log these fields:

- the user's question, and the rewritten query if there is one
- the retrieved chunks (the passages the search returned), with their document IDs and scores
- the prompt version and the model
- the raw model output, before any post-processing
- latency and token counts for each step

In the setups I have seen, the retrieved chunks are the field most often left out. They are also the field I need most. Without them I can't tell a [retrieval failure from a generation failure](#/writing/retrieval-vs-generation-failures). I see a wrong answer, but not whether the model had the right passage and ignored it, or never got it.

The prompt version helps for a different reason. When quality drops after a change, I filter traces by version and compare. In [Lekhni](#/writing/lekhni-recording-to-knowledge), my meeting-notes app, every generation logs its prompt version. A worse batch of notes then points to the change that caused it.

## Make the trace one click away

Most of the fix is wiring, not a new tool.

**Put the trace ID where the complaint lands.** A thumbs-down, a support ticket and a dashboard row should each carry the trace ID. Then the complaint arrives with its evidence, and nobody has to search.

**Link from totals to examples.** A dashboard can say that retrieval failures went up. It is more useful when I can click that number and see twenty of the failing traces.

**Make traces searchable by what people know.** Engineers search by timestamp. Other people know a user, a session, a document or a topic. Index traces by those fields too.

## Let non-engineers read them

Engineers usually build traces for themselves. But many failures belong to other people. A knowledge gap belongs to the person who owns the content. A routing mistake can belong to the person who owns the topic list.

Those people will not read a raw JSON log. Give them a plain view: the question, the documents that came back, the answer, and a label for what went wrong. A content owner can then see that no document covers the question and add one. The fix does not need to pass through three teams.

## A trace alone is not enough

A trace shows what the model did. It does not show what the user did next. Did they ask again in other words, open a support case, or give up?

On a production assistant I evaluate, the most useful work was a row-level join. I joined traces with interaction records and ticketing data. Then I could read one session from question to answer to outcome. That join separated AI failures from routing and intake failures. The [case study](#/experience/enterprise-ai-quality) explains how I built it.

## Use an existing trace viewer

Tools such as Arize Phoenix and Langfuse already capture and store traces and show them in a usable screen. I put my effort into two other places: logging the right fields, and putting trace IDs where people already look.

I learned this the hard way. [SakethWiki](#/writing/review-gated-knowledge-system), my notes app, once had its own monitoring layer with dashboards and queues. It had more code to maintain than the app it watched. I moved model telemetry to Langfuse and removed that code. After the move I read traces more often, not less.

## Treat a missing trace as a bug

If I debug with traces, a request without a trace is a blind spot. I check for it like any other data problem. Lekhni's health report checks, for every session, that a trace exists for the generation. The check is simple, and when it fails it says exactly which session has no trace.

## One tradeoff

Easy access works against privacy. Traces hold user questions and sometimes the documents behind them. So easy access needs rules: hide sensitive fields, limit views by role, and set how long traces are kept. I set these rules at the start. When teams add them later, they often lock the traces away completely, and then nobody reads them.

## A simple test

Pick a bad answer from last week. Time how long it takes to open its trace, see what was retrieved, and know which step failed. If it takes less than a minute, the setup works. If it takes longer, I would fix that before I add another metric.
