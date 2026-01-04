import React from 'react';
import { useParams, Link } from 'react-router-dom';
import AlbumTrackList from '../components/albums/AlbumTrackList';
import { ALBUMS } from '../data/mockData';

const AlbumDetails = () => {
  const { albumId } = useParams();
  const album = ALBUMS.find(a => a.id === albumId);

  if (!album) {
    return <div className="text-white text-center py-20">Album not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to="/artists" className="hover:text-white transition-colors">Artists</Link>
        <span>/</span>
        <Link to={`/artists/${album.artistId}`} className="hover:text-white transition-colors">{album.artistName}</Link>
        <span>/</span>
        <span className="text-white">{album.title}</span>
      </nav>

      <AlbumTrackList album={album} />
    </div>
  );
};

export default AlbumDetails;
