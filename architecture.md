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

## Contact surface

The redesign dropped the contact section without replacing it. The homepage currently ends on the activity ledger, and the only contact affordances are a hero link labelled `Contact` and a footer mail icon, both pointing at a bare `mailto:`.

A `mailto:` URL is a handoff to whatever the operating system has registered as the default mail client. On a machine where mail is read in a browser tab and no handler is registered — the common case on a work laptop — clicking it produces no visible effect at all. The link is not broken in any way a build or a link checker would detect; it simply hands off to nothing. That failure is silent, and it fails on the single action the site exists to produce.

The fix is to stop depending on the handoff. The address becomes readable text on the page, so the worst case is that a visitor reads it and types it somewhere else. The `mailto:` stays as a convenience for people whose machines do handle it, and a copy control covers everyone in between.

```text
Recruiter finishes reading
          │
          ▼
   Contact section
          │
          ├── reads sakethv7@gmail.com as visible text ── always works
          ├── clicks the address ──> mailto: ─────────── works if a handler exists
          ├── clicks copy ────────> clipboard ────────── works without a mail client
          ├── opens LinkedIn / GitHub
          └── downloads the résumé
```

*Every path out of the contact section works on its own; none of them is the only way through.*

Placement is the closing section of the homepage, after the activity ledger. This restores the `Contact / resume` node the information architecture above already claims, and it keeps the homepage a single readable narrative that ends on an action rather than sending the reader to a separate route for one line of text.

The section is new markup in the editorial style, not a revival of `src/components/Contact.tsx`. That component belongs to the pre-redesign visual system — glass panels, gradient buttons, scale-on-hover cards — which the redesign deliberately removed from the main reading path.

## Deployment-path-sensitive assets

The site deploys to a GitHub Pages *project* page, so it is served from `/sakethai-portfoliogen/` rather than from the domain root. Any absolute path written as `/something` therefore resolves to the wrong place in production while working perfectly in local development, where the base is `/`. This class of bug is invisible until deploy.

Three assets currently have it or are missing entirely:

- **Favicon.** `index.html` declares no icon link, so the browser falls back to its default probe of `/favicon.ico` at the domain root — not the project path. `public/favicon.ico` is deployed and never requested. Needs an explicit base-path-aware `<link rel="icon">`.
- **Social card image.** `twitter:card` is set to `summary_large_image` with no `og:image` to fill it, so every share of the site renders an empty card. For a portfolio whose main distribution channel is a pasted link, this is the highest-leverage asset on the page.
- **Not-found navigation.** `NotFound.tsx` links home with a raw `href="/"`, which leaves the site entirely on a project page. It must use router navigation instead.

The general rule: every URL that points at this site is either a router link or is composed from `import.meta.env.BASE_URL`. No raw absolute paths.

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
- The email address is readable as text without clicking anything, and the copy control reports success.
- A production build is served from a subpath and checked for favicon load, social card metadata, and not-found navigation.

## Open questions and code/doc drift

These are recorded rather than resolved, because resolving them is a larger task than the current change.

**The delivery phases in this document describe a system that was only partly built.** Phase 2 promised individual detail routes; `App.tsx` registers six routes and no `:slug` route exists. Phase 3's publishing templates and validation script do not exist. The document is aspirational in places where it reads as descriptive, and a reader cannot currently tell which is which.

**`api.md`'s type definitions do not match the shipped content registry.** `src/data/portfolio.ts` defines a flatter `WorkItem` with a different category vocabulary, a `PublicationItem` with three literal kinds and three statuses, and an `ActivityItem` without categories or IDs. The documented types are the richer intended design; the code is the simpler thing that was actually built. Neither is wrong, but only one of them is true today. The route table in that file is corrected as part of this change; the type contracts are not, because reconciling them means deciding whether to grow the code or shrink the docs.

**The component architecture tree names components that no longer exist** (`SharedShell`, `CompactHero`, `SelectedWork`, `DetailPage`, and the four separate content registry files). The shipped structure is `PortfolioShell` plus page-level composition, with all content in a single `portfolio.ts`.

**Sixty-two modules are unreachable from the entry point.** Thirteen pre-redesign components (`Hero`, `Navigation`, `About`, `Projects`, `Skills`, `Certifications`, `Contact`, `Footer`, `ParticleBackground`, `ProductionWork`, `SystemDesign`, `CurrentFocus`, and the old `Experience`), `App.css`, `use-mobile.tsx`, and forty-five unused shadcn primitives. They still fall inside the Tailwind content globs, so they inflate the generated stylesheet. Deletion is deferred to a separate, explicitly requested pass.

**Three unused providers are mounted in `App.tsx`** — `QueryClientProvider` with no queries, plus `Toaster`, `Sonner`, and `TooltipProvider` with no consumers. Deferred to the same pass.
