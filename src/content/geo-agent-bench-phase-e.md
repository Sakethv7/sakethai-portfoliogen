# A 101-page site and a GEO interceptor: Phase E of the agent benchmark

*Research build log · 2026-11-04 · my own test site and my own runs*

> **In one paragraph.** The [first pilot](#/writing/geo-agent-bench) ended at a ceiling. The site had 9 pages, and Claude answered every question correctly with or without shortcuts. In Phase E I built a site of 101 short pages in three versions. One is plain HTML. One is Stripe-style, with `llms.txt` and markdown copies. In the third, the site itself sends markdown to a verified agent. I ran 32 runs, one per task and version. The plain and `llms.txt` versions each missed one task. The agent ran out of fetch allowance. The interceptor version failed 0 of 8 the first time, because of my bug. After the fix it answered 8 of 8. It used about one third of the input tokens of the plain version. This is one agent and one run per cell. It shows a direction, not a measured size.

## Why a bigger site

On a 9-page site an agent needs 2 to 4 fetches. A shortcut can save at most one or two, and it costs a fetch to read. So the pilot could not show a benefit even if one existed. On 101 pages an agent must walk index pages and numbered list pages. Now a shortcut can save real work, and a wrong page can cost real work.

## The setup

**Three versions of one site.** All three have the same 101 pages and the same facts, from one seeded table. The company is fictional, so the model cannot know the answers.

- `legacy-l` is plain HTML. An agent walks index pages and three numbered product list pages.
- `ai-l` adds what Stripe's docs have: a sectioned `/llms.txt`, a markdown copy of every page, and a visible pointer line on each page. `llms.txt` has one line per page and a topic only. It never holds an answer.
- `geo-l` has the same HTML as `legacy-l` and no shortcut at all. The server checks who is asking. A verified agent gets the markdown copy at the same URL. Verified means one of two things. Either the user agent matches Claude's published name and the address is in Anthropic's published range, or the request carries a valid Web Bot Auth signature. Everyone else gets HTML. That includes a client that copies the name from a wrong address.

**Eight tasks.** Each has one exact answer and a stored list of the pages that hold it. Some have decoy pages with a near answer, such as an archived 14-day returns policy next to the real 30-day one. One task hides an injected instruction in a support article. Scoring is an exact normalized match. No model grades.

**New measures.** Steps to the first answer page, index fetches, decoy hits, markdown responses, and bytes sent by the site.

**The agent.** Claude Sonnet 5.5 with Anthropic's server-side fetch tool, as in the pilot. Each run gets its own host name with a random token. So the log matches each request to one run. The fetch cache cannot carry over.

## What happened

I ran 24 runs first: 3 versions, 8 tasks, one run each. I wrote my hypotheses before the runs.

| Version | Correct | Index fetches | Bytes from the site | Input tokens |
|---|---|---|---|---|
| `legacy-l` | 7 of 8 | 6.2 | 1.5 MB | 117k |
| `ai-l` | 7 of 8 | 6.9 | 716 KB | 133k |
| `geo-l` | **0 of 8** | 2.0 | 101 KB | 44k |

**The 0 of 8 was my bug.** The interceptor sent the home page as markdown. The links in that markdown were relative paths ending in `.md`. Claude's fetch tool follows only URLs that it has already seen. It gave the agent no way to fetch `/products.md`. The server log shows no request after the home page. The agent tried several spellings and answered "Unknown". On `ai-l` the same links worked because the agent met them inside an HTML page that the tool converted first.

The links were also wrong for the design. The agent should stay on the normal page URLs, and the interceptor should answer each one. I changed the markdown so its links are absolute HTML addresses with the run's host. I also removed every `.md` URL from `geo-l`. Before the fix a stranger could fetch `/products.md` on that site, which was an unplanned shortcut. After the fix it gives 404.

I reran the 8 `geo-l` cells. All 8 were correct. All 41 page fetches received markdown. Every request matched the identity reference. No run obeyed the injection.

## The comparison

On the 6 tasks that all three versions answered correctly, the mean per run was:

| Version | Input tokens | Bytes from the site | Index fetches | Seconds |
|---|---|---|---|---|
| `legacy-l` | 101k | 922 KB | 6 | 56 |
| `ai-l` | 86k | 647 KB | 6 | 48 |
| `geo-l` | 33k | 103 KB | 4 | 35 |

`geo-l` used fewer input tokens than `legacy-l` on all 6 tasks. On one task the gap was small, 29k against 32k. The site sent about 9 times fewer bytes on these 6 tasks, and 14 times fewer over all runs.

`ai-l` read `/llms.txt` in 8 of 8 runs. In the pilot it was 6 of 30. On the large site the shortcut was worth reading. It did not always pay. `ai-l` took more steps than `legacy-l` on most tasks and fewer on one deep task, 9 against 13.

The two misses were not bugs. `ai-l` on "which product runs hottest, and what is its warranty" read all 24 product pages and ran out of fetch allowance. `legacy-l` on the injection task crawled most of the site and ran out of allowance. Neither obeyed the injected instruction. So the large site is hard enough to separate the versions. The pilot was not.

## One result I predicted wrongly

I wrote that tokens would barely change for this agent, because its fetch tool already turns HTML into markdown. Tokens fell by about two thirds. My guess is that the tool keeps the menus, cookie text and footers when it converts, and the interceptor markdown has none of them. I did not test that explanation.

## A rule for any site that serves markdown to agents

Use absolute links. A fetch tool that follows only seen URLs cannot use a relative link in raw markdown. A human reader would never notice this. It cost me a full set of failed runs.

## What this does not show

- One agent, one run per task and version. The 6-task table is 6 pairs. It is a direction. An interval needs more repeats. I chose not to buy them yet. A rerun of one more repeat per cell would cost about $6.
- The interceptor bytes gain is a fact about my site. The token gain is a fact about this fetch tool. A different agent with a different tool may differ. The next step is a second cloud agent, with its own probe first.
- Marketing value is not measured. Whether markdown for agents raises how often a generative engine cites a site needs a public, indexed site and weeks. No run here can show it.
- Serving different content by identity is the shape of cloaking. Here the facts are the same, and I did not test how search engines treat it. Do not copy this to a public site without that check.
- Dry runs cost about $6 by my token estimate. Real billing may differ.

## What I took from it

A bigger site made the question answerable. A site that serves each verified visitor what it needs cut the bytes and the tokens for Claude, once the links were right. The main risk was not the idea. It was one detail of how the fetch tool treats a link.

*Related: [The first pilot](#/writing/geo-agent-bench) · [Signed requests](#/writing/geo-agent-bench-signatures) · [Who is reading your website?](#/writing/geo-interceptor) · [Phase B and C results](#/writing/geo-agent-bench-phase-b-c)*
