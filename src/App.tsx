import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import BrowseArtists from './pages/BrowseArtists';
import ArtistDetails from './pages/ArtistDetails';
import AlbumDetails from './pages/AlbumDetails';
import Lyrics from './pages/Lyrics';
import TopCharts from './pages/TopCharts';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/artists" element={<BrowseArtists />} />
        <Route path="/artists/:artistId" element={<ArtistDetails />} />
        <Route path="/albums/:albumId" element={<AlbumDetails />} />
        <Route path="/lyrics/:songId" element={<Lyrics />} />
        <Route path="/top-charts" element={<TopCharts />} />
      </Route>
    </Routes>
  );
}

export default App;
