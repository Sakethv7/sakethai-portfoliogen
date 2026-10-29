# Ollama or MLX: how I benchmarked a local model runtime

*Engineering note · 2026-10-28 · measured on my own Mac, single runs*

> **In one paragraph.** Lekhni, my local notes app, runs a Qwen3-8B model through Ollama. MLX, Apple's machine-learning framework, is often called faster on Apple Silicon. I tested both with the same model on the same Mac. MLX was 10 to 18% faster end to end and used about 2 GB less memory. It also failed one of my five eval fixtures, and the server I used could not constrain its output to a JSON schema. I stayed on Ollama. A month later I re-ran the test through LM Studio, which can constrain MLX output to a schema, and then measured tokens per second call by call. MLX writes 10 to 20% faster per token. But under a schema some of its answers ran to the output cap and were cut off, and its note lost evidence. Lekhni stays on Ollama. This note explains all three tests and what each number means.

## The question

A runtime is the program that loads model weights and generates tokens. Ollama wraps llama.cpp and serves GGUF model files. MLX is Apple's array framework, and `mlx-lm` runs language models on it. [LM Studio](https://lmstudio.ai/mlx) is a desktop app that can run both GGUF models and MLX models.

The claim I wanted to test was simple: "MLX is faster on a Mac, so switch." Speed alone was not my question. My question was: **does the faster runtime give the same notes, in a format my code can trust, inside the memory I have?**

## The setup

I fixed everything except the runtime.

| Held constant | Value |
|---|---|
| Machine | M4 Mac, 16 GB unified memory, nothing else running |
| Model | Qwen3-8B, 4-bit |
| Thinking | Off ([Qwen3 has a hard switch](https://huggingface.co/Qwen/Qwen3-8B) for this, `enable_thinking=False`) |
| Prompts | Lekhni's real prompts, unchanged |

| Runtime | How I ran it |
|---|---|
| Ollama | `qwen3:8b`, which is a Q4_K_M GGUF file, through Ollama's API |
| MLX | `mlx-community/Qwen3-8B-4bit` through `mlx_lm.server`, an OpenAI-compatible server |

**Why `mlx-lm` and not the LM Studio app.** LM Studio was not installed on this Mac. I had two routes. One was to install LM Studio, download the MLX model in its interface, and benchmark through its local server. The other was to run `mlx-lm` from a throwaway Python environment. LM Studio runs MLX models with its open-source [mlx-engine](https://github.com/lmstudio-ai/mlx-engine), which is built on `mlx-lm`. So the second route tests the same generation engine with no app install, and it is easy to delete afterwards. I chose it. The cost of that choice is in the section "What LM Studio changes" below.

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

**How to read the fixture row.** MLX failed the `scratch_guided` fixture. The note dropped "on Thursday" from an action item. One failure in one run is thin evidence. It could be the runtime, the quantization, or sampling. I did not run it enough times to tell.

**How to read the JSON row.** Both runtimes produced valid JSON every time. The difference is why. Ollama takes a JSON schema in its [`format` field](https://docs.ollama.com/capabilities/structured-outputs) and constrains generation to it. The [`mlx_lm.server` docs](https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/SERVER.md) list no schema or `response_format` field. So on MLX the JSON was valid by luck, not by construction. The same page also says the server "is not recommended for production".

## The decision in September

I stayed on Ollama. My reasons, in order:

1. **Correctness over speed.** A dropped deadline is the kind of error a user does not notice until it costs them. One failure is weak evidence, but I had no evidence the other way.
2. **Guaranteed structure.** Lekhni parses model JSON in several places. Schema-constrained output removes a whole class of failure.
3. **One server.** Switching meant a second always-on model server and a new backend in the code.

What I gave up: about 10 to 18% of generation time, which is about 1.5 minutes on an hour-long talk, and about 2 GB of memory headroom.

The bigger lesson was that the runtime was not the bottleneck. The hour-long talk took 9 to 10 minutes on either runtime. The better lever was the pipeline: how transcripts are split into chunks, and how small the chunk model can be.

## What LM Studio changes

I tested MLX through `mlx_lm.server`, not through the LM Studio app. Speed should be close, because both use `mlx-lm` to generate. Structure is different. [LM Studio's structured-output docs](https://lmstudio.ai/docs/developer/openai-compat/structured-output) say it constrains GGUF models with llama.cpp's grammar sampling and MLX models with [Outlines](https://github.com/dottxt-ai/outlines). So reason 2 above may not hold for MLX served by LM Studio. The re-test below checks it.

## Re-test through LM Studio (2026-10-28)

A month later I ran the fair test. I installed LM Studio, downloaded the same `mlx-community/Qwen3-8B-4bit` model, loaded it with the same 16,384-token window, and served it on LM Studio's OpenAI-compatible server. Lekhni's real pipeline called it with a JSON schema in `response_format`. A first check returned exactly `{"ok": true}`, with no reasoning block. So structured output works on MLX through LM Studio.

This time the harness fixed three gaps from September. It repeated each fixture three times. It added a 58-minute recording that takes the chunked path (9 chunk calls and one merge call). And it timed every model call. The Ollama numbers come from the same harness on the same day, in my [model benchmark](#/writing/choosing-local-qwen-models).

| Measure | Ollama, `qwen3:8b` | LM Studio, MLX Qwen3-8B 4-bit |
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
- **MLX failed the same fixture as in September.** The note for `scratch_guided` dropped "Thursday" from an action item again. Ollama passed it in all runs, both months. One failure is weak evidence. The same failure on the same fixture, a month apart, is a pattern worth taking seriously.
- **Chunk times stayed far from the timeout.** On MLX no chunk call came near 120 seconds. On Ollama two calls went over it.
- **I did not get a fair memory number.** LM Studio's model memory sits in the GPU and does not show in the process memory I sampled. So this table has no memory row.

## Where this left the decision

After the re-test, reason 2 for staying on Ollama no longer held: LM Studio gives MLX schema-constrained JSON. Reason 3 still held: switching means a second model server and a new backend in Lekhni. Reason 1 got stronger: the dropped deadline came back.

That left one open question. Was MLX truly faster, or did it only write less? Total time cannot tell the two apart. So I ran one more test.

## Tokens per second, call by call (2026-10-28)

Both runtimes streamed every call, and the harness timed each one. For every call it recorded the time to the first token (how fast the prompt was read), the writing speed in tokens per second, and how many tokens the model wrote. Same model, same 16,384-token window, same 58-minute recording, run one after the other on the same afternoon.

| Measure | Ollama, `qwen3:8b` | LM Studio, MLX Qwen3-8B |
|---|---|---|
| Writing speed, 9 chunk calls | 18.6 falling to 11.8 tok/s | 16.0 to 16.6 tok/s, steady |
| Writing speed, merge call | 11.2 tok/s | 13.4 tok/s |
| Time to first token, chunk calls | 12 to 19 s | 15 to 22 s |
| Chunk answers cut off at the 1,400-token cap | 0 of 9 | 2 of 9, and both repairs were cut off too |
| 58-minute recording, total | 15.7 min | 16.4 min |
| Evidence items kept | 356 | 233 |
| Late topics reached (of 4) | 4 | 2 (no waiting queue, no WebSockets) |
| Final note | 18,413 chars | 10,279 chars |

How to read it:

- **MLX writes faster per token, by about 10 to 20%.** It also holds its speed. Ollama's writing speed fell by more than a third over the run. MLX barely moved.
- **Ollama reads prompts a little faster.** Its first token came 2 to 4 seconds sooner on chunk calls.
- **Under a JSON schema, MLX sometimes ran to the output cap.** Two chunk answers stopped at exactly 1,399 tokens, which cut the JSON off. The repair calls hit the same cap. Those chunks lost their evidence, and the note lost two of the four late topics. I did not record the cut-off text on this run, so I could not say why the answers ran long. I found the cause the next day. See the follow-up section below.
- **The earlier speed-up was mostly shorter answers.** With real per-token numbers, MLX is 10 to 20% faster at writing. In this run the cut-off chunks and their repairs ate that gain, and MLX finished 40 seconds slower.

## The decision

Lekhni stays on Ollama with `qwen3:8b`. In order:

1. **Complete notes.** Ollama kept every chunk's evidence and reached every late topic, in both long runs. MLX lost evidence in one of its two runs.
2. **The deadline.** MLX dropped the same "Thursday" deadline in September and again in October. Ollama never did.
3. **One server.** Switching still means a second model server and a new backend.

What I give up: about 10 to 20% of writing speed, and a steadier speed on long runs. The timeout fix I am designing for Lekhni covers the slow late chunks. It sizes each call's limit from its token budget instead of a fixed number.

**Why the cut-off answers outweigh the speed.** The two sides of this trade are not equal.

- **The gain is small and bounded.** MLX writes 10 to 20% faster per token. In the same run it finished 40 seconds slower (16.4 minutes against 15.7), because the cut-off chunks and their repairs used the time it saved. This is a background job, so a minute or two does not change what the user gets.
- **The loss is large and may go unseen.** Two chunk answers stopped at the cap, and both repairs did too. Those chunks lost all their evidence. The note lost two of four late topics. I found the loss by comparing evidence counts (233 against 356), not because anything raised an error. I checked the next day: the Lekhni version I tested did not flag a cut-off chunk, so a user would read a normal-looking note with parts missing.

A small time saving does not pay for a possible silent loss of content. That is why the truncation, not the speed, decides this.

**What would make me test MLX again:** finding out why some schema-constrained answers run to the cap. I did that the next day. The follow-up section below has the result.

## Follow-up (2026-10-29): I found the causes and tested again

I ran the open questions as separate tests the next day. LM Studio can run the same Qwen3-8B file with either engine, so every test below used LM Studio. That removed the server as a variable. Ollama itself was not part of these runs.

**Same engine, same answers.** Ollama and LM Studio's llama.cpp engine gave byte-identical output on 75 of 75 calls. So LM Studio's llama.cpp engine is a fair stand-in for Ollama.

**Why the deadline dropped.** I ran the `scratch_guided` fixture 20 times per setup. MLX 4-bit dropped "Thursday" in 20 of 20 runs. MLX 6-bit and llama.cpp dropped it in 0 of 20. The model is the same, so the 4-bit rounding in MLX is the likely cause. I have not shown which part of the model matters.

**Why answers hit the cap.** The model fell into a repetition loop in the list of key terms. After 23 distinct terms, one answer cycled through the same 10 terms until it reached the cap. The repair call copied the loop. This happened only on LM Studio's chat route with MLX: 15 cut-offs in 18 calls. The same prompt sent the way Lekhni sends it to Ollama gave 0 cut-offs in 135 calls. Capping the term list at 15 items gave 0 in 18. A second cap on the length of each item stalled MLX for about 30 minutes, so I do not use it.

**Does Lekhni notice a cut-off?** The version I tested did not. It dropped that chunk's evidence without a flag. Lekhni's new timeout work (Part 15) marks the gap.

**Heat and energy.** I measured chip power and thermal pressure with macOS `powermetrics`: 3 runs per engine, 12 minutes each, on a 16 GB M4 Mac on the charger.

| Measure | llama.cpp 4-bit | MLX 4-bit |
|---|---|---|
| Energy per output token | about 0.44 J | about 0.36 J |
| Writing speed | 14.4 tok/s | 19.6 tok/s |
| Time at Heavy thermal pressure | 76 to 82% | 61 to 74% |
| Memory pressure | warn in 2 of 3 runs | normal in 3 of 3 |

Both engines reached Heavy thermal pressure within 2 to 4 minutes. Under heat, llama.cpp lost 16% of its writing speed and MLX lost 4%. I did not measure Ollama. It runs the same engine on the same file, so I expect the same heat effect. That is an inference. It also fits the slowdown I saw in Ollama's long run.

**The full pipeline, MLX 6-bit against llama.cpp 4-bit.** I ran all 9 chunks and the merge on the 58-minute recording, with the term cap in place. One run per setup.

| Measure | llama.cpp 4-bit | MLX 6-bit |
|---|---|---|
| Evidence items kept | 353 | 295 (16% fewer) |
| Chunks cut off, repaired or failed | 0 | 0 |
| Pipeline time | 14.6 min | 11.9 min |
| Writing speed, median per call | 14.7 tok/s | 12.2 tok/s |
| Memory taken by the model | 5.1 GB | 8.4 GB |

6-bit MLX finished sooner because it wrote shorter answers (6,346 tokens against 9,188), not because it wrote faster. It passed the Thursday check. The llama.cpp count of 353 is close to the 356 I measured on 2026-10-28.

**What this means.** No MLX setup beat Ollama on everything.
- MLX 4-bit is faster and uses less energy, but it drops the deadline.
- MLX 6-bit keeps the deadline and does not cut off with the term cap. It writes more slowly per token than llama.cpp, finds 16% fewer evidence items, and takes about 3 GB more memory.
- Switching still needs a new backend in Lekhni. Lekhni talks to Ollama's own streaming API and sends the schema in Ollama's format. LM Studio uses a different API. Its context size is fixed when the model loads.

So Lekhni stays on Ollama. The cut-off cause is no longer a reason. The deadline and the evidence count still are.

**A short meeting, scored against Granola.** The recording I used for everything above is long. Most of my meetings are not, so I ran a 14-minute meeting through both engines, 2 runs each. This input is under Lekhni's 18,000-character limit, so Lekhni made one call per run and did not chunk it. I took Granola's own note for the same meeting as the reference. It has 28 points. I scored each Lekhni note against them, blind: I shuffled the outputs, hid the engine name, then scored.

| Measure | llama.cpp 4-bit | MLX 6-bit |
|---|---|---|
| Points of 28 covered, per run | 11.5 and 10.0 | 7.5 and 11.0 |
| Speed | 16.1 to 16.8 tok/s | 13.6 to 14.4 tok/s |
| Energy per note | about 570 J | about 635 J |
| Time per note | 38 to 39 s | 42 s |
| Thermal state | Nominal | Nominal |
| Cut-offs | 0 | 0 |

- **The engines tie on quality.** MLX's two runs differ from each other by more than the two engines differ.
- **llama.cpp is a little faster and uses less energy here.** About 60% of each call is reading the 3,578-token prompt. The Mac stayed at Nominal thermal state, so the slowdown from heat that I saw on the long recording did not appear.
- **Both miss most of what Granola caught.** Each run covered about a third of the points. All 4 runs missed 9 of them, including 3 of the 5 next steps. All 4 also failed my planted date check, where the speakers corrected a start date. The notes were flat (summary, key points, action items) with owners given only as "me" or "them". Granola groups by topic and names the owner of each action.

So on a short meeting the runtime does not decide quality. The prompt and the note structure do. That is a larger gap than anything between llama.cpp and MLX, and it is the next thing to work on. I did not run MLX 4-bit on this meeting, because it already fails the deadline check.

**Limits.** The power test has 3 runs per engine and measures chip power only. The full-pipeline test has 1 run per setup, and the short-meeting test has one meeting and 2 runs per engine. Granola's note is a reference, not the truth. I did not check whether the 58 extra items from llama.cpp are real content or repeats. More items is not the same as better notes. The 2026-10-28 count of 356 came from an earlier harness, and I did not verify how it counted.

**What would make me test MLX again:** a check that the 16% evidence gap is repeats and not content, or an MLX build that keeps the deadline at 4-bit.

## What I would do differently

- **Save the text of every cut-off answer.** I measured that two answers hit the cap, but not what they contained. That is the first thing to look at next time.
- **Fix the memory comparison.** Read GPU memory from the runtime itself, not process memory.
- **Run each long recording more than once per runtime.** Ollama's total time moved from 22.1 to 15.7 minutes between two runs of the same recording. One run per runtime is a direction, not a result.

## Sources

- Ollama, [Structured outputs](https://docs.ollama.com/capabilities/structured-outputs)
- ml-explore, [mlx-lm server documentation](https://github.com/ml-explore/mlx-lm/blob/main/mlx_lm/SERVER.md)
- LM Studio, [Structured output](https://lmstudio.ai/docs/developer/openai-compat/structured-output), [MLX support](https://lmstudio.ai/mlx) and [mlx-engine](https://github.com/lmstudio-ai/mlx-engine)
- Qwen, [Qwen3-8B model card](https://huggingface.co/Qwen/Qwen3-8B)

*Related: [Lekhni: system design of a local-first notes app](#/writing/lekhni-system-design) · [Choosing local Qwen models: memory, context and JSON](#/writing/choosing-local-qwen-models)*
