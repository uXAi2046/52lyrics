import React from 'react';
import { Link } from 'react-router-dom';
import { ARTISTS } from '../../data/mockData';

const PopularArtists = () => {
  // Take first 6 artists for the showcase
  const displayArtists = ARTISTS.slice(0, 6);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Popular Artists</h2>
        <Link to="/artists" className="text-primary-500 hover:text-primary-400 font-semibold text-sm">
          See All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {displayArtists.map((artist) => (
          <Link key={artist.id} to={`/artists/${artist.id}`} className="group flex flex-col items-center text-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-primary-500 transition-all shadow-lg shadow-black/50">
              <img 
                src={artist.imageUrl} 
                alt={artist.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary-500 transition-colors">{artist.name}</h3>
            <p className="text-gray-400 text-xs">{artist.genres.slice(0, 2).join(', ')}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularArtists;
