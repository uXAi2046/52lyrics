import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { HOT_SONGS } from '../../data/mockData';

const HotSongs = () => {
  return (
    <section className="py-8 h-full">
      <h2 className="text-2xl font-bold text-white mb-6">Hot Songs</h2>
      
      <div className="flex flex-col gap-4">
        {HOT_SONGS.map((song, index) => (
          <div key={song.id} className="flex items-center gap-4 group p-3 rounded-xl hover:bg-surface transition-colors cursor-pointer">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-500/20 text-primary-500 font-bold rounded-lg text-sm">
              {index + 1}
            </div>
            
            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden relative">
              <img 
                src={song.coverUrl || song.albumTitle ? `https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=Album%20cover%20for%20${encodeURIComponent(song.title)}&image_size=square` : ''} 
                alt={song.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
            
            <div className="flex-grow min-w-0">
              <h4 className="text-white font-bold text-sm truncate group-hover:text-primary-500 transition-colors">{song.title}</h4>
              <p className="text-gray-400 text-xs truncate">{song.artistName}</p>
            </div>
            
            <Link to={`/lyrics/${song.id}`} className="p-2 rounded-full bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
      
      <Link to="/top-charts" className="block mt-6 text-center py-3 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-colors text-xs font-bold tracking-widest uppercase">
        View Top 100
      </Link>
    </section>
  );
};

export default HotSongs;
