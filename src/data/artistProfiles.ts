import profiles from './imported/artist-profiles.json';

export interface ArtistProfile {
  wikidataId: string;
  mbid: string;
  name: string;
  description: string | null;
  genres: { id: string; name: string }[];
  sourceUrl: string;
  queryUrl: string;
  sourceSha256: string;
  retrievedAt: string;
}

export const ARTIST_PROFILES = profiles.records as ArtistProfile[];
export const artistProfilesByIdentity = new Map(ARTIST_PROFILES.map((record) => [record.wikidataId, record]));
