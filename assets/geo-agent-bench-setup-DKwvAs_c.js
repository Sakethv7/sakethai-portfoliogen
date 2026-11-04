const e=`# How I set up the test website: Cloudflare, one small VM and a request log

*System design · 2026-11-03 · the setup behind my agent benchmark*

My benchmark needs a real public website. Cloud agents cannot reach my laptop, and I want my own log of what they fetch. So I rent one small machine, point a domain at it, and log every request. This note shows how the pieces fit.

## The pieces

<a href="diagrams/system-overview.svg" target="_blank" rel="noopener"><img src="diagrams/system-overview.svg" alt="System overview: a laptop with the runner and a local model, Anthropic's servers, and one small cloud VM that hosts the test site and its request log" style="width:100%;max-width:1000px;border-radius:12px"></a>

*Click the diagram to open it full size.*

- **A small cloud machine.** It is a Google Cloud e2-micro with 1 GB of memory and a fixed IP address.
- **A domain in Cloudflare.** Cloudflare only does DNS, which turns names into the machine's address.
- **Caddy.** It gives the site HTTPS and passes each visitor's real IP address to the site.
- **One site process.** It serves every version of the site and writes the log.
- **My laptop.** It runs the experiment, runs the local model, and builds the tables.

## DNS

I added nine records in Cloudflare. All point to the machine's address, and all have Cloudflare's proxy turned off.

| Name | Used for |
|---|---|
| \`legacy\`, \`ai\` | the plain site and the AI-readable site |
| \`native\` | the same facts as MCP tools |
| \`account\` | an OAuth sign-in and one protected page |
| \`bot\` | a public key directory for signature checks |
| \`*.legacy\`, \`*.ai\`, \`*.native\`, \`*.account\` | one name per test run |

I keep the proxy off on purpose. Cloudflare's proxy can filter bots and cache pages. Both would change what agents see and what my log records. With it off, the address in my log is the real address of the agent's server, and no cache answers in front of me.

## HTTPS

A \`.dev\` domain loads only over HTTPS. A wildcard name needs a wildcard certificate, and Caddy gets one by proving that I own the domain through a DNS challenge. For that, Caddy uses a Cloudflare API token that can edit DNS for this one domain. The token expires after 90 days. I have four wildcard certificates, one for each kind of run name.

## One host name per run

Claude's fetch tool keeps a copy of a page. In a probe, it returned a stored copy for at least 21 minutes, and a stored copy leaves no line in my log. So every run gets its own host name, such as \`ab12cd34.native.wanderingcodersv.dev\`. The first part is a random 8-character token. A new name is a new cache key, and the token tells me which run made each request.

## The site and the log

The site is one process that serves all five kinds of host. It writes one line to the log for each request. A line holds the host, the run token, the path, the status, the size, the user agent, the IP address and a label. It also holds fields for tool calls, signatures and sign-in steps.

<a href="diagrams/request-path.svg" target="_blank" rel="noopener"><img src="diagrams/request-path.svg" alt="One request through the test site: read the host name, check the signature, route by variant, label the client, write a log line, then match by token on the laptop" style="width:100%;max-width:900px;border-radius:12px"></a>

*Click the diagram to open it full size.*

On my laptop, a request with a run token goes to that run. A request without one goes to a stranger table.

The label comes from a small function that I call the interceptor. It names the agent a request claims to be, and says whether the address matches the vendor's published ranges. It only records. It never blocks.

## What the machine handles

The machine has 964 MB of memory in total. With the site and Caddy running, 363 MB were free. Before I added the sign-in code, the site process used about 108 MB. I had set a limit of 300 MB free. The machine passed, so the sign-in server runs in the same process as the site.

I copy new code to the machine with \`tar\` over \`gcloud compute ssh\`. A restart takes about 15 seconds.

## What the log held

By 2026-11-04 03:27 UTC, after 29.5 hours, the log held 4,422 requests from 351 addresses and 160 different user agents. 1,187 lines carried a run token. The rest came from strangers and from my own checks.

The \`bot\` host shows how fast scanners arrive. Its log starts at 20:02 UTC on 2026-11-03. By the end of the log, strangers had sent it 296 requests from 106 addresses. I did not announce it.

## What I gave up

- A one-process site is simple. If it crashes, everything stops. A restart brings it back.
- Nine DNS names and four certificates are a lot to run for a test. They need one token that expires.
- A new host per run means I cannot test what a cache does across runs.

*Related: [Real crawlers on the plain and the AI site](#/writing/geo-agent-bench-crawlers) · [Agentic OAuth](#/writing/geo-agent-bench-oauth) · [Signed requests](#/writing/geo-agent-bench-signatures)*
`;export{e as default};
