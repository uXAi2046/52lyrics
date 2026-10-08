import StaticPage from '../components/legal/StaticPage';

export const meta = () => [{ title: 'About — 52lyrics' }, { name: 'description', content: 'Why 52lyrics exists and how the catalog approaches song discovery and lyric rights.' }];

export default function About() {
  return <StaticPage eyebrow="About 52lyrics" title="Songs deserve context." intro="52lyrics is a small, independent catalog for reading, tracing, and rediscovering songs.">
    <h2>What we are building</h2><p>Search should lead somewhere richer than a single text block. Every song connects to a release, an artist, a time, and a set of ideas. We make those paths visible.</p>
    <h2>What “full lyrics” means here</h2><p>Complete texts are available for original, licensed, and verified public-domain entries. Other songs remain useful metadata pages without placeholder verses.</p>
    <h2>The historical songbook</h2><p>Our public-domain selection brings historical English lyrics into the reading catalog. Every text links to a specific Wikisource revision and its copyright evidence. Songbooks group texts for reading; they are not recording releases.</p>
    <h2>Release catalog</h2><p>The Midnight Echo is an original fictional project created for 52lyrics. Its two releases demonstrate the complete reading experience without borrowing another writer’s work.</p>
  </StaticPage>;
}
