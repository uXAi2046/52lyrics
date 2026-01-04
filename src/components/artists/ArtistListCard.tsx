import React from 'react';
import { Link } from 'react-router-dom';
import { Artist } from '../../types';

interface ArtistListCardProps {
  artist: Artist;
}

const ArtistListCard = ({ artist }: ArtistListCardProps) => {
  return (
    <Link 
      to={`/artists/${artist.id}`}
      className="flex items-center gap-4 bg-surface p-4 rounded-xl hover:bg-dark-800 transition-colors border border-transparent hover:border-dark-700"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-dark-900">
        <img 
          src={artist.imageUrl} 
          alt={artist.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h3 className="text-white font-bold">{artist.name}</h3>
        <p className="text-gray-400 text-xs">{artist.songCount} Songs</p>
      </div>
    </Link>
  );
};

export default ArtistListCard;
