I record a lot of talks, calls, and study sessions. For a long time the recordings turned into transcripts, and the transcripts turned into nothing. A transcript is a record of what was said, not what I learned from it. Nobody rereads an hour of text.

[Lekhni](https://github.com/Sakethv7/lekhni-app) (लेखनी, "pen") is the local app I built to close that gap. It takes a recording, a transcript, or pasted notes and turns them into structured notes. Then it hands the parts worth keeping to my knowledge base, [SakethWiki](#/writing/review-gated-knowledge-system). Everything runs on my Mac.

This is a build log: what the pieces are, and the decisions that kept it small.

## Don't rebuild the hard part

Recording on macOS is the hardest part of this whole problem. You need microphone and system audio, permissions, and on-device transcription. [Quill](https://github.com/digimata/quill), an MIT-licensed open-source recorder, already does all of that and writes each session to a folder.

So Lekhni has two halves. Capture is Quill's job. Lekhni's job starts once a session folder exists: turning it into notes, tracking quality, and deciding what's worth keeping. A future native recorder could replace Quill, but only once Quill actually gets in the way. Rebuilding working audio capture first would have been months of solved problems.

## One session contract for every input

Recordings, pasted notes, and uploaded audio all end up in the same shape: a folder with a transcript or notes file and some metadata. The folders are the source of truth. A SQLite database mirrors them for browsing, stats, and traces, and it can be rebuilt from the folders at any time.

Keeping one shape made the rest simple. The notes generator, the health checks, and the UI never need to know where a session came from.

Some inputs aren't ready yet, and Lekhni says so. An uploaded audio file stays pending until a transcript exists. It doesn't pretend to have notes it can't produce.

## Route by intent, not by format

My first notes were meeting-shaped: summary, decisions, action items. That's the right shape for a standup and the wrong one for a system design talk or a paper walkthrough.

So each note has a type, and each type has its own structure:

- **System design:** requirements, architecture, bottlenecks, trade-offs
- **Paper or research:** problem, method, results, limitations
- **Debugging session:** symptoms, hypotheses, experiments, fix
- **AI engineering:** retrieval, agents, evals, serving, observability
- **Meeting:** decisions, action items, open questions

A YouTube video is technically a "talk", but what I want from it might be system design notes. The type follows what I'm trying to learn, not the file format.

Long recordings get one more safeguard. An hour-long transcript is split into overlapping chunks before the final notes are written, so the result doesn't depend on a single giant call to a small local model.

## Traces, not vibes

Every generation logs the backend, model, prompt version, input size, raw output, and latency. Every edit I make in the UI logs a diff. When a prompt change makes notes worse, I can see exactly which change did it.

On top of that sits a small eval set: synthetic transcripts with known decisions, action items, and open questions, and a check that each one shows up in the notes. There's also a 30-second smoke test that runs one real session end to end.

What Lekhni doesn't do is fix itself. The traces and evals are evidence for me to act on. Nothing rewrites a prompt without my decision.

## Check every session

Each session gets a health report built from simple checks. Is there a transcript? Were notes generated? Is there a trace for that generation? Did the notes find decisions, action items, and open questions, or flag uncertainty?

These checks are deterministic on purpose. When a session looks wrong, I want a specific reason like "transcript missing", not a model's opinion.

## Hand off only what lasts

Most notes stay session notes, and that's fine. But a technical note often contains a pattern worth keeping, like how a system handles backpressure or why a design chose one trade-off over another.

Technical notes include a **Reusable Patterns** section. When the health report says a note has durable signal, I can send those patterns to SakethWiki. Each one lands in SakethWiki's review queue, where I approve or reject it like any other capture. If the same pattern shows up in a later session, it adds to the existing page instead of starting a new one.

## What's next

- Transcribing uploaded audio files directly, so they don't wait on a separate step
- Search across all sessions, not just browsing them
- A native shell that makes capture, notes, and memory feel like one app

*Code and design notes: [github.com/Sakethv7/lekhni-app](https://github.com/Sakethv7/lekhni-app).*
