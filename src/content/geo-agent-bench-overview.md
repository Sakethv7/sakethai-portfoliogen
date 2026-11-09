# The GEO agent benchmark: what I built and what I found

*Project overview · 2026-11-04 · my own test sites, my own runs · [code](https://github.com/Sakethv7/geo-agent-bench)*

> **In one paragraph.** GEO-agent-bench is a well-engineered experimental harness for studying agent web behavior, identity, tools and access. It is not yet a general benchmark of GEO effectiveness. I use it to compare three kinds of web surface: legacy HTML built for people, agent-readable sites with `llms.txt` and markdown copies, and agent-native interfaces built from MCP tools or identity-aware responses. Across them I measure navigation, instruction adherence, data exposure, OAuth and signed identity. Qwen and Claude ran as agents in my harness; Anthropic and OpenAI crawlers arrived in the public logs; OpenAI hosted search was a separate probe. Most results are one run per cell, so they show a direction, not a size.

## Why I built it

Advice on generative engine optimization (GEO) says to publish a version of a site that agents can read more easily. I found little measured evidence. I wanted to compare the old web, an agent-readable web and an agent-native web while keeping the underlying facts fixed. A request log I own lets me check what each client actually fetched instead of trusting its answer. The same setup tests security questions: does an agent follow a hidden instruction, ask for more data than it needs, respect denied access, and prove who is asking?

## What exists

- A fictional company site on one small cloud VM with its own domain and HTTPS. The same facts appear as legacy HTML, agent-readable HTML plus markdown, and agent-native tools or identity-aware responses. The text is invented, so the model cannot know the answers.
- A site that writes its own request log. Each run has its own host name with a random token, so the log matches each request to one run.
- A runner and a scorer. A run counts as correct only if the normalized answer matches the stored one. No model grades the answer.
- Identity checks: published IP ranges, user agent names and signed requests (Web Bot Auth).
- One OAuth-protected page, a set of MCP tools, and a markdown interceptor.
- Qwen and Claude agent runs, public-log observations of Anthropic and OpenAI crawlers, and a separate OpenAI hosted-search probe. These are different kinds of evidence, not one three-agent comparison.
- 190 tests, 30 design records (ADRs), and result tables for every run.

## The notes, in order

| Step | Question | Short result | Note |
|---|---|---|---|
| Set-up | How do I host the test site and log every request? | Cloudflare, one small VM, one log. | [How I set up the test website](#/writing/geo-agent-bench-setup) |
| Pilot | Does an agent use `llms.txt` or a markdown copy? | 60 of 60 correct. `llms.txt` read in 6 of 30 runs, no copy fetched. | [The 60-run pilot](#/writing/geo-agent-bench) |
| Real visitors | Who reads the site when nobody asks them to? | ClaudeBot and GPTBot took every page and every markdown copy. | [What real AI crawlers did](#/writing/geo-agent-bench-crawlers) |
| Phase A | What changes on a realistic site, with a local model and planted files? | Claude 24 of 24. Qwen 0 of 12, then 12 of 12 after a harness change. | [Phase A](#/writing/geo-agent-bench-phase-a) |
| Phase B and C | What do tools, hidden text and signatures do? | Broad tools returned 18 to 28 times the bytes. A spoofer with a valid token read the protected page. | [Tools, tricks and signatures](#/writing/geo-agent-bench-phase-b-c) |
| Phase D | Can an agent sign in, and can a site check a signature? | A signature gate blocked 6 of 6 spoofed or unsigned runs. | [Agentic OAuth](#/writing/geo-agent-bench-oauth), [Signed requests](#/writing/geo-agent-bench-signatures) |
| Phase E | Does a site that sends markdown to a verified agent help on a large site? | About one third of the input tokens, after one bug fix. | [A 101-page site and a GEO interceptor](#/writing/geo-agent-bench-phase-e) |
| Phase F | Does OpenAI's hosted web search reach the site live? | Yes, as `ChatGPT-User`, from IPs in its published file. A repeat page came from a cache. | In the [repository findings](https://github.com/Sakethv7/geo-agent-bench/blob/master/FINDINGS.md) |

The background reading is in two earlier notes: [SEO, AEO, GEO](#/writing/seo-aeo-geo) and [Who is reading your website?](#/writing/geo-interceptor).

## What I would tell an engineer who builds for agents

1. Put a shortcut in the visible page body. A fetch tool may drop the HTML head.
2. Use absolute links in any markdown you serve to agents. My first version used relative links and answered 0 of 8 correctly.
3. Check identity with more than the user agent name. Copying a name is common. A valid sign-in does not prove who is asking.
4. Match runs by a host token, not by IP. One agent used three IPs in one probe.
5. For a small local model, fix the harness before you blame the model.

## What it does not show

- One agent family for most runs, and one run per cell in Phase E. The intervals collapse when every run succeeds.
- Marketing value. Whether markdown for agents raises citations needs a public, indexed site and weeks.
- Serving different content by identity has the shape of cloaking. I did not test how search engines treat it.

## What it says about my work

The benchmark is a systems project. It joins evaluation (exact ground truth, no model as judge), observability (a log I own), infrastructure (DNS, TLS, one VM) and security (identity, signatures, sign-in). The same habits apply to the RAG platform I work on. Write the measure before the run. Keep an independent record. Report the wrong predictions.
