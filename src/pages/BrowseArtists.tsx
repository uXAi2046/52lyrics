import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCw, Music } from 'lucide-react';
import AlphaPagination from '../components/common/AlphaPagination';
import ArtistListCard from '../components/artists/ArtistListCard';
import { ARTISTS } from '../data/mockData';
import { Artist } from '../types';

const BrowseArtists = () => {
  const [searchParams] = useSearchParams();
  const filterChar = searchParams.get('filter') || 'All';
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and Group Artists
  const groupedArtists = useMemo(() => {
    let filtered = ARTISTS;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by char
    if (filterChar !== 'All') {
      if (filterChar === 'num') {
        filtered = filtered.filter(a => /^\d/.test(a.name));
      } else {
        filtered = filtered.filter(a => a.name.toUpperCase().startsWith(filterChar));
      }
    }

    // Group by first letter
    const groups: Record<string, Artist[]> = {};
    filtered.forEach(artist => {
      const firstChar = artist.name.charAt(0).toUpperCase();
      const groupKey = /^[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(artist);
    });

    // Sort keys
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, Artist[]>);
  }, [filterChar, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Browse Artists</h1>
          <p className="text-gray-400">Find your favorite artists alphabetically or use the search bar.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for an artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface text-white pl-10 pr-4 py-3 rounded-xl border border-gray-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-gray-500 transition-all"
          />
        </div>
      </div>

      {/* Filter */}
      <div className="mb-10 overflow-x-auto no-scrollbar">
        <AlphaPagination activeChar={filterChar} />
      </div>

      {/* Content */}
      <div className="space-y-12">
        {Object.keys(groupedArtists).length > 0 ? (
          Object.entries(groupedArtists).map(([letter, artists]) => (
            <div key={letter}>
              <h2 className="text-2xl font-bold text-primary-500 mb-6">{letter}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {artists.map(artist => (
                  <ArtistListCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-gray-800 rounded-3xl bg-surface/50">
            <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No artists found starting with '{filterChar}'</h3>
            <p className="text-gray-400">Try searching for a specific artist above.</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {Object.keys(groupedArtists).length > 0 && (
        <div className="mt-12 flex justify-center">
          <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-primary-500 text-white hover:bg-primary-500/10 transition-colors font-semibold">
            <RotateCw className="w-4 h-4" />
            <span>Load More Artists</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseArtists;
