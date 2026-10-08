export const HOME_LAYOUTS = ['studio', 'gallery', 'reading'] as const;
export type HomeLayout = typeof HOME_LAYOUTS[number];
export type HomeRegion = 'north-america' | 'british-isles' | 'world';
export type HomeTheme = 'classic' | 'harvest' | 'summer' | 'spring' | 'winter' | 'nightfall' | 'rose';

export interface HomeExperience {
  layout: HomeLayout;
  theme: HomeTheme;
  region: HomeRegion;
  edition: string;
  title: string;
  accent: string;
  introduction: string;
  regionTitle: string;
}

// Keep pre-rendered HTML independent of a visitor's clock and browser settings.
export const STATIC_HOME_EXPERIENCE: HomeExperience = {
  layout: 'studio', theme: 'classic', region: 'world', edition: 'The people behind the music',
  title: 'Meet the artists.', accent: 'Follow the songs.',
  introduction: 'A familiar voice. A name you haven’t met yet. Explore their records, find the words, and make a few discoveries of your own.',
  regionTitle: 'Across the catalog',
};

const hash = (value: string) => [...value].reduce((total, character) => (Math.imul(total, 31) + character.charCodeAt(0)) >>> 0, 7);

export function nextHomeLayout(layout: HomeLayout): HomeLayout {
  return HOME_LAYOUTS[(HOME_LAYOUTS.indexOf(layout) + 1) % HOME_LAYOUTS.length];
}

/** A local, stable edition for each daypart. No IP lookup or visitor data is sent. */
export function selectHomeExperience(now: Date, locale: string): HomeExperience {
  let country = '';
  try { country = new Intl.Locale(locale).region?.toUpperCase() || ''; }
  catch { /* Unknown browser locale uses the world edition. */ }
  const region: HomeRegion = ['US', 'CA'].includes(country) ? 'north-america'
    : ['GB', 'IE'].includes(country) ? 'british-isles' : 'world';
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const daypart = hour < 11 && hour >= 5 ? 'morning' : hour < 18 && hour >= 11 ? 'afternoon' : 'evening';
  let theme: HomeTheme;
  let season: string;
  if (month === 12 && day >= 20 || month === 1 && day <= 3) { theme = 'winter'; season = 'Winter lights'; }
  else if (month === 10 && day >= 25 || month === 11 && day === 1) { theme = 'nightfall'; season = 'After dark'; }
  else if (month === 2 && day >= 11 && day <= 15) { theme = 'rose'; season = 'Love notes'; }
  else if (month >= 9 && month <= 11) { theme = 'harvest'; season = 'Autumn edition'; }
  else if (month >= 6 && month <= 8) { theme = 'summer'; season = 'Summer edition'; }
  else if (month >= 3 && month <= 5) { theme = 'spring'; season = 'Spring edition'; }
  else { theme = 'winter'; season = 'Winter edition'; }
  const copy = {
    morning: { title: 'Start with a voice.', accent: 'Follow the songs.', introduction: 'A fresh day, a new name on the sleeve. Explore a record and see where its songs lead.' },
    afternoon: { title: 'Meet the artists.', accent: 'Follow the songs.', introduction: 'A familiar voice. A name you haven’t met yet. Explore their records, find the words, and make a few discoveries of your own.' },
    evening: { title: 'One more record.', accent: 'Stay for the words.', introduction: 'Settle into an artist’s story, follow a record track by track, and find a lyric worth reading tonight.' },
  }[daypart];
  const dayKey = `${now.getFullYear()}-${month}-${day}-${daypart}-${region}`;
  return {
    ...copy, layout: HOME_LAYOUTS[hash(dayKey) % HOME_LAYOUTS.length], theme, region,
    edition: `${daypart === 'evening' ? 'Tonight' : daypart === 'morning' ? 'This morning' : 'Today'} · ${season}`,
    regionTitle: region === 'north-america' ? 'From North America' : region === 'british-isles' ? 'From Britain & Ireland' : 'Across the catalog',
  };
}
