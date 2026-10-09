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

## Design docs

`architecture.md`, `adr.md`, `logic_flow.md`, and `api.md` live at the repo root. Update them in place. Do not create copies.
