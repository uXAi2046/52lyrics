import { useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router';
import { SaveButton, ShareButton } from '../components/ui/Actions';
import { AvailabilityBadge, EmptyState } from '../components/ui/Status';
import { MetadataCredit } from '../components/ui/SourceCredit';
import { albumPath, artistPath, findAlbum, findArtist, songPath } from '../data/catalog';
import { useLibraryStore } from '../store/library';
import { serializeStructuredData } from '../data/structuredData';

export const meta = ({ params }: { params: { albumId?: string } }) => {
  const album = findAlbum(params.albumId);
  return [
    { title: album ? `${album.title} by ${album.artistName} — 52lyrics` : 'Album not found — 52lyrics' },
    { name: 'description', content: album?.seoDescription || 'The requested album is not in the 52lyrics catalog.' },
  ];
};

export default function AlbumDetails() {
  const { albumId } = useParams();
  const album = findAlbum(albumId);
  const recordView = useLibraryStore((state) => state.recordView);

  useEffect(() => {
    if (album) recordView('album', album.id);
  }, [album, recordView]);

  if (!album) {
    return <div className="shell page"><EmptyState eyebrow="404 · Album" title="This release is not in the catalog." description="Return to Discover to find another route into the music." action={<Link to="/discover">Open Discover <ArrowRight aria-hidden="true" /></Link>} /></div>;
  }
  if (albumId !== album.slug) return <Navigate to={albumPath(album)} replace />;
  const artist = findArtist(album.artistId);
  const multipleDiscs = album.tracks.some((song) => (song.discNumber || 1) > 1);

  return (
    <div className="shell page detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData({
          '@context': 'https://schema.org',
          '@type': album.type === 'Songbook' ? 'CreativeWorkSeries' : 'MusicAlbum',
          name: album.title,
          ...(album.type === 'Songbook' ? { description: album.seoDescription, about: { '@type': 'Person', name: album.artistName } } : { datePublished: album.releaseDate, numTracks: album.trackCount, byArtist: { '@type': artist?.entityType || 'MusicGroup', name: album.artistName } }),
          url: `${__SITE_URL__}${albumPath(album)}`,
        }) }}
      />
      <Link to={artist ? artistPath(artist) : '/artists'} className="back-link"><ArrowLeft aria-hidden="true" /> {album.artistName}</Link>
      <header className="album-hero">
        <div className="album-hero__art"><img src={album.coverUrl} alt="" width="720" height="720" /><span>52L / {album.id.toUpperCase()}</span></div>
        <div className="album-hero__copy">
          <span className="eyebrow">{album.type} · {album.type === 'Songbook' ? (album.year === null ? 'Author-published texts' : 'Historical texts') : album.year} · {album.trackCount} {album.type === 'Songbook' ? (album.trackCount === 1 ? 'text' : 'texts') : 'tracks'}</span>
          <h1>{album.title}</h1>
          <Link to={artist ? artistPath(artist) : '/artists'}>{album.artistName} <ArrowRight aria-hidden="true" /></Link>
          <p>{album.seoDescription}</p>
          <MetadataCredit source={album.metadataSource} />
          {album.metadataSource && <p><Link className="text-link" to="/guides/follow-a-song-to-its-release">How to read a sourced release edition <ArrowRight aria-hidden="true" /></Link></p>}
          {album.metadataSource && <p className="source-credit">52lyrics abstract catalog artwork; not the original album cover.</p>}
          <div className="detail-actions"><SaveButton type="album" id={album.id} /><ShareButton title={album.title} text={album.seoDescription} /></div>
        </div>
      </header>

      <section className="track-list">
        <header><span className="eyebrow">Sequence</span><h2>{album.type === 'Songbook' ? 'Inside the songbook.' : 'Track by track.'}</h2></header>
        <ol>
          {album.tracks.map((song) => (
            <li key={song.id}>
              <span aria-label={multipleDiscs ? `Disc ${song.discNumber}, track ${song.discTrackNumber}` : undefined}>{multipleDiscs ? `${song.discNumber}.${String(song.discTrackNumber).padStart(2, '0')}` : String(song.trackNumber).padStart(2, '0')}</span>
              <Link to={songPath(song)}><strong>{song.title}</strong><small>{song.duration ? `${song.duration} · ` : ''}{song.writers.join(', ')}</small></Link>
              <AvailabilityBadge song={song} />
              <ArrowRight aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
