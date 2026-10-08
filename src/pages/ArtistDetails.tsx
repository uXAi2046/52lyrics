import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router';
import { SaveButton, ShareButton } from '../components/ui/Actions';
import { CatalogCard } from '../components/ui/CatalogCard';
import { EmptyState } from '../components/ui/Status';
import { MetadataCredit, PhotoCredit } from '../components/ui/SourceCredit';
import { artistPath, findArtist } from '../data/catalog';
import { useLibraryStore } from '../store/library';
import { serializeStructuredData } from '../data/structuredData';

export const meta = ({ params }: { params: { artistId?: string } }) => {
  const artist = findArtist(params.artistId);
  return [
    { title: artist ? `${artist.name} — songs and albums | 52lyrics` : 'Artist not found — 52lyrics' },
    { name: 'description', content: artist?.seoDescription || 'The requested artist is not in the 52lyrics catalog.' },
  ];
};

export default function ArtistDetails() {
  const { artistId } = useParams();
  const artist = findArtist(artistId);
  const recordView = useLibraryStore((state) => state.recordView);

  useEffect(() => {
    if (artist) recordView('artist', artist.id);
  }, [artist, recordView]);

  if (!artist) {
    return <div className="shell page"><EmptyState eyebrow="404 · Artist" title="This artist is not in the catalog." description="The link may be outdated, or the artist has not been indexed yet." action={<Link to="/artists">Open artist index <ArrowRight aria-hidden="true" /></Link>} /></div>;
  }
  if (artistId !== artist.slug) return <Navigate to={artistPath(artist)} replace />;
  const mixedShelf = artist.albums.some((album) => album.type === 'Songbook') && artist.albums.some((album) => album.type !== 'Songbook');

  return (
    <div className="shell page detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData({
          '@context': 'https://schema.org',
          '@type': artist.entityType || (artist.role === 'Songwriter' ? 'Person' : 'MusicGroup'),
          name: artist.name,
          genre: artist.genres,
          url: `${__SITE_URL__}${artistPath(artist)}`,
          description: artist.biography,
        }) }}
      />
      <Link to="/artists" className="back-link"><ArrowLeft aria-hidden="true" /> Artist index</Link>
      <header className="artist-hero">
        <div className="artist-hero__image"><img src={artist.imageUrl} alt="" width="640" height="640" /><span>{artist.slug.toUpperCase()}</span></div>
        <div className="artist-hero__copy">
          <span className="eyebrow">{artist.role === 'Songwriter' ? 'Writer file · Lifespan' : artist.timelineLabel ? `Artist file · ${artist.timelineLabel}` : 'Artist file'} · {artist.activeYears}</span>
          <h1>{artist.name}</h1>
          <p className="artist-hero__location"><MapPin aria-hidden="true" /> {artist.location}</p>
          <p className="artist-hero__bio">{artist.biography}</p>
          {artist.sourceUrl && <p><a className="text-link" href={artist.sourceUrl} target="_blank" rel="noreferrer">Author reference on Wikisource</a></p>}
          <MetadataCredit source={artist.metadataSource} />
          <MetadataCredit source={artist.profileSource} />
          <PhotoCredit credit={artist.imageCredit} />
          <div className="tag-list">{artist.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
          <div className="detail-actions"><SaveButton type="artist" id={artist.id} /><ShareButton title={artist.name} text={artist.seoDescription} /></div>
        </div>
      </header>

      <section className="detail-section">
        <header><div><span className="eyebrow">First five</span><h2>Start with these songs.</h2></div></header>
        <div className="catalog-grid">
          {artist.topSongs.map((song, index) => <CatalogCard key={song.id} itemRef={{ type: 'song', id: song.id }} index={index} />)}
        </div>
      </section>

      <section className="detail-section">
        <header><div><span className="eyebrow">{mixedShelf ? 'Catalog shelf' : artist.role === 'Songwriter' ? 'Reading shelf' : 'Discography'}</span><h2>{mixedShelf ? 'Releases and songbooks.' : artist.role === 'Songwriter' ? 'Songbooks in the catalog.' : 'Releases in the catalog.'}</h2></div><span>{artist.albums.length} {mixedShelf ? 'catalog entries' : artist.role === 'Songwriter' ? 'songbook' : artist.albums.length === 1 ? 'release' : 'releases'}</span></header>
        <div className="catalog-grid">
          {artist.albums.map((album, index) => <CatalogCard key={album.id} itemRef={{ type: 'album', id: album.id }} index={index} />)}
        </div>
      </section>
    </div>
  );
}
