const e=`# SEO, AEO, GEO: how buyers find a business now

For twenty years, a business won attention by ranking on a page of ten blue links. That page still exists. But more buyers now get one written answer instead, from Google's AI Overviews, ChatGPT, Perplexity, or Claude. Some buyers do not read an answer at all. They send an agent to compare options and book.

Marketing teams use three names for the work this needs. This note defines each one, shows what the evidence says, and ends with what a business can actually do. The security side of the same change is in a companion note, [Who is reading your website?](#/writing/geo-interceptor).

## Three names, three goals

LLM Pulse, a company that tracks AI visibility, separates the three like this ([LLM Pulse, Jul 2026](https://llmpulse.ai/blog/aeo-vs-geo-vs-seo/)):

| | Goal | How success is measured | Typical work |
|---|---|---|---|
| **SEO** (search engine optimization) | Rank in the organic results of Google and Bing | Clicks, rankings, conversions | Links from other sites, topic depth, technical health |
| **AEO** (answer engine optimization) | Have the search engine lift your text as the direct answer | Featured snippets, AI Overview citations | Short definitions, lists, tables, FAQ blocks, structured data |
| **GEO** (generative engine optimization) | Get your brand cited inside answers from AI tools | Share of mentions and citations in AI answers | Pages AI crawlers can read, presence on other sites, fresh content |

The same post argues that AEO and GEO are largely the same work with a different emphasis, and that SEO stays the base under both. Similarweb, which sells AI-search tools, makes the same point: GEO adds to SEO and does not replace it ([Similarweb, Mar 2026](https://aisearch.similarweb.com/blog/what-is-geo/)).

## Where the term GEO came from

The term comes from a research paper, not a marketing team. Aggarwal and co-authors introduced "Generative Engine Optimization" in 2023, and the paper was accepted to KDD 2024. They tested ways to rewrite content so generative engines show it more. The abstract reports that GEO "can boost visibility by up to 40%," and notes that the effect varies by domain ([arXiv:2311.09735](https://arxiv.org/abs/2311.09735)).

That "up to" matters. It is the best case in a research setup, not a promise for every site.

## Why businesses care

The numbers below come from Similarweb's own research, as it reports them. They are vendor figures, and I could not check each one against raw data.

- **Fewer clicks.** The share of news-related Google searches that end with no click rose from 56% in May 2024 to 69% in May 2025.
- **More AI referrals.** Visits referred by AI chatbots grew 357% year over year, to 1.1 billion in June 2025.
- **Unstable visibility.** Citing an AirOps report of 45,000 citations, Similarweb says only 30% of brands stay visible from one AI answer to the next. Only 20% stay visible across five runs of the same question.

The third point changes how a team measures results. A search ranking moves slowly. An AI answer can change each time someone asks. So GEO tools track a brand across many prompts and many runs, and report a share, not a position. Similarweb calls this "Share of Model."

## What Google says you do not need

A lot of GEO advice tells a business to add new files and new markup. Google's own guidance for its AI features says the opposite: "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary." It adds: "You don't need to create new machine readable files, AI text files, or markup to appear in these features" ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)).

That covers Google, not every AI tool. But it is a useful check. The \`llms.txt\` file is one example: Similarweb recommends it while also saying it is not a verified standard. Before a team spends time on a new file, it should ask which AI platform has said it reads that file.

## What a business can do

These four jobs come from the sources above. The grouping is my reading.

**1. Make the site readable without a browser.** Many AI crawlers read the HTML that the server sends and do not run JavaScript. LLM Pulse's checker fetches a page with and without JavaScript and reports "the share of your visible text that survives without JavaScript" ([LLM Pulse checker](https://llmpulse.ai/geo-crawlability-checker)). Bright Data publishes an open-source agent crew that audits a page against Google AI Overview results. It writes "page-level optimization suggestions in Markdown" ([Bright Data on GitHub](https://github.com/brightdata/geo-ai-agent)).

**2. Be cited by other sites.** In Similarweb's travel-brand example, the brand appeared in 13 of 180 tracked prompts. The most-cited sources were third-party sites such as Cvent, Wikipedia, and TripAdvisor, not the brand's own homepage. AI answers lean on what other sites say about a business.

**3. Give agents a structured door.** Some visitors want to act, not read. Sabre, which runs a large travel-booking platform, launched an MCP server in September 2025. MCP (Model Context Protocol) lets an AI agent call a company's functions directly. Sabre reports "nearly 80 customers both piloting and in full production mode." It says its MCP powers apps "live inside ChatGPT and Claude today" ([Sabre, Sep 2026](https://www.sabre.com/resources/newsroom/mcp-is-the-new-ndc-is-this-travels-shift-to-streaming-moment/)). These are Sabre's own figures, and the 80 includes pilots.

**4. Measure it as a share, over time.** Track a fixed set of prompts on each AI platform. Run them more than once. Report how often the brand appears, how often its own domain is cited, and how the answers describe it.

## My reading

SEO is still the floor. A page that search engines cannot crawl or trust will not do well in AI answers either. GEO adds two things on top. It adds measurement across unstable answers. It also moves attention off the website, to the other sites that AI tools quote.

For businesses where the buyer wants to act, such as booking travel, the bigger change is the structured door. A page helps an AI tool describe a business. An API lets an agent complete the sale.

Opening the site to agents also opens it to visitors a business does not want. The companion note covers that side: [Who is reading your website?](#/writing/geo-interceptor).

## What this note does not claim

- The Similarweb and Sabre figures are company-reported. I found no independent check.
- The 40% figure is a best case from one research setup.
- Google's "no special requirements" statement covers Google's AI features only.

## Sources

- LLM Pulse (Esteve Castells), ["AEO vs GEO vs SEO"](https://llmpulse.ai/blog/aeo-vs-geo-vs-seo/), 8 Jul 2026, updated 16 Oct 2026.
- Similarweb (Limor Barenholtz), ["What is GEO?"](https://aisearch.similarweb.com/blog/what-is-geo/), 23 Mar 2026.
- Aggarwal et al., ["GEO: Generative Engine Optimization"](https://arxiv.org/abs/2311.09735), arXiv 2023, KDD 2024.
- Google Search Central, ["AI features and your website"](https://developers.google.com/search/docs/appearance/ai-features).
- LLM Pulse, [GEO crawlability checker](https://llmpulse.ai/geo-crawlability-checker).
- Bright Data, [geo-ai-agent repository](https://github.com/brightdata/geo-ai-agent).
- Sabre, ["MCP Is the New NDC — Is This Travel's Shift-to-Streaming Moment?"](https://www.sabre.com/resources/newsroom/mcp-is-the-new-ndc-is-this-travels-shift-to-streaming-moment/), 20 Sep 2026.
`;export{e as default};
