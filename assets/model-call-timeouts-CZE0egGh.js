const e=`# Stop a model call on silence, not on total time

*System design · 2026-10-28 · built in Lekhni, my local notes app*

> **In one paragraph.** A benchmark of local models found a bug in my notes app. One slow model call on a 58-minute recording passed a fixed 120-second limit, and the whole 20-minute note was lost. The limit was below the worst case the app allowed itself, and a fixed total-time limit is the wrong shape for text generation anyway. I changed three things: each call now streams its answer and stops only on silence, each limit is computed from the call's own token budget, and a failed chunk is retried once and then skipped with a visible gap, instead of losing the note. This note explains the failure, the arithmetic, the design, and what it gives up.

## The failure

Lekhni turns a recording into notes with a local model, \`qwen3:8b\` on Ollama. A long transcript does not fit in one call, so Lekhni cuts it into chunks. Each chunk call extracts evidence as JSON, and one final merge call writes the note. A 58-minute recording makes 9 chunk calls and one merge.

Lekhni gave each chunk call 120 seconds. During a [model benchmark](#/writing/choosing-local-qwen-models), chunk 6 of that recording took longer, and the call raised an error. Nothing caught it, so the evidence from the other chunks was thrown away with it.

A timed re-run with no early stop showed how long the calls really take:

| Chunk | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| Seconds | 68 | 85 | 74 | 91 | 98 | 118 | 124 | 133 | 86 |

Two of nine calls passed 120 seconds. The calls also get slower toward the end of the recording. A later test streamed every call and logged its writing speed, and that speed fell from 18.6 to 11.8 tokens per second over one run.

## The arithmetic

A model call has two phases. **Prefill** reads the prompt. **Decode** writes the answer, one token at a time. So:

\`\`\`text
call time ≈ prompt tokens / reading speed  +  output tokens / writing speed
\`\`\`

A chunk call reads about 3,200 prompt tokens and may write up to 1,400. On this Mac the model reads about 118 tokens per second and writes about 13.6 per second at long context:

\`\`\`text
3,200 / 118 ≈ 27 s   +   1,400 / 13.6 ≈ 103 s   =   about 130 s
\`\`\`

So the 120-second limit was below the worst case that the app's own settings allowed. It dated from when chunks could write only 900 tokens. Nobody re-derived it when that cap rose to 1,400.

The repair limit was worse. When a chunk's JSON comes back broken, Lekhni asks the model to fix it, within 60 seconds. But JSON breaks almost only when the answer hit its 1,400-token cap and was cut off. So a repair must rewrite about 1,400 tokens, which takes more than 60 seconds every time. The repair could only fail in the one case it existed for.

## Why a total-time limit is the wrong shape

Lekhni asked Ollama for the whole answer at once (\`"stream": false\`). Ollama then sends nothing until it finishes. The HTTP client's timeout is a **read timeout**: the longest wait between two pieces of data. When nothing arrives until the end, "between two pieces" means "the whole call". So every limit in the app was a total-time limit, whether anyone meant it to be or not.

A total-time limit cannot fit generation. How long a call takes depends on how much the model decides to write and how busy the machine is. Any fixed number is too short for a long answer on a busy day, or too long to notice a stuck model quickly.

## The design

### 1. Stream, and stop on silence

Each call now asks Ollama to stream (\`"stream": true\`). A working model sends a token every fraction of a second, so a stuck model shows up as silence. The read timeout becomes a **silence limit**: the call stops only when nothing arrives for that long.

The first token is the exception. It arrives only after the whole prompt is read, and that can take minutes for a long prompt. So the silence limit is sized from the prompt, not set to one short number.

A **ceiling** stays as a backstop. It is a generous total limit, for a model that keeps writing and never stops.

Streaming also brings measurement for free. Ollama's last streamed line reports prompt tokens, output tokens, and the reading and writing times. Lekhni now records them for every call, which is how the writing-speed numbers above were measured.

### 2. Size every limit from the work

Both limits are computed from the call itself, not typed in by hand:

\`\`\`text
read time    = prompt tokens / 80 tok/s
write time   = output cap / 10 tok/s
silence      = read time × 1.5 + 30 s
ceiling      = (read time + write time) × 1.5
\`\`\`

The speeds of 80 and 10 tokens per second are deliberately slow. They sit 25 to 30% below what I measured on an idle Mac, to leave room for a busy one. The 30 seconds covers loading the model.

| Call | Silence limit | Ceiling | Old limit |
|---|---|---|---|
| Chunk extraction | 91 s | 271 s | 120 s |
| JSON repair | 66 s | 246 s | 60 s |
| Final merge | 254 s | 839 s | 900 s |

The merge ceiling comes out close to the old 900 seconds. That is a useful check: the one limit that never failed is the one the formula reproduces. And when someone raises an output cap, the limit now rises with it, with no second edit.

### 3. Retry a chunk once, then skip it and say so

A chunk attempt is the extraction call plus its repair. If it fails, it runs once more. If it fails again, Lekhni skips that chunk and adds one line under the note's summary:

> Part of the recording could not be read: chunk 6 of 9. The rest of the note covers the other chunks.

If more than a third of the chunks fail, Lekhni fails the note and names the chunks. A note built from a small part of a recording would look complete when it is not.

The merge call is not retried. It is one call, and there is nothing to merge into if it fails.

## What it gives up

- **Simplicity.** The model call reads a stream of JSON lines instead of one response.
- **Fast detection of some hangs.** Before the merge's first token, a working call can be silent for minutes while it reads. So a hang at that moment takes up to about 4 minutes to notice.
- **Complete-or-nothing notes.** A note can now miss a part of the recording. The gap line is the price of keeping the rest.
- **Certainty about the slow speeds.** The 80 and 10 tokens per second floors are estimates. One replay already wrote slower than the floor, at 4.2 tokens per second (see below).

## How I checked it

- **Unit tests.** Eleven new tests use a fake streaming server. They cover a slow but steady stream, silence past the limit, a stream past its ceiling, a stream cut off before its end, an error line from Ollama, a chunk that fails once, a chunk that fails twice, and failure past one third. Lekhni's full suite passes: 141 tests.
- **Real replays.** I ran the same 58-minute recording through the new code three times.

| Run | Total | Slowest chunk call | Chunk calls over 120 s | Slowest writing speed | Retried | Skipped | Evidence kept | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | 22.8 min | 100 s | 0 | 10.4 tok/s | 0 | 0 | 353 | 19,296 chars |
| 2 | 19.3 min | 146 s | 2 | 4.2 tok/s | 0 | 0 | 346 | 18,870 chars |
| 3 | 14.1 min | 79 s | 0 | 12.1 tok/s | 0 | 0 | 358 | 17,962 chars |

All three runs produced a complete note, and every call ended with outcome \`ok\`. Run 2 is the one that matters. Two of its chunk calls took longer than 120 seconds, up to 146. The old code would have lost that note. The new code let both calls finish, because tokens kept arriving and both stayed under their 271-second ceiling.

Run 2 also broke one of my assumptions. One chunk wrote at only 4.2 tokens per second, well under the 10 tokens per second floor the limits assume. It still finished, because the ceiling has a 1.5× margin and the call did not use its full 1,400-token budget. But a call that slow and that long would pass its ceiling. So the floor is not as safe as I estimated, and measuring it on a busy Mac is now the first item below.

The runs also show how much the same work varies on one machine: 14.1 to 22.8 minutes for the same recording, same model, same code. Any fixed limit has to live with that spread.

## What I would do next

- Find out why one call fell to 4.2 tokens per second, and time calls during a real call with live transcription running. Then lower the writing-speed floor if the data says so.
- Retry a skipped chunk later, when the Mac is idle, instead of leaving the gap.
- Show the gap in minutes, not chunk numbers. That needs a map from chunks back to the raw transcript's timestamps.

*Related: [Choosing local Qwen models](#/writing/choosing-local-qwen-models) · [Ollama or MLX](#/writing/ollama-vs-mlx-benchmark) · [Lekhni: system design](#/writing/lekhni-system-design)*
`;export{e as default};
