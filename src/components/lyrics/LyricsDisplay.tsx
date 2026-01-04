import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Song } from '../../types';

interface LyricsDisplayProps {
  song: Song;
}

const LyricsDisplay = ({ song }: LyricsDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(song.lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Lyrics</h2>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy Text'}</span>
        </button>
      </div>

      <div className="flex-1 text-xl leading-loose text-white space-y-8 font-medium">
        {song.sections.map((section, index) => (
          <div key={index}>
            <p className="text-primary-500 text-sm font-bold italic mb-2">
              [{section.type.charAt(0).toUpperCase() + section.type.slice(1)}{section.number ? ` ${section.number}` : ''}]
            </p>
            {section.content.map((line, i) => (
              <p key={i} className="mb-1">{line}</p>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-gray-500">
        <div className="mb-4">
          <span className="font-bold text-gray-400 block mb-1">Written By</span>
          <p>{song.writers.join(', ')}</p>
        </div>
        <p className="text-xs">{song.copyright}</p>
      </div>
    </div>
  );
};

export default LyricsDisplay;
