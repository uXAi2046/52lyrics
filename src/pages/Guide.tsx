import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router';
import { EmptyState } from '../components/ui/Status';
import { albumPath, artistPath, findAlbum, findArtist, findSong, FULL_LYRIC_WORKS, songPath } from '../data/catalog';
import { findGuide, GUIDES, guidePath } from '../data/guides';

export const meta = ({ params }: { params: { guideId?: string } }) => {
  const guide = findGuide(params.guideId);
  return [
    { title: guide ? `${guide.title} — 52lyrics` : 'Guide not found — 52lyrics' },
    { name: 'description', content: guide?.description || 'Explore music reading guides on 52lyrics.' },
    { property: 'og:title', content: guide?.title || 'Music reading guides' },
    { property: 'og:description', content: guide?.description || 'Explore music reading guides on 52lyrics.' },
  ];
};

function ReleaseGuide() {
  const artist = findArtist('beyonce')!;
  const album = findAlbum('beyonce-dangerously-in-love-f639ba46')!;
  const song = album.tracks[0];
  return <>
    <section><h2>Start with the record, not a title alone.</h2>
      <p>A song title is a good search term, but it is not always a complete identity. The same work may have different recordings, and a recording may appear on several release editions. Begin with an artist page, open a specific release, and follow its ordered track list. That gives you a more useful path than a disconnected list of titles.</p>
      <p>Try <Link to={artistPath(artist)}>{artist.name}</Link> → <Link to={albumPath(album)}>{album.title}</Link> → <Link to={songPath(song)}>{song.title}</Link>. The album page shows this catalog’s release date and sequence; the song page keeps its position and credits alongside the track notes.</p>
    </section>
    <section><h2>What the edition tells you.</h2>
      <p>52lyrics links its imported release facts to a particular MusicBrainz release. The source link on each album and track page lets you inspect that edition. A different edition can have a different date, bonus track, disc number, or order, so treat the displayed sequence as evidence about that release rather than a universal track list.</p>
      <p>Track order and duration help you navigate a record. They do not establish that full lyric text can be reproduced. Look for the availability label on each song page; it keeps the release catalog separate from lyric rights.</p>
    </section>
    <section><h2>Make a useful path through the catalog.</h2>
      <p>When a track catches your attention, follow its album siblings for more of the same release, or return to the artist page for another edition. <Link to="/discover#album-archive">The album archive</Link> is a starting shelf of sourced records if you have no artist in mind. For a song whose words you can read in full, use <Link to="/guides/which-lyrics-can-you-read">the lyric availability guide</Link> before choosing a text.</p>
    </section>
  </>;
}

function LyricGuide() {
  const original = findSong('the-midnight-echo-city-lights')!;
  const historical = findSong('john-newton-amazing-grace')!;
  const reviewed = findSong('tom-lehrer-the-elements-91641359')!;
  const notes = findSong('the-weeknd-blinding-lights')!;
  return <>
    <section><h2>Read the label before the text.</h2>
      <p>“Full lyrics” means the complete words are displayed on that page. Other entries contain a release record and song notes, but no verses. The label is a statement about what 52lyrics can show for that entry, not a claim that the song has no published lyrics elsewhere.</p>
      <p>For contrast, open <Link to={songPath(original)}>City Lights</Link>, an original song written for this site, and <Link to={songPath(notes)}>Blinding Lights</Link>, a sourced recording page that shows notes without the lyric text. Both pages still connect to an artist and an album.</p>
    </section>
    <section><h2>Three routes to a complete text.</h2>
      <p>The Midnight Echo is a fictional original project made for this catalog. Historical entries such as <Link to={songPath(historical)}>Amazing Grace</Link> point to a specific Wikisource revision and a rights explanation. The <Link to={songPath(reviewed)}>The Elements</Link> page belongs to a reviewed set of Tom Lehrer texts, with a link to the author’s published source. These are different provenance routes; the source block on each page explains which one applies.</p>
      <p>A familiar recording of a historical song is not interchangeable with the historical text itself. The composition, a later arrangement, and a particular recording can have different rights and credits. For that reason, the historical reading page identifies its text edition rather than presenting a modern performer’s recording as its source.</p>
    </section>
    <section><h2>Choose the reading shelf.</h2>
      <p><Link to="/discover#lyrics-you-can-read-now">Original lyrics</Link>, <Link to="/discover#public-domain-classics">historical texts</Link>, and <Link to="/discover#tom-lehrer-archive">reviewed author works</Link> are grouped separately in Discover. If you need to check how 52lyrics handles reuse or a missing lyric, read the <Link to="/copyright">copyright and source policy</Link>.</p>
    </section>
  </>;
}

function HistoricalGuide() {
  const grace = findSong('john-newton-amazing-grace')!;
  const winter = findSong('christina-rossetti-in-the-bleak-midwinter')!;
  const home = findSong('john-howard-payne-home-sweet-home')!;
  return <>
    <section><h2>Begin with the exact text.</h2>
      <p>This shelf is a reading route through historical words, not a list of interchangeable recordings. Start with <Link to={songPath(grace)}>Amazing Grace</Link>, then compare the very different ideas of home in <Link to={songPath(home)}>Home, Sweet Home</Link> and <Link to={songPath(winter)}>In the Bleak Midwinter</Link>. Each page is arranged for reading in sections and identifies its writer or writers.</p>
    </section>
    <section><h2>Check the source before sharing.</h2>
      <p>At the foot of each historical lyric page, open the linked Wikisource revision to see the text edition used here. The same source block records copyright evidence, the text’s reuse terms, and when the source was retrieved. This matters because a title can point to more than one wording, and a later arrangement or performance may have its own separate rights.</p>
      <p>52lyrics adapts spacing and section labels for reading, while identifying the linked edition. If you quote or reuse a text, follow the page’s source and transcription terms; do not assume the artwork or a recording shares the text’s rights status.</p>
    </section>
    <section><h2>Keep exploring by provenance.</h2>
      <p><Link to="/discover#public-domain-classics">The historical collection</Link> gathers all eight Wikisource texts currently in the catalog. For a different kind of documented archive, visit <Link to="/discover#tom-lehrer-archive">the reviewed author works</Link>; for new writing made for 52lyrics, begin with <Link to="/discover#lyrics-you-can-read-now">the original songs</Link>. These paths let you choose by source as well as by mood.</p>
    </section>
  </>;
}

function LehrerSourceGuide() {
  const elements = FULL_LYRIC_WORKS.find((song) => song.artistName === 'Tom Lehrer' && song.title === 'The Elements')!;
  const prepared = FULL_LYRIC_WORKS.find((song) => song.artistName === 'Tom Lehrer' && song.title === 'Be Prepared')!;
  const songbook = findAlbum('tom-lehrer-author-lyric-sheets')!;
  return <>
    <section><h2>Start with a document you can inspect.</h2>
      <p><a href="https://tomlehrersongs.com/" target="_blank" rel="noreferrer">Tom Lehrer’s song archive</a> publishes his copyright declaration and song documents. On 52lyrics, each complete Lehrer text links to the particular PDF used for that reading page. Open <Link to={songPath(elements)}>The Elements</Link> or <Link to={songPath(prepared)}>Be Prepared</Link>, then follow the source link below the text. The displayed stanzas were checked against the author’s document rather than accepted from extracted PDF text alone.</p>
    </section>
    <section><h2>Keep the lyric sheet and recording distinct.</h2>
      <p>The source sheet tells you which words this page presents. It does not establish every spoken introduction, lyric change, or running time in a performance. A song can also appear on multiple release editions; the album link on each page identifies its catalog placement. Texts without a verified recording placement appear in <Link to={albumPath(songbook)}>Tom Lehrer: Author Lyric Sheets</Link>, an editorial reading selection rather than a historical album.</p>
    </section>
    <section><h2>Check the scope of the rights statement.</h2>
      <p>Lehrer’s declaration covers lyrics and music he wrote or composed. It does not establish rights in third-party photographs, album art, or an underlying work written by someone else. Where a text adapts another writer’s work, the lyric page links separate evidence for that original. Check the source block before reusing a text; the displayed edition and the recording or artwork can have different rights.</p>
    </section>
  </>;
}

function AmazingGraceEditionGuide() {
  const grace = findSong('john-newton-amazing-grace')!;
  return <>
    <section><h2>Find the text behind the familiar title.</h2>
      <p>The <a href="https://en.wikisource.org/wiki/Olney_Hymns_(1840)/Book_1/Hymn_41" target="_blank" rel="noreferrer">1840 Olney Hymns edition, Book I, Hymn 41</a> prints John Newton’s text under the heading “Faith’s Review and Expectation.” Its opening words are now the name by which most readers find it. The <Link to={songPath(grace)}>52lyrics reading page</Link> follows this six-stanza printed text, with a link to the fixed Wikisource revision used for transcription.</p>
    </section>
    <section><h2>Know what this edition contains.</h2>
      <p>All six stanzas of the chosen edition appear on the reading page in source order. Later added verses and modern arrangements are outside this text edition. If you are comparing a performance with these words, a different ending does not by itself mean either source is incomplete; first check which text and arrangement that performance uses.</p>
      <p>The sequence moves from Newton’s recollection of being lost, through dangers already survived, toward hope beyond death. The final stanza’s image of the earth dissolving is part of this edition. Reading the sequence as a whole makes it easier to notice when a later performance selects, replaces, or rearranges stanzas.</p>
    </section>
    <section><h2>Trace a line back to the page.</h2>
      <p>Use the stanza navigation to locate a passage, then open “Source &amp; text edition” below the lyric. It gives the edition name, the source revision, and reuse information. The page describes a historical text, not a particular recording. For the same method applied to other songs and poems, continue with the <Link to="/guides/read-the-historical-songbook">historical songbook guide</Link>.</p>
    </section>
  </>;
}

const content = {
  'follow-a-song-to-its-release': ReleaseGuide,
  'which-lyrics-can-you-read': LyricGuide,
  'read-the-historical-songbook': HistoricalGuide,
  'tom-lehrer-lyrics-source-guide': LehrerSourceGuide,
  'amazing-grace-1840-lyrics': AmazingGraceEditionGuide,
};

export default function Guide() {
  const { guideId } = useParams();
  const guide = findGuide(guideId);
  if (!guide) return <div className="shell page"><EmptyState eyebrow="404 · Guide" title="This guide is not in the library." description="Choose another route into the music." action={<Link to="/guides">Open reading guides <ArrowRight aria-hidden="true" /></Link>} /></div>;
  if (guideId !== guide.slug) return <Navigate to={guidePath(guide.slug)} replace />;
  const Content = content[guide.slug];
  const next = GUIDES[(GUIDES.findIndex((entry) => entry.slug === guide.slug) + 1) % GUIDES.length];
  return <div className="shell page guide-page">
    <Link to="/guides" className="back-link"><ArrowLeft aria-hidden="true" /> All guides</Link>
    <header className="page-intro page-intro--wide"><span className="eyebrow">{guide.eyebrow}</span><h1>{guide.title}</h1><p>{guide.description}</p></header>
    <article className="guide-article"><Content /></article>
    <nav className="guide-next" aria-label="Continue reading"><span className="eyebrow">Continue reading</span><Link to={guidePath(next.slug)}>{next.title} <ArrowRight aria-hidden="true" /></Link></nav>
  </div>;
}
