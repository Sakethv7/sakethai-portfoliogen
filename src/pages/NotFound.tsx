import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { PortfolioShell } from '@/components/PortfolioShell';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return <PortfolioShell>
    <section className="page-header editorial-section not-found">
      <p className="eyebrow">404</p>
      <h1>This page does not exist</h1>
      <p>The link may be out of date, or the page may not have been built yet. Everything published is reachable from the navigation above.</p>
      <div className="hero-links">
        <Link className="primary-link" to="/">Back to the homepage <ArrowRight /></Link>
        <Link to="/work">Browse the work archive <ArrowRight /></Link>
      </div>
    </section>
  </PortfolioShell>;
};

export default NotFound;
