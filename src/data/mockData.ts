import { Artist, Album, Song, LyricSection } from '../types';

// Helper to create lyric sections
const createSections = (lines: string[]): LyricSection[] => {
  return [
    { type: 'intro', content: ['Yeah'] },
    { type: 'verse', number: 1, content: lines.slice(0, 4) },
    { type: 'chorus', content: lines.slice(4, 8) },
    { type: 'verse', number: 2, content: lines.slice(8, 12) },
    { type: 'chorus', content: lines.slice(4, 8) },
    { type: 'bridge', content: lines.slice(12, 14) },
    { type: 'outro', content: ['Ooh, yeah'] }
  ];
};

// Generic lyrics for mock
const genericLyrics = `I've been tryna call
I've been on my own for long enough
Maybe you can show me how to love, maybe
I'm going through withdrawals
I said, ooh, I'm blinded by the lights
No, I can't sleep until I feel your touch
I said, ooh, I'm drowning in the night
Oh, when I'm like this, you're the one I trust
I'm running out of time
'Cause I can see the sun light up the sky
So I hit the road in overdrive, baby, oh
The city's cold and empty
No one's around to judge me
I can't see clearly when you're gone`;

const blindingLightsSections: LyricSection[] = [
  { type: 'intro', content: ['Yeah'] },
  { type: 'verse', number: 1, content: [
    "I've been tryna call",
    "I've been on my own for long enough",
    "Maybe you can show me how to love, maybe",
    "I'm going through withdrawals",
    "You don't even have to do too much",
    "You can turn me on with just a touch, baby"
  ]},
  { type: 'pre-chorus', content: [
    "I look around and",
    "Sin City's cold and empty (Oh)",
    "No one's around to judge me (Oh)",
    "I can't see clearly when you're gone"
  ]},
  { type: 'chorus', content: [
    "I said, ooh, I'm blinded by the lights",
    "No, I can't sleep until I feel your touch",
    "I said, ooh, I'm drowning in the night",
    "Oh, when I'm like this, you're the one I trust",
    "Hey, hey, hey"
  ]},
  { type: 'verse', number: 2, content: [
    "I'm running out of time",
    "'Cause I can see the sun light up the sky",
    "So I hit the road in overdrive, baby, oh"
  ]},
  { type: 'pre-chorus', content: [
    "The city's cold and empty (Oh)",
    "No one's around to judge me (Oh)",
    "I can't see clearly when you're gone"
  ]},
  { type: 'chorus', content: [
    "I said, ooh, I'm blinded by the lights",
    "No, I can't sleep until I feel your touch",
    "I said, ooh, I'm drowning in the night",
    "Oh, when I'm like this, you're the one I trust"
  ]},
  { type: 'bridge', content: [
    "I'm just walking by to let you know (By to let you know)",
    "I can never say it on the phone (Say it on the phone)",
    "Will never let you go this time (Ooh)"
  ]},
  { type: 'outro', content: [
    "I said, ooh, I'm blinded by the lights",
    "No, I can't sleep until I feel your touch",
    "Hey, hey, hey",
    "Hey, hey, hey"
  ]}
];

// Artists
export const ARTISTS: Artist[] = [
  {
    id: 'a1',
    name: 'The Weeknd',
    genres: ['Pop', 'R&B'],
    activeYears: '2010 - Present',
    location: 'Toronto, Canada',
    biography: 'The Weeknd is known for his atmospheric soundscapes and introspective lyrics. Since his debut, he has captivated audiences worldwide with a unique blend of synth-pop and alternative R&B.',
    songCount: 156,
    imageUrl: 'https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=The%20Weeknd%20portrait%20dark%20moody%20red%20lighting&image_size=square',
    albums: [],
    topSongs: []
  },
  {
    id: 'a2',
    name: 'Taylor Swift',
    genres: ['Pop', 'Country', 'Alternative'],
    activeYears: '2006 - Present',
    location: 'Reading, Pennsylvania, USA',
    biography: 'Taylor Swift is an American singer-songwriter. Her discography spans genres and her narrative songwriting, which is often inspired by her personal life, has received widespread media coverage and critical praise.',
    songCount: 234,
    imageUrl: 'https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=Taylor%20Swift%20portrait%20elegant%20lighting&image_size=square',
    albums: [],
    topSongs: []
  },
  {
    id: 'a3',
    name: 'Harry Styles',
    genres: ['Pop', 'Rock'],
    activeYears: '2010 - Present',
    location: 'Redditch, England',
    biography: 'Harry Styles rose to fame as a member of One Direction before launching a successful solo career known for his flamboyant fashion and classic rock-influenced sound.',
    songCount: 48,
    imageUrl: 'https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=Harry%20Styles%20portrait%20colorful%20vintage%20style&image_size=square',
    albums: [],
    topSongs: []
  },
  {
    id: 'a4',
    name: 'Dua Lipa',
    genres: ['Pop', 'Disco'],
    activeYears: '2015 - Present',
    location: 'London, UK',
    biography: 'Dua Lipa is known for her signature disco-pop sound and mezzo-soprano vocal range. She has received numerous accolades, including multiple Grammy Awards.',
    songCount: 63,
    imageUrl: 'https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=Dua%20Lipa%20portrait%20neon%20background&image_size=square',
    albums: [],
    topSongs: []
  },
  {
    id: 'a5',
    name: 'Ed Sheeran',
    genres: ['Pop', 'Folk'],
    activeYears: '2011 - Present',
    location: 'Halifax, England',
    biography: 'Ed Sheeran is an English singer-songwriter. He has sold more than 150 million records worldwide, making him one of the world\'s best-selling music artists.',
    songCount: 120,
    imageUrl: 'https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=Ed%20Sheeran%20portrait%20acoustic%20guitar&image_size=square',
    albums: [],
    topSongs: []
  },
  {
    id: 'a6',
    name: 'Beyoncé',
    genres: ['R&B', 'Pop'],
    activeYears: '1997 - Present',
    location: 'Houston, Texas, USA',
    biography: 'Beyoncé is an American singer, songwriter, and actress. Known as "Queen Bey", she has been cited as an influence by many other artists.',
    songCount: 189,
    imageUrl: 'https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=Beyonce%20portrait%20glamorous%20gold%20lighting&image_size=square',
    albums: [],
    topSongs: []
  },
  {
    id: 'a7',
    name: 'Adele',
    genres: ['Soul', 'Pop'],
    activeYears: '2006 - Present',
    location: 'London, England',
    biography: 'Adele is an English singer-songwriter. She is one of the world\'s best-selling music artists, with sales of over 120 million records.',
    songCount: 84,
    imageUrl: 'https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=Adele%20portrait%20classic%20black%20and%20white&image_size=square',
    albums: [],
    topSongs: []
  },
  {
    id: 'a8',
    name: 'The Midnight Echo',
    genres: ['Alternative Rock'],
    activeYears: '2015 - Present',
    location: 'London, UK',
    biography: 'The Midnight Echo is known for their atmospheric soundscapes and introspective lyrics. Since their debut in 2015, they have captivated audiences worldwide with a unique blend of synth-pop and alternative rock.',
    songCount: 22,
    imageUrl: 'https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=Indie%20Rock%20Band%20portrait%20neon%20lights&image_size=square',
    albums: [],
    topSongs: []
  }
];

// Albums
const createAlbum = (id: string, title: string, artistId: string, year: number, coverPrompt: string, trackNames: string[]): Album => {
  const artist = ARTISTS.find(a => a.id === artistId);
  const album: Album = {
    id,
    title,
    artistId,
    artistName: artist?.name || 'Unknown Artist',
    releaseDate: `${year}-01-01`,
    year,
    trackCount: trackNames.length,
    coverUrl: `https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(coverPrompt)}&image_size=square`,
    type: 'Album',
    tracks: []
  };

  album.tracks = trackNames.map((name, index) => ({
    id: `${id}_t${index + 1}`,
    title: name,
    artistId,
    artistName: artist?.name || 'Unknown Artist',
    albumId: id,
    albumTitle: title,
    duration: '3:30',
    trackNumber: index + 1,
    lyrics: genericLyrics,
    sections: name === 'Blinding Lights' ? blindingLightsSections : createSections(genericLyrics.split('\n')),
    writers: ['Songwriter A', 'Songwriter B'],
    copyright: `© ${year} ${artist?.name} Records`,
    genres: artist?.genres,
    releaseYear: year
  }));

  return album;
};

export const ALBUMS: Album[] = [
  createAlbum('alb1', 'After Hours', 'a1', 2020, 'After Hours album cover The Weeknd red suit dark background', 
    ['Alone Again', 'Too Late', 'Hardest To Love', 'Scared To Live', 'Snowchild', 'Escape From LA', 'Heartless', 'Faith', 'Blinding Lights', 'In Your Eyes', 'Save Your Tears']),
  createAlbum('alb2', 'Midnights', 'a2', 2022, 'Midnights Taylor Swift album cover blue dark mood', 
    ['Lavender Haze', 'Maroon', 'Anti-Hero', 'Snow On The Beach', 'You\'re On Your Own, Kid', 'Midnight Rain']),
  createAlbum('alb3', 'Harry\'s House', 'a3', 2022, 'Harrys House album cover upside down room', 
    ['Music For a Sushi Restaurant', 'Late Night Talking', 'Grapejuice', 'As It Was', 'Daylight', 'Little Freak', 'Matilda']),
  createAlbum('alb4', 'Future Nostalgia', 'a4', 2020, 'Future Nostalgia Dua Lipa album cover retro car moon', 
    ['Future Nostalgia', 'Don\'t Start Now', 'Cool', 'Physical', 'Levitating', 'Pretty Please', 'Hallucinate', 'Love Again']),
  createAlbum('alb5', 'Divide', 'a5', 2017, 'Divide Ed Sheeran album cover blue background', 
    ['Eraser', 'Castle on the Hill', 'Dive', 'Shape of You', 'Perfect', 'Galway Girl']),
  createAlbum('alb6', 'Renaissance', 'a6', 2022, 'Renaissance Beyonce album cover horse', 
    ['I\'m That Girl', 'Cozy', 'Alien Superstar', 'Cuff It', 'Energy', 'Break My Soul', 'Church Girl']),
  createAlbum('alb7', 'Neon Nights', 'a8', 2023, 'Neon geometric shapes dark background', 
    ['City Lights', 'Echoes of Yesterday', 'Digital Hearts', 'Running from the Sun', 'Concrete Jungle']),
  createAlbum('alb8', 'Retrograde', 'a8', 2021, 'Vintage car on desert road sunset', 
    ['Back to the Start', 'Fading Signals', 'Starlit Drive', 'Lost Frequency', 'Waves'])
];

// Link albums to artists
ARTISTS.forEach(artist => {
  artist.albums = ALBUMS.filter(album => album.artistId === artist.id);
  // Flatten tracks for top songs (just taking first 5 for mock)
  artist.topSongs = artist.albums.flatMap(a => a.tracks).slice(0, 5);
});

// Hot Songs (Global Top 5)
export const HOT_SONGS: Song[] = [
  ALBUMS[1].tracks.find(t => t.title === 'Cruel Summer') || { ...ALBUMS[1].tracks[2], id: 's_cruel_summer', title: 'Cruel Summer' }, // Mock if not found
  ALBUMS[0].tracks.find(t => t.title === 'Starboy') || { ...ALBUMS[0].tracks[0], id: 's_starboy', title: 'Starboy' },
  ALBUMS[2].tracks.find(t => t.title === 'As It Was') || { ...ALBUMS[2].tracks[3], id: 's_as_it_was' },
  { ...ALBUMS[0].tracks[0], id: 's_flowers', title: 'Flowers', artistName: 'Miley Cyrus', artistId: 'miley', coverUrl: 'https://core-normal.trae.ai/api/ide/v1/text_to_image?prompt=Miley%20Cyrus%20Flowers&image_size=square' },
  ALBUMS[1].tracks.find(t => t.title === 'Anti-Hero') || ALBUMS[1].tracks[2],
];

export const MOCK_DATA = {
  artists: ARTISTS,
  albums: ALBUMS,
  hotSongs: HOT_SONGS
};
