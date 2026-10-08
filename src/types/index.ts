export type CatalogItemType = 'song' | 'artist' | 'album';
export type LyricsAvailability = 'full' | 'metadata-only';
export type RightsStatus = 'original' | 'licensed' | 'public-domain' | 'unavailable';

export interface ImageCredit {
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  attribution?: string;
}

export interface MetadataSource {
  provider: 'MusicBrainz' | 'Wikidata';
  url: string;
  license: 'CC0-1.0';
  retrievedAt: string;
  edition?: string;
}

export interface LyricSource {
  provider: 'Wikisource' | 'Tom Lehrer';
  url: string;
  revisionUrl: string;
  retrievedAt: string;
  edition: string;
  license: 'Public domain';
  evidenceUrl: string;
  rightsNote: string;
  transcriptionLicenseUrl: string;
  documentSha256?: string;
  documentType?: 'lyric-sheet-pdf' | 'score-pdf';
  underlyingWork?: {
    title: string;
    writers: string[];
    evidenceUrls: string[];
    rightsNote: string;
  };
}

export interface LyricSection {
  type: 'intro' | 'verse' | 'chorus' | 'pre-chorus' | 'bridge' | 'outro';
  number?: number;
  label?: string;
  language?: 'en' | 'es';
  content: string[];
}

export interface Song {
  metadataSource?: MetadataSource;
  id: string;
  slug: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumTitle: string;
  duration: string;
  trackNumber: number;
  discNumber?: number;
  discTrackNumber?: number;
  lyrics: string;
  sections: LyricSection[];
  lyricsAvailability: LyricsAvailability;
  rights: RightsStatus;
  source?: LyricSource;
  writers: string[];
  producers: string[];
  copyright: string;
  genres: string[];
  coverUrl: string;
  releaseYear: number | null;
  releaseDate: string;
  description: string;
  about: string;
  themes: string[];
  moods: string[];
  editorialNotes: string[];
  seoDescription: string;
}

export interface Album {
  metadataSource?: MetadataSource;
  id: string;
  slug: string;
  title: string;
  artistId: string;
  artistName: string;
  releaseDate: string;
  year: number | null;
  trackCount: number;
  coverUrl: string;
  tracks: Song[];
  type: 'Album' | 'Single' | 'EP' | 'Songbook';
  seoDescription: string;
}

export interface Artist {
  metadataSource?: MetadataSource;
  profileSource?: MetadataSource;
  alternateNames?: string[];
  imageCredit?: ImageCredit;
  entityType?: 'Person' | 'MusicGroup';
  timelineLabel?: string;
  role?: 'Songwriter';
  sourceUrl?: string;
  id: string;
  slug: string;
  name: string;
  genres: string[];
  activeYears: string;
  location: string;
  biography: string;
  songCount: number;
  imageUrl: string;
  albums: Album[];
  topSongs: Song[];
  seoDescription: string;
}

export interface CatalogItemRef {
  type: CatalogItemType;
  id: string;
  savedAt?: number;
}

export interface DiscoveryCollection {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  accent: 'coral' | 'iris' | 'cream';
  itemRefs: CatalogItemRef[];
  themes: string[];
  moods: string[];
}

export interface SearchResults {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  total: number;
}
