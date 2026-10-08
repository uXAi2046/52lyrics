import { useEffect, useState } from 'react';
import { Bookmark, Menu, Search, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router';
import GlobalSearch from '../search/GlobalSearch';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/discover', label: 'Discover' },
  { to: '/artists', label: 'Artists' },
  { to: '/saved', label: 'Saved' },
];

export default function Header() {
  const [mobileSearch, setMobileSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileSearch(false);
    setMobileMenu(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.classList.toggle('overlay-open', mobileSearch);
    return () => document.body.classList.remove('overlay-open');
  }, [mobileSearch]);

  return (
    <>
      <header className="site-header">
        <div className="shell site-header__inner">
          <Link to="/" className="wordmark" aria-label="52lyrics home">
            <span className="wordmark__number">52</span>
            <span className="wordmark__name">lyrics</span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'is-active' : ''}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__search">
            <GlobalSearch />
          </div>

          <div className="site-header__mobile-actions">
            <Link to="/saved" aria-label="Open saved library"><Bookmark aria-hidden="true" /></Link>
            <button type="button" onClick={() => setMobileSearch(true)} aria-label="Open search"><Search aria-hidden="true" /></button>
            <button type="button" onClick={() => setMobileMenu((value) => !value)} aria-expanded={mobileMenu} aria-label="Toggle navigation">
              {mobileMenu ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <nav className="mobile-nav shell" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>
            ))}
          </nav>
        )}
      </header>

      {mobileSearch && (
        <div className="mobile-search-overlay" role="dialog" aria-modal="true" aria-label="Search 52lyrics">
          <div className="mobile-search-overlay__top">
            <span className="eyebrow">Find your next line</span>
            <button type="button" onClick={() => setMobileSearch(false)} aria-label="Close search"><X aria-hidden="true" /></button>
          </div>
          <GlobalSearch autoFocus variant="mobile" onNavigate={() => setMobileSearch(false)} />
          <p>Search the catalog by song, artist, album, theme, or mood.</p>
        </div>
      )}
    </>
  );
}
