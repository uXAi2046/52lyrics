import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const RightCards = () => {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Artist Spotlight Card */}
      <div className="flex-1 rounded-3xl overflow-hidden relative group cursor-pointer bg-dark-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
        <div className="relative z-10 p-6 flex flex-col justify-end h-full">
          <h3 className="text-xl font-bold text-white mb-2">Artist Spotlight</h3>
          <p className="text-gray-300 text-sm">Discover the untold stories behind the hits of Taylor Swift.</p>
        </div>
      </div>

      {/* Top Charts Card */}
      <div className="flex-1 rounded-3xl overflow-hidden relative group cursor-pointer bg-dark-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
        <div className="relative z-10 p-6 flex flex-col justify-end h-full">
          <h3 className="text-xl font-bold text-white mb-2">Top Charts 2026</h3>
          <p className="text-gray-300 text-sm">The 100 most searched songs this year.</p>
        </div>
      </div>
    </div>
  );
};

export default RightCards;
