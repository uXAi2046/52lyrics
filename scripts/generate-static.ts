import { copyFile, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ALBUMS, ARTISTS } from '../src/data/catalog';
import { GUIDES, guidePath } from '../src/data/guides';

const baseUrl = (
  process.env.SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  || 'http://localhost:5173'
).replace(/\/$/, '');

const paths = [
  '/',
  '/discover',
  '/guides',
  ...GUIDES.map((guide) => guidePath(guide.slug)),
  '/artists',
  '/about',
  '/privacy',
  '/terms',
  '/copyright',
  ...ARTISTS.map((artist) => `/artists/${artist.slug}`),
  ...ALBUMS.map((album) => `/albums/${album.slug}`),
  ...ALBUMS.flatMap((album) => album.tracks.map((song) => `/lyrics/${song.slug}`)),
];

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>${baseUrl}${path}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

await writeFile('build/client/sitemap.xml', sitemap, 'utf8');
await writeFile('build/client/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`, 'utf8');
await copyFile('build/client/__spa-fallback.html', 'build/client/404.html');

const findHtmlFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? findHtmlFiles(path) : path.endsWith('.html') ? [path] : [];
  }));
  return nested.flat();
};

// The pages already contain complete prerendered content. Keep React Router's
// hydration links in the DOM, but point them at an inert module so the first
// paint is not competing with duplicate route fetches on constrained mobile
// links. The module entry at the end imports the real route modules and starts
// hydration normally; data-href preserves the generated URL for inspection.
for (const file of await findHtmlFiles('build/client')) {
  const html = await readFile(file, 'utf8');
  await writeFile(file, html.replace(
    /<link rel="modulepreload" href="([^"]+)"/g,
    '<link rel="modulepreload" href="data:text/javascript," data-href="$1"',
  ), 'utf8');
}
