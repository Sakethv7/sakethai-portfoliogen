# Choosing local Qwen models: memory, context and JSON

*Engineering note · 2026-10-28 · from Lekhni, my local meeting-notes app*

> **In one paragraph.** I run Qwen models locally through Ollama on a 16 GB Mac. Picking "the best model" turned out to be the wrong question. Each step of a pipeline needs a model that fits in memory next to everything else, returns output the code can parse, and passes that step's checks. This note covers why I chose Qwen, a benchmark against Llama, Mistral and newer Qwen models, the GPU memory limit on a 16 GB Mac, the context-window setting that cost me 3.3 GiB, schema-constrained JSON, and how a model becomes the default.

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

The constraint came first. Lekhni had to run free and keep recordings on the Mac. The Mac has 16 GB, and during a call it also runs the call app and two speech models. So the weights, the cache and everything else must fit at once.

`qwen3:8b` fits. Its 4-bit weights take about 5.2 GB, and a 16K-token cache adds about 2.3 GiB. A 14B model at 4 bits would need roughly 9 GB for weights alone. That is my estimate, not a measurement.

Four properties of Qwen 3 fit the job, from the [release post](https://qwenlm.github.io/blog/qwen3/) and the [Qwen3-8B card](https://huggingface.co/Qwen/Qwen3-8B). The weights are open under Apache 2.0, so there is no API cost. The family has six dense sizes (0.6B to 32B), so a step can move to a smaller model without changing the runtime. `enable_thinking=False` stops the reasoning block, which notes do not need. And the 8B model reads 32,768 tokens natively, against my routine window of 16,384.

On 2026-08-09 I ran Lekhni's eval fixtures on two local models with the same prompt version. `qwen2.5:7b` passed 39 of 48 runs (81%). It failed with no title, an "Action items" section on a meeting that had none, or a missing "Decisions" section. `qwen3:8b` passed 7 of 8 (88%). Qwen 2.5 was about three times faster, but its failures were ones a user would see. I made Qwen 3 the only supported local line that day. On later prompt versions it passed 15 of 15. The run counts differ, so treat this as a direction. I have not run the same fixtures on a hosted model, so I cannot say the local model matches a hosted one.

## Benchmark: Qwen against other local models (2026-10-28)

Two months later I tested Qwen 3 against newer local models. The harness reused Lekhni's real prompts, schemas and long-recording pipeline. It ran one setup at a time on the same M4 and deleted each model afterwards, because the disk had about 13 GB free. Stage 1 screened every setup on the five fixtures (three runs each) and one 33,000-character talk. Stage 2 ran a 58-minute recording only on the best setups.

| Setup | Fixtures passed | Talk time | Talk note | Peak memory |
|---|---|---|---|---|
| `qwen3:8b` (default) | 15/15 | 106 s | 4,716 chars | 7.4 GB |
| `llama3.1:8b` | 15/15 | 116 s | 3,781 chars | 6.9 GB |
| `ministral-3:8b` | 15/15 | 339 s | 12,670 chars | 7.4 GB |
| `qwen3.5:9b` | 12/15 | 179 s | 7,925 chars | 6.6 GB |

`qwen3.5:9b` failed three runs the same way: it added a "Decisions" section to a transcript with none. `ministral-3:8b` wrote the most but was three times slower and put bold markdown inside headings, which breaks the note format. `llama3.1:8b` passed everything and was fast, but its notes were shorter and more generic. I also ran `qwen3:8b` with a 4B chunk model. Those rows differed from the default by about ±15%, but the short inputs never reach the chunked path. That spread is run-to-run noise, so a gap smaller than it is not a real difference.

Stage 2 used a 58-minute system-design mock interview. It takes the chunked path: 9 chunk calls and one merge call. I checked whether the note reaches four topics from the last third: the waiting queue, WebSockets, sharding and the search index.

| Setup | Total time | Note | Evidence kept | Late topics |
|---|---|---|---|---|
| `qwen3:8b` | 22.1 min | 18,665 chars | 357 of 357 | 4/4 |
| `llama3.1:8b` | 13.5 min | 9,178 chars | 281 of 281 | 3/4 (no WebSockets) |
| `qwen3:8b` + `qwen3.5:4b` for chunks | 23.1 min | 21,378 chars | 341 of 385 | 4/4 |

**`qwen3:8b` stays the default.** It was the only single-model setup that reached every late topic and kept all its evidence. Llama was 40% faster, but its note was half as long and lost a topic. For notes I read later, a complete note beats a fast one.

**The smaller chunk model did not help.** It was not faster in total, and its note dropped 44 evidence items. Ollama logged "model predicted to exceed available memory, evicting" at each switch between the 4B and 8B model. The two do not fit in GPU memory together, so every switch reloads one. The GPU section below explains why.

**The benchmark also found a bug in my app.** The first `qwen3:8b` run on the long recording failed. One chunk call took longer than Lekhni's fixed 120-second limit, and the whole 20-minute note was lost. The fix is to stream the answer, stop a call only on silence, size each limit from the work, and skip a failed chunk with a note. The design is in [Stop a model call on silence, not on total time](#/writing/model-call-timeouts).

## Memory is weights plus the KV cache

A model in memory has two large parts. The **weights** are the trained parameters, about 5 GB for `qwen3:8b` at 4 bits. The **KV cache** stores the attention keys and values for every token in the context, so the model does not recompute them. The [Qwen3-8B card](https://huggingface.co/Qwen/Qwen3-8B) lists 36 layers and 8 KV heads. With a head size of 128 and a 16-bit cache:

```text
KV cache per token = 2 (K and V) × 36 layers × 8 KV heads × 128 × 2 bytes
                   ≈ 144 KiB

16,384-token window ≈ 2.3 GiB
40,960-token window ≈ 5.6 GiB   (more than the weights)
```

On a 16 GB machine, the cache for a long window can cost more than the model.

## The GPU does not get all 16 GB

Apple Silicon has unified memory, but macOS limits how much the GPU can wire. On this Mac `sysctl iogpu.wired_limit_mb` returns 0, which means the system default. Ollama's log shows what that is in practice: `free="11.8 GiB"` of Metal memory. That is the budget for every loaded model and its cache. You can raise it with `sudo sysctl iogpu.wired_limit_mb=<MB>` ([llmconfigurator](https://llmconfigurator.com/en/guides/troubleshooting/increase-metal-vram-limit-apple-silicon)), but every gigabyte comes from macOS and the other apps.

That budget explains the chunk-model result. `qwen3:8b` with a 16K window sits at about 7.4 GB, and a 4B model needs about 3.7 GiB more. Together they pass the limit, so Ollama evicts one to load the other. A second local model gives no parallel work on this Mac. It only adds reloads.

## The setting that cost 3.3 GiB

Ollama's context window is `num_ctx`, and the [FAQ](https://docs.ollama.com/faq) gives a default of 4,096 tokens, which is too small for a transcript. My first version used 40,960 tokens for the final note and 16,384 for chunks. Two things went wrong. Ollama reserved the cache for the full window, so the 40K window held about 3.3 GiB more than the 16K one and no routine call used it. And Ollama reloaded the model when a call asked for a different `num_ctx`, so every long note paid for a reload between the chunk step and the final step.

The fix was one shared window, `OLLAMA_NUM_CTX=16384`, with a step-up only for a single call that would not fit. A quantized cache is another lever I have not adopted. The FAQ says a `q8_0` cache (`OLLAMA_KV_CACHE_TYPE`) uses about half the memory of `f16`, with a small loss of precision.

## JSON and the default-model rule

Every JSON step (chunk extraction, pattern extraction, the privacy filter, repair) passes a schema in Ollama's [`format` field](https://docs.ollama.com/capabilities/structured-outputs). That removes malformed structure as a failure. It does not remove running out of tokens: if a chunk hits its output limit mid-object, the JSON is cut off. So each JSON call keeps one repair attempt on the same schema. This is also why the runtime mattered. My [Ollama versus MLX benchmark](#/writing/ollama-vs-mlx-benchmark) covers it.

A candidate model becomes the default only after the evals show it holding up. `eval.py` re-runs five fixtures and checks fixed expectations by string match, not an LLM judge. It catches "the model stopped following instructions" and not "the summary got a bit worse". I chose that limit on purpose, because an uncalibrated judge gives confident labels I cannot trust. `compare_models.py` runs several setups side by side on the fixtures and on real long transcripts, writes the notes out for me to read, and offers to `ollama rm` the losers. Pass counts tell me a setup is safe. Reading the long notes tells me it is good.

## What I would tell someone starting

1. Write down every step that calls a model, and what each needs.
2. Do the KV-cache arithmetic before you pick a context window, and use one window for routine calls.
3. Constrain JSON with a schema, and keep one repair call for truncation.
4. Let evals and side-by-side reading pick the model for each step.
5. Check how much memory the GPU really gets. On a 16 GB Mac it is about 11.8 GiB, and two models rarely fit together.
6. Time every model call before you set its timeout.

## Sources

- Ollama, [FAQ: context window, KV cache quantization, keep-alive](https://docs.ollama.com/faq)
- Ollama, [Structured outputs](https://docs.ollama.com/capabilities/structured-outputs)
- Qwen, [Qwen 3 release post](https://qwenlm.github.io/blog/qwen3/)
- Qwen, [Qwen3-8B model card](https://huggingface.co/Qwen/Qwen3-8B)
- llmconfigurator, [Increase the Metal VRAM limit on Apple Silicon](https://llmconfigurator.com/en/guides/troubleshooting/increase-metal-vram-limit-apple-silicon)

*Related: [Ollama or MLX: how I benchmarked a local model runtime](#/writing/ollama-vs-mlx-benchmark) · [Lekhni: system design of a local-first meeting-notes app](#/writing/lekhni-system-design)*
