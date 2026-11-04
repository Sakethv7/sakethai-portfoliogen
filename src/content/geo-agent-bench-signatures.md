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
- **No blocking.** The check only records. The page is served in every case. I wanted complete data, and a blocked agent never reaches the page.

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

- Blocking by signature.
- Whether Claude's own fetch tool or any vendor tool sends signatures. None appeared.
- Whether other people's signers or verifiers accept mine. I tested only against my own code and the text of the drafts.

*Related: [Agentic OAuth](#/writing/geo-agent-bench-oauth) · [Real crawlers on the plain and the AI site](#/writing/geo-agent-bench-crawlers) · [How I set up the test website](#/writing/geo-agent-bench-setup)*
