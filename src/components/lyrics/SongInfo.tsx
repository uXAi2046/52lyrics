import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, Music } from 'lucide-react';
import { Song, Album } from '../../types';

interface SongInfoProps {
  song: Song;
  album: Album;
}

const SongInfo = ({ song, album }: SongInfoProps) => {
  return (
    <div className="flex flex-col gap-8">
      {/* Album Cover */}
      <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
        <img 
          src={album.coverUrl} 
          alt={album.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Song Details */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{song.title}</h1>
        <Link to={`/artists/${song.artistId}`} className="text-xl text-primary-500 hover:text-primary-400 font-bold block mb-4">
          {song.artistName}
        </Link>
        <div className="text-sm text-gray-400 mb-4">
          <Link to={`/albums/${album.id}`} className="hover:text-white transition-colors">Album: {album.title}</Link>
          <span className="mx-2">•</span>
          <span>{album.year}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {song.genres?.map(genre => (
            <span key={genre} className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-surface px-3 py-1 rounded-md">
              {genre}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="flex-1 bg-surface hover:bg-dark-700 text-gray-400 hover:text-white py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 group border border-transparent hover:border-gray-700">
            <Heart className="w-5 h-5 group-hover:text-red-500 transition-colors" />
            <span className="font-medium">Favorite</span>
          </button>
          <button className="flex-1 bg-surface hover:bg-dark-700 text-gray-400 hover:text-white py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 group border border-transparent hover:border-gray-700">
            <Share2 className="w-5 h-5 group-hover:text-primary-500 transition-colors" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* More from Album */}
      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">More from {album.title}</h3>
        <div className="flex flex-col gap-3">
          {album.tracks.filter(t => t.id !== song.id).slice(0, 3).map(track => (
            <Link key={track.id} to={`/lyrics/${track.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors group">
              <div className="w-10 h-10 rounded bg-dark-800 flex items-center justify-center text-gray-600 group-hover:text-white">
                <Music className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate group-hover:text-primary-500 transition-colors">{track.title}</h4>
                <p className="text-gray-500 text-xs">{track.duration}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SongInfo;
