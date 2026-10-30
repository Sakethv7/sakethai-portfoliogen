# Ollama or MLX: how I benchmarked a local model runtime

*Engineering note · 2026-10-29 · measured on my own Mac, mostly single runs*

> **In one paragraph.** Lekhni, my local note-taking and meeting-summarizing app, runs a Qwen3-8B model through Ollama. MLX, Apple's machine-learning framework, is often called faster on Apple Silicon. I tested both with the same model on the same Mac, in four rounds over two days. MLX writes 10 to 20% faster per token and uses less energy. But MLX 4-bit dropped a deadline from a test note in 20 of 20 runs, and under a JSON schema some of its answers ran to the output cap and lost evidence. MLX 6-bit fixes the deadline but is slower per token and uses about 3 GB more memory. Lekhni stays on Ollama.

## The question and the setup

A runtime is the program that loads model weights and generates tokens. Ollama wraps llama.cpp and serves GGUF files. MLX is Apple's array framework, and `mlx-lm` runs language models on it. [LM Studio](https://lmstudio.ai/mlx) is a desktop app that runs both kinds of model.

The claim was "MLX is faster on a Mac, so switch." My question was wider: **does the faster runtime give the same notes, in a format my code can trust, inside the memory I have?**

I fixed everything except the runtime: an M4 Mac with 16 GB of unified memory, Qwen3-8B at 4 bits, thinking off ([Qwen3 has a hard switch](https://huggingface.co/Qwen/Qwen3-8B), `enable_thinking=False`), and Lekhni's real prompts. The two 4-bit files are not identical. Ollama's `qwen3:8b` is a Q4_K_M GGUF file, and MLX quantizes in a different way. "Same model" means the same base weights at the same nominal bit width.

I measured raw speed, memory, five eval fixtures (plain string checks, not an LLM judge) and real recordings. Raw speed is what most benchmark posts report. The fixtures and recordings decide whether a user gets a better product.

## Round 1: September, through `mlx_lm.server`

LM Studio was not installed, so I ran MLX through `mlx_lm.server`. LM Studio's [mlx-engine](https://github.com/lmstudio-ai/mlx-engine) is built on `mlx-lm`, so generation speed should be close.

| Measure | Ollama | MLX |
|---|---|---|
| Generation, short / long context | 19.3 / 13.6 tok/s | 21.6 / 18.4 tok/s |
| Memory | 7.8 GB (16K context reserved) | 5.1 to 5.8 GB peak |
| 5 eval fixtures | 5 of 5 pass | 4 of 5 pass |
| 1-hour talk, 9 chunk calls | 10.4 min | 8.9 min |

The memory row compares different things. Ollama reserves the cache for the whole 16,384-token window. MLX grows its cache with the prompt, so I report its peak. Part of the gap is a setting, not the runtime. My [other note](#/writing/choosing-local-qwen-models) has the arithmetic.

MLX failed the `scratch_guided` fixture. The note dropped "on Thursday" from an action item. One failure in one run is thin evidence. Also, the [`mlx_lm.server` docs](https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/SERVER.md) list no schema field. Ollama takes a JSON schema in its [`format` field](https://docs.ollama.com/capabilities/structured-outputs) and constrains output to it. Both gave valid JSON every time, but on MLX that was luck, not construction.

## Rounds 2 and 3: October 28, through LM Studio

[LM Studio constrains MLX output with Outlines](https://lmstudio.ai/docs/developer/openai-compat/structured-output). So I ran the fair test: the same `mlx-community/Qwen3-8B-4bit` model, the same 16,384-token window, and a JSON schema in `response_format`. A first check returned exactly `{"ok": true}`. This harness repeated each fixture three times, added a 58-minute recording (9 chunk calls and one merge call), and timed every call. Round 3 added per-call streaming, to separate speed from shorter answers.

| Measure | Ollama, `qwen3:8b` | LM Studio, MLX 4-bit |
|---|---|---|
| Fixtures, 15 runs | 15/15 | 14/15 (same Thursday miss) |
| Writing speed, 9 chunk calls | 18.6 falling to 11.8 tok/s | 16.0 to 16.6 tok/s, steady |
| Chunk answers cut off at the 1,400-token cap | 0 of 9 | 2 of 9, and both repairs too |
| Evidence items kept | 356 | 233 |
| Late topics reached (of 4) | 4 | 2 |
| 58-minute recording, total | 15.7 min | 16.4 min |

In round 2 MLX looked 1.9 times faster on the long recording (11.8 against 22.1 minutes). But it wrote less. In round 3, with per-call timing, MLX wrote 10 to 20% faster per token and held its speed, while Ollama's writing speed fell by more than a third over the run. Then two MLX chunk answers stopped at exactly 1,399 tokens, which cut the JSON off. The repairs hit the same cap. Those chunks lost their evidence, and MLX finished 40 seconds slower.

Nothing raised an error. I found the loss by comparing evidence counts. The Lekhni version I tested did not flag a cut-off chunk, so a user would read a normal-looking note with parts missing.

## Round 4: October 29, finding the causes

LM Studio can run the same file with either engine, so every test below used LM Studio. Ollama and LM Studio's llama.cpp engine gave byte-identical output on 75 of 75 calls, so I use it as a stand-in for Ollama.

**Why the deadline dropped.** I ran `scratch_guided` 20 times per setup. MLX 4-bit dropped "Thursday" in 20 of 20 runs. MLX 6-bit and llama.cpp dropped it in 0 of 20. The model is the same, so the 4-bit rounding in MLX is the likely cause. I have not shown which part matters.

**Why answers hit the cap.** The model fell into a repetition loop in the list of key terms. After 23 distinct terms, one answer cycled through the same 10 until the cap. The repair copied the loop. This happened only on LM Studio's chat route with MLX: 15 cut-offs in 18 calls. The same prompt sent the way Lekhni sends it to Ollama gave 0 in 135. Capping the term list at 15 items gave 0 in 18. A second cap on item length stalled MLX for about 30 minutes, so I do not use it.

**Heat and energy.** I measured chip power and thermal pressure with `powermetrics`: 3 runs per engine, 12 minutes each, on the charger.

| Measure | llama.cpp 4-bit | MLX 4-bit |
|---|---|---|
| Energy per output token | about 0.44 J | about 0.36 J |
| Writing speed | 14.4 tok/s | 19.6 tok/s |
| Time at Heavy thermal pressure | 76 to 82% | 61 to 74% |

Both engines reached Heavy thermal pressure within 2 to 4 minutes. Under heat, llama.cpp lost 16% of its writing speed and MLX lost 4%. I did not measure Ollama. It runs the same engine on the same file, so I expect the same heat effect. That is an inference.

**Full pipeline, MLX 6-bit against llama.cpp 4-bit.** All 9 chunks and the merge, with the term cap. One run per setup.

| Measure | llama.cpp 4-bit | MLX 6-bit |
|---|---|---|
| Evidence items kept | 353 | 295 (16% fewer) |
| Pipeline time | 14.6 min | 11.9 min |
| Writing speed, median per call | 14.7 tok/s | 12.2 tok/s |
| Memory taken by the model | 5.1 GB | 8.4 GB |

6-bit MLX finished sooner because it wrote shorter answers (6,346 tokens against 9,188), not because it wrote faster. It passed the Thursday check.

**A short meeting, scored against Granola.** Most of my meetings are short. I ran a 14-minute meeting through both engines, 2 runs each, one call per run. I scored each note blind against Granola's own note for the meeting, which has 28 points. The engines tie. llama.cpp covered 11.5 and 10.0 points and MLX 6-bit covered 7.5 and 11.0. MLX's two runs differ from each other by more than the engines differ. Both miss most of what Granola caught. All 4 runs missed 9 points, including 3 of the 5 next steps, and all 4 failed my planted date check. Lekhni's notes were flat, with owners given only as "me" or "them". Granola groups by topic and names the owner of each action. So on a short meeting the prompt and note structure decide quality, not the runtime. That is the next thing to work on.

## The decision

Lekhni stays on Ollama with `qwen3:8b`. In order:

1. **Complete notes.** Ollama kept every chunk's evidence and reached every late topic in both long runs. MLX 4-bit lost evidence in one run. MLX 6-bit finds 16% fewer items.
2. **The deadline.** MLX 4-bit dropped "Thursday" in 20 of 20 runs. A dropped deadline is the error a user does not notice until it costs them.
3. **One server.** Switching needs a second model server and a new backend. Lekhni uses Ollama's streaming API and schema format. LM Studio's API differs, and its context size is fixed at load.

The cut-off cause is no longer a reason, because the term cap fixes it. What I give up is 10 to 20% of writing speed and lower energy per token. That is small. This is a background job, so a minute or two changes nothing for the user, while a silent gap in a note can go unseen. The runtime was also never the main bottleneck. The hour-long talk took 9 to 16 minutes on either one. The better levers are chunking and note structure.

**What would make me test MLX again:** a check that the 16% evidence gap is repeats and not content, or an MLX build that keeps the deadline at 4-bit.

## Limits and what I would change

The power test has 3 runs per engine. The pipeline test has 1 run per setup. The short-meeting test has one meeting. Granola's note is a reference, not the truth. I did not check whether llama.cpp's 58 extra evidence items are content or repeats. The 356 count came from an earlier harness. Ollama's total time moved from 22.1 to 15.7 minutes between two runs of the same recording, so one run is a direction, not a result.

Next time I would save the text of every cut-off answer, which would have found the cause a day sooner. I would read GPU memory from the runtime, not from process memory. And I would run each long recording more than once.

## Sources

- Ollama, [Structured outputs](https://docs.ollama.com/capabilities/structured-outputs)
- ml-explore, [mlx-lm server documentation](https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/SERVER.md)
- LM Studio, [Structured output](https://lmstudio.ai/docs/developer/openai-compat/structured-output), [MLX support](https://lmstudio.ai/mlx) and [mlx-engine](https://github.com/lmstudio-ai/mlx-engine)
- Qwen, [Qwen3-8B model card](https://huggingface.co/Qwen/Qwen3-8B)

*Related: [Lekhni: system design of a local-first meeting-notes app](#/writing/lekhni-system-design) · [Choosing local Qwen models: memory, context and JSON](#/writing/choosing-local-qwen-models)*
