import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';
import { HOT_SONGS } from '../data/mockData';

const TopCharts = () => {
  // Mock 20 songs for the chart
  const chartSongs = [...HOT_SONGS, ...HOT_SONGS, ...HOT_SONGS, ...HOT_SONGS];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Top Charts 2026</h1>
      <p className="text-gray-400 mb-8">The 100 most searched songs this year.</p>

      <div className="flex flex-col gap-2">
        {chartSongs.map((song, index) => (
          <div key={`${song.id}-${index}`} className="flex items-center gap-4 group p-4 rounded-xl hover:bg-surface transition-colors border-b border-gray-800/50 hover:border-transparent">
            <div className="flex-shrink-0 w-12 text-center text-xl font-bold text-gray-500 group-hover:text-primary-500">
              {index + 1}
            </div>
            
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden relative">
              <img 
                src={song.coverUrl || song.albumTitle ? `https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=Album%20cover%20for%20${encodeURIComponent(song.title)}&image_size=square` : ''} 
                alt={song.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
            
            <div className="flex-grow min-w-0">
              <h4 className="text-white font-bold text-lg truncate group-hover:text-primary-500 transition-colors">{song.title}</h4>
              <p className="text-gray-400 text-sm truncate">
                <Link to={`/artists/${song.artistId}`} className="hover:text-white">{song.artistName}</Link>
                {song.albumTitle && (
                  <>
                    <span className="mx-2">•</span>
                    <Link to={`/albums/${song.albumId}`} className="hover:text-white">{song.albumTitle}</Link>
                  </>
                )}
              </p>
            </div>
            
            <div className="hidden md:block text-gray-500 text-sm font-medium mr-8">
              {song.duration}
            </div>

            <Link to={`/lyrics/${song.id}`} className="p-3 rounded-full bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCharts;
