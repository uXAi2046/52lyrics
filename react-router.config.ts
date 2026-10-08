import type { Config } from '@react-router/dev/config';
import { ALBUMS, ARTISTS } from './src/data/catalog';
import { GUIDES, guidePath } from './src/data/guides';

const songPaths = ALBUMS.flatMap((album) => album.tracks.map((song) => `/lyrics/${song.slug}`));
const prerenderConcurrency = Number(process.env.PRERENDER_CONCURRENCY ?? 8);

if (!Number.isSafeInteger(prerenderConcurrency) || prerenderConcurrency < 1) {
  throw new Error('PRERENDER_CONCURRENCY must be a positive integer');
}

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: {
    concurrency: prerenderConcurrency,
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
