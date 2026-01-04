import React, { useState } from 'react';
import { Album } from '../../types';
import AlbumTrackList from '../albums/AlbumTrackList';
import { cn } from '../../utils/cn';

interface DiscographyProps {
  albums: Album[];
}

const Discography = ({ albums }: DiscographyProps) => {
  const [activeTab, setActiveTab] = useState<'ALBUMS' | 'SINGLES'>('ALBUMS');

  // Filter albums (mock logic, assume all are Albums for now unless specified)
  const displayAlbums = activeTab === 'ALBUMS' 
    ? albums.filter(a => a.type === 'Album')
    : albums.filter(a => a.type !== 'Album');

  // If no singles, show empty state or just keep it simple
  const hasContent = displayAlbums.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Discography</h2>
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('ALBUMS')}
            className={cn(
              "text-sm font-bold tracking-wider pb-4 -mb-4 border-b-2 transition-colors",
              activeTab === 'ALBUMS' ? "text-primary-500 border-primary-500" : "text-gray-500 border-transparent hover:text-gray-300"
            )}
          >
            ALBUMS
          </button>
          <button
            onClick={() => setActiveTab('SINGLES')}
            className={cn(
              "text-sm font-bold tracking-wider pb-4 -mb-4 border-b-2 transition-colors",
              activeTab === 'SINGLES' ? "text-primary-500 border-primary-500" : "text-gray-500 border-transparent hover:text-gray-300"
            )}
          >
            SINGLES
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {hasContent ? (
          displayAlbums.map(album => (
            <AlbumTrackList key={album.id} album={album} />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No {activeTab.toLowerCase()} found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Discography;
