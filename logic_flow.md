# Portfolio Logic Flow

## Visitor flow

```text
Visitor arrives
    │
    ├── understands role and thesis
    │
    ├── chooses strongest evidence
    │      ├── production system
    │      ├── independent system
    │      └── industrial / compute direction
    │
    ├── checks recent public output
    │      ├── writing
    │      ├── research
    │      └── notes
    │
    ├── scans experience preview
    │      ├── opens complete chronology
    │      └── downloads recruiter resume
    └── reaches the contact section
           ├── reads the address
           ├── copies the address
           ├── opens a mail client
           └── opens GitHub or LinkedIn
```

## Contact flow

The controlling property is that no step depends on the one before it. A visitor who reads the section and does nothing else still leaves with the address.

```text
Contact section renders
        │
        ├── address is on screen as text ──────────── terminal success
        │
        ├── visitor clicks the address
        │        └── mailto: handed to the OS
        │                 ├── handler registered ──> compose window
        │                 └── no handler ─────────> nothing happens,
        │                                            address still on screen
        │
        └── visitor clicks copy
                 ├── clipboard write resolves ─────> confirm for ~2s, then reset
                 └── clipboard write rejects ─────> report the failure,
                                                     address still on screen
```

*The `mailto:` and the clipboard are both allowed to fail. The visible address is what makes that acceptable.*

Rules:

1. The address is never hidden behind a click, a hover, or an obfuscation scheme.
2. The copy control reports its result. A silent copy is indistinguishable from a failed one.
3. Copy confirmation is transient state that resets on a timer; leaving a component unmounted mid-timer must not warn.
4. The clipboard write can reject — denied permission, insecure context — and that rejection is surfaced, not swallowed.
5. The section is reachable by keyboard in reading order, and the copy control is a real button with an accessible name.

## Not-found flow

```text
Unknown hash route
        │
        ├── log the attempted path
        ├── render inside PortfolioShell
        │        └── site navigation stays available
        └── offer router navigation home
                 └── never a raw href="/", which
                     leaves the project subpath
```

Rules:

1. The page inherits the site's dark palette. A light-background page inside a dark site reads as a crash, not as a 404.
2. Recovery uses `Link`, so it resolves under the deployed base path.
3. The shell stays rendered, so a visitor who lands here from a stale link can reach any section without going back.

## Homepage selection logic

1. Load all content from the local registries.
2. Select work records with `featured: true`.
3. Enforce a maximum of three featured work records.
4. Combine public writing, research, and notes.
5. Sort by `publishedAt` descending and show the latest three.
6. Sort activity records by `date` descending and show the latest five.
7. Render an honest empty state when no research artifact exists; do not manufacture placeholders that look published.

## Detail-page flow

1. Read the route collection and slug.
2. Find the matching typed record.
3. Render title, type, date, status, summary, and evidence links.
4. Render the long-form body or case study.
5. Show related artifacts sharing tags or project identifiers.
6. Return a real not-found page when no record matches.

## Experience flow

```text
Open Experience
      │
      ├── load validated records
      ├── sort by start date descending
      ├── render semantic role cards
      └── connect cards as a neural path
                │
                ├── motion allowed → signal activates nodes in order
                └── reduced motion → static connected nodes

Recruiter may then
      ├── open/download resume
      ├── open LinkedIn
      └── inspect selected work evidence
```

Rules:

1. Present precedes past roles.
2. Employment type is visible so contract, full-time, and part-time work are not conflated.
3. The animation never hides content or controls reading order.
4. No internship is published until its title, organization, dates, and source evidence are supplied or found in an approved artifact.

## Publishing flow

```text
Create artifact
    │
    ├── classify it honestly
    │      ├── note
    │      ├── writing
    │      ├── research / reproduction
    │      └── paper
    │
    ├── add metadata record
    ├── add body / evidence links
    ├── validate required fields and unique slug
    ├── preview desktop and mobile
    └── publish site
```

## Activity ingestion flow

### Initial manual flow

1. Finish a meaningful public artifact or milestone.
2. Add an activity record with a date, category, plain-language change, and evidence URL.
3. Validate that the event is not merely a commit-count signal.
4. Publish it in chronological order.

### Possible later GitHub-assisted flow

1. Fetch releases or explicitly labeled repository events at build time.
2. Normalize them into draft activity records.
3. Require human selection and copy editing.
4. Publish only approved records.

## Content replacement rule

When adding something to the homepage:

1. Identify which existing item it replaces or deepens.
2. If it is not stronger or more current, keep it on its collection/detail page.
3. Never expand the homepage simply because another credential or project exists.

## Visual upgrade flows (proposed 2026-09-22)

### Bento layout resolution

Layout is decided entirely by CSS at each breakpoint. No JavaScript measures anything, so there is no layout shift after hydration.

```text
Viewport width
      │
      ├── ≥ 1024px ──> 4-col grid, named areas place tiles (see architecture.md)
      ├── 640–1023px ─> 2-col grid, identity + flagship span both columns
      └── < 640px ───> 1-col flow, tiles in DOM order
                             │
                             └── DOM order == reading order == tab order
                                 (identity → now → metric → flagship → wiki
                                  → roastrank → thesis → experience → résumé)
```

*Visual placement changes by breakpoint; reading order never does.*

Rules:

1. No tile is hidden at any breakpoint. If something doesn't fit on mobile, it wasn't needed on desktop either.
2. Tile row height is a token (`--tile-row`), not content-driven, on desktop only. Below 1024px, rows size to content, so long copy never clips.
3. Tile content comes from `src/data/*`. A tile whose record is missing renders nothing. It never shows a placeholder.

### Motion lifecycle

```text
Page load
   │
   ├── prefers-reduced-motion: reduce ?
   │        └── yes ──> all elements render in final state; stop
   │
   ├── Hero stagger (CSS only, runs once)
   │        eyebrow (0ms) → h1 (60) → thesis (120) → CTAs (180) → tiles (240 + 40·i)
   │        each: opacity 0→1, translateY 12px→0, 480ms, ease-out
   │
   ├── Scroll reveal (below-fold sections)
   │        @supports (animation-timeline: view()) ?
   │           ├── yes ──> fade/rise tied to scroll position, entry 0%–cover 25%
   │           └── no ───> visible immediately (no JS fallback, by design)
   │
   └── Pointer enters bento grid  [@media (hover: hover) only]
            │
            ├── pointermove (delegated, one listener on grid)
            │      └── find closest [data-tile] → set --mx, --my on it
            ├── CSS paints radial-gradient at (--mx, --my) on ::before
            └── pointerleave ──> ::before opacity → 0 (200ms)
```

*Every branch ends with all content visible. Motion only decides how it arrives.*

Rules:

1. No content starts invisible without a guaranteed path to visible. The hero stagger uses `animation-fill-mode: both` with a finite duration. Scroll reveal exists only inside `@supports`, so unsupported browsers never see the hidden starting state.
2. Only `opacity` and `transform` animate, except the spotlight gradient (see ADR-019).
3. No animation loops forever except the NOW tile's live dot, which animates only `opacity`/`transform`.
4. Programmatic scrolling (the hero's Contact link) reads `prefers-reduced-motion` and uses `behavior: 'auto'` when set. This fixes the current bug, where `'smooth'` is hardcoded.
5. Hover effects never move text. Borders, glows, and icons may move; paragraphs may not.

### Focus flow

```text
Keyboard user presses Tab
      │
      └── :focus-visible element
             ├── 2px outline, --accent color, 3px offset
             └── if inside a bento tile ──> tile gets :focus-within border state
                                             (same visual as hover, minus spotlight)
```

Rule: every hover affordance has a focus equivalent, except the pointer-positional spotlight, which has no keyboard meaning.

### Upgrade delivery sequence

```text
Phase 0  cleanup      remove providers, dead modules, unused font  → verify: budget table, all routes render
Phase 1  tokens       tokens.css, index.css onto tokens            → verify: visual diff per route, no overflow at 375/768/1280
Phase 2  bento        site.ts, BentoTile, BentoHero, Index         → verify: DOM order, tab order, 3 breakpoints, a11y tree
Phase 3  motion       stagger, reveal, spotlight, focus, fixes     → verify: reduced-motion emulation, Performance panel shows no paint loops
```

Each phase is one commit, reviewable and revertible on its own.
