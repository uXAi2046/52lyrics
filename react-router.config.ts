import type { Config } from '@react-router/dev/config';
import { ALBUMS, ARTISTS } from './src/data/catalog';
import { GUIDES, guidePath } from './src/data/guides';

const songPaths = ALBUMS.flatMap((album) => album.tracks.map((song) => `/lyrics/${song.slug}`));

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: {
    concurrency: 8,
    paths: [
      '/',
      '/discover',
      '/guides',
      ...GUIDES.map((guide) => guidePath(guide.slug)),
      '/search',
      '/artists',
      '/saved',
      '/about',
      '/privacy',
      '/terms',
      '/copyright',
      ...ARTISTS.map((artist) => `/artists/${artist.slug}`),
      ...ALBUMS.map((album) => `/albums/${album.slug}`),
      ...songPaths,
    ],
  },
} satisfies Config;
