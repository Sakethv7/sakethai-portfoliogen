import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Heading } from '@/lib/article';

// The list is a sticky side column from 1100 px and wider, and a folded list below that (ADR-043).
const NARROW = '(max-width: 1099px)';

export function ArticleContents({ headings, basePath }: { headings: Heading[]; basePath: string }) {
  const [folded] = useState(() => window.matchMedia(NARROW).matches);
  if (headings.filter((heading) => heading.level === 2).length < 3) return null;
  return <details className="article-contents" open={!folded}>
    <summary>Contents</summary>
    <ol>
      {headings.map((heading) => <li key={heading.id} className={heading.level === 3 ? 'sub' : undefined}>
        <Link to={{ pathname: basePath, search: `?section=${encodeURIComponent(heading.id)}` }}>{heading.text}</Link>
      </li>)}
    </ol>
  </details>;
}
