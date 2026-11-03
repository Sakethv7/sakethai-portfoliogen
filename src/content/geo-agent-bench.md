# Do AI agents use the shortcuts a site gives them? A 60-run pilot

*Research build log · 2026-11-03 · my own test site and my own runs*

> **In one paragraph.** I built a small fictional website and published it two ways: as plain HTML, and with extra shortcuts for AI agents (an `llms.txt` index and a markdown copy of each page). Then I sent Claude Sonnet 5.5 to answer 6 questions on each version, 5 times each. All 60 answers were correct on both versions. The shortcuts did not make the agent faster or cheaper. In 6 of 30 runs the agent read `llms.txt`. On the one task where it did so every time, those runs cost about 24% more input tokens and fetched no fewer pages. This is one agent on one small site. It is a pilot, not a ranking.

The companion notes cover the marketing side ([SEO, AEO, GEO](#/writing/seo-aeo-geo)) and the security side ([Who is reading your website?](#/writing/geo-interceptor)). Both rest on claims I could not test. This project tests one of them.

## The question

Advice on GEO (generative engine optimization) says to publish a version of your site that agents read more easily. Common examples are an `llms.txt` file and markdown copies of pages. The pilot asks a narrow question. Given those shortcuts, does an agent use them, and does it then need fewer fetches or fewer tokens?

## The setup

**The site.** A fictional company with 9 pages: products, specs, pricing, a FAQ and a policy page. The text is invented, so the model cannot know the answers from training. The `legacy` version has 16 paths. The `ai` version has 26. It adds `/llms.txt` and a markdown twin of every page.

**The tasks.** Six questions with one exact answer each. Examples are a spec value or a price. A run counts as correct only if the normalized answer matches the stored one. No model grades the answer.

**The agent.** Claude Sonnet 5.5 with Anthropic's server-side web fetch tool. The agent starts from the home page URL and nothing else.

**The measuring.** The site writes its own request log. That log, not the agent's own report, says what was fetched. The test site is on a small cloud VM with its own domain and HTTPS.

**The size.** 6 tasks, 5 repeats, 2 versions: 60 runs. Cost was about $3.20 and the run took about one hour.

## Four things that changed the plan

I wrote design documents first. The build then broke four of my assumptions.

**1. The fetch tool caches.** In a probe, Claude's fetch tool returned a stored copy for at least 21 minutes. A cached page leaves no line in my log, so a missing line would not mean "not fetched". The fix was one host name per run: `<8-character token>.legacy.<domain>`. A new host is a new cache key. It also lets me match each request to exactly one run. This needed a wildcard HTTPS certificate, which needed DNS-based validation. That is why the build took longer than the experiment.

**2. The agent cannot see the head of the page.** My first `ai` version put its shortcuts in the HTML head, in a `<link rel="alternate">` tag. A diagnostic call showed that the fetch tool converts the page to markdown and drops the head. The model never saw the tag. The first dry run, 6 of 6 correct, showed no shortcut use for that reason. I moved the pointers into the visible body text.

**3. The tool only fetches URLs it has already seen.** The agent cannot guess `/llms.txt`. A URL must appear in the conversation first. So a visible pointer is the only way a shortcut can be used at all.

**4. The local model was not a usable baseline.** I also tried Qwen3-8B on my 16 GB Mac. It loaded only with a larger context setting. It fetched the home page, then answered "not available". That was 0 of 2. Two runs are not a verdict on Qwen. They show only that this setup was a poor baseline, so I dropped it and used cloud agents only.

## Results

All numbers are from my 60 runs. Intervals are 95% bootstrap intervals. I call a gap real only if the intervals do not overlap.

| Measure | `legacy` | `ai` |
|---|---|---|
| Correct answers | 30 of 30 | 30 of 30 |
| Pages fetched per run (mean) | 3.37 | 3.27 |
| Over-fetch ratio | 0.15 [0.09, 0.21] | 0.13 [0.08, 0.19] |
| Read `llms.txt` | 0 of 30 | 6 of 30 |
| Fetched a markdown twin | 0 | 0 |
| Input tokens per run (mean) | 23,712 | 25,286 |
| Seconds per run (mean) | 14.7 | 18.4 |
| Obeyed the planted prompt injection | 0 | 0 |
| Refusals | 0 | 0 |

Only one measure shows a real gap: reading `llms.txt`, which the `legacy` site does not have. Nothing else separates the two versions.

All 5 `ai` runs on t04 read `llms.txt`, and so did 1 of 5 on t02. On t04 both versions fetched 5 pages. The `ai` runs used 31,000 input tokens on average and the `legacy` runs used 25,000, about 24% more. The one t02 run that read `llms.txt` used 36,600 tokens, against a `legacy` t02 mean of 25,900. In this pilot the shortcut cost a fetch and saved none. Five runs per cell is small, so treat the size of the gap as rough.

The agent also never fetched a markdown twin. The fetch tool already converts HTML to markdown, so a twin adds little for this agent.

## What this does and does not show

On a 9-page site, Claude finds the answer in 2 to 5 fetches by following links. An index file can save at most one or two fetches, and it costs one. I expect the trade to change on a much larger site. I have not tested that.

The pilot does not show that `llms.txt` is useless. It shows that for one agent on a small site, the shortcut was not worth its fetch.

## Limits

- One agent (Sonnet 5.5), one small fictional site, one tool version. Results hold for that date and version only.
- Every run was correct, so success cannot separate the two versions. A harder task set might.
- Four runs carry a `cache_suspected` flag (3 on `legacy`, 1 on `ai`). I did not investigate them further. All four were still answered correctly.
- One `ai` run took 111 seconds against a median of 14. I did not find the cause.
- Identity checks matched on all 60 runs. The request log showed a `Claude-User` agent from published Anthropic address space.
- I did not test ChatGPT, Gemini or Perplexity. Their tools may behave differently.

## What I would do next

Make the site large enough that a shortcut can pay off, write harder tasks with answers that cannot be reached by browsing alone, and add a second cloud agent. I will do that only after I decide the first result is worth extending. The [Phase A follow-up](#/writing/geo-agent-bench-phase-a) took the first step: heavier pages, a local model and planted files.

*Related: [SEO, AEO, GEO](#/writing/seo-aeo-geo) · [Who is reading your website?](#/writing/geo-interceptor)*
