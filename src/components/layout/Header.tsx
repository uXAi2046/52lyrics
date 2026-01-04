import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, Search } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-white' : 'text-gray-400 hover:text-white';
  };

  return (
    <header className="bg-transparent py-6">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary-500 rounded-lg p-1.5 group-hover:bg-primary-600 transition-colors">
            <Music className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-white">52lyrics</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search for songs, artists, or albums..."
              className="w-full bg-surface text-white pl-10 pr-4 py-2.5 rounded-lg border border-transparent focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-gray-500 transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/artists" className={isActive('/artists')}>Browse Artists</Link>
          <Link to="/top-charts" className={isActive('/top-charts')}>Top Charts</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
