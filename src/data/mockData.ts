import { Artist, Album, Song, LyricSection } from '../types';

type AlbumBlueprint = {
  id: string;
  title: string;
  artistId: string;
  year: number;
  coverPrompt: string;
  trackNames: string[];
  type?: Album['type'];
  releaseDate?: string;
};

const DURATION_POOL = ['2:48', '3:05', '3:18', '3:27', '3:36', '3:45', '3:57', '4:02'];

export const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const artworkPalette = ['#FF6A5C', '#9381FF', '#D8AE63', '#648D86', '#B35C78'];

export const buildImageUrl = (label: string) => {
  const index = Array.from(label).reduce((total, char) => total + char.charCodeAt(0), 0);
  const accent = artworkPalette[index % artworkPalette.length];
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">',
    '<rect width="800" height="800" fill="#11131B"/>',
    '<circle cx="610" cy="174" r="280" fill="' + accent + '" opacity=".88"/>',
    '<circle cx="125" cy="675" r="330" fill="#242837"/>',
    '<path d="M0 490L800 178V800H0Z" fill="#090A0F" opacity=".78"/>',
    '<text x="58" y="696" fill="#F0E7D8" font-family="Arial,sans-serif" font-size="132" font-weight="800">' + initials + '</text>',
    '<path d="M58 730H742" stroke="' + accent + '" stroke-width="8"/>',
    '</svg>',
  ].join('');
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
};

const createPlaceholderLyrics = () => '';
const createSections = (): LyricSection[] => [];


type ArtistSeed = Omit<Artist, 'slug' | 'seoDescription'>;

const ARTIST_SEEDS: ArtistSeed[] = [
  {
    id: 'a1',
    name: 'The Weeknd',
    genres: ['Pop', 'R&B'],
    activeYears: '2010 - Present',
    location: 'Toronto, Canada',
    biography:
      'The Weeknd is a Canadian singer-songwriter known for atmospheric production, noir pop aesthetics, and a catalog that bridges alternative R&B with arena-sized hooks.',
    songCount: 156,
    imageUrl: buildImageUrl('The Weeknd portrait, moody red and blue lighting, studio photography, dark background'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a2',
    name: 'Adele',
    genres: ['Soul', 'Pop'],
    activeYears: '2006 - Present',
    location: 'London, England',
    biography:
      'Adele is an English singer-songwriter celebrated for powerhouse ballads, emotional vocal performances, and record-breaking album eras anchored by timeless songwriting.',
    songCount: 84,
    imageUrl: buildImageUrl('Adele portrait, elegant studio lighting, classic styling, rich dark backdrop'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a3',
    name: 'Ed Sheeran',
    genres: ['Pop', 'Folk'],
    activeYears: '2011 - Present',
    location: 'Halifax, England',
    biography:
      'Ed Sheeran is an English singer-songwriter whose acoustic-rooted pop, direct storytelling, and global touring success have made him one of the defining artists of his generation.',
    songCount: 120,
    imageUrl: buildImageUrl('Ed Sheeran portrait with acoustic guitar, warm studio light, realistic photography'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a4',
    name: 'Dua Lipa',
    genres: ['Pop', 'Disco'],
    activeYears: '2015 - Present',
    location: 'London, UK',
    biography:
      'Dua Lipa is a British-Albanian pop star recognized for sleek dance-pop production, disco revival influences, and a confident, club-ready vocal style.',
    songCount: 63,
    imageUrl: buildImageUrl('Dua Lipa portrait, neon blue background, editorial pop photography'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a5',
    name: 'Harry Styles',
    genres: ['Pop', 'Rock'],
    activeYears: '2010 - Present',
    location: 'Redditch, England',
    biography:
      'Harry Styles moved from global boy-band fame to a solo career built on charismatic live shows, classic-pop craftsmanship, and soft-rock experimentation.',
    songCount: 48,
    imageUrl: buildImageUrl('Harry Styles portrait, colorful fashion editorial, soft vintage lighting'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a6',
    name: 'Beyonce',
    genres: ['R&B', 'Pop'],
    activeYears: '1997 - Present',
    location: 'Houston, Texas, USA',
    biography:
      'Beyonce is an American singer, songwriter, producer, and performer whose visual ambition, precision, and vocal range have shaped modern pop and R&B.',
    songCount: 189,
    imageUrl: buildImageUrl('Beyonce portrait, glamorous gold light, premium fashion photography'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a7',
    name: 'Taylor Swift',
    genres: ['Pop', 'Country', 'Alternative'],
    activeYears: '2006 - Present',
    location: 'Reading, Pennsylvania, USA',
    biography:
      'Taylor Swift is an American singer-songwriter whose narrative writing, reinvention across genres, and era-based album storytelling define her global appeal.',
    songCount: 234,
    imageUrl: buildImageUrl('Taylor Swift portrait, cinematic blue tones, polished editorial photography'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a8',
    name: 'Ariana Grande',
    genres: ['Pop', 'R&B'],
    activeYears: '2013 - Present',
    location: 'Boca Raton, Florida, USA',
    biography:
      'Ariana Grande is an American vocalist known for agile melismas, glossy pop production, and a string of chart-topping singles shaped by contemporary R&B.',
    songCount: 95,
    imageUrl: buildImageUrl('Ariana Grande portrait, modern studio beauty lighting, pop editorial style'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a9',
    name: 'Billie Eilish',
    genres: ['Alternative Pop', 'Electropop'],
    activeYears: '2015 - Present',
    location: 'Los Angeles, California, USA',
    biography:
      'Billie Eilish is an American singer-songwriter known for whispery intimacy, minimalist production, and a visual identity that blends pop stardom with outsider cool.',
    songCount: 48,
    imageUrl: buildImageUrl('Billie Eilish portrait, green-black moody lighting, realistic photo'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a10',
    name: 'Bruno Mars',
    genres: ['Pop', 'Funk'],
    activeYears: '2010 - Present',
    location: 'Honolulu, Hawaii, USA',
    biography:
      'Bruno Mars is an American singer-songwriter and performer whose retro-funk influences, vocal agility, and showmanship have driven a deep catalog of radio staples.',
    songCount: 56,
    imageUrl: buildImageUrl('Bruno Mars portrait, warm spotlight, live-performance inspired photography'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a11',
    name: 'Coldplay',
    genres: ['Alternative Rock', 'Pop'],
    activeYears: '1997 - Present',
    location: 'London, England',
    biography:
      'Coldplay is a British band known for melodic stadium rock, widescreen arrangements, and anthems that balance emotional introspection with communal uplift.',
    songCount: 104,
    imageUrl: buildImageUrl('Coldplay band portrait, concert atmosphere, blue arena lights'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a12',
    name: 'Calvin Harris',
    genres: ['Dance', 'Electronic'],
    activeYears: '2007 - Present',
    location: 'Dumfries, Scotland',
    biography:
      'Calvin Harris is a Scottish DJ and producer whose crossover dance records, festival presence, and collaborations helped shape mainstream EDM and pop in the 2010s.',
    songCount: 63,
    imageUrl: buildImageUrl('Calvin Harris portrait, sleek electronic music aesthetic, dark club lighting'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a13',
    name: 'Cardi B',
    genres: ['Hip-Hop', 'Rap'],
    activeYears: '2015 - Present',
    location: 'New York City, USA',
    biography:
      'Cardi B is an American rapper known for sharp charisma, unfiltered delivery, and chart-dominating singles that blend humor, confidence, and pop accessibility.',
    songCount: 34,
    imageUrl: buildImageUrl('Cardi B portrait, luxury fashion styling, dramatic dark studio lighting'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a14',
    name: 'Miley Cyrus',
    genres: ['Pop', 'Rock'],
    activeYears: '2006 - Present',
    location: 'Franklin, Tennessee, USA',
    biography:
      'Miley Cyrus is an American singer-songwriter whose catalog spans pop, country-pop, glam-rock, and contemporary radio hits delivered with a distinctly raspy voice.',
    songCount: 72,
    imageUrl: buildImageUrl('Miley Cyrus portrait, edgy glam styling, moody studio light'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a15',
    name: 'SZA',
    genres: ['R&B', 'Neo Soul'],
    activeYears: '2012 - Present',
    location: 'St. Louis, Missouri, USA',
    biography:
      'SZA is an American singer-songwriter celebrated for diaristic lyricism, elastic melodies, and atmospheric R&B that feels intimate, messy, and modern.',
    songCount: 52,
    imageUrl: buildImageUrl('SZA portrait, soft green and amber lighting, editorial studio photo'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a16',
    name: 'Post Malone',
    genres: ['Pop', 'Hip-Hop'],
    activeYears: '2015 - Present',
    location: 'Syracuse, New York, USA',
    biography:
      'Post Malone is an American singer and rapper whose melodic hooks, genre-blending production, and laid-back delivery have produced a long run of crossover hits.',
    songCount: 78,
    imageUrl: buildImageUrl('Post Malone portrait, tattooed pop star, moody concert-inspired lighting'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a17',
    name: 'Olivia Rodrigo',
    genres: ['Pop', 'Alternative Pop'],
    activeYears: '2021 - Present',
    location: 'Temecula, California, USA',
    biography:
      'Olivia Rodrigo is an American singer-songwriter whose breakout success came through confessional songwriting, sharp pop-rock dynamics, and dramatic emotional hooks.',
    songCount: 32,
    imageUrl: buildImageUrl('Olivia Rodrigo portrait, purple spotlight, modern pop editorial photo'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a18',
    name: 'Rihanna',
    genres: ['Pop', 'R&B'],
    activeYears: '2005 - Present',
    location: 'Saint Michael, Barbados',
    biography:
      'Rihanna is a Barbadian singer, businesswoman, and performer whose catalog moves effortlessly across dance-pop, Caribbean influences, and contemporary R&B.',
    songCount: 110,
    imageUrl: buildImageUrl('Rihanna portrait, high-fashion lighting, sophisticated dark editorial backdrop'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a19',
    name: 'Kendrick Lamar',
    genres: ['Hip-Hop', 'Rap'],
    activeYears: '2003 - Present',
    location: 'Compton, California, USA',
    biography:
      'Kendrick Lamar is an American rapper and songwriter widely praised for conceptual albums, lyrical precision, and a body of work that bridges popular success with critical acclaim.',
    songCount: 70,
    imageUrl: buildImageUrl('Kendrick Lamar portrait, dramatic directional lighting, minimal dark background'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a20',
    name: 'AC/DC',
    genres: ['Rock', 'Hard Rock'],
    activeYears: '1973 - Present',
    location: 'Sydney, Australia',
    biography:
      'AC/DC is an iconic rock band whose hard-driving riffs, huge choruses, and blue-collar energy turned classic albums into staples of rock radio and live performance.',
    songCount: 156,
    imageUrl: buildImageUrl('ACDC band portrait, classic rock stage lighting, gritty concert photography'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a21',
    name: 'Adam Levine',
    genres: ['Pop', 'Rock'],
    activeYears: '2002 - Present',
    location: 'Los Angeles, California, USA',
    biography:
      'Adam Levine is an American singer best known for fronting Maroon 5 while also releasing solo material shaped by mainstream pop and adult contemporary songwriting.',
    songCount: 42,
    imageUrl: buildImageUrl('Adam Levine portrait, clean studio portrait, neutral dark lighting'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a22',
    name: 'Aloe Blacc',
    genres: ['Soul', 'Pop'],
    activeYears: '2003 - Present',
    location: 'Orange County, California, USA',
    biography:
      'Aloe Blacc is an American singer-songwriter whose catalog combines soul influences, uplifting pop writing, and socially aware themes delivered with warmth and clarity.',
    songCount: 28,
    imageUrl: buildImageUrl('Aloe Blacc portrait, soulful warm lighting, realistic studio photo'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a23',
    name: 'Beach Boys',
    genres: ['Pop', 'Rock'],
    activeYears: '1961 - Present',
    location: 'Hawthorne, California, USA',
    biography:
      'The Beach Boys are an American band whose harmonies, studio experimentation, and California imagery remain foundational to classic pop history.',
    songCount: 201,
    imageUrl: buildImageUrl('Beach Boys vintage band portrait, sunny retro color grade, realistic archival style'),
    albums: [],
    topSongs: [],
  },
  {
    id: 'a24',
    name: 'The Midnight Echo',
    genres: ['Alternative Rock', 'Synth-Pop'],
    activeYears: '2015 - Present',
    location: 'London, UK',
    biography:
      'The Midnight Echo is the project original featured band in this demo, built around neon-soaked synth textures, introspective themes, and late-night alternative-pop energy.',
    songCount: 22,
    imageUrl: buildImageUrl('Indie alternative band portrait, neon stage glow, dark cinematic atmosphere'),
    albums: [],
    topSongs: [],
  },
];

export const ARTISTS: Artist[] = ARTIST_SEEDS.map((artist) => ({
  ...artist,
  slug: slugify(artist.name),
  seoDescription: `Explore ${artist.name}'s biography, releases, songs, and credits on 52lyrics.`,
}));

const createAlbum = ({
  id,
  title,
  artistId,
  year,
  coverPrompt,
  trackNames,
  type = 'Album',
  releaseDate,
}: AlbumBlueprint): Album => {
  const artist = ARTISTS.find((entry) => entry.id === artistId);

  const album: Album = {
    id,
    slug: slugify(`${artist?.name || 'unknown-artist'}-${title}`),
    title,
    artistId,
    artistName: artist?.name || 'Unknown Artist',
    releaseDate: releaseDate || `${year}-01-01`,
    year,
    trackCount: trackNames.length,
    coverUrl: buildImageUrl(coverPrompt),
    type,
    tracks: [],
    seoDescription: `Browse ${title} by ${artist?.name || 'Unknown Artist'}, including track details and lyric availability.`,
  };

  album.tracks = trackNames.map((name, index) => ({
    id: `${id}_t${index + 1}`,
    slug: slugify(`${artist?.name || 'unknown-artist'}-${name}`),
    title: name,
    artistId,
    artistName: artist?.name || 'Unknown Artist',
    albumId: id,
    albumTitle: title,
    duration: DURATION_POOL[index % DURATION_POOL.length],
    trackNumber: index + 1,
    lyrics: createPlaceholderLyrics(),
    sections: createSections(),
    lyricsAvailability: 'metadata-only',
    rights: 'unavailable',
    writers: artist ? [artist.name, 'Collaborators'] : ['Unknown Artist'],
    producers: artist ? [artist.name, 'Studio Team'] : ['Studio Team'],
    copyright: `© ${year} ${artist?.name || 'Unknown Artist'} Records`,
    genres: artist?.genres,
    releaseYear: year,
    releaseDate: album.releaseDate,
    coverUrl: buildImageUrl(`${title} by ${artist?.name || 'Unknown Artist'} cover art`),
    description: `${name} is track ${index + 1} from ${title}, extending ${artist?.name || 'Unknown Artist'}'s ${artist?.genres?.join(', ') || 'pop'} palette with a polished studio arrangement.`,
    about: `This page highlights the song's place within ${title}, with release context, credits, and related tracks to make the catalog feel more complete even when full licensed lyrics are not embedded.`,
    themes: artist?.genres?.slice(0, 2) || ['Pop'],
    moods: ['Moody', 'Cinematic'],
    editorialNotes: [
      `Track ${index + 1} of ${trackNames.length} on ${title}.`,
      `Part of ${artist?.name || 'Unknown Artist'}'s ${year} release cycle.`,
    ],
    seoDescription: `Read credits, release context, themes, and lyric availability for ${name} by ${artist?.name || 'Unknown Artist'}.`,
  }));

  return album;
};

const ALBUM_BLUEPRINTS: AlbumBlueprint[] = [
  {
    id: 'alb1',
    title: 'Midnights',
    artistId: 'a7',
    year: 2022,
    coverPrompt: 'Midnights by Taylor Swift, moody blue retro album artwork, realistic',
    trackNames: ['Lavender Haze', 'Maroon', 'Anti-Hero', 'Snow On The Beach', "You're On Your Own, Kid", 'Midnight Rain', 'Bejeweled', 'Karma'],
  },
  {
    id: 'alb2',
    title: 'After Hours',
    artistId: 'a1',
    year: 2020,
    coverPrompt: 'After Hours by The Weeknd, red suit portrait, cinematic dark album art',
    trackNames: ['Alone Again', 'Too Late', 'Hardest To Love', 'Scared To Live', 'Snowchild', 'Escape From LA', 'Heartless', 'Faith', 'Blinding Lights', 'In Your Eyes', 'Save Your Tears'],
  },
  {
    id: 'alb3',
    title: 'Renaissance',
    artistId: 'a6',
    year: 2022,
    coverPrompt: 'Renaissance by Beyonce, silver chrome horse concept, premium album artwork',
    trackNames: ["I'm That Girl", 'Cozy', 'Alien Superstar', 'Cuff It', 'Energy', 'Break My Soul', 'Church Girl', "Virgo's Groove"],
  },
  {
    id: 'alb4',
    title: "Harry's House",
    artistId: 'a5',
    year: 2022,
    coverPrompt: "Harry's House by Harry Styles, minimalist room concept, polished album cover",
    trackNames: ['Music for a Sushi Restaurant', 'Late Night Talking', 'Grapejuice', 'As It Was', 'Daylight', 'Little Freak', 'Matilda', 'Cinema'],
  },
  {
    id: 'alb5',
    title: 'Future Nostalgia',
    artistId: 'a4',
    year: 2020,
    coverPrompt: 'Future Nostalgia by Dua Lipa, retro moon car concept, glossy disco artwork',
    trackNames: ['Future Nostalgia', "Don't Start Now", 'Cool', 'Physical', 'Levitating', 'Pretty Please', 'Hallucinate', 'Love Again'],
  },
  {
    id: 'alb6',
    title: 'Divide',
    artistId: 'a3',
    year: 2017,
    coverPrompt: 'Divide by Ed Sheeran, textured blue paint circle, clean album cover',
    trackNames: ['Eraser', 'Castle on the Hill', 'Dive', 'Shape of You', 'Perfect', 'Galway Girl', 'Happier', 'Supermarket Flowers'],
  },
  {
    id: 'alb7',
    title: '30',
    artistId: 'a2',
    year: 2021,
    coverPrompt: '30 by Adele, soft sepia portrait, premium editorial album art',
    trackNames: ['Strangers by Nature', 'Easy on Me', 'My Little Love', 'Cry Your Heart Out', 'Oh My God', 'Can I Get It', 'I Drink Wine'],
  },
  {
    id: 'alb8',
    title: 'Positions',
    artistId: 'a8',
    year: 2020,
    coverPrompt: 'Positions by Ariana Grande, upside down portrait, sleek pop album cover',
    trackNames: ['Shut Up', '34+35', 'Motive', 'Just Like Magic', 'Off the Table', 'Six Thirty', 'Positions', 'POV'],
  },
  {
    id: 'alb9',
    title: 'Happier Than Ever',
    artistId: 'a9',
    year: 2021,
    coverPrompt: 'Happier Than Ever by Billie Eilish, warm blonde portrait, muted album artwork',
    trackNames: ['Getting Older', "I Didn't Change My Number", 'Billie Bossa Nova', 'My Future', 'Oxytocin', 'NDA', 'Therefore I Am', 'Happier Than Ever'],
  },
  {
    id: 'alb10',
    title: '24K Magic',
    artistId: 'a10',
    year: 2016,
    coverPrompt: '24K Magic by Bruno Mars, luxury gold chains and purple lighting, stylish album art',
    trackNames: ['24K Magic', 'Chunky', 'Perm', "That's What I Like", 'Versace on the Floor', 'Finesse'],
  },
  {
    id: 'alb11',
    title: 'Music of the Spheres',
    artistId: 'a11',
    year: 2021,
    coverPrompt: 'Music of the Spheres by Coldplay, cosmic symbols on deep blue background, album art',
    trackNames: ['Higher Power', 'Humankind', 'Let Somebody Go', 'People of the Pride', 'Biutyful', 'My Universe'],
  },
  {
    id: 'alb12',
    title: '18 Months',
    artistId: 'a12',
    year: 2012,
    coverPrompt: '18 Months by Calvin Harris, clean electronic geometric cover, dark neon style',
    trackNames: ['Green Valley', 'Bounce', 'Feel So Close', 'We Found Love', 'Sweet Nothing', 'I Need Your Love'],
  },
  {
    id: 'alb13',
    title: 'Invasion of Privacy',
    artistId: 'a13',
    year: 2018,
    coverPrompt: 'Invasion of Privacy by Cardi B, bold luxe styling, high-fashion album cover',
    trackNames: ['Get Up 10', 'Drip', 'Bickenhead', 'Bodak Yellow', 'Be Careful', 'I Like It', 'Ring'],
  },
  {
    id: 'alb14',
    title: 'Endless Summer Vacation',
    artistId: 'a14',
    year: 2023,
    coverPrompt: 'Endless Summer Vacation by Miley Cyrus, rooftop sunlit portrait, deluxe pop artwork',
    trackNames: ['Flowers', 'Jaded', 'Rose Colored Lenses', 'Thousand Miles', 'You', 'River', 'Violet Chemistry'],
  },
  {
    id: 'alb15',
    title: 'SOS',
    artistId: 'a15',
    year: 2022,
    coverPrompt: 'SOS by SZA, ocean diving board concept, cinematic album cover',
    trackNames: ['SOS', 'Kill Bill', 'Seek & Destroy', 'Low', 'Love Language', 'Snooze', 'Shirt', 'Blind'],
  },
  {
    id: 'alb16',
    title: "Hollywood's Bleeding",
    artistId: 'a16',
    year: 2019,
    coverPrompt: "Hollywood's Bleeding by Post Malone, moody twilight portrait, dark album art",
    trackNames: ["Hollywood's Bleeding", 'Saint-Tropez', 'Enemies', 'Circles', 'Die for Me', 'Take What You Want', 'Sunflower'],
  },
  {
    id: 'alb17',
    title: 'GUTS',
    artistId: 'a17',
    year: 2023,
    coverPrompt: 'GUTS by Olivia Rodrigo, purple color palette, bold modern pop album cover',
    trackNames: ['All-American Bitch', 'Bad Idea Right?', 'Vampire', 'Lacy', 'Ballad of a Homeschooled Girl', 'Get Him Back!', 'Teenage Dream'],
  },
  {
    id: 'alb18',
    title: 'ANTI',
    artistId: 'a18',
    year: 2016,
    coverPrompt: 'ANTI by Rihanna, dark red abstract portrait, luxury album art',
    trackNames: ['Consideration', 'James Joint', 'Kiss It Better', 'Work', 'Desperado', 'Needed Me', 'Love on the Brain'],
  },
  {
    id: 'alb19',
    title: 'DAMN.',
    artistId: 'a19',
    year: 2017,
    coverPrompt: 'DAMN. by Kendrick Lamar, bold red portrait, stark album cover',
    trackNames: ['BLOOD.', 'DNA.', 'YAH.', 'ELEMENT.', 'FEEL.', 'LOYALTY.', 'HUMBLE.'],
  },
  {
    id: 'alb20',
    title: 'Back in Black',
    artistId: 'a20',
    year: 1980,
    coverPrompt: 'Back in Black by ACDC, minimal black embossed cover, classic rock style',
    trackNames: ['Hells Bells', 'Shoot to Thrill', 'What Do You Do for Money Honey', 'Given the Dog a Bone', 'Let Me Put My Love into You', 'Back in Black'],
  },
  {
    id: 'alb21',
    title: 'Lift Your Spirit',
    artistId: 'a22',
    year: 2014,
    coverPrompt: 'Lift Your Spirit by Aloe Blacc, uplifting soul album cover, warm sunlit portrait',
    trackNames: ['Wake Me Up', 'The Man', 'Love Is the Answer', 'Can You Do This', 'Ticking Bomb'],
  },
  {
    id: 'alb22',
    title: 'Pet Sounds',
    artistId: 'a23',
    year: 1966,
    coverPrompt: 'Pet Sounds by The Beach Boys, retro 1960s aesthetic, warm archival album art',
    trackNames: ["Wouldn't It Be Nice", 'You Still Believe in Me', "That's Not Me", "Don't Talk (Put Your Head on My Shoulder)", "I'm Waiting for the Day", 'Sloop John B', 'God Only Knows'],
  },
  {
    id: 'alb23',
    title: 'Neon Nights',
    artistId: 'a24',
    year: 2023,
    coverPrompt: 'Neon Nights by The Midnight Echo, glowing synthwave geometric symbols, dark blue album cover',
    trackNames: ['City Lights', 'Echoes of Yesterday', 'Digital Hearts', 'Running from the Sun', 'Concrete Jungle'],
  },
  {
    id: 'alb24',
    title: 'Retrograde',
    artistId: 'a24',
    year: 2021,
    coverPrompt: 'Retrograde by The Midnight Echo, desert highway at sunset, cinematic indie album art',
    trackNames: ['Back to the Start', 'Fading Signals', 'Starlit Drive', 'Lost Frequency', 'Waves'],
  },
  {
    id: 'alb25',
    title: 'Lost Stars',
    artistId: 'a21',
    year: 2014,
    coverPrompt: 'Lost Stars by Adam Levine, minimal acoustic single artwork, dark midnight palette',
    trackNames: ['Lost Stars'],
    type: 'Single',
  },
];

export const ALBUMS: Album[] = ALBUM_BLUEPRINTS.map(createAlbum);

ARTISTS.forEach((artist) => {
  artist.albums = ALBUMS.filter((album) => album.artistId === artist.id);
  artist.topSongs = artist.albums.flatMap((album) => album.tracks).slice(0, 5);
});

const findSong = (title: string, artistName: string) =>
  ALBUMS.flatMap((album) => album.tracks).find(
    (track) => track.title === title && track.artistName === artistName,
  );

const applySongOverrides = (
  title: string,
  artistName: string,
  overrides: Partial<Song>,
) => {
  const track = findSong(title, artistName);
  if (track) {
    Object.assign(track, overrides);
  }
};

applySongOverrides('Blinding Lights', 'The Weeknd', {
  writers: ['Abel Tesfaye', 'Ahmad Balshe', 'Jason Quenneville', 'Max Martin', 'Oscar Holter'],
  producers: ['Max Martin', 'Oscar Holter', 'The Weeknd'],
  description: 'A synth-pop single framed here through verified release metadata and editorial context.',
  about: 'This catalog entry provides credits, themes, and album context. Full lyrics are not available in this rights-safe release.',
  themes: ['Longing', 'Nightlife', 'Isolation'],
  moods: ['Urgent', 'Neon', 'Melancholic'],
  editorialNotes: ['Explore the wider After Hours release through the album and artist pages.'],
});

applySongOverrides('Anti-Hero', 'Taylor Swift', {
  writers: ['Taylor Swift', 'Jack Antonoff'],
  producers: ['Taylor Swift', 'Jack Antonoff'],
  description:
    'A self-aware pop record that turns insecurity, humor, and confession into a sharply modern lead single.',
  about:
    'Anti-Hero frames internal doubt as the central antagonist, which is why it resonates so strongly as both a hooky pop song and an intimate piece of songwriting.',
  themes: ['Self-doubt', 'Fame', 'Anxiety', 'Reflection'],
  moods: ['Confessional', 'Wry', 'Late-night', 'Direct'],
  editorialNotes: [
    'Built around conversational writing rather than ornate metaphor.',
    'Balances vulnerability with a knowing pop sensibility, making the song feel intimate but still radio-sized.',
    'Works especially well as an entry point into the broader mood of Midnights.',
  ],
});

applySongOverrides('As It Was', 'Harry Styles', {
  writers: ['Harry Styles', 'Kid Harpoon', 'Tyler Johnson'],
  producers: ['Kid Harpoon', 'Tyler Johnson'],
  description:
    'A lean pop song that sounds bright on first listen but carries a quiet emotional distance underneath.',
  about:
    'As It Was captures transition and disconnection with unusual restraint, using brisk rhythm and light textures to carry heavier emotional subtext.',
  themes: ['Change', 'Distance', 'Modern loneliness'],
  moods: ['Bittersweet', 'Airy', 'Nostalgic'],
  editorialNotes: [
    'The production stays light and kinetic, which sharpens the contrast with its emotional core.',
    'A good example of Harry Styles moving toward economical, melody-first songwriting.',
  ],
});

applySongOverrides('Flowers', 'Miley Cyrus', {
  writers: ['Miley Cyrus', 'Michael Pollack', 'Gregory Hein'],
  producers: ['Kid Harpoon', 'Tyler Johnson'],
  description:
    'A self-possessed pop-rock single built around personal independence and a clean, instantly memorable refrain.',
  about:
    'Flowers lands as a reclamation anthem, using conversational detail and mid-tempo control instead of vocal excess to deliver its point.',
  themes: ['Self-worth', 'Independence', 'Recovery'],
  moods: ['Confident', 'Warm', 'Resolute'],
  editorialNotes: [
    'The song’s appeal comes from how calmly it states its thesis rather than overselling it.',
    'Its lyrical framing turns a breakup narrative into a statement of autonomy.',
  ],
});

applySongOverrides('Kill Bill', 'SZA', {
  writers: ['SZA', 'Carter Lang', 'Rob Bisel'],
  producers: ['Carter Lang', 'Rob Bisel'],
  description:
    'A darkly playful R&B-pop record that turns jealousy and fixation into an instantly recognizable hook.',
  about:
    'Kill Bill works because it treats extreme emotions with a deceptively breezy surface, letting the tension live in the contrast between the lyric idea and the smooth arrangement.',
  themes: ['Jealousy', 'Obsession', 'Fantasy'],
  moods: ['Silky', 'Darkly comic', 'Sharp'],
  editorialNotes: [
    'The writing leans into exaggeration to communicate emotional chaos rather than literal action.',
    'Its melodic ease makes the song feel approachable even while the premise stays provocative.',
  ],
});

applySongOverrides('Levitating', 'Dua Lipa', {
  writers: ['Dua Lipa', 'Clarence Coffee Jr.', 'Sarah Hudson', 'Stephen Kozmeniuk'],
  producers: ['Koz', 'Stuart Price'],
  description:
    'A disco-pop standout that turns flirtation into lift-off with crisp grooves and bright melodic phrasing.',
  about:
    'Levitating is one of the clearest expressions of Future Nostalgia’s mission: modern pop writing filtered through disco momentum and glossy rhythmic precision.',
  themes: ['Chemistry', 'Momentum', 'Playfulness'],
  moods: ['Sparkling', 'Upbeat', 'Dancefloor-ready'],
  editorialNotes: [
    'Works as a strong bridge between album-listening and playlist culture.',
    'The groove stays lightweight, but the chorus is engineered for repeat play.',
  ],
});

applySongOverrides('Shape of You', 'Ed Sheeran', {
  writers: ['Ed Sheeran', 'Steve Mac', 'Johnny McDaid'],
  producers: ['Steve Mac'],
  description:
    'A stripped-back pop hit driven by rhythm-first writing, playful phrasing, and a minimalist hook structure.',
  about:
    'Shape of You shows how little arrangement is needed when the rhythmic idea is strong enough to carry the whole record.',
  themes: ['Attraction', 'Momentum', 'Night out'],
  moods: ['Playful', 'Light', 'Rhythmic'],
  editorialNotes: [
    'Its songwriting is built around cadence and percussive phrasing more than harmonic complexity.',
  ],
});

applySongOverrides('Easy on Me', 'Adele', {
  writers: ['Adele', 'Greg Kurstin'],
  producers: ['Greg Kurstin'],
  description:
    'A piano-led ballad that foregrounds emotional clarity and restraint rather than vocal theatrics.',
  about:
    'Easy on Me frames personal change as a plea for understanding, which gives the song its quiet authority and broad emotional reach.',
  themes: ['Change', 'Vulnerability', 'Grace'],
  moods: ['Tender', 'Reflective', 'Open-hearted'],
  editorialNotes: [
    'The arrangement stays intentionally spare to keep focus on voice and lyric framing.',
  ],
});

type OriginalSongDetail = {
  title: string;
  description: string;
  themes: string[];
  moods: string[];
  sections: LyricSection[];
};

const ORIGINAL_SONGS: OriginalSongDetail[] = [
  {
    title: 'City Lights',
    description: 'A nocturnal opening track about finding direction in a city that never fully goes dark.',
    themes: ['Nightlife', 'Belonging', 'Motion'],
    moods: ['Neon', 'Restless', 'Hopeful'],
    sections: [
      { type: 'verse', number: 1, content: ['Rain writes silver on the avenue', 'Last train humming like it always knew', 'Every window holds a borrowed scene', 'I walk the spaces flickering between'] },
      { type: 'chorus', content: ['City lights, keep a place for me', 'Draw a map in electricity', 'If the morning asks where I have been', 'Say I found my way beneath your skin'] },
      { type: 'verse', number: 2, content: ['Taxi radios are talking low', 'Crosswalk constellations come and go', 'In the glass my old reflection fades', 'New names gather in the light we made'] },
      { type: 'outro', content: ['City lights, do not disappear', 'I can see the next turn from here'] },
    ],
  },
  {
    title: 'Echoes of Yesterday',
    description: 'Warm synths carry a reflection on memory, distance, and the parts of a past life that remain audible.',
    themes: ['Memory', 'Distance', 'Change'],
    moods: ['Nostalgic', 'Tender', 'Widescreen'],
    sections: [
      { type: 'verse', number: 1, content: ['Dust on the speakers, tape on the floor', 'Your summer jacket still hangs by the door', 'A half-spoken promise caught in the grain', 'Turns with the record and starts up again'] },
      { type: 'chorus', content: ['Echoes of yesterday, soften and sway', 'You are not calling, but I hear you anyway', 'Time keeps the rhythm, the rooms rearrange', 'Some things grow quieter, some never change'] },
      { type: 'bridge', content: ['I open the curtains and let the day through', 'The house becomes different, the memory stays true'] },
      { type: 'outro', content: ['The needle lifts gently, the silence can stay', 'I leave one light on for yesterday'] },
    ],
  },
  {
    title: 'Digital Hearts',
    description: 'A bright, clipped synth-pop song about trying to make an honest connection through imperfect screens.',
    themes: ['Connection', 'Technology', 'Vulnerability'],
    moods: ['Bright', 'Urgent', 'Open'],
    sections: [
      { type: 'verse', number: 1, content: ['Blue glow morning, message unsent', 'We measure affection in battery percent', 'Your face freezes halfway into a smile', 'I wait through the static another little while'] },
      { type: 'pre-chorus', content: ['No perfect signal, no faultless start', 'Just human hands around a digital heart'] },
      { type: 'chorus', content: ['Meet me where the pixels end', 'Speak without a filter, stay without pretend', 'If the whole connection falls apart', 'I will still remember your digital heart'] },
      { type: 'outro', content: ['Screen goes dark, the room feels wide', 'Your honest words are still alive inside'] },
    ],
  },
  {
    title: 'Running from the Sun',
    description: 'A fast-moving road song about postponing an ending until the horizon finally catches up.',
    themes: ['Escape', 'Time', 'Reckoning'],
    moods: ['Driving', 'Defiant', 'Bittersweet'],
    sections: [
      { type: 'verse', number: 1, content: ['Coffee gone cold at a quarter to five', 'White lines counting to keep us alive', 'The east turns orange in the rear-view glass', 'We make another promise the morning will pass'] },
      { type: 'chorus', content: ['Running from the sun with the radio loud', 'Two small shadows under one long cloud', 'Night is a country we cannot outrun', 'Still we keep moving, running from the sun'] },
      { type: 'bridge', content: ['When daylight finds us, say what we mean', 'No more hiding in the hours between'] },
      { type: 'outro', content: ['The road turns gold, our reasons come undone', 'We slow down together and face the sun'] },
    ],
  },
  {
    title: 'Concrete Jungle',
    description: 'A grounded city anthem about protecting softness inside a hard and hurried place.',
    themes: ['Resilience', 'Community', 'City life'],
    moods: ['Steady', 'Gritty', 'Uplifting'],
    sections: [
      { type: 'verse', number: 1, content: ['Sirens fold into the evening rain', 'Flowers push between the platform and the train', 'Neighbors trade a wave across the fire escape', 'Small acts of mercy give the skyline shape'] },
      { type: 'chorus', content: ['In the concrete jungle we learn to grow', 'Roots in the cracks where the warm winds blow', 'No room is empty when somebody knows', 'How to keep a light where the hard world goes'] },
      { type: 'verse', number: 2, content: ['Corner-store music spills into the street', 'Old friends arguing above the summer heat', 'Every locked door has a story behind', 'Every crowded block leaves a doorway to find'] },
      { type: 'outro', content: ['Steel all around us, green in the soul', 'We make a garden wherever we go'] },
    ],
  },
  {
    title: 'Back to the Start',
    description: 'A patient reset song about choosing to begin again without pretending the past did not happen.',
    themes: ['Renewal', 'Honesty', 'Return'],
    moods: ['Reflective', 'Patient', 'Warm'],
    sections: [
      { type: 'verse', number: 1, content: ['We kept the receipts from the plans that failed', 'Names of the stations and roads we bailed', 'Nothing is wasted if something is learned', 'Even a bridge can be crossed when it burned'] },
      { type: 'chorus', content: ['Take me back to the start, not back in time', 'Keep every scar and redraw every line', 'We know what breaks and we know what is hard', 'Take me as I am, back to the start'] },
      { type: 'bridge', content: ['No clean slate, no vanishing act', 'Just room for a future that carries the facts'] },
      { type: 'outro', content: ['Open the window, unfasten the heart', 'Meet me right here, back at the start'] },
    ],
  },
  {
    title: 'Fading Signals',
    description: 'A spacious ballad about recognizing when a relationship has become mostly interference.',
    themes: ['Distance', 'Acceptance', 'Communication'],
    moods: ['Spacious', 'Melancholic', 'Calm'],
    sections: [
      { type: 'verse', number: 1, content: ['Your voice arrives in pieces after midnight', 'A word, then weather, then a field of white', 'I answer slowly though the line has gone', 'The quiet tells me what we both knew all along'] },
      { type: 'chorus', content: ['Fading signals, thinning through the air', 'I keep listening though nobody is there', 'No final thunder, no dramatic goodbye', 'Just a smaller sound beneath a wider sky'] },
      { type: 'bridge', content: ['I set the receiver down with care', 'Some endings vanish instead of tear'] },
      { type: 'outro', content: ['One last flicker, then the room is still', 'I wish you clearly and always will'] },
    ],
  },
  {
    title: 'Starlit Drive',
    description: 'An open-road synth anthem about friendship, shared silence, and a destination that matters less than the ride.',
    themes: ['Friendship', 'Freedom', 'Night drive'],
    moods: ['Expansive', 'Joyful', 'Dreamlike'],
    sections: [
      { type: 'verse', number: 1, content: ['Dashboard dust and a paper cup', 'A road sign says the coast is coming up', 'You tap the rhythm on the passenger door', 'We have no answer and we do not need one more'] },
      { type: 'chorus', content: ['On a starlit drive, every mile turns blue', 'The world grows quiet enough to tell the truth', 'No finish line, no reason to arrive', 'We are fully here on this starlit drive'] },
      { type: 'verse', number: 2, content: ['Mountains disappear behind the glass', 'Headlights greet us, then they quickly pass', 'We trade old stories for the cooling air', 'The road keeps every secret that we share'] },
      { type: 'outro', content: ['Morning at the shoreline, engine barely alive', 'We carry home the starlight from the drive'] },
    ],
  },
  {
    title: 'Lost Frequency',
    description: 'A tense electronic track about searching for a voice that once cut cleanly through the noise.',
    themes: ['Search', 'Identity', 'Noise'],
    moods: ['Tense', 'Electric', 'Searching'],
    sections: [
      { type: 'verse', number: 1, content: ['Turn the dial slowly past the weather report', 'Past the late-night preacher and the shipping port', 'Once you were a station I could always find', 'Now every number leaves another sound behind'] },
      { type: 'chorus', content: ['Lost frequency, come back through', 'Cut a narrow channel where the words get through', 'I am holding steady while the circuits breathe', 'Calling through the noise on a lost frequency'] },
      { type: 'bridge', content: ['Maybe the signal changed its name', 'Maybe I am not tuned the same'] },
      { type: 'outro', content: ['Static into silence, silence into sea', 'I stop chasing echoes on a lost frequency'] },
    ],
  },
  {
    title: 'Waves',
    description: 'A quiet closing song that treats change as a rhythm to move with rather than a force to defeat.',
    themes: ['Change', 'Release', 'Nature'],
    moods: ['Quiet', 'Restorative', 'Resolute'],
    sections: [
      { type: 'verse', number: 1, content: ['The tide rearranges what we wrote in sand', 'Takes every castle with an even hand', 'I used to build higher and guard every wall', 'Now I leave a doorway and listen to it fall'] },
      { type: 'chorus', content: ['Let it come in waves, let it leave that way', 'Nothing has to hold its shape forever and a day', 'I can lose the shoreline and still know where I stand', 'Let it come in waves, let it open up my hands'] },
      { type: 'bridge', content: ['The moon does not command the sea to stay', 'It offers light and lets it move away'] },
      { type: 'outro', content: ['One breath returning, one carried away', 'I meet the changing water and call it a day'] },
    ],
  },
];

ORIGINAL_SONGS.forEach((detail) => {
  const song = findSong(detail.title, 'The Midnight Echo');
  if (!song) return;
  const lyrics = detail.sections.map((section) => section.content.join('\n')).join('\n\n');
  Object.assign(song, {
    ...detail,
    lyrics,
    lyricsAvailability: 'full',
    rights: 'original',
    writers: ['Mara Vale', 'Jon Bell', 'Iris North'],
    producers: ['The Midnight Echo', 'Noah Reed'],
    copyright: '© 2026 52lyrics Originals',
    about: `${detail.description} Written for the original 52lyrics catalog, this track belongs to The Midnight Echo's connected late-night songbook.`,
    editorialNotes: [
      'An original composition created for the rights-safe 52lyrics release.',
      'Read the lyric sections in sequence or use the lyric rail to move through the song.',
    ],
    seoDescription: `Read the complete original lyrics to ${detail.title} by The Midnight Echo on 52lyrics.`,
  });
});

ARTISTS.forEach((artist) => {
  artist.songCount = artist.albums.reduce((total, album) => total + album.trackCount, 0);
  artist.topSongs = artist.albums.flatMap((album) => album.tracks).slice(0, 5);
});

export const HOT_SONGS: Song[] = [
  findSong('Anti-Hero', 'Taylor Swift'),
  findSong('Blinding Lights', 'The Weeknd'),
  findSong('As It Was', 'Harry Styles'),
  findSong('Flowers', 'Miley Cyrus'),
  findSong('Kill Bill', 'SZA'),
].filter(Boolean) as Song[];

export const MOCK_DATA = {
  artists: ARTISTS,
  albums: ALBUMS,
  hotSongs: HOT_SONGS,
};
