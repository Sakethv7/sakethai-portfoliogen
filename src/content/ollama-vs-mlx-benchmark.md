# Ollama or MLX: how I benchmarked a local model runtime

*Engineering note · 2026-10-29 · measured on my own Mac, mostly single runs*

> **In one paragraph.** Lekhni, my local note-taking and meeting-summarizing app, runs a Qwen3-8B model through Ollama. MLX, Apple's machine-learning framework, is often called faster on Apple Silicon. I tested both with the same model on the same Mac, in three rounds over two days. MLX writes 10 to 20% faster per token and uses less energy. But MLX 4-bit dropped a deadline from a test note in 20 of 20 runs, and under a JSON schema some of its answers ran to the output cap and lost evidence. MLX 6-bit fixes the deadline but is slower per token and uses about 3 GB more memory. Lekhni stays on Ollama.

## The question

A runtime is the program that loads model weights and generates tokens. Ollama wraps llama.cpp and serves GGUF model files. MLX is Apple's array framework, and `mlx-lm` runs language models on it. [LM Studio](https://lmstudio.ai/mlx) is a desktop app that can run both kinds of model.

The claim I wanted to test was "MLX is faster on a Mac, so switch." Speed alone was not my question. My question was: **does the faster runtime give the same notes, in a format my code can trust, inside the memory I have?**

## The setup

I fixed everything except the runtime.

| Held constant | Value |
|---|---|
| Machine | M4 Mac, 16 GB unified memory, nothing else running |
| Model | Qwen3-8B, 4-bit |
| Thinking | Off ([Qwen3 has a hard switch](https://huggingface.co/Qwen/Qwen3-8B) for this, `enable_thinking=False`) |
| Prompts | Lekhni's real prompts, unchanged |

The two 4-bit files are not identical. Ollama's `qwen3:8b` is a Q4_K_M GGUF file. MLX 4-bit quantizes the weights in a different way. "Same model" here means the same base weights at the same nominal bit width. That is as close as two runtimes allow.

I measured from the bottom up: raw speed, memory, five eval fixtures (plain string checks, not an LLM judge), and real recordings. The recordings were a 23-minute meeting (one model call) and a 1-hour talk (nine chunk calls plus a final note). Raw speed is what most benchmark posts report. The fixtures and recordings decide whether a user gets a better product.

## Round 1: September, through `mlx_lm.server`

LM Studio was not installed, so I ran MLX through `mlx_lm.server`, an OpenAI-compatible server. LM Studio's [mlx-engine](https://github.com/lmstudio-ai/mlx-engine) is built on `mlx-lm`, so generation speed should be close.

| Measure | Ollama | MLX |
|---|---|---|
| Prompt read, 650 / 3,900 tokens | 135 / 118 tok/s | 175 / 159 tok/s |
| Generation, short / long context | 19.3 / 13.6 tok/s | 21.6 / 18.4 tok/s |
| Memory | 7.8 GB (16K context reserved) | 5.1 to 5.8 GB peak |
| 5 eval fixtures | 89.5 s, 5 of 5 pass | 73.8 s, 4 of 5 pass |
| 23-minute meeting, one call | 69.5 s | 62.4 s |
| 1-hour talk, 9 chunk calls | 10.4 min | 8.9 min |
| JSON repairs needed | 0 (schema-constrained) | 0 (unconstrained) |

The memory row compares different things. Ollama reserves the cache for the whole 16,384-token window when it loads the model. MLX grows its cache with the prompt, so I report its peak. Part of the 2 GB gap is a setting, not the runtime. My [other note](#/writing/choosing-local-qwen-models) has the arithmetic.

MLX failed the `scratch_guided` fixture. The note dropped "on Thursday" from an action item. One failure in one run is thin evidence.

Both runtimes produced valid JSON every time. The reason differs. Ollama takes a JSON schema in its [`format` field](https://docs.ollama.com/capabilities/structured-outputs) and constrains generation to it. The [`mlx_lm.server` docs](https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/SERVER.md) list no schema field. So on MLX the JSON was valid by luck, not by construction.

## Round 2: October 28, through LM Studio

[LM Studio's structured-output docs](https://lmstudio.ai/docs/developer/openai-compat/structured-output) say it constrains MLX models with [Outlines](https://github.com/dottxt-ai/outlines). So I ran the fair test. I loaded the same `mlx-community/Qwen3-8B-4bit` model with the same 16,384-token window and called it with a JSON schema in `response_format`. A first check returned exactly `{"ok": true}`, so structured output works on MLX through LM Studio.

This harness repeated each fixture three times, added a 58-minute recording (9 chunk calls and one merge call), and timed every call.

| Measure | Ollama, `qwen3:8b` | LM Studio, MLX Qwen3-8B 4-bit |
|---|---|---|
| Fixtures, 15 runs | 15/15, 329 s | 14/15, 195 s |
| 58-minute recording, total | 22.1 min | 11.8 min |
| Chunk calls | 68 to 133 s, two over Lekhni's 120 s limit | 49 to 61 s, none over |
| Final note | 18,665 chars, 285 bullets | 11,692 chars, 199 bullets |
| Evidence items from chunks | 357 | 300 |
| Late topics reached (of 4) | 4 | 4 |

MLX was about 1.9 times faster on the long recording. But it also wrote less, so part of that speed-up is shorter answers, not speed. And MLX failed the same fixture again. The note for `scratch_guided` dropped "Thursday" a second time, while Ollama passed it in every run, both months.

I did not get a fair memory number. LM Studio's model memory sits in the GPU and does not show in the process memory I sampled.

## Round 3: tokens per second, call by call

To separate speed from shorter answers, both runtimes streamed every call and the harness recorded the time to first token, the writing speed and the tokens written. Same model, same window, same recording, run one after the other.

| Measure | Ollama, `qwen3:8b` | LM Studio, MLX Qwen3-8B |
|---|---|---|
| Writing speed, 9 chunk calls | 18.6 falling to 11.8 tok/s | 16.0 to 16.6 tok/s, steady |
| Writing speed, merge call | 11.2 tok/s | 13.4 tok/s |
| Time to first token, chunk calls | 12 to 19 s | 15 to 22 s |
| Chunk answers cut off at the 1,400-token cap | 0 of 9 | 2 of 9, and both repairs were cut off too |
| 58-minute recording, total | 15.7 min | 16.4 min |
| Evidence items kept | 356 | 233 |
| Late topics reached (of 4) | 4 | 2 (no waiting queue, no WebSockets) |

MLX writes faster per token by about 10 to 20%, and it holds its speed. Ollama's writing speed fell by more than a third over the run. But two MLX chunk answers stopped at exactly 1,399 tokens, which cut the JSON off, and the repair calls hit the same cap. Those chunks lost their evidence, and the note lost two of four late topics. The cut-off chunks and repairs ate the speed gain, and MLX finished 40 seconds slower.

Nothing raised an error. I found the loss by comparing evidence counts (233 against 356). The Lekhni version I tested did not flag a cut-off chunk, so a user would read a normal-looking note with parts missing.

## Round 4: October 29, finding the causes

LM Studio can run the same Qwen3-8B file with either engine, so every test below used LM Studio. That removed the server as a variable. Ollama itself was not part of these runs.

**Same engine, same answers.** Ollama and LM Studio's llama.cpp engine gave byte-identical output on 75 of 75 calls. So LM Studio's llama.cpp engine is a fair stand-in for Ollama.

**Why the deadline dropped.** I ran the `scratch_guided` fixture 20 times per setup. MLX 4-bit dropped "Thursday" in 20 of 20 runs. MLX 6-bit and llama.cpp dropped it in 0 of 20. The model is the same, so the 4-bit rounding in MLX is the likely cause. I have not shown which part of the model matters.

**Why answers hit the cap.** The model fell into a repetition loop in the list of key terms. After 23 distinct terms, one answer cycled through the same 10 terms until it reached the cap. The repair call copied the loop. This happened only on LM Studio's chat route with MLX: 15 cut-offs in 18 calls. The same prompt sent the way Lekhni sends it to Ollama gave 0 cut-offs in 135 calls. Capping the term list at 15 items gave 0 in 18. A second cap on the length of each item stalled MLX for about 30 minutes, so I do not use it.

**Heat and energy.** I measured chip power and thermal pressure with macOS `powermetrics`: 3 runs per engine, 12 minutes each, on the charger.

| Measure | llama.cpp 4-bit | MLX 4-bit |
|---|---|---|
| Energy per output token | about 0.44 J | about 0.36 J |
| Writing speed | 14.4 tok/s | 19.6 tok/s |
| Time at Heavy thermal pressure | 76 to 82% | 61 to 74% |
| Memory pressure | warn in 2 of 3 runs | normal in 3 of 3 |

Both engines reached Heavy thermal pressure within 2 to 4 minutes. Under heat, llama.cpp lost 16% of its writing speed and MLX lost 4%. I did not measure Ollama. It runs the same engine on the same file, so I expect the same heat effect. That is an inference, and it fits the slowdown I saw in Ollama's long run.

**The full pipeline, MLX 6-bit against llama.cpp 4-bit.** All 9 chunks and the merge on the 58-minute recording, with the term cap in place. One run per setup.

| Measure | llama.cpp 4-bit | MLX 6-bit |
|---|---|---|
| Evidence items kept | 353 | 295 (16% fewer) |
| Chunks cut off, repaired or failed | 0 | 0 |
| Pipeline time | 14.6 min | 11.9 min |
| Writing speed, median per call | 14.7 tok/s | 12.2 tok/s |
| Memory taken by the model | 5.1 GB | 8.4 GB |

6-bit MLX finished sooner because it wrote shorter answers (6,346 tokens against 9,188), not because it wrote faster. It passed the Thursday check.

**A short meeting, scored against Granola.** Most of my meetings are short, so I ran a 14-minute meeting through both engines, 2 runs each. It is under Lekhni's 18,000-character limit, so Lekhni made one call per run. I took Granola's own note for the same meeting as the reference. It has 28 points. I scored blind: I shuffled the outputs, hid the engine name, then scored.

| Measure | llama.cpp 4-bit | MLX 6-bit |
|---|---|---|
| Points of 28 covered, per run | 11.5 and 10.0 | 7.5 and 11.0 |
| Speed | 16.1 to 16.8 tok/s | 13.6 to 14.4 tok/s |
| Energy per note | about 570 J | about 635 J |
| Time per note | 38 to 39 s | 42 s |
| Cut-offs | 0 | 0 |

The engines tie on quality, because MLX's two runs differ from each other by more than the two engines differ. Both miss most of what Granola caught. Each run covered about a third of the points. All 4 runs missed 9 of them, including 3 of the 5 next steps, and all 4 failed my planted date check. The notes were flat (summary, key points, action items) with owners given only as "me" or "them". Granola groups by topic and names the owner of each action. So on a short meeting the prompt and the note structure decide quality, not the runtime. That is the next thing to work on. I did not run MLX 4-bit on this meeting, because it already fails the deadline check.

## The decision

Lekhni stays on Ollama with `qwen3:8b`. In order:

1. **Complete notes.** In both long runs, Ollama kept every chunk's evidence and reached every late topic. MLX 4-bit lost evidence in one run. MLX 6-bit finds 16% fewer evidence items.
2. **The deadline.** MLX 4-bit dropped the same "Thursday" in 20 of 20 runs. A dropped deadline is the kind of error a user does not notice until it costs them.
3. **One server.** Switching needs a second model server and a new backend. Lekhni talks to Ollama's own streaming API and sends the schema in Ollama's format. LM Studio uses a different API, and its context size is fixed when the model loads.

The cut-off cause is no longer a reason, because the term cap fixes it. What I give up: about 10 to 20% of writing speed, lower energy per token, and about 3 GB less memory than MLX 6-bit would use if I chose it for safety. The gain is small and bounded. This is a background job, so a minute or two does not change what the user gets. The loss from a silent gap is large and can go unseen.

The bigger lesson is that the runtime was not the bottleneck. The hour-long talk took 9 to 16 minutes on either runtime. The better levers are the pipeline (how transcripts are split into chunks) and the note structure.

**What would make me test MLX again:** a check that the 16% evidence gap is repeats and not content, or an MLX build that keeps the deadline at 4-bit.

## Limits

The power test has 3 runs per engine and measures chip power only. The full-pipeline test has 1 run per setup. The short-meeting test has one meeting and 2 runs per engine. Granola's note is a reference, not the truth. I did not check whether the 58 extra items from llama.cpp are real content or repeats. More items is not the same as better notes. The 2026-10-28 count of 356 came from an earlier harness, and I did not verify how it counted. Ollama's total time moved from 22.1 to 15.7 minutes between two runs of the same recording, so one run per runtime is a direction, not a result.

## What I would do differently

- **Save the text of every cut-off answer.** On 10-28 I measured that two answers hit the cap but not what they contained. That delayed the cause by a day.
- **Fix the memory comparison.** Read GPU memory from the runtime itself, not process memory.
- **Run each long recording more than once per runtime.**

## Sources

- Ollama, [Structured outputs](https://docs.ollama.com/capabilities/structured-outputs)
- ml-explore, [mlx-lm server documentation](https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/SERVER.md)
- LM Studio, [Structured output](https://lmstudio.ai/docs/developer/openai-compat/structured-output), [MLX support](https://lmstudio.ai/mlx) and [mlx-engine](https://github.com/lmstudio-ai/mlx-engine)
- Qwen, [Qwen3-8B model card](https://huggingface.co/Qwen/Qwen3-8B)

*Related: [Lekhni: system design of a local-first meeting-notes app](#/writing/lekhni-system-design) · [Choosing local Qwen models: memory, context and JSON](#/writing/choosing-local-qwen-models)*
