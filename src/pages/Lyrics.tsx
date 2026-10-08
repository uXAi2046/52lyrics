import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, Disc3, FileText, Hash, PenLine } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router';
import { SaveButton, ShareButton } from '../components/ui/Actions';
import { AvailabilityBadge, EmptyState } from '../components/ui/Status';
import { MetadataCredit } from '../components/ui/SourceCredit';
import { useToast } from '../components/ui/Toast';
import { albumPath, artistPath, findAlbum, findArtist, findSong, FULL_LYRIC_SONGS, PUBLIC_DOMAIN_SONGS, songPath } from '../data/catalog';
import { useLibraryStore } from '../store/library';
import type { LyricSection } from '../types';
import { serializeStructuredData } from '../data/structuredData';

export const meta = ({ params }: { params: { songId?: string } }) => {
  const song = findSong(params.songId);
  return [
    { title: song ? `${song.title} by ${song.artistName} — ${song.lyricsAvailability === 'full' ? 'full lyrics and song notes' : 'song credits and release notes'} | 52lyrics` : 'Song not found — 52lyrics' },
    { name: 'description', content: song?.seoDescription || 'The requested song is not in the 52lyrics catalog.' },
    { property: 'og:title', content: song ? `${song.title} — ${song.artistName}` : 'Song not found' },
    { property: 'og:description', content: song?.seoDescription || 'Search songs on 52lyrics.' },
  ];
};

const sectionLabel = ({ type, number, label }: LyricSection) =>
  label ?? `${type[0].toUpperCase()}${type.slice(1)}${number ? ` ${number}` : ''}`;

export default function Lyrics() {
  const { songId } = useParams();
  const song = findSong(songId);
  const album = findAlbum(song?.albumId);
  const artist = findArtist(song?.artistId);
  const recordView = useLibraryStore((state) => state.recordView);
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState(0);
  const [copied, setCopied] = useState(false);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const railRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (song) recordView('song', song.id);
  }, [song, recordView]);

  useEffect(() => {
    if (!song || song.lyricsAvailability !== 'full') return;
    let frame = 0;
    // A narrow intersection band can contain no section, or miss a very long one.
    // Choose the last heading above the reading line, including reverse scrolling.
    const updateSection = () => {
      frame = 0;
      const readingLine = Math.max(160, window.innerHeight * 0.25);
      let next = 0;
      sectionRefs.current.slice(0, song.sections.length).forEach((section, index) => {
        if (section && section.getBoundingClientRect().top <= readingLine) next = index;
      });
      setActiveSection(next);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(updateSection); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [song]);

  useEffect(() => {
    const rail = railRef.current;
    const button = rail?.querySelector<HTMLButtonElement>('[aria-current="step"]');
    if (!rail || !button || rail.scrollWidth <= rail.clientWidth) return;
    const bounds = rail.getBoundingClientRect();
    const target = button.getBoundingClientRect();
    const delta = target.left < bounds.left ? target.left - bounds.left : target.right > bounds.right ? target.right - bounds.right : 0;
    // Move only the horizontal rail; scrollIntoView would also move the lyric page.
    if (delta) rail.scrollTo({ left: rail.scrollLeft + delta, behavior: 'instant' });
  }, [activeSection, song]);

  if (!song || !album || !artist) {
    return <div className="shell page"><EmptyState eyebrow="404 · Song" title="This song is not in the catalog." description="Search by title or browse a curated route to keep exploring." action={<Link to="/search">Search the catalog <ArrowRight aria-hidden="true" /></Link>} /></div>;
  }
  if (songId !== song.slug) return <Navigate to={songPath(song)} replace />;
  const albumSiblings = album.tracks.filter((track) => track.id !== song.id);
  const relatedSongs = albumSiblings.length ? albumSiblings : (song.source ? PUBLIC_DOMAIN_SONGS : FULL_LYRIC_SONGS).filter((track) => track.id !== song.id);

  const copy = async () => {
    let text = song.lyricsAvailability === 'full'
      ? song.sections.map((section) => `[${sectionLabel(section)}]\n${section.content.join('\n')}`).join('\n\n')
      : [song.description, song.about, ...song.editorialNotes].join('\n\n');
    if (song.source) text += `\n\n${song.title} — ${song.writers.join(', ')}\n${song.source.edition}\nPublic-domain text via ${song.source.provider}: ${song.source.revisionUrl}\nText reuse terms: ${song.source.transcriptionLicenseUrl}`;
    if (song.source?.underlyingWork) text += `\nOriginal work: ${song.source.underlyingWork.title}\n${song.source.underlyingWork.rightsNote}\n${song.source.underlyingWork.evidenceUrls.join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast(song.lyricsAvailability === 'full' ? 'Lyrics copied' : 'Song notes copied', 'success');
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      showToast('Clipboard access is unavailable. Select the text manually.', 'error');
    }
  };

  const goToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="shell page lyric-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData({
          '@context': 'https://schema.org',
          '@type': song.source ? 'MusicComposition' : 'MusicRecording',
          name: song.title,
          ...(song.releaseDate ? { datePublished: song.releaseDate } : {}),
          genre: song.genres,
          ...(song.source ? {
            lyricist: song.writers.map((name) => ({ '@type': 'Person', name })),
            isBasedOn: song.source.revisionUrl,
            lyrics: { '@type': 'CreativeWork', text: song.lyrics, creditText: `${song.writers.join(', ')}; ${song.source.provider}`, isBasedOn: song.source.revisionUrl },
          } : { byArtist: { '@type': artist.entityType || 'MusicGroup', name: song.artistName }, inAlbum: { '@type': 'MusicAlbum', name: song.albumTitle } }),
          url: `${__SITE_URL__}${songPath(song)}`,
          description: song.seoDescription,
        }) }}
      />
      <Link to={albumPath(album)} className="back-link"><ArrowLeft aria-hidden="true" /> {album.title}</Link>

      <header className="lyric-header">
        <div className="lyric-header__art"><img src={song.coverUrl} alt="" width="560" height="560" /><span>{String(song.trackNumber).padStart(2, '0')} / {album.trackCount}</span></div>
        <div className="lyric-header__copy">
          <AvailabilityBadge song={song} />
          <h1>{song.title}</h1>
          <Link to={artistPath(artist)} className="lyric-header__artist">{song.artistName} <ArrowRight aria-hidden="true" /></Link>
          <p>{song.description}</p>
          <div className="lyric-facts">
            <span><Disc3 aria-hidden="true" /> {album.title}</span>
            <span><Hash aria-hidden="true" /> {album.tracks.some((track) => (track.discNumber || 1) > 1) ? `Disc ${song.discNumber} · Track ${song.discTrackNumber}` : `${album.type === 'Songbook' ? 'Text' : 'Track'} ${song.trackNumber}`}</span>
            <span><FileText aria-hidden="true" /> {song.releaseYear ?? 'Undated text'}{song.source?.provider === 'Wikisource' ? ' · historical text' : ''}</span>
          </div>
          <div className="tag-list">{[...song.themes, ...song.moods].slice(0, 6).map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="detail-actions">
            <SaveButton type="song" id={song.id} />
            <ShareButton title={song.title} text={song.seoDescription} />
            <button type="button" className="action-button" onClick={copy}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}<span>{copied ? 'Copied' : song.lyricsAvailability === 'full' ? 'Copy lyrics' : 'Copy notes'}</span></button>
          </div>
        </div>
      </header>

      {song.lyricsAvailability === 'full' ? (
        <div className="lyric-reader">
          <nav ref={railRef} className="lyric-rail" aria-label="Lyric sections">
            <span className="eyebrow">Lyric rail</span>
            <ol>
              {song.sections.map((section, index) => (
                <li key={`${section.type}-${index}`} className={index === activeSection ? 'is-active' : ''}>
                  <button type="button" onClick={() => goToSection(index)} aria-current={index === activeSection ? 'step' : undefined}>
                    <span>{String(index + 1).padStart(2, '0')}</span>{sectionLabel(section)}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <article className="lyrics-copy">
            <header><span className="eyebrow">{song.rights === 'public-domain' ? 'Complete public-domain lyrics' : song.rights === 'licensed' ? 'Complete licensed lyrics' : 'Complete original lyrics'}</span><p>{song.about}</p></header>
            {song.sections.map((section, index) => (
              <section
                key={`${section.type}-${index}`}
                ref={(element) => { sectionRefs.current[index] = element; }}
                data-section-index={index}
                id={`section-${index + 1}`}
                className={index === activeSection ? 'is-active' : ''}
              >
                <span>{sectionLabel(section)}</span>
                {section.content.map((line, lineIndex) => <p key={`${line}-${lineIndex}`} lang={section.language}>{line}</p>)}
              </section>
            ))}
            <footer>
              <span className="eyebrow">Credits</span><p>Written by {song.writers.join(', ')}</p>
              {song.producers.length > 0 && <p>Produced by {song.producers.join(', ')}</p>}
              <small>{song.copyright}</small>
              {song.source && <div className="lyric-source">
                <h2>Source &amp; text edition</h2>
                <p>{song.source.edition}</p>
                <p>{song.source.rightsNote}</p>
                {song.source.provider === 'Wikisource' && <p><Link to={song.slug === 'john-newton-amazing-grace' ? '/guides/amazing-grace-1840-lyrics' : '/guides/read-the-historical-songbook'}>How to read this historical text and its source</Link></p>}
                {song.source.provider === 'Tom Lehrer' && <p><Link to="/guides/tom-lehrer-lyrics-source-guide">How to read the author’s source sheet</Link></p>}
                {song.source.underlyingWork && <div className="underlying-work">
                  <p>Original work: {song.source.underlyingWork.title} · {song.source.underlyingWork.writers.join(', ')}</p>
                  <p>{song.source.underlyingWork.rightsNote}</p>
                  {song.source.underlyingWork.evidenceUrls.map((url, index) => <p key={url}><a href={url} target="_blank" rel="noreferrer">Original-work evidence {index + 1}</a></p>)}
                </div>}
                <p><a href={song.source.revisionUrl} target="_blank" rel="noreferrer">{song.source.provider === 'Wikisource' ? 'Read the source on Wikisource' : song.source.documentType === 'score-pdf' ? 'Read the author’s score (PDF)' : 'Read the author’s lyric sheet (PDF)'}</a></p>
                <p><a href={song.source.evidenceUrl} target="_blank" rel="noreferrer">View copyright evidence</a> · <a href={song.source.transcriptionLicenseUrl} target="_blank" rel="noreferrer">{song.source.provider === 'Wikisource' ? 'Transcription terms (CC BY-SA 4.0)' : 'Author’s public-domain declaration'}</a></p>
                <small>Retrieved {song.source.retrievedAt}. Line spacing and section labels are adapted for reading. The displayed text follows the linked edition. Editorial notes and abstract artwork are by 52lyrics.</small>
              </div>}
              <MetadataCredit source={song.metadataSource} />
            </footer>
          </article>
        </div>
      ) : (
        <div className="song-notes-layout">
          <article className="song-notes">
            <div className="availability-notice"><PenLine aria-hidden="true" /><div><span className="eyebrow">Rights-aware catalog</span><h2>Lyrics unavailable in this catalog.</h2><p>We do not display unlicensed or placeholder lyrics. The verified song notes and release context remain available below. <Link to="/guides/which-lyrics-can-you-read">Learn which lyrics you can read here</Link>.</p></div></div>
            <section><span className="eyebrow">About this song</span><h2>Context, not a substitute.</h2><p>{song.about}</p></section>
            <section><span className="eyebrow">Editorial notes</span>{song.editorialNotes.map((note) => <p key={note}>{note}</p>)}</section>
            <section className="credits-grid"><div><span className="eyebrow">Written by</span><p>{song.writers.join(', ') || 'Not supplied in this catalog'}</p></div><div><span className="eyebrow">Produced by</span><p>{song.producers.join(', ') || 'Not supplied in this catalog'}</p></div></section>
            <MetadataCredit source={song.metadataSource} />
          </article>
          <aside className="originals-aside">
            <span className="eyebrow">Read something complete</span>
            <h2>Original lyrics, ready now.</h2>
            <div>{FULL_LYRIC_SONGS.slice(0, 4).map((original) => <Link key={original.id} to={songPath(original)}><span>{original.title}<small>{original.artistName}</small></span><ArrowRight aria-hidden="true" /></Link>)}</div>
          </aside>
        </div>
      )}

      <section className="more-from-album">
        <header><span className="eyebrow">Keep tracing</span><h2>{albumSiblings.length ? `More from ${album.title}.` : song.source ? 'Keep reading the classics.' : 'More lyrics to explore.'}</h2></header>
        <div>{relatedSongs.slice(0, 4).map((track, index) => <Link key={track.id} to={songPath(track)}><span>{String(albumSiblings.length ? track.trackNumber : index + 1).padStart(2, '0')}</span><strong>{track.title}</strong><AvailabilityBadge song={track} /><ArrowRight aria-hidden="true" /></Link>)}</div>
      </section>
    </div>
  );
}
