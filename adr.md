# Architecture Decision Record

## ADR-001: Curated index instead of single-page resume

**Status:** Accepted

**Decision:** Make the homepage a small editorial index and move depth into routed detail pages.

**Why:** The current page demonstrates breadth but forces every audience through the same long sequence. Separate pages allow recruiters to scan and technical readers to inspect evidence.

**Trade-off:** More routes and content maintenance, but clearer hierarchy and stronger shareable URLs.

## ADR-002: Meaningful activity ledger instead of contribution heatmap

**Status:** Accepted

**Decision:** Display dated public outputs and milestones. Do not display raw commit totals or a cloned GitHub heatmap in the first release.

**Why:** Commit frequency measures repository activity, not research or engineering value. A curated ledger can explain what changed and link to the artifact.

**Trade-off:** Updates are initially manual. This is intentional: editorial judgment is part of the signal.

## ADR-003: Local typed content as source of truth

**Status:** Accepted

**Decision:** Store work, publications, and activity as typed TypeScript records in the repository.

**Why:** The site is currently a static Vite application. Local typed content preserves simple deployment, version history, and compile-time validation without introducing a CMS or database.

**Trade-off:** Publishing requires a code change. A CMS can be reconsidered after publishing frequency proves the need.

## ADR-004: Honest publication taxonomy

**Status:** Accepted

**Decision:** Separate `writing`, `note`, `research`, `reproduction`, and `paper`, and attach explicit statuses such as `draft`, `published`, `submitted`, `under-review`, or `accepted`.

**Why:** A technical note is useful evidence but must not be presented as peer-reviewed research.

**Trade-off:** More metadata and stricter wording, with materially higher credibility.

## ADR-005: Evolve, do not clone, the reference design

**Status:** Accepted

**Decision:** Borrow the reference site's calm navigation and public-work hierarchy without reproducing its visual identity.

**Why:** Saketh's strongest differentiation is production AI systems moving toward industrial machines and compute. The design should express that specific story.

**Trade-off:** Less immediately flashy than the current hero, but more distinctive and readable.

## ADR-006: Build-time or manual GitHub integration only

**Status:** Accepted

**Decision:** Do not call GitHub APIs from the browser for the initial version. Public GitHub releases may later be ingested during the build and converted into reviewed activity records.

**Why:** Client-side API calls add loading states, rate-limit failure, and uncurated noise.

**Trade-off:** No automatic real-time activity initially.

## ADR-007: Hash routing remains for the first redesign

**Status:** Accepted

**Decision:** Keep the existing `HashRouter` during the first implementation unless the deployment target is changed and configured for SPA rewrites.

**Why:** This minimizes deployment risk while enabling detail pages.

**Trade-off:** URLs contain `#`. Clean URLs can be a later deployment decision.

## ADR-008: Full experience chronology gets its own route

**Status:** Accepted

**Decision:** Add `/#/experience` for the complete reverse-chronological work history. The homepage contains only a compact preview and a resume action.

**Why:** Recruiters need the chronology, but placing every bullet on the homepage would recreate the long-resume problem the redesign is solving.

**Trade-off:** One additional click for complete detail, in exchange for a much faster homepage scan.

## ADR-009: LinkedIn establishes chronology; the approved resume establishes technical emphasis

**Status:** Accepted

**Decision:** Use the supplied LinkedIn screenshots for company, title, employment type, dates, location, and ordering. Use the approved resume for the tighter J&J, HP, and ECrent achievement bullets. Use supplied LinkedIn text for iDwTeam and ASU until stronger approved resume evidence exists.

**Why:** LinkedIn is the complete employment ledger, while the resume contains stronger recruiter-facing technical framing. Combining them prevents both missing roles and bloated copy.

**Trade-off:** The site intentionally does not reproduce every LinkedIn bullet verbatim.

## ADR-010: Neural animation is progressive enhancement

**Status:** Accepted

**Decision:** Represent the chronology as connected neural nodes with a subtle signal animation, ordered newest to oldest. Content remains ordinary semantic HTML and fully visible without JavaScript animation.

**Why:** The visual metaphor supports the AI-systems identity while chronology—not spectacle—remains the primary information.

**Trade-off:** Requires careful mobile and reduced-motion testing.

## ADR-011: Resume is a first-class recruiter action

**Status:** Accepted

**Decision:** Keep one canonical PDF in `public/`, label the action `Download resume`, and expose it from the hero, Experience route, and footer.

**Why:** Recruiters should not need to search the site or copy experience manually.

**Trade-off:** The checked-in PDF must be refreshed whenever the approved resume baseline changes.

## ADR-012: Contact returns as the homepage's closing section, not a route

**Status:** Proposed

**Decision:** Add a contact section as the final block of the homepage, after the activity ledger. Do not add a `/#/contact` route, and do not add `Contact` to the primary navigation.

**Why:** ADR-001 made the homepage a curated index that a recruiter reads top to bottom in about thirty seconds. A narrative that ends on a list of recent activity ends on an observation; ending it on a contact block ends it on an action, at exactly the point where a convinced reader is looking for one. A dedicated route would put a click between that moment and the address, and would spend one of six navigation slots on a section containing four links — slots currently held by Work, Experience, Writing, Research, and Notes, all of which hold substantially more.

The information architecture in `architecture.md` has listed `Contact / resume` as the last homepage node since before the redesign. This restores what was already specified rather than introducing a new idea.

**Trade-off:** There is no shareable contact URL, and the section is reachable only by scrolling the homepage or by using the footer's icons. If the site later grows a "work with me" or availability page with real content, that becomes a route and this ADR gets superseded.

## ADR-013: The email address is page text; `mailto:` is an enhancement on top of it

**Status:** Proposed

**Decision:** Render `sakethv7@gmail.com` as visible text. Wrap it in a `mailto:` link and add a copy-to-clipboard control beside it. Never rely on the `mailto:` alone to communicate the address.

**Why:** A `mailto:` link is a request that the operating system open a registered mail handler. When none is registered — a browser-only mail setup, a locked-down corporate machine — the click does nothing and reports nothing. No error, no navigation, no console output. This is the current bug: the site's single most important action fails silently and undetectably, and it fails for exactly the audience most likely to be on a managed laptop.

Making the address readable text removes the dependency. The worst outcome becomes a visitor reading eleven characters and typing them elsewhere, which always works. The `mailto:` still serves everyone whose machine handles it, and the copy button serves the middle case where a visitor wants the address in a different tool.

The clipboard write itself uses the async Clipboard API, which requires a secure context and can be denied. That failure must be visible — the address stays on screen regardless, so a denied copy degrades to the always-works path rather than to nothing.

**Trade-off:** A plaintext address on a public page is harvestable by scrapers, so this accepts some spam risk in exchange for the contact path actually working. Obfuscation schemes that defeat scrapers also defeat screen readers and copy-paste, which costs more than the spam does. The section also gains a small amount of client state and an interaction to test, where a plain link had none.

## ADR-014: Every URL pointing at this site is router-aware or base-path-composed

**Status:** Proposed

**Decision:** Replace the not-found page's raw `href="/"` with router navigation, add a base-path-composed favicon link, and add `og:image` and `og:url` built from the deployed origin. Prohibit raw absolute paths that point back at this site.

**Why:** The site is served from `/sakethai-portfoliogen/`, not from the domain root. A path written as `/` or `/favicon.ico` resolves correctly in local development, where the Vite base is `/`, and incorrectly in production, where it escapes to the domain root. The bug class is invisible to the build, to TypeScript, and to local testing — it appears only after deploy, which is where it is most expensive to notice.

Three instances exist today. The not-found page's home link leaves the site. The missing favicon link causes the browser to probe the domain root and get nothing, so the deployed `public/favicon.ico` is never requested. And `twitter:card` is declared as `summary_large_image` with no image to display, so every shared link renders an empty card — the portfolio's primary distribution channel is a pasted URL, which makes this the most visible of the three.

The not-found page is also restyled into `PortfolioShell`. It currently ships Tailwind's `bg-gray-100` against a near-white `--foreground`, which renders its `404` heading invisible against its own background.

**Trade-off:** `og:image` requires producing and maintaining a social card image, which is a design asset that did not previously exist and that goes stale when the positioning copy changes. `og:url` must be hardcoded to the deployed origin because static HTML cannot compose it at request time, so it needs a manual edit if the site ever moves to a custom domain.
