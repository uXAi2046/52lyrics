import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, Heart, MapPin } from 'lucide-react';
import { Artist } from '../../types';

interface ArtistHeaderProps {
  artist: Artist;
}

const ArtistHeader = ({ artist }: ArtistHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-dark-800 to-dark-900 rounded-3xl p-8 mb-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        {/* Artist Image */}
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl">
          <img 
            src={artist.imageUrl} 
            alt={artist.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{artist.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <MusicIcon className="w-4 h-4" />
                  <span>{artist.genres.join(', ')}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                <span>Active: {artist.activeYears}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{artist.location}</span>
                </div>
              </div>
            </div>
            
            <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-full font-semibold transition-colors shadow-lg shadow-primary-500/25">
              <Heart className="w-4 h-4 fill-white" />
              <span>Follow</span>
            </button>
          </div>

          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            {artist.biography}
          </p>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 transition-colors">
              <Globe className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MusicIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

export default ArtistHeader;
