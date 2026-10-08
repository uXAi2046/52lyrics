import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__grid">
        <div>
          <Link to="/" className="wordmark" aria-label="52lyrics home">
            <span className="wordmark__number">52</span>
            <span className="wordmark__name">lyrics</span>
          </Link>
          <p>A rights-aware place to read, trace, and rediscover songs.</p>
        </div>
        <div className="site-footer__links">
          <span className="eyebrow">Explore</span>
          <Link to="/discover">Discover</Link>
          <Link to="/guides">Reading guides</Link>
          <Link to="/artists">Artist index</Link>
          <Link to="/saved">Saved library</Link>
        </div>
        <div className="site-footer__links">
          <span className="eyebrow">52lyrics</span>
          <Link to="/about">About</Link>
          <Link to="/copyright">Copyright</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
        <div className="site-footer__note">
          <span className="eyebrow">Catalog note</span>
          <p>Read original, licensed, and public-domain lyrics, with source notes for historical texts.</p>
          <small>© 2026 52lyrics</small>
        </div>
      </div>
    </footer>
  );
}
