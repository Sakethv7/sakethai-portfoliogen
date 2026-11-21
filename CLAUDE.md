# CLAUDE.md — sakethai-portfoliogen

Project rules. They override the global file where they conflict.

## Copy rules (added 2026-10-05)

The first reader of this site is a recruiter or hiring manager who skims. Many are not engineers. Every public sentence must work for that reader first. Engineers get the detail one step lower.

1. **Plain sentence first.** Each work item, note, and case study has a `plain` sentence. It has 25 words or fewer. It names the problem or the result. It uses no term a non-engineer would not know.
2. **No stacked keywords.** Do not list technologies in the plain sentence. Tools and tags go in the "For engineers" part.
3. **One real outcome per featured item, or none.** A number or result may appear only if it is on the published résumé or Saketh confirmed it. Never invent one.
4. **No em-dash chains, no arrow chains, no marketing adjectives.** Use short sentences.
5. **Confidentiality.** Never name the internal assistant (JAIDA), teams, or internal metrics. Say "an enterprise assistant" or "a production assistant I evaluate".

The technical summary and the article bodies keep their depth. Do not shorten them to fit these rules.

**Override (2026-10-09, Saketh):** do not flatten the work into "AI assistant" language. It undersells what he does: engineering the evaluation, tracing, failure triage, data pipelines and KPIs around production AI systems. Keep sentences short, but use the precise terms (RAG, retrieval, ranking, evaluation, observability, pipelines, KPIs). Where rule 1 and this conflict, this wins. Rule 5 still applies.

Industrial machines and edge compute stay off the hero, the meta description, and the link preview (decided 2026-10-05). They can appear inside the agentic-maintenance case study.

## Writing rules for notes (added 2026-11-21, Saketh)

Every note must read clearly to a non-engineer in its first paragraph. Engineers get the detail below it. Saketh flagged the old notes as declarative and slop-like. These rules stop that.

1. **Say what happened, not a slogan.** No aphorisms such as "Without them, quality is a feeling" or "X is not Y, it is Z". State the fact, the number or the step.
2. **Titles describe the note.** A title says what was tested or built. No slogan titles such as "Traces nobody opens are not observability".
3. **Introduce every person and company once.** At first mention, say who they are in a few words: "Hamel Husain, a machine learning engineer who teaches AI evaluation". Do not cite a bare surname.
4. **Gloss each technical term at first use** in plain words, in the same sentence or the next. Keep the precise term (the 2026-10-09 override still holds).
5. **Open with the situation.** The first paragraph says what problem came up, what I did and what I found, in everyday words.
6. **Label my opinion as mine.** "I think" or "In my setup" for judgment. No universal claims ("Most teams…", "Nobody…") without a source.
7. **Banned filler:** "That is the problem X solves", "the real question", "here is the thing", "crucially", "it turns out", rule-of-three lists used for rhythm, and stacked contrasts ("not A, not B, but C").
8. **Keep every fact, number, hedge, source and limit.** Shorter is good only while it stays exact.

## Design docs

`architecture.md`, `adr.md`, `logic_flow.md`, and `api.md` live at the repo root. Update them in place. Do not create copies.
