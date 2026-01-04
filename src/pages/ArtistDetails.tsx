import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ArtistHeader from '../components/artists/ArtistHeader';
import Discography from '../components/artists/Discography';
import { ARTISTS } from '../data/mockData';

const ArtistDetails = () => {
  const { artistId } = useParams();
  const artist = ARTISTS.find(a => a.id === artistId);

  if (!artist) {
    return <div className="text-white text-center py-20">Artist not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to="/artists" className="hover:text-white transition-colors">Artists</Link>
        <span>/</span>
        <span className="text-white">{artist.name}</span>
      </nav>

      <ArtistHeader artist={artist} />
      
      <Discography albums={artist.albums} />
    </div>
  );
};

export default ArtistDetails;
