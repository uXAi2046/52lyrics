import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/** Keep screenshot fixtures stable using the same rotation history as real visits. */
export async function seedHomeSpotlights(page: Page) {
  const defaults = new Set(['Beyonce', 'David Bowie', 'Nina Simone']);
  const catalog: { artists: { name: string; existingId?: string; mbid: string }[] } = JSON.parse(
    readFileSync(new URL('../../../src/data/imported/musicbrainz.json', import.meta.url), 'utf8'),
  );
  await page.addInitScript(({ key, seen }) => {
    localStorage.setItem(key, JSON.stringify({ seen, previous: [] }));
    Math.random = () => 1 - Number.EPSILON;
  }, { key: '52lyrics:home-spotlights:v1', seen: catalog.artists.filter((artist) => !defaults.has(artist.name)).map((artist) => artist.existingId || `mb-artist-${artist.mbid}`) });
}
