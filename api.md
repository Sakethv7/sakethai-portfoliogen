# Portfolio Content Contracts

These are local application contracts, not network APIs.

## Core types

> **Drift warning.** The types in this section describe the intended content model, not the shipped one. `src/data/portfolio.ts` implements a flatter `WorkItem` (string-literal categories, no `role`/`period`/`outcomes`/`evidence`), a three-kind `PublicationItem` without slugs or tags, and an `ActivityItem` without `id` or `category`. Reconciling the two means deciding whether to grow the code or shrink the contract, which is out of scope for the contact change. Read the code as authoritative until then.

```ts
type PublicationKind =
  | 'writing'
  | 'note'
  | 'research'
  | 'reproduction'
  | 'paper';

type PublicationStatus =
  | 'draft'
  | 'published'
  | 'submitted'
  | 'under-review'
  | 'accepted';

interface EvidenceLink {
  label: string;
  url: string;
  kind: 'github' | 'demo' | 'paper' | 'dataset' | 'slides' | 'external';
}

interface WorkItem {
  slug: string;
  title: string;
  category: 'production-ai' | 'ai-systems' | 'industrial-ai' | 'data-systems';
  summary: string;
  role: string;
  period: string;
  featured: boolean;
  tags: string[];
  outcomes: string[];
  evidence: EvidenceLink[];
  confidentialityNote?: string;
}

interface PublicationItem {
  slug: string;
  title: string;
  kind: PublicationKind;
  status: PublicationStatus;
  summary: string;
  publishedAt?: string; // ISO YYYY-MM-DD
  updatedAt?: string;   // ISO YYYY-MM-DD
  projectSlug?: string;
  tags: string[];
  evidence: EvidenceLink[];
}

interface ActivityItem {
  id: string;
  date: string; // ISO YYYY-MM-DD
  category: 'release' | 'writing' | 'research' | 'experiment' | 'milestone';
  title: string;
  summary: string;
  url?: string;
  projectSlug?: string;
}

type EmploymentType = 'full-time' | 'contract' | 'part-time' | 'internship';

interface ExperienceItem {
  id: string;
  company: string;
  title: string;
  employmentType: EmploymentType;
  location: string;
  workMode?: 'on-site' | 'hybrid' | 'remote';
  startDate: string; // ISO YYYY-MM
  endDate?: string;  // ISO YYYY-MM; absent means Present
  current?: boolean;
  summary: string;
  highlights: string[];
  skills?: string[];
  source: 'linkedin-screenshot' | 'approved-resume' | 'both';
}

interface ResumeAsset {
  label: 'Download resume';
  href: string;
  filename: string;
  updatedAt: string; // ISO YYYY-MM-DD
}
```

## Route contracts

Routes registered in `src/App.tsx` today:

```text
/#/                         Homepage
/#/work                     Work collection
/#/experience               Complete professional chronology
/#/writing                  Writing and build logs
/#/research                 Research collection
/#/notes                    Notes collection
/#/*                        Not found
```

Detail routes (`/#/work/:slug`, `/#/writing/:slug`, `/#/research/:slug`, `/#/notes/:slug`) were previously listed here as though they existed. They do not. Any link written against them resolves to the not-found route. They remain the intended Phase 2 design and will be restored to this table when they are actually registered.

The homepage contact section is a scroll target within `/#/`, not a route. See ADR-012.

### Not-found contract

- Renders inside `PortfolioShell`, inheriting the site palette and navigation.
- Recovery link uses `react-router` `Link`, never a raw `href`, so it resolves under the deployed base path.
- Logs the attempted pathname once per navigation.

## Contact contract

```ts
interface ContactChannel {
  label: string;
  value: string;              // shown verbatim as page text
  href: string;               // mailto:, https:, or base-composed asset path
  copyable?: boolean;         // renders a clipboard control beside the value
}
```

Required behavior:

- `value` is rendered as readable text for every channel. It is never replaced by an icon, hidden behind an interaction, or obfuscated.
- The email channel sets `copyable`. Its copy control writes `value` — not `href` — to the clipboard.
- A resolved clipboard write shows a transient confirmation that reverts after roughly two seconds. The pending timer is cleared on unmount.
- A rejected clipboard write surfaces the failure. It is never swallowed, because a silent failure is indistinguishable from success.
- `mailto:` and clipboard are both permitted to fail without degrading the section: the visible `value` is the guaranteed path.
- External `href` values are HTTPS and carry `rel="noreferrer"` with `target="_blank"`.
- The résumé `href` is composed from `import.meta.env.BASE_URL`.

## Document asset contracts

Static metadata in `index.html`, all of which must survive being served from a subpath:

```text
link rel="icon"     base-path-composed, resolves to public/favicon.ico
og:image            absolute deployed URL to the social card
og:url              absolute deployed URL to the site root
twitter:card        summary_large_image, valid only while og:image exists
```

Required behavior:

- No URL pointing back at this site is written as a raw absolute path. It is either router-managed or composed from the Vite base.
- `twitter:card` may declare `summary_large_image` only while a reachable `og:image` exists; otherwise shares render an empty card.
- `og:url` is hardcoded to the deployed origin and must be edited if the deployment target changes.

## Homepage query contracts

```ts
getFeaturedWork(limit = 3): WorkItem[]
getRecentPublications(limit = 3): PublicationItem[]
getRecentActivity(limit = 5): ActivityItem[]
getRelatedPublications(slug: string, limit = 3): PublicationItem[]
getExperience(): ExperienceItem[]
getResumeAsset(): ResumeAsset
```

Required behavior:

- Results are deterministic.
- Date-sorted queries use descending ISO dates.
- Draft publications never appear in public recent-publication results.
- Featured work is capped at three on the homepage.
- Unknown slugs return the not-found route.
- Experience records sort by `startDate` descending and use stable IDs.
- The initial verified sequence is J&J, iDwTeam, HP, ASU Graduate Assistant, and ECrent. Date overlap is valid and preserved.

## Content validation rules

- Every slug and activity ID is unique.
- Every public artifact has a title, summary, date, and honest type/status.
- `accepted` requires a public venue or evidence link.
- `submitted` and `under-review` must never be styled as accepted.
- Employer-confidential work cannot link to private material or disclose restricted implementation details.
- External URLs use HTTPS except local development URLs.
- Activity events describe an outcome, not a number of commits.
- Every experience record requires title, organization, employment type, start/end dates, location, and source provenance.
- Internship records require the same evidence and are not inferred from education or project work.
- Resume href resolves under the deployed Vite base path and the asset is a readable PDF.

## Future optional build input

If GitHub-assisted activity is added, its adapter may accept:

```ts
interface GitHubReleaseInput {
  repository: string;
  tag: string;
  name: string;
  publishedAt: string;
  url: string;
  description?: string;
}
```

The adapter output remains a draft `ActivityItem`; it must not bypass review and publish directly.
