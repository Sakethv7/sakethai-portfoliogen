# Portfolio Architecture

## Objective

Turn the portfolio from a long visual resume into a professional public-work system for three audiences:

1. Recruiters and hiring managers evaluating Applied AI Systems Engineer fit.
2. Engineers and researchers evaluating technical depth and reproducibility.
3. Future collaborators following FactoryMind, industrial AI, edge inference, and compute work.

The homepage will be a curated index. Detail pages will hold evidence.

## Information architecture

```text
Home
├── Positioning and current thesis
├── Selected work (3 items)
├── Experience preview and resume CTA
├── Recent publications (3 items)
├── Meaningful activity (5 events)
└── Contact / resume

Work
├── Production AI / JAIDA case study
├── SakethWiki case study
├── FactoryMind case study
└── Other project summaries

Experience
├── Animated chronological neural path
├── J&J (current)
├── iDwTeam
├── HP
├── ASU Graduate Assistant (part-time)
├── ECrent
└── Downloadable recruiter resume

Writing
├── Engineering essays
├── Build logs
└── Paper notes

Research
├── Working papers
├── Reproductions
├── Benchmarks / datasets
└── Research interests and collaboration status

Notes
└── Short, dated, lower-formality technical observations
```

## Component architecture

```text
App / routing
├── SharedShell
│   ├── Navigation
│   └── Footer
├── HomePage
│   ├── CompactHero
│   ├── SelectedWork
│   ├── RecentPublications
│   ├── ActivityLedger
│   └── ExperiencePreview
├── ExperiencePage
│   ├── NeuralTimeline
│   ├── ExperienceNode[]
│   └── ResumeCallToAction
├── CollectionPage
│   └── ContentCard[]
└── DetailPage
    ├── MetadataHeader
    ├── EvidenceLinks
    └── ProseContent

Typed content registry
├── work.ts
├── publications.ts
├── experience.ts
└── activity.ts
```

## Data flow

```text
Curated local content
        │
        ├── selected flag ──> Homepage
        ├── type/status ────> Collection filters
        ├── slug ───────────> Detail route
        └── evidence URLs ──> GitHub, demo, paper, dataset

Optional GitHub source
        │
        └── reviewed releases / milestones only
                    │
                    └── activity registry
```

No GitHub API or live contribution calendar is required for the first release. This avoids rate limits, fragile client-side fetching, misleading commit counts, and exposing low-signal activity. The content registry remains the source of truth.

## Visual system

- Retain a dark technical identity, purple/cyan as restrained accents, and the existing type scale where useful.
- Remove the full-screen particle network, floating badges, typing cursor, excessive glass treatment, and repeated technology chips from the main reading path.
- Use a calm editorial layout: strong typography, wider whitespace, thin borders, compact metadata, and one accent treatment per section.
- Desktop may use a slim persistent navigation rail or conventional top navigation. Mobile uses a compact top bar.
- Project detail pages may contain diagrams; the homepage should not contain full architecture diagrams.
- The Experience page may use a restrained animated neural-path metaphor: experience nodes activate in reverse chronological order and the connecting signal travels downward. It must remain readable with animation disabled.
- Respect `prefers-reduced-motion`; the timeline becomes a static connected path without loss of content or navigation.

## Homepage content budget

- Hero: name, role, one-sentence thesis, four primary links.
- Selected work: exactly three entries.
- Recent publications: exactly three entries across writing/research/notes.
- Activity ledger: latest five meaningful events.
- No skills wall, certification catalogue, or full resume chronology on the homepage. Show a compact Experience preview that links to the complete chronology.
- A recruiter-visible resume action appears in the hero, Experience preview/page, and footer and opens or downloads the current approved PDF.

## Activity ledger semantics

An activity item must represent a public artifact or material milestone:

- released a project version;
- published a technical article or research note;
- opened a reproducible experiment or dataset;
- submitted, accepted, or revised a paper;
- shipped a documented system capability.

Ordinary commits, streaks, dependency updates, formatting changes, and private employer work are excluded. Each displayed event must link to evidence when public evidence exists.

## Delivery phases

### Phase 1: Professional homepage

Replace the current long homepage with the compact hierarchy and curated content. Reuse existing truthful material; do not invent research outputs.

### Phase 2: Detail system

Add Work, Writing, Research, Notes, and individual detail routes using typed local content.

### Phase 3: Publishing workflow

Add templates and a lightweight validation script so a new artifact can be published by adding one content record and its associated page content.

### Phase 4: Optional automation

Consider GitHub release ingestion or a build-time feed only after the manual ledger contains enough genuine activity to justify automation.

## Verification

- TypeScript build and lint.
- Desktop and mobile rendered inspection through HTTP.
- Every navigation item and evidence link checked.
- No unverifiable research, production, or performance claim introduced.
- Homepage scan test: identity, strongest work, recent output, and contact path understandable within 30 seconds.
- Experience order, role titles, employment type, dates, and locations reconciled against the supplied LinkedIn screenshots.
- J&J, HP, and ECrent descriptions reconciled against the approved resume; iDwTeam and ASU copy remains bounded to supplied LinkedIn evidence.
- Resume PDF opens directly, downloads with a meaningful filename, and contains working LinkedIn, GitHub, and portfolio links.
