import { commitsAsOf, commitsIncludePrivate, commitsPerMonth } from '@/data/commits';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const W = 480, H = 130, BAR = 28, GAP = 12, TOP = 18, BASE = 100;

// Small bar chart of commits per month. The numbers are a snapshot from scripts/update-commits.sh, not a live feed.
export function CommitChart() {
  const max = Math.max(...commitsPerMonth.map(([, n]) => n), 1);
  const total = commitsPerMonth.reduce((sum, [, n]) => sum + n, 0);
  const last = commitsPerMonth.length - 1;
  const label = `Commits per month, last 12 months: ${commitsPerMonth.map(([k, n]) => `${MONTHS[Number(k.slice(5)) - 1]} ${n}`).join(', ')}.`;
  return <figure className="commit-chart">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {commitsPerMonth.map(([key, n], i) => {
        const h = Math.max(2, Math.round((n / max) * (BASE - TOP)));
        const x = i * (BAR + GAP) + GAP / 2;
        return <g key={key}>
          <rect x={x} y={BASE - h} width={BAR} height={h} rx={3} className={i === last ? 'bar bar-partial' : 'bar'} />
          <text x={x + BAR / 2} y={BASE - h - 5} textAnchor="middle" className="bar-value">{n}</text>
          <text x={x + BAR / 2} y={BASE + 16} textAnchor="middle" className="bar-label">{MONTHS[Number(key.slice(5)) - 1]}</text>
        </g>;
      })}
    </svg>
    <figcaption>Commits per month, {commitsIncludePrivate ? 'public and private' : 'public'} repositories, last 12 months ({total} in total, as of {commitsAsOf}). The latest month is partial. Commits are not deployments.</figcaption>
  </figure>;
}
