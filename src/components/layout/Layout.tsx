import { Outlet } from 'react-router';
import Footer from './Footer';
import Header from './Header';

export default function Layout() {
  return (
    <div className="site-frame">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
