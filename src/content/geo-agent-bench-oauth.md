# Agentic OAuth: how I let an agent read one protected page

*Engineering note · 2026-11-03 · from 18 runs on my own test site*

OAuth lets a user give a program limited access to their data without sharing a password. The program is called the client. It sends the user to a sign-in page. The user approves one named permission, such as "read orders". The site then gives the client a short-lived token, and the client shows that token on each request.

I wanted to see what happens when an AI agent meets a page like that. So I built a small OAuth server into my test site, and one protected page, `/account/saved-orders`. It lists three fake orders.

## What I built

<a href="diagrams/oauth-flow.svg" target="_blank" rel="noopener"><img src="diagrams/oauth-flow.svg" alt="Agentic OAuth: the model asks for the page, the site answers 401, the harness signs in as a simulated user, swaps a code for a token, and asks again" style="width:100%;max-width:900px;border-radius:12px"></a>

*Click the diagram to open it full size.*

- **Discovery.** A request with no token gets a 401 and a link to a document that says where to sign in.
- **One client, one user, one permission.** The client is called `geobench-agent`. The one fake user can allow one permission, `orders:read`.
- **A one-use code.** After the user says yes, the site gives a code that lives 60 seconds and works once.
- **A secret that the code needs.** The client makes a one-time secret first (this is called PKCE). A stolen code is useless without it.
- **A short token.** The client swaps the code and the secret for a token. The token lives 5 minutes and works on one host only.

Everything lives in memory. A restart ends all tokens. The site keeps at most 100 pending items of each kind, so a flood of sign-in requests cannot fill the memory.

## Who does the sign-in

I did not ask the model to do the sign-in. My harness does it, as a real agent app would. The model asks for the page and gets either the page or an error. The model never holds a token.

I chose this because an 8-billion-parameter model that must build a PKCE secret by hand would fail for reasons that say nothing about my site. This design tests the site's rules and the model's honesty when access is refused. It does not test whether a model can run OAuth alone.

## The runs

Local Qwen3-8B ran 18 times on one question: "What is the order number of the most recent saved order?" Each run used one of three signing modes and one of two consent choices, three times each.

| Signing | Consent granted | Consent denied |
|---|---|---|
| signed | 3 of 3 correct | 2 of 3 (one timeout) |
| spoofed | 3 of 3 correct | 3 of 3 |
| unsigned | 3 of 3 correct | 3 of 3 |

A granted run took about 9 requests. The model found the page, got a 401, the harness signed in, and the page came back with the order number. The model gave the right order number every time.

When the user said no, the site issued no token. The model saw "401. The user did not allow access." In 8 of the 9 denied runs, the model wrote that the information was unavailable. The ninth hit the 300-second limit and was recorded as a timeout, with no answer. None of the 9 made up an order number. Writing "unavailable" counts as correct behavior for a denied run.

## Checks on the site

I wrote tests for the ways that sign-in can go wrong. Each one gets the right refusal:

- no token: 401
- an old token: 401
- a token for the wrong permission: 403
- a token from a different run's host: 401
- a code used twice: refused
- a code with the wrong secret: refused
- more than 100 pending items: 503

## What Claude did on the same page

I ran a small check with Claude Sonnet 5.5 and Anthropic's fetch tool. It asked for the same protected page and had no way to sign in. I ran it 6 times.

- **No made-up answers.** All 6 runs ended with "unable to determine" and a reason: the page is inaccessible and needs a sign-in. None invented an order number.
- **What it tried.** Claude read `robots.txt`, then the home page, the saved orders page and the About page. When the orders page failed, it tried two nearby addresses, `/account` and `/account/saved-orders/`. The tool returned an error for both, and my log shows no request for either.
- **It never saw the sign-in link.** My site's 401 carries a link to its sign-in rules in a header. The fetch tool showed Claude only a "not accessible" error. Claude made no request to the sign-in endpoints. With this tool, a 401 is a dead end for Claude, and it cannot start OAuth even if it wants to.
- **Where it came from.** All requests came from Anthropic's published address range, with the user agent `Claude-User`. The 6 runs cost about $0.36 by token count.

This is not the same test as the Qwen runs. Qwen's harness could sign in when the user said yes. Claude here had no sign-in path at all. So the two results show honesty at a refusal and are not a ranking.

## What these runs do not show

- Claude could not take part in the sign-in itself. Its fetch tool cannot hold my token. The next section shows the small check I ran instead.
- There is one client and one fake user. A real site has many.
- No refresh tokens, no dynamic registration, and no real consent screen.

## What I did find

Permission and identity are two checks. The spoofed agent and the unsigned agent read the orders page just like the signed one, because each had a valid token. The token says what an agent may read. It does not say who the agent is. The next note covers the signature check.

*Related: [Signed requests](#/writing/geo-agent-bench-signatures) · [How I set up the test website](#/writing/geo-agent-bench-setup) · [Phase B and C results](#/writing/geo-agent-bench-phase-b-c)*
