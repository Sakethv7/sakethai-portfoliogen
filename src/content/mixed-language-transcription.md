# Meetings that mix English and Indian languages: what I read about transcribing them

*Research note · 2026-10-28 · what I read, not what I built*

> **In one paragraph.** Many of the meetings I record mix English with Hindi or Telugu, sometimes in the same sentence. My notes app, Lekhni, transcribes on the Mac with NVIDIA's Parakeet, and the version it uses is English-only. So a mixed-language meeting gets a poor transcript before any language model sees it, and changing the notes model cannot fix that. This note collects what I read about the options: Parakeet's newer multilingual version, and Sarvam's Saaras models, which have a mode for code-mixed speech. I have not run a pilot yet. Everything below comes from the vendors' own pages, and my own reading is labelled.

## The problem is the first step, not the last

Lekhni works in two stages. A speech model turns audio into text. Then a language model, `qwen3:8b` on the same Mac, turns that text into notes. My [local model notes](#/writing/choosing-local-qwen-models) are all about the second stage.

For a meeting that switches between English and Hindi, the second stage is not the problem. If the transcript writes Hindi words as wrong English words, the notes model summarizes the wrong words. A better notes model cannot recover what the speech model never heard.

## What Lekhni uses today

I checked Lekhni's code. Its batch transcription loads Parakeet TDT 0.6B **v2**. The [model card](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2) describes it as built for English transcription, and the license is CC-BY-4.0.

NVIDIA's newer [Parakeet TDT 0.6B v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3) extends that to 25 European languages, such as French, German, Spanish, Polish and Ukrainian. No Indian language is on its list. So moving to v3 helps a meeting in Spanish. It does not help a meeting in Hindi or Telugu.

## What Sarvam offers

Sarvam is an Indian company that builds speech and language models for Indian languages. Its speech-to-text models are called Saaras. From [Sarvam's speech-to-text overview](https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/speech-to-text/overview) and the [Saaras model page](https://docs.sarvam.ai/api-reference-docs/getting-started/models/saaras):

| Item | What the docs say |
|---|---|
| Models | Saaras v4 is the default. Saaras v3 is still available. `saaras:v3-realtime` streams |
| Languages | Saaras v3 lists 23: 22 Indian languages plus English, including Hindi (`hi-IN`) and Telugu (`te-IN`). The language can be detected automatically |
| Output modes | `transcribe` (the language spoken), `translate` (to English), `verbatim` (word for word, with fillers), `translit` (Latin script), `codemix` (code-mixed text) |
| Short audio | The direct REST call takes files under 30 seconds |
| Long audio | The Batch API takes files up to 2 hours, 20 files per job, with speaker labels for up to 20 speakers |

Two modes matter for my meetings:

- **`codemix`** keeps the mix as spoken. A sentence that is half Hindi and half English stays that way. That is the most faithful record.
- **`translate`** gives English text. That would let Lekhni's existing English prompts work unchanged, at the cost of losing the original wording.

## My reading: how Lekhni could route between them

This part is my own thinking, not something I have built or measured.

1. **Keep Parakeet as the default.** It runs on the Mac, it costs nothing, and audio never leaves the machine.
2. **Send a recording to Sarvam only when I mark it as mixed-language.** An automatic switch sounds better, but Parakeet's English-only transcript of a Hindi sentence still looks like English text. So the switch cannot depend on that transcript. A per-recording choice, or a language check on the audio itself, is the realistic trigger.
3. **Use the Batch API for whole meetings.** The 30-second limit on the direct call rules it out for a one-hour recording. The batch path also labels speakers, which Lekhni needs for "who said what".
4. **Respect the privacy line.** Sarvam is a cloud service. A recording sent there leaves the Mac. For work meetings, that is allowed only where the work's privacy rules permit it. So this route stays opt-in, one recording at a time.

## What this note does not claim

- I have not measured Sarvam's accuracy on my recordings. The pilot comes next: one real mixed-language meeting, transcribed by both Parakeet and Sarvam, compared line by line.
- I have not measured the time or the cost of the Batch API for an hour of audio.
- I have not checked whether Lekhni's live transcription, which uses a separate streaming Parakeet model, has any multilingual option.

## Sources

- NVIDIA, [Parakeet TDT 0.6B v2 model card](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2)
- NVIDIA, [Parakeet TDT 0.6B v3 model card](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
- Sarvam, [Speech-to-text overview](https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/speech-to-text/overview)
- Sarvam, [Saaras model page](https://docs.sarvam.ai/api-reference-docs/getting-started/models/saaras)

*Related: [Choosing local Qwen models: memory, context and JSON](#/writing/choosing-local-qwen-models) · [Lekhni: system design of a local-first notes app](#/writing/lekhni-system-design)*
