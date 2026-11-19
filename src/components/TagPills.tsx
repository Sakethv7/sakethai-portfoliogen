import { Link } from 'react-router-dom';
import { writingHref } from '@/lib/writingHref';

// A tag pill links to the Writing list filtered by that tag (ADR-049). The active pill links back to the list without the tag.
export function TagPills({ tags, kind = '', active = '', className = '' }: { tags: string[]; kind?: string; active?: string; className?: string }) {
  return <ul className={`tag-row ${className}`.trim()} aria-label="Topics">
    {tags.map((tag) => <li key={tag}><Link to={writingHref(kind, tag === active ? '' : tag)} aria-current={tag === active ? 'true' : undefined}>{tag}</Link></li>)}
  </ul>;
}
