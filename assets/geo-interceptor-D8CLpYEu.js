const e=`# Who is reading your website? Interceptors and security in the age of GEO

**GEO** (generative engine optimization) is the work of getting a business cited in AI answers. The marketing side is in a companion note, [SEO, AEO, GEO: how buyers find a business now](#/writing/seo-aeo-geo). This note covers the other side.

To be cited, a site has to let AI crawlers and agents read it. The same open door lets in visitors the business does not want: scrapers that ignore its rules, and clients that pretend to be someone else. So a business now has two jobs at the edge of its website. It must serve good agents well. It must also find out who each agent is, and what it wants, before it answers.

The layer that does both jobs is often called a **GEO interceptor**. That name is informal. I found no product or standard that uses it. But several vendors describe the same layer, and this note uses their sources.

## Agents arrive in different forms

HUMAN Security, a bot-detection company, sorts AI traffic into three classes ([HUMAN Security, 5 Aug 2026](https://www.humansecurity.com/learn/blog/ai-ecosystem-agents-scrapers-crawlers/)):

- **Crawlers and scrapers** collect content to train models, such as GPTBot and ClaudeBot.
- **Retrieval bots** fetch a page during a live conversation, such as ChatGPT-User, Claude-User, and Perplexity-User.
- **Agents and agentic browsers** plan and act across many steps. They can log in, fill forms, and buy.

The third class is the hardest to see. NEC is one example of a company that builds such agents. In August 2026 it began selling **NEC cotomi Agent** through Microsoft Marketplace, starting in Japan. The release says the agent operates real business systems and browsers, and installs as a web browser extension ([NEC press release, 18 Aug 2026, Japanese](https://jpn.nec.com/press/202608/20260818_01.html)). Its underlying technology, cotomi Act, reached an 80.4% task success rate on the WebArena web-automation benchmark. The release cites a human rate of 78.2%.

HUMAN explains why that kind of agent is hard to detect. Local agents "operate within user browsers, inheriting the same fingerprints, session states, and network characteristics as legitimate manual activity." The NEC release does not say how its agent identifies itself to the sites it visits. *My reading:* a website that sorts traffic only by user-agent string may not see such an agent as an agent at all.

NEC is also working on the identity problem from the agent side. In July 2026 NEC and Ava Labs signed a memorandum of understanding to explore biometric verifiable credentials on a blockchain. Biometric Update reports NEC's reasoning: as agents act for users, "identity verification, authority verification, and fraud prevention" become more important ([Biometric Update, 13 Jul 2026](https://www.biometricupdate.com/202607/nec-ava-labs-building-on-chain-verification-layer-for-ai-agents-stablecoins)). That article does not link NEC's own release, so treat the quote as reported, not primary.

## A name is a claim, robots.txt is a request

Most of this rests on one fact. A website cannot trust what a visitor says about itself.

The **user-agent string** is a line of text that the client chooses. Any scraper can send \`GPTBot\` in it.

**robots.txt** is a file that asks crawlers to stay out of some paths. It enforces nothing. ChatGPT-User fetches pages when a person asks ChatGPT a question. For that agent, OpenAI's own documentation says "robots.txt rules may not apply," because the visit is user-initiated ([OpenAI crawler docs](https://developers.openai.com/api/docs/bots)). OpenAI separates that agent from GPTBot, which collects training data, and OAI-SearchBot, which powers ChatGPT search. A site that blocks one has not blocked the others.

The scale is large. TollBit, which tracks AI bots across publisher sites, reports more than 22 billion AI bot scrapes in the first half of 2026. It reports more than 1.9 billion that "bypassed or ignored robots.txt instructions set by publishers" ([TollBit](https://tollbit.com/)). That is about 9% of the scrapes it detected.

Three methods give real evidence of identity:

1. **Published IP ranges.** OpenAI publishes the IP addresses for each of its crawlers. A request that claims to be GPTBot but comes from another address is not GPTBot.
2. **Reverse DNS.** Google documents the hostnames its crawlers resolve to, and publishes IP ranges in \`common-crawlers.json\`. Google also warns that user-agent strings can be spoofed ([Google crawler docs](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)).
3. **Signed requests.** Web Bot Auth lets an agent operator sign each HTTP request with a private key and publish the public key. The site checks the signature. The IETF has a working group for it, and its main document is the working-group draft "HTTP Message Signatures for automated traffic" ([IETF datatracker](https://datatracker.ietf.org/wg/webbotauth/)). It is a draft, not a finished standard.

HUMAN reports that OpenAI's ChatGPT agent already signs its requests with HTTP Message Signatures (RFC 9421), so websites can check it. HUMAN also warns that declared crawlers are only the visible part: some collection likely runs through "secondary, undeclared crawlers." Those never sign anything.

Use the method each operator documents. A valid signature or IP match proves who operates the agent. It does not prove that the request is allowed. That is a separate decision.

## What vendors sell at the edge

Several companies now work at the **edge**, the network layer in front of a website.

**Verify identity and charge for access.** Cloudflare calls a bot verified when it "is transparent about who it is and what it does." The bot proves this with a cryptographic signature, a published IP list with a stable user agent, or reverse DNS. It must also follow robots.txt and keep reasonable request rates ([Cloudflare docs](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/)). Some sites charge for crawling. There, Cloudflare answers an unpaid AI crawler with HTTP status 402 and puts the price in a response header ([Cloudflare docs](https://developers.cloudflare.com/ai-crawl-control/features/pay-per-crawl/use-pay-per-crawl-as-ai-owner/verify-ai-crawler/)).

**Serve agents a readable version.** Scrunch's Agent Experience Platform detects AI visitors such as ChatGPT-User and PerplexityBot at the CDN. It returns server-rendered HTML with "structured summaries and context blocks." Human visitors get the normal site. Googlebot and Bingbot are not routed ([Scrunch FAQ](https://scrunch.com/faqs/what-is-scrunch-agent-experience-platform-axp-and-how-does-it-work)). Adobe's Optimize at Edge works the same way. It serves optimized HTML "only to AI agents," and says it "does not impact either human users or SEO bots" ([Adobe docs](https://experienceleague.adobe.com/en/docs/llm-optimizer/using/resources/optimize-at-edge/overview)).

**Control crawlers at runtime.** API7, an API gateway company, argues for "a runtime control layer that can observe, classify, limit, allow, challenge, or block crawler behavior" ([API7, 1 Jul 2026](https://api7.ai/blog/ai-crawlers-need-api-gateway-controls)).

## What a GEO interceptor does

A GEO interceptor puts those parts in one place, in front of the website and any agent API. *My reading:* across the sources above, it does four things in order. The four-step split is my summary, not a vendor's diagram.

\`\`\`text
request arrives
  -> 1. identify   who operates this client? (signature, IP range, reverse DNS, or claim only)
  -> 2. classify   which class? (training crawler, retrieval bot, acting agent)
  -> 3. decide     serve agent view | route to API | ask for payment | rate-limit | block
  -> 4. record     log the identity, class, decision, and outcome
\`\`\`

**1. Identify.** Sort each request into three trust levels: *verified* (a valid signature, a matching IP range, or a matching reverse DNS name), *claimed* (a known agent name with no proof), and *unknown*. Treat a claimed name with no proof as unknown.

**2. Classify.** Map each known agent to one of HUMAN's three classes. One operator can appear in all three, so the class comes from the agent, not the company.

**3. Decide.** A verified retrieval bot gets the readable agent view, as Scrunch and Adobe do. An acting agent gets routed to a structured API, such as an MCP server. A training crawler may get a 402 and a price, as with Cloudflare. An unknown client that ignores robots.txt gets rate-limited or blocked. The policy can also differ by path. HUMAN's example is to let a scraper learn from marketing content but not from pricing pages.

The same order already exists for agents that call tools. In Amazon Bedrock AgentCore Gateway, a request interceptor runs custom code before a request reaches a tool. AWS writes that "the Gateway evaluates the request interceptor before the Cedar policy." So the interceptor can check identity and add context before a fixed allow-or-deny rule runs ([AWS, 1 Jun 2026](https://aws.amazon.com/blogs/machine-learning/secure-ai-agents-with-policy-and-lambda-interceptors-in-amazon-bedrock-agentcore-gateway/)). A GEO interceptor applies the same order to inbound traffic: dynamic checks first, then a declared policy.

**4. Record and report.** Every decision is a row with the identity level, the claimed agent and version, the class, the decision, and the outcome. From those rows a business can answer real questions. Which agents read our pricing page? Which claimed agents failed verification? Which clients ignored our robots.txt rules?

## The cloaking line

Serving a different version to bots has a known risk. Google's spam policies define **cloaking** as "presenting different content to users and search engines with the intent to manipulate search rankings." One of Google's examples is inserting text or keywords into a page only when the requesting user agent is a search engine ([Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)).

Both vendors above stay clear of that line in the same way. Scrunch does not route Googlebot or Bingbot. Adobe says its service does not affect SEO bots. *My reading:* the safe rule is to change the format, not the meaning. The agent view can drop scripts, menus, and layout. It should not say anything the human page does not say.

## Advice that does not hold up

Some guides describe a stricter version of this pattern. The checks below compare that advice with the sources.

**"Verify every AI bot with reverse DNS."** Operators document different methods. Google documents reverse DNS hostnames and IP ranges. OpenAI's crawler page lists published IP addresses for each agent. Use the method each operator publishes, not one rule for all.

**"Send AI crawlers an empty page with only JSON-LD."** JSON-LD is a format for structured data inside a page. Google says its AI features need no special schema.org markup. It also says structured data should stay consistent with the visible page text ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)). A page that holds only structured data, while humans see a full page, moves toward the cloaking line.

**"Stripping the layout stops scrapers."** *My reading:* it does the opposite for scrapers that want the text. The stripped version is the cleanest copy of the content. Stripping layout serves good agents better. It does not protect the content. Protection comes from steps 1 to 3: identify, classify, decide.

## Where version and safety checks fit, and where they stop

Discussions of this layer often include two more jobs: checking crawler and local-model versions for known vulnerabilities, and checking requests against safety rules. *My reading:* part of this is possible at the edge, and part is not.

A site can check what a client **declares**. If an agent sends a version number, the interceptor can compare it with a list of versions known to be unsafe. It flags those requests in the report. A site can also check **behavior**: request rates, paths outside robots.txt, or form inputs shaped like prompt injection.

A site cannot see **inside** the client. It cannot know which local model runs on someone's laptop, or whether that model is patched. An agent inside a browser extension, like the NEC example, may declare nothing at all. So a "vulnerability report" from the edge is a report about declared versions and observed behavior. It is not a security audit of the visitor.

The same limit applies to regulations. The interceptor can enforce the business's own published terms and log evidence of what happened. Whether a given agent's use breaks a specific law is a legal question. The logs support that question. They do not answer it.

## What this note does not claim

- NEC's and TollBit's figures are company-reported. I found no independent check of them.
- NEC's release does not describe how its agent identifies itself to websites.
- HUMAN's report that ChatGPT agent signs its requests is HUMAN's statement. I did not check it against OpenAI's documentation.
- Web Bot Auth is still a draft. Support for it differs by agent operator and by CDN.
- "GEO interceptor" is an informal name. No vendor or standard I found uses it. The four-step split, the cloaking rule of thumb, and the limits on version checks are my reading of the sources, not a tested system.

## Sources

- HUMAN Security (Jeff Edwards), ["AI Agents, Scrapers, and Crawlers: Understanding the AI Traffic Ecosystem"](https://www.humansecurity.com/learn/blog/ai-ecosystem-agents-scrapers-crawlers/), 5 Aug 2026.
- NEC, ["NEC cotomi Agent" on Microsoft Marketplace](https://jpn.nec.com/press/202608/20260818_01.html) (Japanese), 18 Aug 2026.
- Biometric Update, ["NEC, Ava Labs building on-chain verification layer for AI agents, stablecoins"](https://www.biometricupdate.com/202607/nec-ava-labs-building-on-chain-verification-layer-for-ai-agents-stablecoins), 13 Jul 2026.
- OpenAI, [Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots).
- Google, [Google's common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers).
- TollBit, [H1 2026 figures on the TollBit home page](https://tollbit.com/).
- IETF, [Web Bot Auth working group](https://datatracker.ietf.org/wg/webbotauth/).
- Cloudflare, [Verified bots](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/) and [Verify your AI crawler (pay per crawl)](https://developers.cloudflare.com/ai-crawl-control/features/pay-per-crawl/use-pay-per-crawl-as-ai-owner/verify-ai-crawler/).
- Scrunch, ["What is Scrunch Agent Experience Platform (AXP) and how does it work?"](https://scrunch.com/faqs/what-is-scrunch-agent-experience-platform-axp-and-how-does-it-work)
- Adobe, [Optimize at Edge overview](https://experienceleague.adobe.com/en/docs/llm-optimizer/using/resources/optimize-at-edge/overview).
- API7, ["AI crawlers need API gateway controls at the edge"](https://api7.ai/blog/ai-crawlers-need-api-gateway-controls), 1 Jul 2026.
- AWS, ["Secure AI agents with Policy and Lambda interceptors in Amazon Bedrock AgentCore gateway"](https://aws.amazon.com/blogs/machine-learning/secure-ai-agents-with-policy-and-lambda-interceptors-in-amazon-bedrock-agentcore-gateway/), 1 Jun 2026.
- Google Search Central, [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) and ["AI features and your website"](https://developers.google.com/search/docs/appearance/ai-features).
`;export{e as default};
