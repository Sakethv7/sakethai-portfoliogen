I built the SDLC Intelligence Agent for the GitLab AI Hackathon. It is a small service, so this is a short note on how it is put together. It is not a full system-design doc.

## The idea

AI can already write code. The slow parts are around the code. Security review arrives late. Merge requests skip process steps. Nobody has time to triage pipeline failures. There is no clear weekly picture of what shipped. I wanted agents that react to real GitLab events and post their results where the team already looks. A chat window was not the goal.

## The shape

One webhook server, one orchestrator, and four agents. GitLab sends an event, the server turns it into a small context (project, merge request, pipeline), and the orchestrator picks the agents.

| Event | Agents that run |
|---|---|
| Merge request opened | Security, then Compliance |
| Reviewer assigned | Compliance |
| Pipeline failed | Insight |
| Weekly schedule or manual call | Digest |

Every other event is ignored with a clear response. The webhook checks GitLab's secret token before it does anything. The whole thing is about 760 lines of Python. Most of that is the GitLab, Slack, and Anthropic clients.

## Three decisions worth writing down

**The orchestrator is a plain function.** It is an if/else on the event name that calls agent objects from a dictionary. There is no agent framework. With four agents and fixed triggers, a framework would add more machinery than it removes. The cost is that adding a fifth agent means editing the function.

**Each agent run is wrapped in a try/except.** If the Security Agent crashes, the Compliance Agent still runs. The failure comes back as an error entry in the result. A crash is not a silent drop. The cost is that errors travel as data, so a caller has to read the result to notice them.

**The Security Agent retrieves policy chunks instead of loading every policy.** It searches a local vector store of policy documents. It queries with the start of the diff plus two fixed queries. It keeps only chunks above a similarity threshold. The idea is that the prompt carries a few chunks instead of every policy. My repo's sustainability doc claimed this cuts policy tokens by 60 to 80 percent. I measured it, and at the size of my sample corpus it does not. The three policy files total about 6,000 characters. The retrieved context for four test diffs was 4,000 to 6,200 characters, which is 67 to 103 percent of the corpus. Three fixed queries each return up to four chunks, so a small corpus is almost fully retrieved every time. Retrieval would only pay off on a policy set many times larger. This is the retrieval code I first built in [RAG Mini](https://github.com/Sakethv7/RAG_mini-phase-2) and ported over. If the embedding model is unavailable, a deterministic fallback embedder keeps tests and restricted environments running.

## Keeping cost bounded

- Diffs are capped at 20 files, 5 hunks per file, and 10,000 characters in the prompt. Pipeline logs send the last 60 lines of each failed job.
- The larger model handles security review, failure analysis, and the digest. The smaller one handles trend summaries and the compliance checklist, which are structured and short.
- Agents run only when an event arrives, so an idle project makes no model calls.
- Each completion writes its token counts to a log file that CI keeps as an artifact.

## What I would change

Three things. First, retrieval. I fixed the claim above in my repos. The next step is to grow the policy set or drop retrieval for something simpler. Second, the webhook handler runs the agents inside the HTTP request, so GitLab waits on the model calls. I would put a queue between the webhook and the agents. That is my reasoning about the design, not something I hit in testing. Third, the tests check formatting, verdict handling, and retrieval. They do not score whether the findings are right. I have not measured how often the Security Agent is correct, and I would not trust it as a gate without that.

## Corrections after I wrote this

Checking my own claims turned up three more problems, all fixed in my repos. The cost tracker used Haiku 3 prices under the Haiku 4.5 name. So Haiku cost estimates were four times too low. My docs also said Haiku was 12 times cheaper than Sonnet. Current list prices make it about 3 times cheaper. The Insight agent set its recurrence-risk label by looking for the words HIGH or LOW anywhere in the model's answer. So a phrase like "high confidence" could set the wrong level. It now reads the risk section the prompt asks for. My earlier portfolio summary also said the agent connects failures to impacted files, which it does not. It reads job log tails and recent failure history.

The agents are also published to the hackathon's GitLab AI Catalog, and the webhook server ships as a container for Cloud Run.

*Code: [github.com/Sakethv7/SDLC-Intelligence-Agent](https://github.com/Sakethv7/SDLC-Intelligence-Agent).*
