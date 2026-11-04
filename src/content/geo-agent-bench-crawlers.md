# What real AI crawlers did on my plain site and my AI site

*Research note · 2026-11-03 · from the request log of my own test website*

I put two versions of a small fictional company site online. One is plain HTML. The other has the same pages plus an `llms.txt` file and a markdown copy of every page. I logged every request for 29 hours and 30 minutes, from 2026-11-02 22:00 UTC to 2026-11-04 03:27 UTC. The log holds 4,422 requests. This note covers the visitors that were not me.

## The two sites

- **`legacy`** has 9 pages of plain HTML.
- **`ai`** has the same 9 pages, `llms.txt`, and a markdown copy of each page. Each page also shows a visible link to its markdown copy.

I did not announce either site, and as far as I know no page links to them. Visitors found them on their own.

## Who came

3,170 requests came from visitors with no run token that were not my laptop. Only 119 of them, about 4%, came from named AI crawlers. The table lists them.

| Crawler | Requests | Addresses | Address check | Read `robots.txt` |
|---|---:|---:|---|---:|
| ClaudeBot | 76 | 3 | no address list published | 21 times |
| GPTBot | 37 | 5 | inside OpenAI's published range | 0 times |
| OAI-SearchBot | 6 | 6 | inside OpenAI's published range | 6 times |

OAI-SearchBot asked only for `robots.txt` and left. I do not know why. GPTBot sent no `robots.txt` request in this log. It may have used a stored copy. I did not test that.

## What ClaudeBot and GPTBot did

Both did the same thing. On each site they fetched all 9 pages, one time each.

On the `ai` site they also fetched all 9 markdown copies and `llms.txt` once. So the crawl on the `ai` site was 19 requests for content, against 9 on the plain site. Neither crawler asked for markdown with the `Accept` header. They requested the `.md` paths. All 9 of GPTBot's markdown requests carried a referer, so it followed the links on the pages. None of ClaudeBot's did, so it may have read the paths from `llms.txt`.

Both reached the plain site first, on the evening of 2026-11-02. They reached the `ai` site six to seven hours later.

ClaudeBot also asked for `sitemap.xml` 18 times. My sites have none, so each request got a 404.

Neither crawler asked for any of the fake secret files that I planted, such as `/.env`.

## What an agent did instead

In my own runs, Claude answered one question at a time. It fetched only what the question needed. In the 60-run pilot it read `llms.txt` in 6 of 30 runs on the `ai` site and fetched no markdown copy. A crawler takes everything once. An agent that answers a question takes a few pages. So a markdown copy doubled what a crawler fetched, and it changed little for the agent.

## The rest of the traffic

Most strangers were scanners. 2,612 of the 3,170 stranger requests got a 404, and they came from 309 addresses.

The largest single source was one address that claimed to be `Claude-User`. It sent 397 requests, all probes for secret files such as `/.env`. It hit every host I run: 112 on `legacy`, 100 on `ai`, 56 on `native`, 92 on `account` and 37 on `bot`. The address belongs to a hosting company, not to Anthropic. Two requests claimed to be Googlebot from addresses outside Google's range.

No stranger requests came from Anthropic's published range for `Claude-User`. The 12 requests I saw from that range were my own test runs.

## Limits

- One small site and 29 hours and 30 minutes. I cannot choose who visits or when.
- ClaudeBot publishes no address list, so its identity rests on its user agent alone.
- I count requests, not visitors.
- Vendor range lists change. These checks hold for the lists I saved on 2026-11-03.

*Related: [The request log and the setup](#/writing/geo-agent-bench-setup) · [Do AI agents use the shortcuts a site gives them?](#/writing/geo-agent-bench) · [Signed requests](#/writing/geo-agent-bench-signatures)*
