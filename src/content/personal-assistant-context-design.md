Most chat assistants keep a growing message history and replay it on every turn. That makes them hard to reason about. The answer depends on a transcript you can't see. I wanted a personal assistant where I can always point at the file that fed a wrong answer.

This note covers a local-first assistant I'm building around that idea. It describes the design, where it came from, what it costs, and what I'm still working out.

## Where it came from

I started it in late April 2026 as a terminal assistant. It knew who I was, what I was working on, and what my goals were. The first version was just that: a command that gathers my context and asks a local model a question.

The goal was never only question answering. I build with microcontrollers and sensors, and I wanted a software colleague for hands-busy work. Before I start, it briefs me on the day and the open risks. While I build, it watches the signals and speaks up only when something changes. After I finish, it wraps the session into a journal entry and next steps. I wrote that loop down as build, observe, speak, log, summarize.

Since then I've cut some things. I built voice output and then found I never used it, so I'm removing it.

## What it has to do

1. Answer a question using my identity, goals, notes and projects.
2. Keep memory that changes only when I tell it to.
3. Watch a hardware signal and speak only on a state change.
4. Work with no network. A cloud model is optional.

It does not need to serve anyone else, hold long chats, or run as a hosted service.

## Complexity tier

**Single-process command-line tool, plus two optional helpers on localhost.** The helpers are a background watcher and a small status dashboard. They are separate processes that I start myself. They share files with the main tool. They do not talk over a message bus, and nothing listens on a public port.

My design doc states a rule for this tier. If a part of the plan seems to need a service, a queue, a second daemon, or a sign-in flow, the design is wrong. It is a useful test, because each of those is easy to add and hard to remove.

## The core bet: rebuild context on every call

Every command assembles a fresh block of context from named files and sends it in a single model call. It then prints a short plain-text answer. There is no chat server, no saved conversation, and no database for the assistant's own state.

The block is built in layers, in a fixed order:

| Layer | What it holds | Always included? |
|---|---|---|
| Identity | Who I am, my active projects, my goals | Yes, in compact form. The full file only for deep commands. |
| Durable memory | Stable facts and recurring context | Yes |
| Goals | A plain list I edit | Yes |
| Retrieved notes | Keyword-matched passages from my notes | Only when a query asks for them |
| Recent activity | What I did lately in git, my journal, my notes apps and my other tools | Only when a command opts in |

I keep the layers narrow on purpose. Durable memory holds what stays true. Recent activity holds what just happened. Retrieval holds supporting facts. If those blur together, the assistant starts sounding aware while it is really guessing at my state. That is my reasoning, and it is why each layer has one job.

The same question with the same files gives the same context. When an answer is wrong, I open the file that fed it and fix it.

## Two boundaries that matter

**Orchestration versus capability.** One file only routes commands. One module only builds context. One module only talks to models. A workflow module calls into those, and it never opens a model connection itself.

**Config as the only source of truth.** Every path the assistant reads comes from one config file. A feature that needs a new location gets a new key there. It does not hard-code a path.

## Model routing

There are four call types, split by how much thinking a task needs: fast, deep, a quick hardware check, and hardware design. Each one picks a cloud or local model from a setting. In `auto` mode it uses the cloud model when an API key exists and falls back to a local model otherwise. One routing table means one place to change a model.

## How it degrades

- Each recent-activity source is a small adapter that reads a local file, database or command. If one fails, it returns nothing, and the others still work.
- The status dashboard binds to localhost only, checks the host name, and checks the origin on any request that changes state.
- The Mac app shell is only a launcher and viewer. It owns no state and opens no port. If it ever needs logic the command line doesn't have, that logic belongs in the Python package first.

## Decisions and what each cost

| Decision | What I gave up |
|---|---|
| Rebuild context on every call | Slightly more work per call, and no natural follow-up questions. |
| No saved chat history | I have to restate things the files don't hold. |
| Plain files, no database | No fast queries. Event logs need a stable line format so summaries stay easy. |
| Keyword retrieval, not vectors | It misses paraphrases. Simple and explainable matters more at my scale. |
| Local by default, cloud optional | Local models are weaker, especially on deep tasks. |
| One tier, no services | No multi-device access. |

## What I'm doing now

I'm folding an earlier companion app into this one, so there is one routing policy and one context path. That work is part done. I'm also designing a Mac app shell and a calmer status screen that puts one answer first. Both are still in progress.

## Open problems

- Watching a real hardware signal over a serial port is written but not tested against real hardware yet. That is the first thing on my list.
- Voice alerts get annoying fast. The rule I'm using is to speak only on state changes, threshold crossings and recovery, and to leave raw streams in logs.
- I haven't measured how much the recent-activity layer improves answers over leaving it out.
