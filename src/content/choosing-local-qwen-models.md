# Choosing local Qwen models: memory, context and JSON

*Engineering note · 2026-10-28 · from Lekhni and SakethWiki, my two local apps*

> **In one paragraph.** I run Qwen models locally through Ollama on a 16 GB Mac. Picking "the best model" turned out to be the wrong question. Each step of a pipeline needs a model that fits in memory next to everything else, returns output the code can parse, and passes that step's checks. This note covers why I chose Qwen, a benchmark against Llama, Mistral, Gemma and newer Qwen models, the GPU memory limit on a 16 GB Mac, the context-window setting that cost me 3.3 GiB, schema-constrained JSON, and how a model becomes the default.

## One app, several model jobs

Lekhni turns recordings into notes. It does not make one model call. It makes several kinds:

| Step | What the model does | What matters most |
|---|---|---|
| Chunk extraction | Reads one slice of a long transcript and returns JSON evidence | Valid JSON, speed (it runs 9 times on an hour) |
| Final note | Merges all the evidence into one note | Quality, and fitting the evidence in the window |
| JSON repair | Fixes a broken JSON answer, under the same schema | Valid JSON |
| Privacy filter, continuity check | Short yes/no or filter decisions | Speed, low memory |

Each step can have a different best model. So Lekhni has two settings: `OLLAMA_MODEL` for the final note, revisions and the privacy filter, and `OLLAMA_CHUNK_MODEL` for chunk extraction and JSON repair. The default for both is `qwen3:8b`. On this Mac a separate chunk model turned out not to pay off, and the benchmark below shows why.

## Why Qwen, and why an 8B model

The constraint came first. Lekhni had to be free to run and keep recordings on the Mac. The Mac has 16 GB of memory, and during a call it also runs the call app and two speech models. So the model's weights, its cache and everything else must fit at the same time.

`qwen3:8b` fits that budget. Its 4-bit weights take about 5.2 GB. A 16K-token cache adds about 2.3 GiB (the arithmetic is below). That leaves room for the rest of the app. A 14B model at 4 bits would need roughly 9 GB for weights alone, before any cache. That is my estimate, not a measurement.

Four properties of Qwen 3 made it a good fit. They come from the [Qwen 3 release post](https://qwenlm.github.io/blog/qwen3/) and the [Qwen3-8B card](https://huggingface.co/Qwen/Qwen3-8B):

1. **Open weights under Apache 2.0.** No API cost and no usage fee.
2. **One family, six dense sizes.** 0.6B, 1.7B, 4B, 8B, 14B and 32B. A step can move to a smaller model in the same family without changing the runtime.
3. **A hard switch for thinking.** `enable_thinking=False` stops the reasoning block. Notes do not need it, and it costs tokens and time.
4. **Enough context.** The 8B model reads 32,768 tokens natively. My routine window is 16,384.

**What I measured.** On 2026-08-09 I ran Lekhni's eval fixtures on two local models with the same prompt version:

| Model | Fixture runs | Passed | Typical failures |
|---|---|---|---|
| `qwen2.5:7b` | 48 | 39 (81%) | No title, an "Action items" section on a meeting that had none, a missing "Decisions" section |
| `qwen3:8b` | 8 | 7 (88%) | One unexpected "Action items" section |

Qwen 2.5 was about three times faster per fixture. It also failed in ways a user would see. I made Qwen 3 the only supported local line that day. On later prompt versions `qwen3:8b` passed 15 of 15 runs. The run counts differ, so treat this as a direction, not a precise ranking.

**What I have not measured.** I have not run the same fixtures on a hosted model, so I cannot claim that the local model does the same job as a hosted one. Lekhni's eval harness has a hosted backend. That comparison is a later measurement. The next section compares other local model families.

## Benchmark: Qwen against other local models (2026-10-28)

Two months after choosing Qwen 3, I tested it again against newer local models. The harness reused Lekhni's real prompts, JSON schemas and long-recording pipeline. It ran one setup at a time on the same M4 with 16 GB, and it deleted each candidate model after its run, because the disk had only about 13 GB free.

I ran it in two stages. A full run on every model would take about 2.5 hours, because one hour of audio takes about 20 minutes to become a note. So stage 1 screened every setup quickly, and stage 2 ran the long recording only on the best ones.

**Stage 1: fixtures and one short talk.** Each setup ran the five fixtures three times (15 runs), plus one talk of about 33,000 characters that fits in a single model call.

| Setup | Fixtures passed | Fixture time | Talk time | Talk note | Peak memory |
|---|---|---|---|---|---|
| `qwen3:8b` (current default) | 15/15 | 329 s | 106 s | 4,716 chars | 7.4 GB |
| `llama3.1:8b` | 15/15 | 211 s | 116 s | 3,781 chars | 6.9 GB |
| `ministral-3:8b` | 15/15 | 448 s | 339 s | 12,670 chars | 7.4 GB |
| `qwen3.5:9b` | 12/15 | 499 s | 179 s | 7,925 chars | 6.6 GB |
| `qwen3:8b` + `qwen3.5:4b` for chunks | 15/15 | 298 s | 137 s | 5,120 chars | 7.8 GB |
| `qwen3:8b` + `gemma3:4b` for chunks | 15/15 | 354 s | 145 s | 5,321 chars | 7.9 GB |

How to read it:

- **`qwen3.5:9b` failed three runs** the same way. It added a "Decisions" section to a transcript that has none. It was also slower than the default.
- **`ministral-3:8b` wrote the most,** but it was three times slower on the talk, and it put bold markdown inside headings, which breaks the note format.
- **`llama3.1:8b` passed everything and was the fastest.** Its notes were shorter and more generic. For example, it gave two different patterns the same trade-offs, where `qwen3:8b` kept the speaker's numbers.
- **The last two rows measure noise, not chunk models.** The fixtures and the short talk never reach the chunked path, so those setups ran as plain `qwen3:8b`. Their spread against the first row, about ±15%, is the run-to-run noise. A gap smaller than that is not a real difference.

**Stage 2: a 58-minute recording.** This is a system-design mock interview. It takes the chunked path: 9 chunk calls, then one merge call that writes the note. I checked whether the note reaches four topics from the last third of the recording: the waiting queue, WebSockets, sharding and the search index.

| Setup | Total time | Note | Evidence kept | Late topics | Slowest chunk | Merge call |
|---|---|---|---|---|---|---|
| `qwen3:8b` | 22.1 min | 18,665 chars, 285 bullets | 357 of 357 | 4/4 | 133 s | 446 s |
| `llama3.1:8b` | 13.5 min | 9,178 chars, 194 bullets | 281 of 281 | 3/4 (no WebSockets) | 97 s | 235 s |
| `qwen3:8b` + `qwen3.5:4b` for chunks | 23.1 min | 21,378 chars, 259 bullets | 341 of 385 | 4/4 | 111 s | 578 s |

**The decision: `qwen3:8b` stays the default.** It was the only single-model setup that reached every late topic and kept all of its evidence. Llama was 40% faster, but its note was half as long and lost a topic. For notes I read later, a complete note beats a fast one.

**The smaller chunk model did not help.** The 4B model was not faster in total, and its note dropped 44 evidence items. The reason is memory. During that run, Ollama logged "model predicted to exceed available memory, evicting" each time the pipeline switched between the 4B and the 8B model. The two models do not fit in GPU memory together, so every switch reloads a model. The section on the GPU memory limit below explains why.

**The benchmark also found a bug in my app.** The first `qwen3:8b` run on the long recording failed. Chunk 6 took longer than Lekhni's 120-second limit for a chunk call, and the whole 20-minute note was lost. In the timed re-run, two of nine chunk calls took 124 and 133 seconds.

The cause is arithmetic. A chunk call reads about 3,200 prompt tokens and may write up to 1,400. At this Mac's measured speeds, about 118 tokens per second to read and 13.6 to write, that is up to about 130 seconds. So the 120-second limit sits below the worst case the app allows itself. It dates from when chunks could write only 900 tokens, and nobody re-derived it when the cap rose. The JSON repair limit is worse. A repair runs only after a chunk hit its 1,400-token cap, so it must rewrite about 1,400 tokens, and that never fits in its 60 seconds. The repair can only fail in the case it exists for.

The deeper problem is the shape of the limit. Lekhni asks Ollama for the whole answer at once, so Ollama sends nothing until it finishes. The HTTP client's timeout then measures total time. But generation time depends on how much the model writes and how busy the Mac is, so any fixed total is wrong for some calls.

My proposed fix, written up as design records but not built yet:

1. **Stream the answer** and stop a call only when nothing arrives for a while. A working model sends a token every fraction of a second, so silence means a stuck model.
2. **Size each limit from the work.** Prompt tokens divided by a slow reading speed, plus the output cap divided by a slow writing speed, times 1.5. A chunk call gets 91 seconds of allowed silence and a 270-second ceiling, instead of a flat 120.
3. **Retry a failed chunk once, then skip it** and say so in the note, instead of losing the whole note.

I will write the full design up as its own note after it is built and measured.

## Memory is weights plus the KV cache

A model in memory has two large parts. The **weights** are the trained parameters. For `qwen3:8b` at 4 bits, that is about 5 GB. The **KV cache** stores the attention keys and values for every token in the context, so the model does not recompute them for each new token.

The cache size follows from the model's shape. The [Qwen3-8B card](https://huggingface.co/Qwen/Qwen3-8B) lists 36 layers and 8 KV heads. With a head size of 128 and a 16-bit cache:

```text
KV cache per token = 2 (K and V) × 36 layers × 8 KV heads × 128 × 2 bytes
                   ≈ 144 KiB

16,384-token window ≈ 2.3 GiB
40,960-token window ≈ 5.6 GiB   (more than the weights)
```

This is the arithmetic that matters on a 16 GB machine. The cache for a long window can cost more than the model itself.

## The GPU does not get all 16 GB

Apple Silicon has unified memory: the CPU and the GPU share one pool. But macOS does not let the GPU use all of it. It sets a default limit on the memory the GPU can wire for itself. On this Mac, `sysctl iogpu.wired_limit_mb` returns 0, which means "use the system default". Ollama's own log reports what that default is in practice: `free="11.8 GiB"` of Metal memory. So about 11.8 GiB of the 16 GB is the budget for every loaded model and its cache.

You can raise the limit with `sudo sysctl iogpu.wired_limit_mb=<MB>`, and guides suggest about 11 GB as a safe target on a 16 GB Mac ([llmconfigurator](https://llmconfigurator.com/en/guides/troubleshooting/increase-metal-vram-limit-apple-silicon)). Every gigabyte you give the GPU is taken from macOS and the other apps. On a machine that also runs a call app and speech models, there is little to take.

That budget explains the benchmark result above. `qwen3:8b` with a 16K window sits at about 7.4 GB. A second 4B model needs about 3.7 GiB more by Ollama's estimate. Together they pass the limit, so Ollama evicts one to load the other. A second local model gives no parallel work on this Mac. It only adds reloads. If I want a separate, faster model for one step, the realistic place for it is a hosted model, not this machine.

## The setting that cost 3.3 GiB

Ollama's context window is `num_ctx`. The [Ollama FAQ](https://docs.ollama.com/faq) gives a default of 4,096 tokens, which is too small for a transcript. So you set it.

My first version used two windows: 40,960 tokens for the final note and 16,384 for chunks. Two things went wrong, both of which I saw in Lekhni:

1. Ollama reserved the cache for the full window when it loaded the model. The 40K window held about 3.3 GiB more than the 16K one, and no routine call used it.
2. Ollama reloaded the model when a call asked for a different `num_ctx`. Every long note paid for a reload between the chunk step and the final step.

The fix was one shared window, `OLLAMA_NUM_CTX=16384`, sized for the largest routine prompt. A function steps the window up only for a single call that would not fit. That trades a rare reload for a smaller, steady footprint.

Two other levers exist, and I have not adopted either yet:

- **A quantized cache.** The Ollama FAQ says a `q8_0` cache (`OLLAMA_KV_CACHE_TYPE`) uses about half the memory of `f16`, with a small loss of precision. It needs Flash Attention, and it applies to every model on the server.
- **A different architecture.** The [Qwen3.5-9B card](https://huggingface.co/Qwen/Qwen3.5-9B) describes 32 layers in a repeating pattern: three Gated DeltaNet layers, then one gated-attention layer. Gated DeltaNet keeps a fixed-size state instead of a cache that grows with context ([explainer](https://sebastianraschka.com/llms-from-scratch/ch04/08_deltanet/)). So only 8 of its 32 layers keep a growing cache, against all 36 in `qwen3:8b`. On paper that makes long windows much cheaper. I have the harness to test it, but `qwen3:8b` is still my default.

## Make the JSON valid by construction

Chunk extraction, pattern extraction, the privacy filter and JSON repair all return JSON. A model that is asked nicely for JSON returns it most of the time. "Most of the time" breaks a pipeline that runs nine chunk calls per recording.

Ollama accepts a JSON schema in its [`format` field](https://docs.ollama.com/capabilities/structured-outputs) and constrains generation to it. Lekhni passes a schema on every JSON call. That removes malformed structure as a failure, but it does not remove one more case: running out of tokens. If a chunk hits its output limit (`num_predict`) mid-object, the JSON is cut off. On one 58-minute recording a chunk used 875 of its 900 allowed tokens. So each JSON call keeps one repair attempt, on the same schema, for truncation.

This is also why the runtime choice mattered. My [Ollama versus MLX benchmark](#/writing/ollama-vs-mlx-benchmark) found that the plain `mlx-lm` server had no schema field. LM Studio's MLX engine does, and the re-test in that note uses it.

## How a model becomes the default

I use a rule: **a candidate becomes the default only after the evals show it holding up.** Two tools enforce it.

1. **`eval.py`** re-runs five fixture transcripts and checks fixed expectations: sections that must appear and sections that must not. The checks are string matches, not an LLM judge. That catches "the model stopped following instructions". It does not catch "the summary got a bit worse". I chose that limit on purpose, because an uncalibrated judge gives confident labels I cannot trust.
2. **`compare_models.py`** runs several setups side by side, for example `qwen3:8b` alone against a 9B final model with a 4B chunk model. It runs the fixtures and real long transcripts, prints pass counts and timings, and writes the notes out for me to read. The fixtures are all under 1,000 characters, so only the real transcripts test the chunk model. At the end it asks which setup to keep and offers to `ollama rm` the rest, so unused models do not fill the disk.

The reading step is deliberate. Pass counts tell me a setup is safe. Reading the long notes tells me it is good.

## A small model must beat the rules first

For a newer feature, cleaning up live transcript lines, I wrote the test before choosing any model. A 1B to 4B model would add punctuation and remove filler words. The design requires a rules-only baseline (delete fillers and stutters, add a period) to run on the same 50 lines first. If the rules win or tie in a blind comparison, the model path does not get built. This feature is designed, not measured yet.

The principle is the same as the eval gate. A model has to earn its memory.

## Routing per task in SakethWiki

SakethWiki, my knowledge app, takes the idea one step further. Each task has its own provider and model setting, for example `LLM_PROVIDER_TAG_CLASSIFY=ollama`. Cheap, frequent tasks such as tag classification can run on a local Qwen model at no API cost. The local example uses `qwen2.5:7b` for text and `qwen2.5vl:7b` for images. Harder tasks can stay on a hosted model.

Local models can be stopped or busy. So each task can fall back to the hosted provider when Ollama does not answer. The fallback covers availability only. It never re-runs a call because the first answer was malformed, because that would hide a quality problem behind a second model.

## What I would tell someone starting

1. Write down every step that calls a model, and what each step needs.
2. Do the KV-cache arithmetic before you pick a context window.
3. Use one window size for routine calls, so the model does not reload.
4. Constrain JSON with a schema, and keep one repair call for truncation.
5. Let evals and side-by-side reading pick the model for each step.
6. Check how much memory the GPU really gets. On a 16 GB Mac it is about 11.8 GiB, and two models rarely fit together.
7. Time every model call before you set its timeout.

## Sources

- Ollama, [FAQ: context window, KV cache quantization, keep-alive](https://docs.ollama.com/faq)
- Ollama, [Structured outputs](https://docs.ollama.com/capabilities/structured-outputs)
- Qwen, [Qwen 3 release post](https://qwenlm.github.io/blog/qwen3/)
- Qwen, [Qwen3-8B model card](https://huggingface.co/Qwen/Qwen3-8B) and [Qwen3.5-9B model card](https://huggingface.co/Qwen/Qwen3.5-9B)
- llmconfigurator, [Increase the Metal VRAM limit on Apple Silicon](https://llmconfigurator.com/en/guides/troubleshooting/increase-metal-vram-limit-apple-silicon)
- Sebastian Raschka, [Gated DeltaNet explainer](https://sebastianraschka.com/llms-from-scratch/ch04/08_deltanet/)

*Related: [Ollama or MLX: how I benchmarked a local model runtime](#/writing/ollama-vs-mlx-benchmark) · [Lekhni: system design of a local-first notes app](#/writing/lekhni-system-design)*
