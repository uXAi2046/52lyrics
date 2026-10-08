import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  layout('components/layout/Layout.tsx', [
    index('pages/Home.tsx'),
    route('discover', 'pages/Discover.tsx'),
    route('guides', 'pages/Guides.tsx'),
    route('guides/:guideId', 'pages/Guide.tsx'),
    route('search', 'pages/Search.tsx'),
    route('artists', 'pages/BrowseArtists.tsx'),
    route('artists/:artistId', 'pages/ArtistDetails.tsx'),
    route('albums/:albumId', 'pages/AlbumDetails.tsx'),
    route('lyrics/:songId', 'pages/Lyrics.tsx'),
    route('saved', 'pages/Saved.tsx'),
    route('about', 'pages/About.tsx'),
    route('privacy', 'pages/Privacy.tsx'),
    route('terms', 'pages/Terms.tsx'),
    route('copyright', 'pages/Copyright.tsx'),
    route('top-charts', 'pages/RedirectToDiscover.tsx'),
    route('*', 'pages/NotFound.tsx'),
  ]),
] satisfies RouteConfig;
