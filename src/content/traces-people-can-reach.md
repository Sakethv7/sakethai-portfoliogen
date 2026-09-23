Most teams building with LLMs say they log traces. Fewer can answer a simpler question: when someone reports a bad answer, how long does it take to open the trace behind it?

If the answer is "find an engineer, get the timestamp, search the logs," the traces exist but nobody reads them. Observability that takes ten minutes to reach gets used during incidents and ignored the rest of the time. The value is in the ordinary days, when one odd answer is the first sign of a pattern.

## What a trace needs to hold

A trace is the record of one request as it moved through the system. For a RAG assistant, the useful fields are:

- the user's question, and the rewritten query if there is one
- the retrieved chunks, with their document IDs and scores
- the prompt version and the model
- the raw model output, before any post-processing
- latency and token counts for each step

The retrieved chunks are the field people most often leave out, and the one that matters most. Without them you can't tell a [retrieval failure from a generation failure](#/writing/retrieval-vs-generation-failures). You see a wrong answer, but not whether the model had the right context and ignored it, or never had it at all.

Prompt version matters for a different reason. When quality drops after a change, you want to filter traces by version and compare. In [Lekhni](#/writing/lekhni-recording-to-knowledge), every generation logs its prompt version, so a worse batch of notes points straight at the change that caused it.

## Make the trace one click away

The fix for unread traces is mostly plumbing, not tooling.

**Put the trace ID where the complaint lands.** A thumbs-down, a support ticket, a row in a dashboard: each should carry the trace ID. Then "this answer was wrong" comes with its evidence attached, instead of starting a search.

**Link from aggregates to examples.** A dashboard that says retrieval failures went up is a question. A dashboard where you click that number and see twenty of the failing traces is an answer. The jump from a metric to the rows behind it is the most useful link in the whole stack.

**Make traces searchable by what people know.** Engineers search by timestamp. Everyone else knows a user, a session, a document, or a topic. Index traces by those too.

## Let non-engineers read them

Traces are usually built for the people who wrote the system. But many failures belong to someone else. A knowledge gap belongs to the person who owns the content. A routing mistake might belong to whoever owns the taxonomy.

Those people won't read a JSON span tree. Give them a plain view: the question, the documents that came back, the answer, and a label for what went wrong. If a content owner can open that view and see that no document covers the question, the gap gets fixed without a ticket passing through three teams.

## A trace alone isn't enough

A trace tells you what the model did. It doesn't tell you what happened next. Did the user rephrase and ask again? Open a case? Give up?

On a production assistant I evaluate, the most useful work was joining traces with interaction records and ticketing data at the row level, so one session could be read from question to answer to outcome. That's what separated AI failures from routing and intake failures. The traces were necessary, but the join is what made them explain anything. The [case study](#/work/enterprise-ai-quality) covers how that was built.

## Don't build the viewer yourself

Tools like Arize Phoenix and Langfuse already do trace capture, storage, and a usable UI. The work worth doing is on either side of them: logging the right fields, and wiring trace IDs into the places people already look.

I learned this the expensive way. [SakethWiki](#/writing/review-gated-knowledge-system) once had its own self-monitoring layer with dashboards and queues. It was more code to maintain than the system it watched. Moving model telemetry to Langfuse removed that code, and I read traces more often afterward, not less.

## Treat a missing trace as a bug

If traces are how you debug, a request without one is a blind spot. Check for it the same way you check for any other data problem. Lekhni's health report asks, for every session, whether a trace exists for the generation. It's a boring check, which is the point: it fails loudly and specifically.

## One tradeoff to name

Easy access pulls against privacy. Traces hold user questions, and sometimes the documents behind them. Making them easy to reach means deciding who can see what: redacting sensitive fields, scoping views by role, and setting how long traces are kept. Decide this up front. Locking traces down after the fact usually means locking them away, and then nobody reads them again.

## The test

Pick a bad answer from last week. Time how long it takes to open its trace, see what was retrieved, and know which step failed. If that's under a minute, the observability is working. If it isn't, that's the thing to fix before adding another metric.
