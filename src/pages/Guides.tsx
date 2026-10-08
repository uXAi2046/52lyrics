import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { GUIDES, guidePath } from '../data/guides';

export const meta = () => [
  { title: 'Music reading guides — 52lyrics' },
  { name: 'description', content: 'Follow a song to a sourced release, understand lyric availability, and read historical texts with their source editions and rights evidence.' },
];

export default function Guides() {
  return <div className="shell page guide-index">
    <header className="page-intro page-intro--wide">
      <span className="eyebrow">Listen with context</span>
      <h1>There is more<br /><em>behind the song.</em></h1>
      <p>Follow a recording to its release, choose a text you can read in full, and inspect the source edition behind historical and author-published lyrics.</p>
    </header>
    <div className="guide-grid">
      {GUIDES.map((guide) => <Link className="guide-card" to={guidePath(guide.slug)} key={guide.slug}>
        <span className="eyebrow">{guide.eyebrow}</span>
        <h2>{guide.title}</h2>
        <p>{guide.description}</p>
        <span className="guide-card__action">Read the guide <ArrowRight aria-hidden="true" /></span>
      </Link>)}
    </div>
  </div>;
}
