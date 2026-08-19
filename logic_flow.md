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

1. Present precedes past roles; overlapping HP and ASU dates are preserved rather than forced into a false non-overlap.
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
