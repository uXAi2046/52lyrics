import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Bookmark, CornerDownRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router';
import GlobalSearch from '../components/search/GlobalSearch';
import { SaveButton } from '../components/ui/Actions';
import { PhotoCredit } from '../components/ui/SourceCredit';
import { ARTISTS, albumPath, artistPath, findSong, songPath } from '../data/catalog';
import { HOME_ARTIST_FILTERS, HOME_ARTIST_PICKS, HOME_READERS, HOME_REGION_PICKS, HOME_RELEASE_PATHS, HOME_SPOTLIGHTS, recentHomeArtists, type HomeArtistFilter } from '../data/homeArtists';
import { nextHomeSpotlights } from '../data/homeSpotlights';
import { nextHomeLayout, selectHomeExperience, STATIC_HOME_EXPERIENCE } from '../data/homeExperience';
import { GUIDES, guidePath } from '../data/guides';
import { useLibraryStore } from '../store/library';
import { serializeStructuredData } from '../data/structuredData';
import { buildImageUrl } from '../data/mockData';
import type { Artist } from '../types';

export const meta = () => [
  { title: '52lyrics — Discover the artists behind the songs' },
  { name: 'description', content: 'Discover artists, explore their albums and songs, and find complete original and public-domain lyrics to read. Build a collection of your own.' },
  { property: 'og:title', content: '52lyrics — Discover the artists behind the songs' },
  { property: 'og:description', content: 'Start with an artist. Follow their records, read the available lyrics, and save your discoveries.' },
];

function ArtistPortrait({ artist, eager = false, position }: { artist: Artist; eager?: boolean; position?: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const failed = failedFor === artist.id;
  useEffect(() => {
    // A pre-rendered photo can fail before React attaches its error handler.
    if (imageRef.current?.complete && imageRef.current.naturalWidth === 0) setFailedFor(artist.id);
  }, [artist.id]);
  return <img ref={imageRef} src={failed ? buildImageUrl(artist.name) : artist.imageUrl} alt={failed ? `${artist.name} — photo unavailable` : ''} width="640" height="640" loading={eager ? 'eager' : 'lazy'} decoding="async" style={position ? { objectPosition: position } : undefined} onError={() => setFailedFor(artist.id)} data-photo-fallback={failed || undefined} />;
}

export default function Home() {
  const [experience, setExperience] = useState(STATIC_HOME_EXPERIENCE);
  const [spotlights, setSpotlights] = useState(HOME_SPOTLIGHTS);
  const rotationStarted = useRef(false);
  useEffect(() => {
    // Match the static HTML for hydration, then rotate once per homepage visit.
    if (rotationStarted.current) return;
    rotationStarted.current = true;
    setSpotlights(nextHomeSpotlights());
  }, []);
  useEffect(() => {
    setExperience(selectHomeExperience(new Date(), navigator.language));
  }, []);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [filter, setFilter] = useState<HomeArtistFilter>('All picks');
  const spotlight = spotlights[spotlightIndex];
  const selected = spotlight.artist;
  const hydrated = useLibraryStore((state) => state.hydrated);
  const recentlyViewed = useLibraryStore((state) => state.recentlyViewed);
  const recentArtists = hydrated ? recentHomeArtists(recentlyViewed) : [];
  const picks = HOME_ARTIST_PICKS.filter((pick) => filter === 'All picks' || pick.group === filter);
  const regionPicks = HOME_REGION_PICKS[experience.region];
  const cityLights = findSong('the-midnight-echo-city-lights')!;
  const credits = [...new Map([
    ...spotlights.map((entry) => entry.artist), ...HOME_ARTIST_PICKS.map((entry) => entry.artist),
    ...HOME_RELEASE_PATHS.map((entry) => entry.artist), ...HOME_READERS.map((entry) => entry.artist), ...recentArtists,
  ].filter((artist) => artist.imageCredit).map((artist) => [artist.id, artist])).values()];

  return (
    <div className="artist-home" data-layout={experience.layout} data-theme={experience.theme} data-region={experience.region} data-edition-ready={experience !== STATIC_HOME_EXPERIENCE || undefined}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData({
        '@context': 'https://schema.org', '@type': 'WebSite', name: '52lyrics', url: __SITE_URL__,
        potentialAction: { '@type': 'SearchAction', target: `${__SITE_URL__}/search?q={search_term_string}&type=all`, 'query-input': 'required name=search_term_string' },
      }) }} />

      <section className="artist-home-hero shell" aria-labelledby="home-title">
        <div className="artist-home-hero__intro">
          <div className="home-scene-bar"><span className="eyebrow">{experience.edition}</span><button type="button" onClick={() => setExperience((current) => ({ ...current, layout: nextHomeLayout(current.layout) }))} aria-label={`Change homepage layout, current view: ${experience.layout}`}><span>{experience.layout} view</span><RefreshCw aria-hidden="true" /></button></div>
          <h1 id="home-title">{experience.title}<br /><em>{experience.accent}</em></h1>
          <p>{experience.introduction}</p>
          <GlobalSearch variant="hero" />
        </div>

        <div className="home-spotlight" data-rotation-ready={spotlights !== HOME_SPOTLIGHTS || undefined}>
          <div className="home-spotlight__label"><span className="eyebrow">Artist spotlight</span><span>Selected by 52lyrics</span></div>
          <div id="home-spotlight-panel" className="home-spotlight__panel">
            <Link className="home-spotlight__portrait" to={artistPath(selected)} aria-label={`Explore ${selected.name}`}>
              <ArtistPortrait artist={selected} eager position={spotlight.position} />
              <span className="home-spotlight__name"><span>{selected.genres.slice(0, 2).join(' / ')}</span><strong>{selected.name}</strong><ArrowUpRight aria-hidden="true" /></span>
            </Link>
            <div className="home-spotlight__caption">
              <p>{spotlight.note}</p>
              <div><Link to={artistPath(selected)}>{selected.albums.length} releases in this catalog <ArrowRight aria-hidden="true" /></Link><SaveButton key={selected.id} type="artist" id={selected.id} /></div>
            </div>
          </div>
          <div className="home-spotlight__choices" role="group" aria-label="Choose a spotlight artist">
            {spotlights.map(({ artist }, index) => <button key={artist.id} type="button" aria-pressed={spotlightIndex === index} aria-controls="home-spotlight-panel" onClick={() => setSpotlightIndex(index)}>
              <ArtistPortrait artist={artist} eager /><span>{artist.name}</span>
            </button>)}
          </div>
          <span className="sr-only" role="status">Spotlight: {selected.name}</span>
        </div>
        <div className="artist-home-hero__links">
          <Link className="home-index-link" to="/artists">Explore {ARTISTS.length} artists &amp; writers <ArrowRight aria-hidden="true" /></Link>
          <Link className="home-read-now" to={songPath(cityLights)}>
            <BookOpen aria-hidden="true" /><span><small>Want to read first? · Full original lyrics</small><strong>City Lights <span>by The Midnight Echo</span></strong></span><ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="home-dial shell" aria-labelledby="home-dial-title">
        <div className="home-dial__intro"><span className="eyebrow">A route through the catalog</span><h2 id="home-dial-title">{experience.regionTitle}</h2><p>Three artist files to start with. Each opens into sourced records and songs.</p></div>
        <div className="home-dial__artists">{regionPicks.map((artist, index) => <Link to={artistPath(artist)} key={artist.id}><span className="home-dial__number">{String(index + 1).padStart(2, '0')}</span><strong>{artist.name}</strong><small>{artist.location}</small><ArrowUpRight aria-hidden="true" /></Link>)}</div>
      </section>

      <section className="home-artists shell home-section" aria-labelledby="home-artists-title">
        <header className="home-section-heading"><div><span className="eyebrow">A few names to begin with</span><h2 id="home-artists-title">Find your kind of artist.</h2></div><Link to="/artists">The full artist index <ArrowUpRight aria-hidden="true" /></Link></header>
        <div className="home-artist-toolbar">
          <div role="group" aria-label="Filter selected artists">{HOME_ARTIST_FILTERS.map((value) => <button key={value} type="button" aria-pressed={filter === value} aria-controls="home-artist-results" onClick={() => setFilter(value)}>{value}</button>)}</div>
          <p role="status">{picks.length} editorial picks</p>
        </div>
        <div className="home-portrait-grid" id="home-artist-results">
          {picks.map(({ artist }) => <Link className="home-portrait-card" to={artistPath(artist)} key={artist.id}>
            <div><ArtistPortrait artist={artist} /><ArrowUpRight aria-hidden="true" /></div>
            <h3>{artist.name}</h3><p>{artist.genres.slice(0, 2).join(' / ')}</p><small>{artist.albums.length} releases in catalog</small>
          </Link>)}
        </div>
      </section>

      <section className="home-release-paths shell home-section" aria-labelledby="release-paths-title">
        <header className="home-section-heading"><div><span className="eyebrow">Artist → album → song</span><h2 id="release-paths-title">One record opens a door.</h2></div><p>Three artists. Three sourced editions.<br />A place to begin, not a greatest-hits list.</p></header>
        <div className="home-release-grid">
          {HOME_RELEASE_PATHS.map(({ artist, album }) => <article className="home-release-card" key={artist.id}>
            <Link className="home-release-card__artist" to={artistPath(artist)}><ArtistPortrait artist={artist} /><div><small>Explore the artist</small><h3>{artist.name}</h3></div><ArrowUpRight aria-hidden="true" /></Link>
            <div className="home-release-card__record"><CornerDownRight aria-hidden="true" /><div><span className="eyebrow">Start with this release · {album.year}</span><Link to={albumPath(album)}>{album.title}<ArrowRight aria-hidden="true" /></Link><p>{album.trackCount} tracks · Sourced edition</p></div></div>
            <ol aria-label={`Opening tracks on ${album.title}`}>{album.tracks.slice(0, 3).map((song) => <li key={song.id}><span>{String(song.trackNumber).padStart(2, '0')}</span><Link to={songPath(song)}>{song.title}<small>{song.lyricsAvailability === 'full' ? 'Full lyrics' : 'Song notes'}</small></Link><ArrowUpRight aria-hidden="true" /></li>)}</ol>
          </article>)}
        </div>
      </section>

      <section className="home-reading shell home-section" aria-labelledby="home-reading-title">
        <header className="home-section-heading"><div><span className="eyebrow">Spend a little time with the words</span><h2 id="home-reading-title">Artists you can read here.</h2></div><Link to="/discover">Explore all reading collections <ArrowUpRight aria-hidden="true" /></Link></header>
        <div className="home-reading-grid">{HOME_READERS.map(({ artist, songs }) => <article className={`home-reading-card ${artist.slug === 'the-midnight-echo' ? 'home-reading-card--original' : ''}`} key={artist.id}>
          <div className="home-reading-card__identity">{artist.imageCredit ? <ArtistPortrait artist={artist} /> : <span className="home-original-mark" aria-hidden="true">ME<span>52lyrics originals</span></span>}<div><span className="eyebrow">{artist.slug === 'the-midnight-echo' ? 'Our fictional original band' : 'The author’s archive'}</span><h3><Link to={artistPath(artist)}>{artist.name}<ArrowUpRight aria-hidden="true" /></Link></h3><p>{songs.length} complete {artist.slug === 'the-midnight-echo' ? 'original songs' : 'reviewed lyric works'}</p></div></div>
          <div className="home-reading-card__songs">{songs.slice(0, 3).map((song) => <Link to={songPath(song)} key={song.id}><BookOpen aria-hidden="true" /><span>{song.title}</span><ArrowRight aria-hidden="true" /></Link>)}</div>
        </article>)}</div>
        <p className="home-reading-note">Full lyrics are marked wherever they’re available. Other songs offer release details and song notes.</p>
      </section>

      <section className="home-guides shell home-section" aria-labelledby="home-guides-title">
        <header className="home-section-heading"><div><span className="eyebrow">Listen with context</span><h2 id="home-guides-title">Go further than a title.</h2></div><Link to="/guides">All reading guides <ArrowUpRight aria-hidden="true" /></Link></header>
        <div className="guide-grid">{GUIDES.map((guide) => <Link className="guide-card" to={guidePath(guide.slug)} key={guide.slug}>
          <span className="eyebrow">{guide.eyebrow}</span><h3>{guide.title}</h3><p>{guide.description}</p><span className="guide-card__action">Read the guide <ArrowRight aria-hidden="true" /></span>
        </Link>)}</div>
      </section>

      <section className="home-return shell home-section" aria-labelledby="home-return-title">
        <header className="home-section-heading"><div><span className="eyebrow">Your corner of the catalog</span><h2 id="home-return-title">{recentArtists.length ? 'Back to the artists.' : 'Keep the names that stay with you.'}</h2></div><Link to="/saved">Open Saved <ArrowUpRight aria-hidden="true" /></Link></header>
        {!hydrated ? <div className="home-return__body skeleton-row" aria-label="Loading your recently viewed artists"><span /><span /><span /></div> : recentArtists.length ? <div className="home-return__body home-recent-grid">{recentArtists.map((artist) => <Link to={artistPath(artist)} key={artist.id}><ArtistPortrait artist={artist} /><span><small>Recently explored</small><strong>{artist.name}</strong></span><ArrowUpRight aria-hidden="true" /></Link>)}</div> : <div className="home-return__body home-library-note"><Bookmark aria-hidden="true" /><p>Save an artist to start your own collection. The artists behind the songs and albums you visit will appear here next time.<small>Stored in this browser. No account needed.</small></p><Link to="/artists">Find your first artist <ArrowRight aria-hidden="true" /></Link></div>}
      </section>

      <nav className="home-alphabet shell" aria-label="Browse artists by first letter"><span className="eyebrow">Find a name</span><div>{'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => <Link key={letter} to={`/artists?letter=${letter}`} aria-label={`Artists starting with ${letter}`}>{letter}</Link>)}</div><Link to="/artists">All artists <ArrowRight aria-hidden="true" /></Link></nav>
      <details className="home-photo-credits shell"><summary>Photograph credits &amp; sources</summary><p>Artist photographs are displayed with responsive crops. Album-cover artwork is not used on this page.</p><div>{credits.map((artist) => <div key={artist.id}><Link to={artistPath(artist)}>{artist.name}</Link><PhotoCredit credit={artist.imageCredit} /></div>)}</div></details>
    </div>
  );
}
