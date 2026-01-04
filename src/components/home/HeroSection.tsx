import React from 'react';
import { Link } from 'react-router-dom';
import { Mic2 } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-900 h-full min-h-[400px] flex flex-col justify-end p-8 md:p-12">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=2800&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent"></div>
      
      <div className="relative z-10 max-w-2xl">
        <div className="flex gap-3 mb-4">
          <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Featured</span>
          <span className="bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">New Release</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          Midnight Horizons
        </h1>
        
        <p className="text-gray-300 text-lg mb-8 max-w-xl">
          Dive into the lyrics of the latest synthwave sensation sweeping the charts. Experience the neon-drenched nostalgia.
        </p>
        
        <Link 
          to="/lyrics/s_flowers" 
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-500/25"
        >
          <Mic2 className="w-5 h-5" />
          <span>View Lyrics</span>
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;
