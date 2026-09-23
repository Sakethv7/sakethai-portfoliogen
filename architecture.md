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
├── Production AI / enterprise RAG case study
├── SakethWiki case study
├── FactoryMind case study
└── Other project summaries

Experience
├── Animated chronological neural path
├── J&J (current)
├── HP
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

> **Proposed amendment (2026-09-22).** The bullets above remain the baseline. The section *Visual upgrade: composition over spectacle* below proposes adding a bento-composed homepage fold, a type and spacing token system, and a small CSS-only motion layer. It does not bring back any of the removed effects. See ADR-015 to ADR-020.

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
- The main timeline and home strip mirror the résumé: J&J, HP, and ECrent, reconciled against the approved resume. iDwTeam and the ASU graduate-assistant role carry `linkedinOnly: true` and appear only in the compact "Full history" list at the bottom of the Experience page, which links out to LinkedIn.
- Resume PDF opens directly, downloads with a meaningful filename, and contains working LinkedIn, GitHub, and portfolio links.
- The email address is readable as text without clicking anything, and the copy control reports success.
- A production build is served from a subpath and checked for favicon load, social card metadata, and not-found navigation.

## Visual upgrade: composition over spectacle

**Status:** Proposed, awaiting review. Nothing in this section is implemented.

### Complexity tier

The tier is a **single-process static tool**: a client-rendered Vite SPA served as files from GitHub Pages. The upgrade does not change it. It adds no server, no CMS, no runtime data fetch, and no animation library. A "stunning" portfolio does not need a higher tier. If anything the upgrade shrinks the system, because it removes about 45% of the shipped JavaScript and 65% of the shipped CSS (measured below).

### The diagnosis

The current site is readable and honest. It isn't memorable, for three structural reasons that polish alone won't fix.

**The first viewport shows no evidence.** At a 1024×768 viewport, the fold contains a name, a sentence, and four links. The strongest facts on the site are an enterprise RAG system serving about 140,000 users, a current role at J&J, and three flagship systems. All of them sit at least one scroll down. A recruiter's first impression is a claim, not proof.

**Every section has the same rhythm.** Each homepage block repeats one pattern: eyebrow, large serif `h2`, a list of rows separated by `border-top`. Repetition makes a page calm, but it also means nothing tells the eye what matters most. Visual hierarchy means varying size, position, and density so importance is readable before any text is read. At the moment it comes almost entirely from font size.

**The type and spacing scales are ad hoc.** `index.css` uses more than 30 distinct `font-size` values and more than 20 distinct spacing values (18, 22, 24, 25, 28, 30, 36, 38, 42, 45, 54, 60, 64, 68, 70, 80, 86, 90, 92, 110, 120 px). A *modular scale* picks one ratio and derives every size from it. With one, sizes relate to each other, and the page reads as designed rather than assembled. The largest current jump is from `h2` (3.8rem) straight to `h3` (1.45rem), a 2.6× gap with nothing in between. Meanwhile, activity text sits at 0.7–0.8rem, about 12px, which is below comfortable reading size.

### The proposal in one sentence

Recompose the homepage fold as a **bento grid** that puts identity and evidence in the same first viewport. Put **design tokens** under every size and gap. Add **one signature interaction** (a cursor-following spotlight on tiles) plus restrained entrance motion. All of it in CSS.

A *bento grid* is a layout of unequal rectangular tiles on a shared grid, named after the Japanese lunch box. Its value is not the trend. Tile *size* becomes a hierarchy signal: the most important item gets the largest cell, so importance is visible before anyone reads.

### Homepage structure after the change

The content budget from *Homepage content budget* is unchanged. The bento does not add content. It merges three existing blocks (hero, experience preview, selected work) into one composed grid. Publications, activity, and contact stay below it as editorial sections.

```text
Desktop ≥ 1024px — 4 columns, 6 rows of --tile-row

┌───────────────────────────────────────┬─────────────────┐
│ IDENTITY                     (3 × 2)  │ NOW      (1×1)  │
│ eyebrow · h1 · thesis · CTAs          │ ● J&J · Data    │
│                                       │   Scientist     │
│                                       ├─────────────────┤
│                                       │ METRIC   (1×1)  │
│                                       │ ~140k users     │
├───────────────────────┬───────────────┼─────────────────┤
│ FLAGSHIP: ENT. RAG (2×2)│ SakethWiki    │ RoastRank       │
│ summary · tags ·      │ (1×1)         │ (1×1)           │
│ "private case study"  ├───────────────┴─────────────────┤
│                       │ THESIS  (2×1)                   │
│                       │ Stack to silicon …              │
├───────────────────────┴───────────────┬─────────────────┤
│ EXPERIENCE STRIP  (3 × 1)             │ RÉSUMÉ  (1×1)   │
│ J&J → HP → ECrent  · chronology →     │ download · copy │
└───────────────────────────────────────┴─────────────────┘

Tablet 640–1023px — 2 columns; identity spans 2, flagship spans 2.
Mobile < 640px   — 1 column; DOM order = reading order.
```

*Size encodes importance: identity and the flagship get the biggest cells, and the one real metric gets its own tile so it is seen at a glance.*

The DOM order is identity, now, metric, enterprise-RAG flagship, SakethWiki, RoastRank, thesis, experience strip, résumé. That order also works as the single-column mobile order and the screen-reader order. `grid-template-areas` moves tiles visually without changing it. This matters because CSS Grid can place items anywhere, and if visual order drifts from DOM order, keyboard and screen-reader users navigate a different page than sighted users see.

### Component changes

```text
PortfolioShell (unchanged role)
└── Index
    ├── BentoHero            NEW   composes the tiles below
    │   ├── BentoTile        NEW   one presentational wrapper, 5 variants
    │   └── (content pulled from data/, never hardcoded)
    ├── PublicationsSection  (existing markup, moved out of Index)
    ├── ActivitySection      (existing markup)
    └── ContactSection       (unchanged)

src/data/site.ts             NEW   resume URL, GitHub, LinkedIn, email — one place
src/hooks/useSpotlight.ts    NEW   ~15 lines; writes pointer position to CSS vars
src/styles/tokens.css        NEW   type, space, radius, motion tokens
src/index.css                     rewritten onto tokens; same class names where kept
```

There are two new components and one hook. `BentoTile` is a real reuse boundary, since there are nine tiles. `BentoHero` exists because the grid's area names and responsive rules belong together. No other abstraction is proposed.

### Motion layer

Motion should mean something. Here there are three kinds, each with a reason.

| Motion | Trigger | Why it exists | Mechanism |
|---|---|---|---|
| Hero stagger | first paint | Guides the eye in reading order: name, thesis, action | CSS `@keyframes`, `--i` index var, 60 ms steps |
| Scroll reveal | section enters viewport | Marks section boundaries as you read | CSS `animation-timeline: view()` inside `@supports` |
| Tile spotlight | pointer over a tile | The signature: the tile "lights up" where attention is | 1 pointer handler → `--mx/--my` → `radial-gradient` |
| Link arrow nudge | hover / focus | Affordance: "this goes somewhere" | `transform: translateX(3px)` |
| Live dot | always, on NOW tile | Signals "current" without the word | `opacity` + `scale` on a pseudo-element |

Every animated property is `transform` or `opacity`. The browser can run these on the *compositor*, the GPU-side thread that moves existing layers without repainting pixels. Animating `box-shadow`, `width`, or `background-position` forces a repaint on every frame. The current `neural-pulse` keyframe animates `box-shadow` forever on five nodes, so it gets rewritten to animate `opacity` on a pre-rendered glow layer instead.

All motion is progressive enhancement, per ADR-010. Under `prefers-reduced-motion: reduce`, or in a browser without scroll-driven animations, every element renders in its final state.

### Performance and clean-code findings (measured 2026-09-22)

| Finding | Evidence | Fix | Effect |
|---|---|---|---|
| Unused providers in entry bundle | `QueryClientProvider`, `TooltipProvider`, two toasters, zero consumers | Remove from `App.tsx` | Entry JS **107.3 → 61.8 kB gz** (measured) |
| Tailwind scans 62 dead modules; live pages use zero utilities | `grep` of live classNames finds no utility classes | Delete dead modules, or narrow `content` globs | CSS **14.0 → 4.8 kB gz** (measured) |
| JetBrains Mono downloaded, never used | CSS uses `ui-monospace` in all 5 mono rules | Drop it from the font URL | One fewer font request |
| Display face is Georgia (system fallback) | `h1, h2 { font-family: Georgia … }` | One variable display serif (see open questions) | Distinctive type |
| Resume URL string built in 4 files, 7 times; social URLs in 3 files | `grep BASE_URL` | `src/data/site.ts` | One edit point |
| `scrollIntoView({behavior:'smooth'})` in hero ignores reduced motion | `Index.tsx:20`; the explicit option overrides the CSS | Respect the media query | Accessibility bug |
| Infinite `box-shadow` animation ×5 | `neural-pulse` | Opacity on pseudo-element | No per-frame repaint |
| `ArrowDown` rendered then always `display:none` | `Experience.tsx:30`, `.timeline-arrow` | Delete | Dead DOM |
| Experience card moves 5px on hover | `.experience-card:hover { transform: translateX(5px) }` | Border and glow only | Text doesn't jump while it's being read |
| No `:focus-visible` style | none in `index.css` | Token-colored outline | Keyboard polish |
| Conflicting `.site-nav` gap/overflow overrides | 3 rules across 2 media queries | Consolidate | Clarity |
| Dead Tailwind theme tokens | `cyber`, `neon`, `gradient-*` reference vars that don't exist; 9 unused keyframes | Remove | Clarity |
| `lovable-tagger` dev plugin | `vite.config.ts` | Remove if Lovable is no longer used | One fewer dev dependency |

### Performance budget (new invariant)

| Asset | Budget (gzip) | Current | After |
|---|---|---|---|
| Entry JS | ≤ 65 kB | 107.3 kB | ~62 kB + ~0.5 kB hook |
| CSS | ≤ 8 kB | 14.0 kB | ~4.8 kB + new rules |
| Web fonts | ≤ 2 families | 2 (1 unused) | 2 (both used) |
| Infinite paint-triggering animations | 0 | 5 | 0 |

## Long-form pages: first case study and first post (shipped 2026-09-23)

### Why this exists

The homepage's first flagship card, Enterprise AI quality systems, is the strongest evidence on the site and the only one that leads nowhere. It says "case study forthcoming". The Writing tab is hidden (ADR-022) because nothing is published. Both problems have the same fix: a way to publish one long page of prose. This section adds the smallest version of the "Phase 2: Detail system" that was planned but never built.

### Complexity tier

**Single-process static tool, unchanged.** The site stays a client-rendered Vite SPA on GitHub Pages. Two routes and two Markdown files are added. There is no server, CMS, database, or build-time content pipeline. A higher tier would buy scheduled publishing or per-article server rendering, and neither is needed for two pages.

### What gets added

A **detail route** is a URL pattern with a variable part, such as `/#/writing/:slug`. The `:slug` is a short, URL-safe name for one item, like `retrieval-vs-generation-failures`. The page reads the slug from the URL, finds the matching record, and renders it.

| Piece | Where | What it does |
|---|---|---|
| `/#/work/:slug` | `App.tsx`, new `Article` page | Case study for a Work item that has one. Only `enterprise-ai-quality` does at first. |
| `/#/writing/:slug` | same `Article` page | One published post. |
| Markdown bodies | `src/content/<slug>.md` | The prose itself, one file per page. |
| Metadata | `portfolio.ts` | Title, date, summary, and which Markdown file to load. |
| Renderer | `marked`, inside the lazy `Article` chunk | Turns Markdown into HTML. See ADR-023. |

### Data flow

```text
visitor opens /#/writing/retrieval-vs-generation-failures
      │
      ▼
Article page (lazy chunk: page code + marked)
      │  reads :slug from the URL
      ▼
portfolio.ts record ──► no match or status ≠ Published ──► NotFound
      │ match
      ▼
import.meta.glob('src/content/*.md', ?raw)  ──►  marked(markdown)  ──►  rendered article
```

*Caption: the URL picks a record, the record picks a Markdown file, and the file is converted to HTML in the browser. Nothing is fetched from a server except the page's own JavaScript chunk.*

`import.meta.glob` is a Vite feature that finds files matching a pattern at build time and turns each one into a separate chunk. So each article's text downloads only when someone opens that article, and the homepage bundle does not grow.

### What changes on existing pages

- The Enterprise AI card swaps "Private / case study forthcoming" for a "Read the case study" link.
- **Writing returns to the nav only when at least one post has status Published.** The nav reads this from the data, so it can't show an empty tab again (ADR-022 stays true automatically).
- The home "Writing & research" block stays hidden. One post doesn't fill it. Revisit at three.
- Article pages reset scroll to the top on open. HashRouter keeps the previous page's scroll position, so without this a cross-link from the bottom of one article opens the next one mid-page. The reset is instant, because the site sets `scroll-behavior: smooth` and a smooth reset would animate on every navigation.
- The case study shipped without an outcomes section (Saketh's call, 2026-09-23). Add one when shareable results are confirmed.

### Confidentiality boundary for the case study

The case study describes employer work, so it gets a written boundary instead of case-by-case judgment. It may say: the problem, the approach, the architecture in generic terms (LLM-as-judge, regression tests, trace-linked failure analysis), public tool names already on the résumé (AWS Bedrock, Databricks, Power BI, Arize Phoenix, ServiceNow), and the ~140,000-user scale already on the résumé. It may not say: the internal system name, team or org names, internal metric names, screenshots, real queries, or any number that isn't already on the published résumé unless Saketh confirms it is shareable.

### Where posts live and how they travel

The portfolio is the **canonical** copy, meaning the one original that other copies point back to. A LinkedIn post then links to it (ADR-024). Medium or dev.to cross-posts are optional later and should state the canonical URL.



These are recorded rather than resolved, because resolving them is a larger task than the current change.

**Does "visually stunning" override ADR-005?** ADR-005 chose "less immediately flashy … more distinctive and readable." The upgrade is written to respect that: every added effect is composition, type, or motion under 400 ms, and nothing decorative runs in the reading path. If the goal is instead the heavier style (WebGL hero, particle fields, scroll-jacked storytelling), that is a different ADR and a different performance budget. That call is yours.

**Display typeface.** The recommendation is *Newsreader* (variable, optical-size axis, Google Fonts), replacing Georgia for `h1`/`h2`. Alternatives are *Fraunces* (more personality, warmer) or keeping Georgia (no download, least distinctive). This is a taste decision.

**Should the flagship tile be the enterprise RAG work?** It is the strongest evidence, but it is private work with no public link. The tile can only say "case study forthcoming". SakethWiki is public and linkable, but a weaker signal. The current proposal leads with the enterprise RAG work, unnamed (the internal system name is never published), and keeps the private label.

**Dead-module deletion was deferred to an "explicitly requested pass".** This upgrade needs it: narrowing Tailwind's globs is the alternative, but it leaves 62 unreachable files in the repo. Approving this design counts as that request unless you say otherwise.

**Docs location.** The global convention is `docs/`. These four files live at the repo root. They are updated in place here rather than moved, to avoid a parallel copy. Moving them is a one-line decision.

**Route transitions are deferred.** The View Transitions API would cross-fade between routes. React Router only wires it into *data routers* (`createHashRouter`), and this app uses the `<HashRouter>` component. Migrating is a separate, small change with its own ADR.

**The delivery phases in this document describe a system that was only partly built.** Phase 2 promised individual detail routes; `App.tsx` registers six routes and no `:slug` route exists. Phase 3's publishing templates and validation script do not exist. The document is aspirational in places where it reads as descriptive, and a reader cannot currently tell which is which.

**`api.md`'s type definitions do not match the shipped content registry.** `src/data/portfolio.ts` defines a flatter `WorkItem` with a different category vocabulary, a `PublicationItem` with three literal kinds and three statuses, and an `ActivityItem` without categories or IDs. The documented types are the richer intended design; the code is the simpler thing that was actually built. Neither is wrong, but only one of them is true today. The route table in that file is corrected as part of this change; the type contracts are not, because reconciling them means deciding whether to grow the code or shrink the docs.

**The component architecture tree names components that no longer exist** (`SharedShell`, `CompactHero`, `SelectedWork`, `DetailPage`, and the four separate content registry files). The shipped structure is `PortfolioShell` plus page-level composition, with all content in a single `portfolio.ts`.

**Sixty-two modules are unreachable from the entry point.** Thirteen pre-redesign components (`Hero`, `Navigation`, `About`, `Projects`, `Skills`, `Certifications`, `Contact`, `Footer`, `ParticleBackground`, `ProductionWork`, `SystemDesign`, `CurrentFocus`, and the old `Experience`), `App.css`, `use-mobile.tsx`, and forty-five unused shadcn primitives. They still fall inside the Tailwind content globs, so they inflate the generated stylesheet. Deletion is deferred to a separate, explicitly requested pass.

**Three unused providers are mounted in `App.tsx`** — `QueryClientProvider` with no queries, plus `Toaster`, `Sonner`, and `TooltipProvider` with no consumers. Deferred to the same pass.

**Per-article link previews won't work under HashRouter (new, 2026-09-22).** When LinkedIn builds a preview card it fetches the URL without running JavaScript and without the part after `#`. Every article link therefore previews as the homepage's title and image. Fixing it needs either real paths (`BrowserRouter` plus a GitHub Pages 404 redirect trick) or pre-rendered HTML per article. Both are larger changes. For now the LinkedIn post text has to carry the pitch itself.

**Scroll position carries across all other routes too (new, 2026-09-23).** Only article pages reset scroll. Going from the bottom of Work to Experience, for example, still lands mid-page. A single app-level reset on route change would fix every page. It was left out of this change to keep it scoped.

**Case study outcomes are unconfirmed (new, 2026-09-22).** The résumé states scope (~140,000 users, thousands of queries evaluated daily) but no before/after results. The draft marks every place an outcome would go with `[CONFIRM]`. A case study without outcomes is still worth publishing, but it is weaker. Saketh decides what is shareable.
