import { ARTISTS } from './catalog';
import { HOME_SPOTLIGHTS } from './homeArtists';
import type { Artist } from '../types';

export const HOME_SPOTLIGHT_STORAGE_KEY = '52lyrics:home-spotlights:v1';

// Require a credited local portrait and a sourced album visitors can explore.
export const HOME_SPOTLIGHT_POOL = ARTISTS.filter((artist) =>
  artist.metadataSource && artist.imageCredit && artist.imageUrl.startsWith('/artwork/imported/')
  && artist.albums.some((album) => album.metadataSource && album.type === 'Album'),
).map((artist) => {
  const editorial = HOME_SPOTLIGHTS.find((entry) => entry.artist.id === artist.id);
  return editorial ?? {
    artist,
    note: `Meet ${artist.name}. Explore their records and follow the songs, track by track.`,
    position: 'center 30%',
  };
});

interface SpotlightHistory {
  seen: string[];
  previous: string[];
}

const poolIds = new Set(HOME_SPOTLIGHT_POOL.map(({ artist }) => artist.id));

function readHistory(value: unknown): SpotlightHistory {
  const state = value && typeof value === 'object' ? value as Partial<SpotlightHistory> : {};
  const validIds = (ids: unknown): string[] => Array.isArray(ids)
    ? [...new Set(ids.filter((id): id is string => typeof id === 'string' && poolIds.has(id)))]
    : [];
  return { seen: validIds(state.seen), previous: validIds(state.previous).slice(0, 3) };
}

/** Broad families keep three neighboring slots from all featuring the same style. */
export function spotlightStyle(artist: Artist): string {
  const genre = (artist.genres[0] ?? 'Other').toLowerCase();
  if (/hip[ -]?hop|rap/.test(genre)) return 'Hip-hop';
  if (/soul|jazz|r&b|rhythm and blues|funk|blues/.test(genre)) return 'Soul & jazz';
  if (/rock|metal|punk|grunge/.test(genre)) return 'Rock';
  if (/pop|dance|disco|electro|house|techno/.test(genre)) return 'Pop & electronic';
  if (/folk|country/.test(genre)) return 'Folk & country';
  if (/classical|opera/.test(genre)) return 'Classical';
  return genre;
}

/** A shuffled rotation: exhaust unseen artists before beginning another cycle. */
export function selectHomeSpotlights(value: unknown, random: () => number = Math.random) {
  const history = readHistory(value);
  let seen = new Set(history.seen);
  const previous = new Set(history.previous);
  const candidates = [...HOME_SPOTLIGHT_POOL];
  for (let index = candidates.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swap]] = [candidates[swap], candidates[index]];
  }

  const spotlights: typeof HOME_SPOTLIGHT_POOL = [];
  const styles = new Set<string>();
  while (spotlights.length < Math.min(3, candidates.length)) {
    const eligible = () => candidates.filter(({ artist }) =>
      !previous.has(artist.id) && !spotlights.some((entry) => entry.artist.id === artist.id),
    );
    let available = eligible().filter(({ artist }) => !seen.has(artist.id));
    if (!available.length) {
      seen = new Set();
      available = eligible();
    }
    // If a future catalog shrinks below two batches, still fill the available slots.
    if (!available.length) available = candidates.filter(({ artist }) => !spotlights.some((entry) => entry.artist.id === artist.id));
    const entry = available.find(({ artist }) => !styles.has(spotlightStyle(artist))) ?? available[0];
    spotlights.push(entry);
    seen.add(entry.artist.id);
    styles.add(spotlightStyle(entry.artist));
  }

  return { spotlights, history: { seen: [...seen], previous: spotlights.map(({ artist }) => artist.id) } };
}

// Also retain rotation within this tab when browser storage is unavailable.
let memoryHistory: SpotlightHistory = { seen: [], previous: [] };

export function nextHomeSpotlights() {
  let history: unknown = memoryHistory;
  try {
    const stored = window.localStorage.getItem(HOME_SPOTLIGHT_STORAGE_KEY);
    if (stored) history = JSON.parse(stored);
  } catch {
    // Blocked or malformed storage must not interrupt the homepage.
  }
  const next = selectHomeSpotlights(history);
  memoryHistory = next.history;
  try {
    window.localStorage.setItem(HOME_SPOTLIGHT_STORAGE_KEY, JSON.stringify(next.history));
  } catch {
    // The current visit still receives its selected artists.
  }
  return next.spotlights;
}
