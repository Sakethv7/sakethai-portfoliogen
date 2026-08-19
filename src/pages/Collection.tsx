import { PortfolioShell } from '@/components/PortfolioShell';
import { publications } from '@/data/portfolio';

const descriptions = {
  writing: ['Writing', 'Engineering essays, build logs, and system-design explanations.'],
  research: ['Research', 'Working questions, reproducible experiments, benchmarks, and papers—with explicit publication status.'],
  notes: ['Notes', 'Short technical observations, paper notes, and ideas that are useful before they become essays.'],
} as const;

export default function Collection({ type }: { type: keyof typeof descriptions }) {
  const [title, description] = descriptions[type];
  const items = publications.filter((item) => type === 'writing' ? item.kind !== 'Research note' : type === 'research' ? item.kind === 'Research note' : false);
  return <PortfolioShell>
    <header className="page-header editorial-section"><p className="eyebrow">Public work</p><h1>{title}</h1><p>{description}</p></header>
    <section className="editorial-section collection-list">{items.length ? items.map((item) => <article key={item.title}>
      <div className="meta-line"><span>{item.kind}</span><span>{item.status}</span></div><h2>{item.title}</h2><p>{item.summary}</p>
    </article>) : <div className="honest-empty"><p className="eyebrow">Nothing published yet</p><h2>This shelf starts empty on purpose.</h2><p>New notes will appear here only when there is a real, dated artifact to read.</p></div>}</section>
  </PortfolioShell>;
}
