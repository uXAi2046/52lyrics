import React from 'react';
import { Link } from 'react-router-dom';
import { ALBUMS } from '../../data/mockData';

const PopularAlbums = () => {
  // Take first 6 albums
  const displayAlbums = ALBUMS.slice(0, 6);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Popular Albums</h2>
        <Link to="/search?type=albums" className="text-primary-500 hover:text-primary-400 font-semibold text-sm">
          See All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {displayAlbums.map((album) => (
          <Link key={album.id} to={`/albums/${album.id}`} className="group bg-surface rounded-xl p-4 hover:bg-dark-800 transition-colors">
            <div className="aspect-square rounded-lg overflow-hidden mb-4 shadow-lg">
              <img 
                src={album.coverUrl} 
                alt={album.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-white font-bold text-lg mb-1 truncate">{album.title}</h3>
            <p className="text-gray-400 text-sm truncate">{album.artistName} • {album.year}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularAlbums;
