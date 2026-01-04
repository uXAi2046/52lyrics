import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface AlphaPaginationProps {
  activeChar?: string;
  onSelect?: (char: string) => void;
  className?: string;
}

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const AlphaPagination = ({ activeChar, onSelect, className }: AlphaPaginationProps) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Link
        to="/artists"
        className={cn(
          "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg text-xs md:text-sm font-bold transition-all",
          activeChar === 'All' 
            ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25" 
            : "bg-surface text-gray-400 hover:text-white hover:bg-dark-700"
        )}
      >
        All
      </Link>
      
      {ALPHABET.map((char) => (
        <Link
          key={char}
          to={`/artists?filter=${char === '#' ? 'num' : char}`}
          className={cn(
            "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg text-xs md:text-sm font-bold transition-all",
            activeChar === char 
              ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25" 
              : "bg-surface text-gray-400 hover:text-white hover:bg-dark-700"
          )}
          onClick={(e) => {
            if (onSelect) {
              e.preventDefault();
              onSelect(char);
            }
          }}
        >
          {char}
        </Link>
      ))}
    </div>
  );
};

export default AlphaPagination;
