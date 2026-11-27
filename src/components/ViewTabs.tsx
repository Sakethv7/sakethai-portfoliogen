import { Link } from 'react-router-dom';
import type { NoteView, NoteViewId } from '@/data/portfolio';

// Tabs for a note with several views. Each tab is a link to the same page with its own hash, so a view can be bookmarked (ADR-066).
export function ViewTabs({ views, active, basePath }: { views: NoteView[]; active: NoteViewId; basePath: string }) {
  return <nav className="view-tabs" aria-label="Choose a version of this note">
    {views.map((view) => <Link key={view.id} to={{ pathname: basePath, hash: `#${view.id}` }} aria-current={view.id === active ? 'page' : undefined}>{view.label}</Link>)}
  </nav>;
}
