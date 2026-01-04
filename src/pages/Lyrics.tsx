import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SongInfo from '../components/lyrics/SongInfo';
import LyricsDisplay from '../components/lyrics/LyricsDisplay';
import { ALBUMS } from '../data/mockData';

const Lyrics = () => {
  const { songId } = useParams();
  
  // Find song in albums
  let song = null;
  let album = null;
  
  for (const a of ALBUMS) {
    const s = a.tracks.find(t => t.id === songId);
    if (s) {
      song = s;
      album = a;
      break;
    }
  }

  if (!song || !album) {
    return <div className="text-white text-center py-20">Song not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/artists/${song.artistId}`} className="hover:text-white transition-colors">{song.artistName}</Link>
        <span>/</span>
        <Link to={`/albums/${album.id}`} className="hover:text-white transition-colors">{album.title}</Link>
        <span>/</span>
        <span className="text-white">{song.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Panel - Song Info */}
        <div className="lg:col-span-3">
          <div className="sticky top-8">
            <SongInfo song={song} album={album} />
          </div>
        </div>

        {/* Right Panel - Lyrics */}
        <div className="lg:col-span-9">
          <LyricsDisplay song={song} />
        </div>
      </div>
    </div>
  );
};

export default Lyrics;
