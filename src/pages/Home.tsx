import React from 'react';
import HeroSection from '../components/home/HeroSection';
import RightCards from '../components/home/RightCards';
import PopularArtists from '../components/home/PopularArtists';
import PopularAlbums from '../components/home/PopularAlbums';
import HotSongs from '../components/home/HotSongs';
import AlphaPagination from '../components/common/AlphaPagination';

const Home = () => {
  return (
    <div className="container mx-auto px-4 pb-12">
      {/* Alpha Pagination */}
      <div className="py-6 overflow-x-auto no-scrollbar">
        <AlphaPagination />
      </div>

      {/* Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2">
          <HeroSection />
        </div>
        <div className="lg:col-span-1">
          <RightCards />
        </div>
      </div>

      {/* Popular Artists */}
      <div className="mb-8">
        <PopularArtists />
      </div>

      {/* Albums & Hot Songs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PopularAlbums />
        </div>
        <div className="lg:col-span-1">
          <HotSongs />
        </div>
      </div>
    </div>
  );
};

export default Home;
