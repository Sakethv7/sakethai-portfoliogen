const e=`I wrote a [build log](#/writing/lekhni-recording-to-knowledge) about how Lekhni turns recordings into notes. This is the system design: the parts, the data flow, how it fails, and what I traded away.

## Where it came from

[Granola](https://www.granola.ai/) was the inspiration. Its idea is simple. You type rough notes while a call is recorded, and the app uses your notes to guide the summary it writes afterward. No bot joins the call, and there is one window.

I wanted that workflow, but with everything on my own machine. Granola's [security page](https://www.granola.ai/security) says it does not store meeting audio. It also says it uses transcription providers (it names Deepgram and AssemblyAI) and AI providers (it names OpenAI and Anthropic) to summarize the meeting. That is a reasonable design for a product. For me it meant my conversations went through other companies' servers. I record study sessions, technical talks, and sometimes work calls, and I wanted none of it to leave my laptop.

So the rule for Lekhni is: record on the Mac, transcribe on the Mac, summarize with a model running on the Mac. One honest caveat. The code has an optional OpenAI backend that I can switch on for a single run. The default is the local model, and the optional backend is the only path where a transcript leaves the machine.

## What it has to do

1. Record my microphone and the other side of a call, in one window.
2. Let me type scratch notes during the recording and use them to steer the final notes.
3. Turn a recording, a pasted transcript, or an exported note into a typed note.
4. Show me why a session's notes might be wrong, with specific checks.
5. Hand the parts worth keeping to SakethWiki, through its review queue.

It does not need accounts, sync between devices, or more than one user.

## Complexity tier

**Two-process desktop app on one machine.** That sits between a single-process tool and a multi-service app.

It is two processes because the capture code is Swift. It has to run inside an app bundle to hold the macOS audio permissions. The notes pipeline is Python. Merging them would mean embedding Python in the Swift app or rewriting generation in Swift. Neither would change what I see day to day. Keeping capture in a separate third process was how it worked before, and it is what I moved away from. Two is the smallest honest number.

## The parts

\`\`\`
  Lekhni.app (Swift)                     Python server (FastAPI)
  +---------------------+                +------------------------+
  | window (web view)   |  JS bridge     | 127.0.0.1:8420         |
  | mic + system audio  |<-------------->| notes | health | traces |
  | Parakeet transcribe |  one HTTP call | evals | import         |
  +----------+----------+                +-----------+------------+
             | writes                                | reads / writes
             v                                       v
        ~/Recordings/<session>/  <---------->  SQLite mirror
        audio, transcript, scratch, notes       (rebuildable)
                                                     |
                                                     v
                                          SakethWiki review queue
\`\`\`

*Caption: the two processes never share memory. They share a folder on disk and one HTTP call that says "the transcript is ready".*

**Capture (Swift).** Microphone audio comes from the default input. Audio from the other side of a call comes from a macOS process tap, a Core Audio feature that gives an app a copy of what other apps are playing. That avoids installing a virtual audio driver. Transcription runs on the device with Parakeet, a speech model I run through a Core ML port. My design notes put it at about 20 seconds per hour of audio. The capture code started as [Quill](https://github.com/digimata/quill), an MIT-licensed recorder. I vendored it into the app once keeping it as a separate menu-bar app became the thing that slowed my workflow down.

**The session folder.** Every input becomes a folder: audio, a transcript, my scratch notes, the generated notes, and a few marker files. This folder is the contract between the two processes and the source of truth. The SQLite database is a mirror for browsing, stats, and traces. It can be rebuilt from the folders at any time.

**Notes generation (Python).** It cleans the transcript, picks a note type, calls the model, normalizes the output, and writes the notes. Note types follow intent, not file format. A talk may become a system-design note, a paper walkthrough, or a debugging session, depending on what I wanted to learn from it. Long transcripts are split into overlapping chunks, and a smaller model can handle the chunk step.

**Health checks.** One shared extraction reads each session for status, decisions, action items, open questions, and uncertainty. Every view reads from it. The checks are deterministic on purpose. When a session looks wrong, I want a reason like "transcript missing", not a model's opinion.

**Traces and evals.** Each generation logs the backend, model, prompt version, input size, raw output, and latency. Each edit I make logs a diff. A small eval set of synthetic transcripts with known decisions and action items checks that each one shows up in the notes.

## The path of one recording

1. I click New note. Swift creates the session folder and starts both audio tracks.
2. I type scratch notes. They are saved to the folder about a second after I stop typing.
3. I click Stop. Swift writes metadata and queues transcription.
4. Parakeet transcribes my track and the other side's track. Swift writes the transcript.
5. Swift makes one HTTP call to the server saying the transcript is ready.
6. The server generates notes from the transcript and my scratch notes, writes them, and updates the mirror.
7. The page polls a status endpoint through recording, transcribing, generating, and ready, then opens the finished notes.

## What happens when things fail

| Failure | What happens |
|---|---|
| The HTTP call to the server fails | The transcript is already in the folder. The server's next scan finds a transcribed session without notes and generates them. |
| Transcription fails | A marker file records it. The audio is still there. |
| Two generations start on one session | A transient lock file stops the second. |
| I close the window mid-recording | The app stays alive while it is recording or transcribing. |
| I upload audio with no transcript | It stays pending. Lekhni does not pretend to have notes it cannot produce. |
| A prompt change makes notes worse | The traces and eval set show which change did it. Nothing rewrites a prompt without my decision. |

## One decision I tested: Ollama or MLX

My runtime is Ollama with a Qwen3 8B model. In late September I benchmarked MLX, Apple's own framework, against it with the same 4-bit model on an M4 with 16 GB of memory. These are single runs, so treat the numbers as a snapshot.

| Measure | Ollama | MLX |
|---|---|---|
| Generation speed, short / long context | 19.3 / 13.6 tok/s | 21.6 / 18.4 tok/s |
| Memory | 7.8 GB | 5.1 to 5.8 GB |
| 5 eval fixtures | 5 of 5 pass | 4 of 5 pass |
| 1-hour talk, chunked | 10.4 min | 8.9 min |

MLX was faster and lighter. It also dropped a detail ("on Thursday") from an action item. Ollama can constrain its output to a schema, and MLX was run unconstrained. I stayed on Ollama because correctness on the fixtures mattered more than 15 percent in speed. That is my judgment, and one failed fixture is thin evidence either way.

## Decisions and what each cost

| Decision | What I gave up |
|---|---|
| Everything runs on the Mac by default | Notes are only as good as an 8B local model. A hosted model would write better summaries. |
| The folder is the source of truth | A rebuild step for the mirror, and a format I must keep stable. |
| Two processes, not one | A bridge between them and two things to start. |
| Vendored a recorder instead of rebuilding it | I own audio code I did not write and have to keep it working. |
| Deterministic health checks | They catch missing pieces but not subtle errors in the notes. |
| No automatic prompt tuning | Slower improvement, but every change is mine and traceable. |
| Mac only, macOS 15 or later | No Windows, no phone. |

## Open problems

- Search across all sessions does not exist yet. I can browse, not query.
- Uploaded audio files still wait on a transcript. The on-device model could handle them, but I have not wired it up.
- I have not measured how often the local model's notes are wrong in ways the health checks miss.

*The code lives in a private repository. The notes that pass review land in [SakethWiki](#/writing/sakethwiki-system-design).*
`;export{e as default};
