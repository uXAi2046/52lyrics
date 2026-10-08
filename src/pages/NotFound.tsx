import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export const meta = () => [{ title: 'Page not found — 52lyrics' }, { name: 'robots', content: 'noindex' }];

export default function NotFound() {
  return <div className="shell page not-found"><span className="not-found__number">404</span><span className="eyebrow">The needle lifted</span><h1>This side is silent.</h1><p>The address does not match a page in the catalog. Search again or return to a curated route.</p><div><Link to="/search">Search the catalog <ArrowRight aria-hidden="true" /></Link><Link to="/discover">Open Discover</Link></div></div>;
}
