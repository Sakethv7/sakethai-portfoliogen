const e=`# Ollama or MLX: how I benchmarked a local model runtime

*Engineering note · 2026-10-28 · measured on my own Mac, single runs*

> **In one paragraph.** Lekhni, my local notes app, runs a Qwen3-8B model through Ollama. MLX, Apple's machine-learning framework, is often called faster on Apple Silicon. I tested both with the same model on the same Mac. MLX was 10 to 18% faster end to end and used about 2 GB less memory. It also failed one of my five eval fixtures, and the server I used could not constrain its output to a JSON schema. I stayed on Ollama. A month later I re-ran the test through LM Studio, which can constrain MLX output to a schema. MLX then halved the time on a 58-minute recording, but it wrote shorter notes and dropped the same deadline again. This note explains both tests, what each number means, and where the decision stands.

## The question

A runtime is the program that loads model weights and generates tokens. Ollama wraps llama.cpp and serves GGUF model files. MLX is Apple's array framework, and \`mlx-lm\` runs language models on it. [LM Studio](https://lmstudio.ai/mlx) is a desktop app that can run both GGUF models and MLX models.

The claim I wanted to test was simple: "MLX is faster on a Mac, so switch." Speed alone was not my question. My question was: **does the faster runtime give the same notes, in a format my code can trust, inside the memory I have?**

## The setup

I fixed everything except the runtime.

| Held constant | Value |
|---|---|
| Machine | M4 Mac, 16 GB unified memory, nothing else running |
| Model | Qwen3-8B, 4-bit |
| Thinking | Off ([Qwen3 has a hard switch](https://huggingface.co/Qwen/Qwen3-8B) for this, \`enable_thinking=False\`) |
| Prompts | Lekhni's real prompts, unchanged |

| Runtime | How I ran it |
|---|---|
| Ollama | \`qwen3:8b\`, which is a Q4_K_M GGUF file, through Ollama's API |
| MLX | \`mlx-community/Qwen3-8B-4bit\` through \`mlx_lm.server\`, an OpenAI-compatible server |

**Why \`mlx-lm\` and not the LM Studio app.** LM Studio was not installed on this Mac. I had two routes. One was to install LM Studio, download the MLX model in its interface, and benchmark through its local server. The other was to run \`mlx-lm\` from a throwaway Python environment. LM Studio runs MLX models with its open-source [mlx-engine](https://github.com/lmstudio-ai/mlx-engine), which is built on \`mlx-lm\`. So the second route tests the same generation engine with no app install, and it is easy to delete afterwards. I chose it. The cost of that choice is in the section "What LM Studio changes" below.

The two 4-bit files are not identical. Q4_K_M and MLX 4-bit quantize the weights in different ways. "Same model" here means the same base weights at the same nominal bit width. That is as close as two runtimes allow.

## Four layers of measurement

I measured from the bottom up. Each layer answers a different question.

1. **Raw throughput.** How fast does each runtime read a prompt and write tokens? I timed a short prompt (about 650 tokens) and a long one (about 3,900 tokens).
2. **Memory.** How much memory does the model hold while it works?
3. **Eval fixtures.** Do the notes still pass? Lekhni has five fixture transcripts with fixed expectations: sections that must appear, and sections that must not. The checks are plain string matches, not an LLM judge.
4. **Real recordings.** How long does a real note take? I used a 23-minute meeting (one model call) and a 1-hour talk (nine chunk calls plus a final note).

Layer 1 is what most benchmark posts report. Layers 3 and 4 decide whether a user gets a better product.

## Results

| Measure | Ollama | MLX |
|---|---|---|
| Prompt read, 650 / 3,900 tokens | 135 / 118 tok/s | 175 / 159 tok/s |
| Generation, short / long context | 19.3 / 13.6 tok/s | 21.6 / 18.4 tok/s |
| Memory | 7.8 GB (16K context reserved) | 5.1 to 5.8 GB peak |
| 5 eval fixtures | 89.5 s, 5 of 5 pass | 73.8 s, 4 of 5 pass |
| 23-minute meeting, one call | 69.5 s | 62.4 s |
| 1-hour talk, 9 chunk calls | 10.4 min | 8.9 min |
| JSON repairs needed | 0 (schema-constrained) | 0 (unconstrained) |

**How to read the memory row.** The two numbers do not measure the same thing. Ollama reserves the cache for the whole context window when it loads the model. I had set that window to 16,384 tokens. MLX grows its cache as the prompt grows, so I report its peak. Part of the 2 GB gap is a setting, not the runtime. My [other note](#/writing/choosing-local-qwen-models) has the arithmetic.

**How to read the fixture row.** MLX failed the \`scratch_guided\` fixture. The note dropped "on Thursday" from an action item. One failure in one run is thin evidence. It could be the runtime, the quantization, or sampling. I did not run it enough times to tell.

**How to read the JSON row.** Both runtimes produced valid JSON every time. The difference is why. Ollama takes a JSON schema in its [\`format\` field](https://docs.ollama.com/capabilities/structured-outputs) and constrains generation to it. The [\`mlx_lm.server\` docs](https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/SERVER.md) list no schema or \`response_format\` field. So on MLX the JSON was valid by luck, not by construction. The same page also says the server "is not recommended for production".

## The decision

I stayed on Ollama. My reasons, in order:

1. **Correctness over speed.** A dropped deadline is the kind of error a user does not notice until it costs them. One failure is weak evidence, but I had no evidence the other way.
2. **Guaranteed structure.** Lekhni parses model JSON in several places. Schema-constrained output removes a whole class of failure.
3. **One server.** Switching meant a second always-on model server and a new backend in the code.

What I gave up: about 10 to 18% of generation time, which is about 1.5 minutes on an hour-long talk, and about 2 GB of memory headroom.

The bigger lesson was that the runtime was not the bottleneck. The hour-long talk took 9 to 10 minutes on either runtime. The better lever was the pipeline: how transcripts are split into chunks, and how small the chunk model can be.

## What LM Studio changes

I tested MLX through \`mlx_lm.server\`, not through the LM Studio app. Speed should be close, because both use \`mlx-lm\` to generate. Structure is different. [LM Studio's structured-output docs](https://lmstudio.ai/docs/developer/openai-compat/structured-output) say it constrains GGUF models with llama.cpp's grammar sampling and MLX models with [Outlines](https://github.com/dottxt-ai/outlines). So reason 2 above may not hold for MLX served by LM Studio. The re-test below checks it.

## Re-test through LM Studio (2026-10-28)

A month later I ran the fair test. I installed LM Studio, downloaded the same \`mlx-community/Qwen3-8B-4bit\` model, loaded it with the same 16,384-token window, and served it on LM Studio's OpenAI-compatible server. Lekhni's real pipeline called it with a JSON schema in \`response_format\`. A first check returned exactly \`{"ok": true}\`, with no reasoning block. So structured output works on MLX through LM Studio.

This time the harness fixed three gaps from September. It repeated each fixture three times. It added a 58-minute recording that takes the chunked path (9 chunk calls and one merge call). And it timed every model call. The Ollama numbers come from the same harness on the same day, in my [model benchmark](#/writing/choosing-local-qwen-models).

| Measure | Ollama, \`qwen3:8b\` | LM Studio, MLX Qwen3-8B 4-bit |
|---|---|---|
| Fixtures, 15 runs | 15/15, 329 s | 14/15, 195 s |
| 33K-character talk, one call | 106 s | 98 s |
| 58-minute recording, total | 22.1 min | 11.8 min |
| Chunk calls | 68 to 133 s, two over Lekhni's 120 s limit | 49 to 61 s, none over |
| Merge call | 446 s | 220 s |
| Final note | 18,665 chars, 285 bullets | 11,692 chars, 199 bullets |
| Evidence items from chunks | 357 | 300 |
| Late topics reached (of 4) | 4 | 4 |
| JSON repairs | 0 | 0 |

How to read it:

- **MLX was much faster on the long recording,** about 1.9 times. But it also wrote less. Its chunks returned 16% fewer evidence items, and its note was 37% shorter. Less output takes less time. So part of the speed-up is the runtime, and part is shorter answers. I cannot separate the two from these numbers. A tokens-per-second measure per call would.
- **The note still reached all four late topics.** Shorter did not mean it lost the end of the recording.
- **MLX failed the same fixture as in September.** The note for \`scratch_guided\` dropped "Thursday" from an action item again. Ollama passed it in all runs, both months. One failure is weak evidence. The same failure on the same fixture, a month apart, is a pattern worth taking seriously.
- **Chunk times stayed far from the timeout.** On MLX no chunk call came near 120 seconds. On Ollama two calls went over it.
- **I did not get a fair memory number.** LM Studio's model memory sits in the GPU and does not show in the process memory I sampled. So this table has no memory row.

## Where this leaves the decision

Reason 2 for staying on Ollama no longer holds. LM Studio gives MLX schema-constrained JSON. Reason 3 still holds: switching means a second model server and a new backend in Lekhni. Reason 1 got stronger: the dropped deadline came back.

So the choice is now a real trade-off. MLX through LM Studio halves the time for a long recording and avoids the chunk timeouts. It also writes shorter notes and has twice dropped a deadline that Ollama keeps. I have not switched. The next test is the one that decides it: tokens per second per call on both runtimes, and the same fixture checks on more long recordings, so I know whether shorter means worse.

## What I would do differently

- **Measure tokens per second per call.** Total time mixes runtime speed with answer length.
- **Fix the memory comparison.** Read GPU memory from the runtime itself, not process memory.
- **Add more long-recording fixtures.** One long recording shows a direction. Three or more would show whether MLX's shorter notes miss things a reader needs.

## Sources

- Ollama, [Structured outputs](https://docs.ollama.com/capabilities/structured-outputs)
- ml-explore, [mlx-lm server documentation](https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/SERVER.md)
- LM Studio, [Structured output](https://lmstudio.ai/docs/developer/openai-compat/structured-output), [MLX support](https://lmstudio.ai/mlx) and [mlx-engine](https://github.com/lmstudio-ai/mlx-engine)
- Qwen, [Qwen3-8B model card](https://huggingface.co/Qwen/Qwen3-8B)

*Related: [Lekhni: system design of a local-first notes app](#/writing/lekhni-system-design) · [Choosing local Qwen models: memory, context and JSON](#/writing/choosing-local-qwen-models)*
`;export{e as default};
