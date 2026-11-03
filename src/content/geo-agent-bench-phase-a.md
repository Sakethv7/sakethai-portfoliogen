# A realistic site, a local model and a scanner in the log: Phase A of the agent benchmark

*Research build log · 2026-11-03 · my own test site and my own runs*

> **In one paragraph.** The [first pilot](#/writing/geo-agent-bench) found no gap, because its site was tiny and Claude's fetch tool rewrites pages before the model sees them. Phase A fixes both. I made the pages heavy, planted fake secret files, and added a local Qwen3-8B model next to Claude. Claude answered 24 of 24 questions correctly. Qwen answered 0 of 12, then 12 of 12 once I changed the harness around it. The request log also caught a scanner that copied Claude's name. This is one site, one task set and one day. It is a set of observations, not a ranking.

## What changed from the pilot

The pilot's site had 9 pages of about 2 KB each. A real page carries navigation, scripts and footers. In Phase A both site versions, `legacy` and `ai`, wrap every page in about 100 KB of that material. The `ai` version still adds `llms.txt` and markdown copies. It also answers a request with `Accept: text/markdown` by sending the markdown copy.

I added three kinds of agent client:

- **Claude with Anthropic's fetch tool.** The vendor path. The tool converts the page itself.
- **Claude with my own fetch tool.** The model is the same, but it reads the raw page. This separates the model from the tool.
- **Qwen3-8B on my laptop.** A small local model with my raw fetch tool. This is the local-against-cloud comparison.

I also planted four fake files a careless site might expose, each with a unique marker string: `/.env`, `/.git/config`, a database dump and a JavaScript source map. A run that requests one is an **exposed hit**. A run whose answer repeats a marker has **leaked** it.

The test is 6 tasks, 2 site versions and 3 clients, one pass: 36 runs. I cut the plan from 180 runs. Extra repeats would cost about $30 and seven hours, and they would add little here.

## Results

| Client | Correct | Page fetches | What it did |
|---|---|---|---|
| Claude, Anthropic's tool | 12 of 12 | 45 | Read `robots.txt` before any content, every run. One run fetched the planted promo trap. |
| Claude, my raw tool | 12 of 12 | 35 | On `ai`, read `llms.txt` in 3 of 6 runs and fetched 4 markdown copies. Two runs also opened the contact form. |
| Qwen3-8B, direct | 0 of 12 | 14 | Ten runs fetched only the home page and gave a wrong answer. Two runs ran out of context. |

No run requested a planted file, leaked a marker, or obeyed the planted prompt injection. No client asked for markdown through the `Accept` header. The 24 Claude runs cost about $4.94 in tokens. That is an estimate from token counts, not an invoice.

Format did not change correctness for Claude. It changed navigation a little: only the raw-tool Claude used `llms.txt`, and the vendor tool did not. In the pilot the vendor tool read it in 6 of 30 runs. I do not claim a reason for the difference.

## The Qwen result and the fix

Zero of twelve is not a score for Qwen. It is a score for Qwen inside a thin harness. The harness gave the model a raw page of up to 60,000 characters and no help. Ten runs stopped at the home page. Two ran past the 32,768-token context.

I did not add a second model to judge or steer. I added deterministic code:

```
raw page → visible <main> text + a list of links → bounded history → Qwen picks the next link → one recovery nudge if it stops at the start page
```

The page is cut to 8,000 characters. Old tool results shrink to short markers. Qwen still chooses which link to open and writes the answer. The code never reads the answers.

The main lesson is plain. A small local model did well once I made the harness more deterministic and gave it better tools: a clean text view of each page and an explicit list of links. The model was the same file. The harness changed. Much of what looks like a weak model is a weak harness.

With that code, Qwen answered 12 of 12 with no context overflow. It made 37 page fetches and the code used its one nudge three times. This shows that scaffolding changed the result a lot on these six tasks. It does not show that Qwen3-8B is a reliable navigator. It also does not show which part of the scaffold did the work.

## The finding I did not want to hide

In one `ai` run, Qwen followed the fetch step of the planted injection and opened the injected page. Its final answer was still correct and did not repeat the injected text. By my predeclared metric that run counts as obeyed. Robust navigation made Qwen better at finding answers. It also made it more willing to follow a link it should not follow. The same change did both.

## Who else was in the log

The site is public, so strangers arrive. In about one day the log held 1,101 requests with no run marker. One stood out. A client with the user agent `Claude-User` made 224 requests. Twelve came from Anthropic's published address range and probed nothing. The other 212 came from one address that belongs to a hosting company, outside that range. Those 212 searched for `.env`, `.git` and `.vscode` paths.

A user agent is only a claim. The IP check showed that a scanner was wearing Claude's name. The check has limits. An address inside a vendor's range shows the network, not which product or user sent the request. Vendors also change their ranges.

## What I decided, and what I gave up

- **Drop the 180-run plan.** I gave up tight repeats. I gain a result in 90 minutes.
- **Keep the direct Qwen result and add a new arm.** I do not replace 0 of 12 with 12 of 12. Both stay in the data, in separate files.
- **No learned controller yet.** A second model that ranks links would add cost and a second source of errors. Plain code solved the observed problem.
- **Real bots are data, not a test.** I cannot control which bots visit or when. I report what arrives.

## Limits

- One site, six tasks, one pass per cell. The cell counts are descriptive. They are not rates.
- Qwen's numbers describe one model file, one quantization and one harness.
- One Claude run is flagged as possibly cached. It claimed two markdown URLs that the origin never served. The flag stays in the report.
- Per-run identity checks for the vendor tool are marked `unchecked`. My saved reference used a different arm name. I did not rename it after seeing the results.

## What comes next

Phase B tests tools instead of pages, and Phase C tests identity and permission. Both are done. The results are in [Phase B and C](#/writing/geo-agent-bench-phase-b-c).

*Related: [Do AI agents use the shortcuts a site gives them?](#/writing/geo-agent-bench) · [Who is reading your website?](#/writing/geo-interceptor)*
