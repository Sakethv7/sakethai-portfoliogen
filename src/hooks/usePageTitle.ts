import { useEffect } from 'react';

// The static route files carry the right <title> for a first load. A client-side move to another
// page does not reload, so each page sets its own title (ADR-048). Home keeps the index.html title.
const HOME_TITLE = 'Saketh Velidimalla — AI Evaluation & Data Engineer';

export function usePageTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} | Saketh Velidimalla` : HOME_TITLE;
  }, [page]);
}
