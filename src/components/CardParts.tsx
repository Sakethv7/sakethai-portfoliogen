import type { WorkItem } from '@/data/portfolio';

// Card parts shared by the home and Work pages (ADR-056, ADR-059, ADR-060).

export function Thumb({ diagram }: { diagram: NonNullable<WorkItem['diagram']> }) {
  return <img className="card-diagram" src={`${import.meta.env.BASE_URL}${diagram.src}`} alt={diagram.alt} width={diagram.width} height={diagram.height} loading="lazy" />;
}

// Tools, services and methods named in the note or repository (ADR-059).
export function StackRow({ stack }: { stack?: string[] }) {
  if (!stack?.length) return null;
  return <ul className="stack-row" aria-label="Tools and methods">{stack.map((name) => <li key={name}>{name}</li>)}</ul>;
}
