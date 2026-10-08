import { ArrowUpRight, Disc3, Mic2, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import type { Album, Artist, CatalogItemRef, Song } from '../../types';
import { albumPath, artistPath, resolveCatalogItem, songPath } from '../../data/catalog';
import { AvailabilityBadge } from './Status';

export function CatalogCard({ itemRef, index }: { itemRef: CatalogItemRef; index?: number }) {
  const item = resolveCatalogItem(itemRef);
  if (!item) return null;

  if (itemRef.type === 'song') {
    const song = item as Song;
    return (
      <Link to={songPath(song)} className="catalog-card">
        <img src={song.coverUrl} alt="" width="160" height="160" loading="lazy" decoding="async" />
        <div className="catalog-card__body">
          <div className="catalog-card__meta"><Mic2 aria-hidden="true" /><span>Song</span><AvailabilityBadge song={song} /></div>
          <h3>{song.title}</h3>
          <p>{song.artistName}{(song.metadataSource || song.releaseYear === null) && <small className="catalog-card__edition">{song.albumTitle} · {song.releaseYear ?? 'Undated text'}</small>}</p>
        </div>
        {index !== undefined && <span className="catalog-card__index">{String(index + 1).padStart(2, '0')}</span>}
        <ArrowUpRight className="catalog-card__arrow" aria-hidden="true" />
      </Link>
    );
  }

  if (itemRef.type === 'album') {
    const album = item as Album;
    return (
      <Link to={albumPath(album)} className="catalog-card">
        <img src={album.coverUrl} alt="" width="160" height="160" loading="lazy" decoding="async" />
        <div className="catalog-card__body">
          <div className="catalog-card__meta"><Disc3 aria-hidden="true" /><span>{album.type} · {album.type === 'Songbook' ? (album.year === null ? 'Author-published texts' : 'Historical texts') : album.year}</span></div>
          <h3>{album.title}</h3>
          <p>{album.artistName}</p>
        </div>
        {index !== undefined && <span className="catalog-card__index">{String(index + 1).padStart(2, '0')}</span>}
        <ArrowUpRight className="catalog-card__arrow" aria-hidden="true" />
      </Link>
    );
  }

  const artist = item as Artist;
  return (
    <Link to={artistPath(artist)} className="catalog-card">
      <img src={artist.imageUrl} alt="" width="160" height="160" loading="lazy" decoding="async" />
      <div className="catalog-card__body">
        <div className="catalog-card__meta"><UserRound aria-hidden="true" /><span>{artist.role === 'Songwriter' ? 'Writer' : 'Artist'} · {artist.location}</span></div>
        <h3>{artist.name}</h3>
        <p>{artist.genres.join(' · ')}</p>
      </div>
      {index !== undefined && <span className="catalog-card__index">{String(index + 1).padStart(2, '0')}</span>}
      <ArrowUpRight className="catalog-card__arrow" aria-hidden="true" />
    </Link>
  );
}
