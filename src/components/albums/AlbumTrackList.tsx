import React from 'react';
import { Link } from 'react-router-dom';
import { Info, Eye } from 'lucide-react';
import { Album } from '../../types';

interface AlbumTrackListProps {
  album: Album;
}

const AlbumTrackList = ({ album }: AlbumTrackListProps) => {
  return (
    <div className="bg-surface rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 hover:bg-surface/80 transition-colors">
      {/* Album Info */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
          <img 
            src={album.coverUrl} 
            alt={album.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{album.title}</h3>
          <p className="text-gray-400 text-sm">Released {album.releaseDate.split('-')[0]} • {album.trackCount} Songs</p>
        </div>
        <Link 
          to={`/albums/${album.id}`}
          className="flex items-center justify-center gap-2 w-full border border-gray-700 hover:border-gray-500 text-white py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <Info className="w-4 h-4" />
          <span>Album Details</span>
        </Link>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 uppercase text-xs tracking-wider">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4 text-right">Lyrics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {album.tracks.map((track) => (
              <tr key={track.id} className="group hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 text-center text-gray-500 group-hover:text-white">{track.trackNumber}</td>
                <td className="py-3 px-4 font-medium text-white">{track.title}</td>
                <td className="py-3 px-4 text-right">
                  <Link 
                    to={`/lyrics/${track.id}`}
                    className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-400 font-medium px-3 py-1 rounded-md bg-primary-500/10 hover:bg-primary-500/20 transition-colors text-xs"
                  >
                    <span>View</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlbumTrackList;
