export interface LyricSection {
  type: 'intro' | 'verse' | 'chorus' | 'pre-chorus' | 'bridge' | 'outro';
  number?: number;
  content: string[];
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumTitle?: string;
  duration: string;
  trackNumber: number;
  lyrics: string;
  sections: LyricSection[];
  writers: string[];
  copyright: string;
  genres?: string[];
  coverUrl?: string;
  releaseYear?: number;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  releaseDate: string;
  year: number;
  trackCount: number;
  coverUrl?: string;
  tracks: Song[];
  type: 'Album' | 'Single' | 'EP';
}

export interface Artist {
  id: string;
  name: string;
  genres: string[];
  activeYears: string;
  location: string;
  biography: string;
  songCount: number;
  imageUrl?: string;
  albums: Album[];
  topSongs?: Song[];
}
