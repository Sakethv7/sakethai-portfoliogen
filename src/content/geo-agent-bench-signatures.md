# Signed requests: telling a real agent from one that copies its name

*Engineering note · 2026-11-03 · from my own test site and its log*

A user agent is a name that a client types into a header. Anyone can type any name. On my test site, one address sent 397 requests with the name `Claude-User`. All of them were probes for secret files such as `/.env`. They hit every host I run. The address belongs to a hosting company, not to Anthropic. I caught it because it was outside Anthropic's published address range.

An address check has limits. Vendors change their ranges. An agent can also run on a user's own machine, where the range does not apply. So I tested a stronger check: a signature.

## What signing is

A draft standard called Web Bot Auth works like this. The agent has a private key. It signs each request, and it adds three headers: the signature, a description of what it signed, and the address where it publishes its public key. The site fetches the public key and checks the signature. A copycat has no private key, so its signature fails.

<a href="diagrams/signature-check.svg" target="_blank" rel="noopener"><img src="diagrams/signature-check.svg" alt="Signed requests: the site checks the agent address, fetches the key directory, finds the key, checks the time window, and checks the signature" style="width:100%;max-width:900px;border-radius:12px"></a>

*Click the diagram to open it full size.*

## What I built

- **A key on my laptop.** The private key stays there, outside my code repository.
- **A public key directory.** The key's public half is served at `bot.wanderingcodersv.dev`.
- **A check in the site.** Every request on every host gets a verdict: valid, unknown key, invalid, expired, key directory unreachable, or no signature.
- **No blocking by default.** The check records. The page is served in every case. I wanted complete data, and a blocked agent never reaches the page. I added an optional gate later. See "Blocking" below.

The check also guards itself. It fetches a web address named by the client, which could be abused. So it accepts only an `https` address on a public host, follows no redirects, reads at most 64 KB, and waits 2 seconds.

## Three modes

My local Qwen agent ran in three modes. In each run, the site recorded these verdicts:

| Mode | What the agent sent | Verdict |
|---|---|---|
| signed | a signature from the published key | valid |
| spoofed | the same name, a signature from a key that is not published | unknown key |
| unsigned | the same name, no signature | no verdict |

The verdicts matched the design in all 18 runs, and again in my live checks after I changed the code. In every case the agent still got the page. A spoofer was recorded, not stopped.

## Two mismatches with the standard

I first wrote the signer and the verifier in one sitting. They agreed with each other, and every test passed. Later I read the drafts. They define the address header as a dictionary, `sig1="https://origin"`, and they require the signed part to name that dictionary entry. My first version used an older plain quoted string. A bot that followed the draft would not have verified on my site. I changed the code to the draft's form and kept the old form accepted.

Then I read the newest working-group draft, from 2026-10-29. It changed the value. The header now holds the address of the key set itself, not an origin that the site extends with a standard path. My signer sent the origin. A verifier that follows the new draft would have fetched my site's home page and failed. I changed the signer again. The verifier now accepts the new form, the origin form and the plain string. I checked all of them against the live site, and each gave "valid". A throwaway key still gave "unknown key", and no signature still gave no verdict.

The lesson is the same both times. Code that I write for both sides of a check agrees with itself, so only the text of the standard can show a mismatch. My 18 sign-in runs used the oldest form, and I did not rerun them.

## Other people's code

My signer and verifier agreed with each other, and I had found two mismatches only by reading. So I ran someone else's code. Cloudflare publishes a reference package for Node, `web-bot-auth`, under the Apache-2.0 license. I installed it in a scratch folder without running its install scripts. I tested in both directions, offline, with a throwaway key.

- **Their signer, my verifier.** The newest form verified. The form in their README did not. That was a bug in my code. For a covered `"signature-agent";key="sig1"`, the standard signs the dictionary member with its parameters, so the signed value is `"https://origin";type=directory`. My code left the parameters out. I fixed it. Both of their forms now verify.
- **My signer, their verifier.** All four of my header forms verified.

Reading the standard did not show this bug. Running another person's code did. Their package follows an older draft, so the test covers mostly the older forms. One implementation is also not a test suite. The tests are in my repository, and they skip unless the package is installed.

## Blocking

Until now the site never blocked. That left one question: does a signature work as a gate? I added an optional policy, off by default. When it is on, the site answers 403 only if three things are true. The host is the account host, the user agent claims my own bot name, and the signature is not valid. Other clients, other hosts and other bot names are never blocked. I can test a gate only on a name that I own. I cannot sign for `Claude-User`.

I ran the same Qwen agent as before in three modes, three times each, with the gate on:

| Mode | Runs | Blocked | Reached the page | Made-up order number |
|---|---:|---:|---:|---:|
| signed | 3 | 0 | 3 | 0 |
| spoofed key | 3 | 3 | 0 | 0 |
| unsigned | 3 | 3 | 0 | 0 |

The signed agent passed with no false block and finished the sign-in. Each spoofed or unsigned agent was blocked on its first request with a 403, and none got past it. Each then wrote that the information was unavailable because of access restrictions. Before the runs I also checked the gate by hand on the live site. Unsigned and throwaway-key requests got 403. The real key got 200. A curl request and a request to another host were untouched. I switched the gate off afterwards.

This is a narrow test. A real spoofer would not use my bot name, and I did not test retries, rate limits or caches.

## What the log shows

After 29.5 hours of logging, 141 requests carried signature headers. 74 were valid and 67 named an unknown key. All 141 came from my own laptop. No other client sent a signature, not Claude's tools and not any crawler. That does not mean no vendor signs requests anywhere. It means none did on my site in this time.

The identity table puts each request into one level of proof:

| Claimed name | Proof | Requests | Addresses |
|---|---|---:|---:|
| Claude-User | address in Anthropic's range | 612 | 51 |
| Claude-User | spoof | 397 | 1 |
| GPTBot | address in OpenAI's range | 37 | 5 |
| OAI-SearchBot | address in OpenAI's range | 6 | 6 |
| ClaudeBot | no published range to check | 76 | 3 |
| Googlebot | spoof | 2 | 2 |
| my own bot name | valid signature | 74 | 1 |
| my own bot name | no valid signature | 439 | 1 |
| no claim | anonymous | 2,779 | 285 |

The 612 include my own Claude runs. My own bot name has no published range, so only a signature can prove it. Its 439 requests with no valid signature are my earlier runs, which never signed, plus the 67 requests that carried an unknown key on purpose. So that row is large by design.

## What I did not test

- A gate for names that I do not own. I cannot sign for them.
- Whether Claude's own fetch tool or any vendor tool sends signatures. None appeared.
- More than one other implementation, and any implementation of the newest draft.

*Related: [Agentic OAuth](#/writing/geo-agent-bench-oauth) · [Real crawlers on the plain and the AI site](#/writing/geo-agent-bench-crawlers) · [How I set up the test website](#/writing/geo-agent-bench-setup)*
