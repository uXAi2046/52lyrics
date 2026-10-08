import type { ReactNode } from 'react';
import { Link } from 'react-router';

export default function StaticPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <div className="shell page legal-page">
      <header className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></header>
      <article>{children}</article>
      <p className="legal-page__contact">Questions about this page? <Link to="/about">Read about 52lyrics</Link>.</p>
    </div>
  );
}
