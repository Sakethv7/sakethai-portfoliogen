# The GEO agent benchmark: what I built and what I found

*Project overview · 2026-11-04 · my own test sites, my own runs · [code](https://github.com/Sakethv7/geo-agent-bench)*

> **In one paragraph.** More people now ask AI tools, not search engines, to find and compare businesses. GEO (generative engine optimization) is the advice on how to get a website read and cited by those tools. Much of that advice is untested. So I built test websites and a request log to watch what AI agents actually do on a site. I compare three kinds of site: legacy HTML built for people, agent-readable sites with `llms.txt` and markdown copies (a plain-text index and plain-text versions of each page), and agent-native interfaces built from MCP tools or identity-aware responses. I measure whether agents find the answer, follow hidden instructions, take more data than they need, handle a sign-in (OAuth), and prove who they are. Qwen and Claude ran as agents in my setup. Anthropic and OpenAI crawlers showed up in the public logs. OpenAI's hosted search was a separate probe. This is an experiment setup, and it is not yet a general benchmark of GEO effectiveness. Most results come from one run per test, so they show which way an effect points, not how large it is.

## Why I built it

Advice on generative engine optimization (GEO) says to publish a version of a site that agents can read more easily. I found little measured evidence. I wanted to compare the old web, an agent-readable web and an agent-native web while keeping the underlying facts fixed. A request log I own lets me check what each client actually fetched instead of trusting its answer. The same setup tests security questions: does an agent follow a hidden instruction, ask for more data than it needs, respect denied access, and prove who is asking?

## What exists

- A fictional company site on one small cloud VM with its own domain and HTTPS. The same facts appear as legacy HTML, agent-readable HTML plus markdown, and agent-native tools or identity-aware responses. The text is invented, so the model cannot know the answers.
- A site that writes its own request log. Each run has its own host name with a random token, so the log matches each request to one run.
- A runner and a scorer. A run counts as correct only if the normalized answer matches the stored one. No model grades the answer.
- Identity checks: published IP ranges, user agent names and signed requests (Web Bot Auth).
- One OAuth-protected page, a set of MCP tools, and a markdown interceptor.
- Qwen and Claude agent runs, public-log observations of Anthropic and OpenAI crawlers, and a separate OpenAI hosted-search probe. These are different kinds of evidence. They are not one comparison of three agents.
- 190 tests, 30 design records (ADRs), and result tables for every run.

## Seven findings

Each finding has its number and its limit. The numbers come from the result tables in the [repository](https://github.com/Sakethv7/geo-agent-bench). The linked note explains how each one was measured.

1. **A shortcut in the page head is invisible to a fetch tool.** Claude's fetch tool returns the page as markdown and drops the HTML head, so a `<link rel="alternate">` never reached the model. Only a visible pointer line in the page body worked, and even then Claude read `llms.txt` in 1 of 6 runs on a 9-page site. *Limit: one agent tool, one small site.* [The 60-run pilot](#/writing/geo-agent-bench)
2. **A fetch tool can cache a page for 21 minutes or more, by full URL.** Repeat runs on one host came from the tool's cache and left no trace in my log. The fix was a fresh host name per run, so each run has its own cache key. *Limit: measured for Claude's tool, suspected once for OpenAI's.* [How I set up the test website](#/writing/geo-agent-bench-setup)
3. **Use absolute links in markdown that you serve to agents.** A fetch tool follows only URLs it has seen, so it cannot use a relative link in raw markdown. My first markdown version answered 0 of 8 correctly. With absolute links it answered 8 of 8. *Limit: one tool. A human reader would never notice.* [Phase E](#/writing/geo-agent-bench-phase-e)
4. **Markdown served to a verified agent cut input tokens by about two thirds.** On the 6 tasks that all three versions solved, mean input tokens were 101k for plain HTML, 86k with `llms.txt` and markdown copies, and 33k with the interceptor. I predicted almost no change and was wrong. My guess is that the tool keeps menus and footers when it converts HTML. I did not test that. *Limit: one run per cell, one agent.* [Phase E](#/writing/geo-agent-bench-phase-e)
5. **A valid sign-in does not prove who is asking.** A spoofer that copied Claude's name and held a valid OAuth token read the protected page. Signed requests (Web Bot Auth) told signed agents from spoofed ones. Copying a name is common: one address sent 397 secret-file probes under Claude's name. *Limit: my own signer and verifier, checked against Cloudflare's.* [Tools, tricks and signatures](#/writing/geo-agent-bench-phase-b-c), [Signed requests](#/writing/geo-agent-bench-signatures)
6. **A small local model needed a better harness, not a bigger model.** The harness is the code around the model that fetches pages and passes them in. Qwen3-8B scored 0 of 12 with plain fetch tools and 12 of 12 with fixed navigation steps and a bounded context. The same model failed the OAuth task 0 of 3, because it never followed the link in the 401 reply. *Limit: one model, one quantization.* [Phase A](#/writing/geo-agent-bench-phase-a), [Agentic OAuth](#/writing/geo-agent-bench-oauth)
7. **OpenAI's hosted web search fetches live and names itself.** A probe showed `ChatGPT-User` and `OAI-SearchBot` requests from IPs in the files OpenAI publishes. Three fetches came from three IPs, so matching runs by IP fails and matching by host token works. A repeat page came from a cache. *Limit: one probe, two time windows, one model.* This probe has no note of its own.

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
| Phase F | Does OpenAI's hosted web search reach the site live? | Yes, as `ChatGPT-User`, from IPs in its published file. A repeat page came from a cache. | Finding 7 above |

The background reading is in two earlier notes: [SEO, AEO, GEO](#/writing/seo-aeo-geo) and [Who is reading your website?](#/writing/geo-interceptor).

## What I would tell an engineer who builds for agents

1. Put a shortcut in the visible page body. A fetch tool may drop the HTML head.
2. Use absolute links in any markdown you serve to agents. My first version used relative links and answered 0 of 8 correctly.
3. Check identity with more than the user agent name. Copying a name is common. A valid sign-in does not prove who is asking.
4. Match runs by a host token, not by IP. One agent used three IPs in one probe.
5. For a small local model, fix the harness before you blame the model.

## What it does not show

- One agent family for most runs, and one run per cell in Phase E. When every run succeeds, the confidence intervals say little about the true success rate.
- Marketing value. Whether markdown for agents raises citations needs a public, indexed site and weeks.
- Serving different content by identity looks like cloaking, which means showing search engines different content than people see. Search engines penalize cloaking. I did not test how they treat this case.

## How it connects to my day job

I use the same three habits on the RAG platform I work on. I write down how I will measure before I run anything. I keep my own record instead of trusting the system's answer. And I report the predictions that turned out wrong.
