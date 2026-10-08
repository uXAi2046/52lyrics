import { afterEach, describe, expect, it, vi } from 'vitest';
import { HOME_SPOTLIGHT_POOL, HOME_SPOTLIGHT_STORAGE_KEY, nextHomeSpotlights, selectHomeSpotlights, spotlightStyle } from './homeSpotlights';

// Reproducible randomness without tying assertions to the catalog's sort order.
function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('homepage spotlight rotation', () => {
  it('draws from a broad pool of sourced artists with credited local photos and albums', () => {
    expect(HOME_SPOTLIGHT_POOL.length).toBeGreaterThan(100);
    expect(new Set(HOME_SPOTLIGHT_POOL.map(({ artist }) => artist.id)).size).toBe(HOME_SPOTLIGHT_POOL.length);
    for (const { artist } of HOME_SPOTLIGHT_POOL) {
      expect(artist.metadataSource).toBeDefined();
      expect(artist.imageCredit?.sourceUrl).toMatch(/^https:\/\/commons.wikimedia.org\//);
      expect(artist.imageUrl).toMatch(/^\/artwork\/imported\//);
      expect(artist.albums.some((album) => album.metadataSource && album.type === 'Album')).toBe(true);
    }
  });

  it('selects three distinct artists and styles, with varying first-visit results', () => {
    const batches = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      const { spotlights } = selectHomeSpotlights(null, seededRandom(seed));
      expect(new Set(spotlights.map(({ artist }) => artist.id)).size).toBe(3);
      expect(new Set(spotlights.map(({ artist }) => spotlightStyle(artist))).size).toBe(3);
      batches.add(spotlights.map(({ artist }) => artist.id).join(','));
    }
    expect(batches.size).toBeGreaterThan(20);
  });

  it('covers the entire pool before repeating and avoids the previous batch across cycle boundaries', () => {
    const random = seededRandom(42);
    let history: unknown = null;
    let previous: string[] = [];
    const shown: string[] = [];
    for (let visit = 0; visit < Math.ceil(HOME_SPOTLIGHT_POOL.length / 3) + 5; visit++) {
      const next = selectHomeSpotlights(history, random);
      const ids = next.spotlights.map(({ artist }) => artist.id);
      expect(ids.some((id) => previous.includes(id))).toBe(false);
      shown.push(...ids);
      history = next.history;
      previous = ids;
    }
    expect(new Set(shown.slice(0, HOME_SPOTLIGHT_POOL.length)).size).toBe(HOME_SPOTLIGHT_POOL.length);
  });

  it('validates history and still fills three slots at the end of a cycle', () => {
    const ids = HOME_SPOTLIGHT_POOL.map(({ artist }) => artist.id);
    const next = selectHomeSpotlights({ seen: [...ids.slice(0, -1), 'removed-artist', null, ids[0]], previous: ids.slice(0, 3) }, seededRandom(1));
    expect(next.spotlights[0].artist.id).toBe(ids.at(-1));
    expect(next.spotlights).toHaveLength(3);
    expect(new Set(next.history.previous).size).toBe(3);
    expect(next.history.seen).not.toContain('removed-artist');
    expect(selectHomeSpotlights({ seen: 'invalid', previous: [false, 'unknown'] }).spotlights).toHaveLength(3);
  });

  it('persists rotation between visits and recovers from corrupt or blocked browser storage', () => {
    const first = nextHomeSpotlights().map(({ artist }) => artist.id);
    expect(JSON.parse(localStorage.getItem(HOME_SPOTLIGHT_STORAGE_KEY)!).previous).toEqual(first);
    expect(nextHomeSpotlights().some(({ artist }) => first.includes(artist.id))).toBe(false);
    localStorage.setItem(HOME_SPOTLIGHT_STORAGE_KEY, '{broken');
    expect(nextHomeSpotlights()).toHaveLength(3);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const blocked = nextHomeSpotlights().map(({ artist }) => artist.id);
    expect(nextHomeSpotlights().some(({ artist }) => blocked.includes(artist.id))).toBe(false);
  });
});
