import { useMemo, useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { CatalogCard } from '../components/ui/CatalogCard';
import { Pagination } from '../components/ui/Pagination';
import { paginate } from '../data/pagination';
import { COLLECTIONS } from '../data/collections';
import { resolveCatalogItem } from '../data/catalog';
import type { CatalogItemRef, Song } from '../types';

function CollectionCards({ itemRefs, slug, title }: { itemRefs: CatalogItemRef[]; slug: string; title: string }) {
  const [params] = useSearchParams();
  const parameter = `page-${slug}`;
  const pagination = paginate(itemRefs.length, params.get(parameter));
  return <>
    <Pagination pagination={pagination} label={`${title} pages`} anchor={slug} parameter={parameter} />
    <div className="catalog-grid">
      {itemRefs.slice(pagination.offset, pagination.end).map((ref, index) => <CatalogCard key={`${ref.type}-${ref.id}`} itemRef={ref} index={pagination.offset + index} />)}
    </div>
    <Pagination pagination={pagination} label={`${title} pages`} anchor={slug} parameter={parameter} position="bottom" />
  </>;
}

export const meta = () => [
  { title: 'Discover songs by mood, theme, and era — 52lyrics' },
  { name: 'description', content: 'Browse editorial song routes across moods, themes, eras, artists, albums, and complete original and public-domain lyrics.' },
];

export default function Discover() {
  const [theme, setTheme] = useState('all');
  const [mood, setMood] = useState('all');
  const [availability, setAvailability] = useState('all');

  const filtered = useMemo(() => COLLECTIONS.map((collection) => {
    let itemRefs = collection.itemRefs;
    if (availability === 'full') {
      itemRefs = itemRefs.filter((ref) => ref.type === 'song' && (resolveCatalogItem(ref) as Song)?.lyricsAvailability === 'full');
    }
    return { ...collection, itemRefs };
  }).filter((collection) =>
    (theme === 'all' || collection.themes.includes(theme)) &&
    (mood === 'all' || collection.moods.includes(mood)) &&
    collection.itemRefs.length > 0
  ), [theme, mood, availability]);

  const reset = () => {
    setTheme('all');
    setMood('all');
    setAvailability('all');
  };

  return (
    <div className="shell page">
      <header className="page-intro page-intro--wide">
        <span className="eyebrow">{COLLECTIONS.length} ways into the catalog</span>
        <h1>Follow the sound,<br /><em>not a leaderboard.</em></h1>
        <p>Every collection has an editorial reason to exist. Choose a mood, a theme, or start with lyrics you can read in full.</p>
        <p>Want to follow the sources? <Link className="text-link" to="/guides">Read the music guides →</Link></p>
      </header>

      <div className="filter-bar" aria-label="Filter collections">
        <Filter aria-hidden="true" />
        <label>Theme
          <select value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="all">All themes</option>
            {[...new Set(COLLECTIONS.flatMap((collection) => collection.themes))].sort().map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </label>
        <label>Mood
          <select value={mood} onChange={(event) => setMood(event.target.value)}>
            <option value="all">All moods</option>
            {[...new Set(COLLECTIONS.flatMap((collection) => collection.moods))].sort().map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </label>
        <label>Lyrics
          <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
            <option value="all">All availability</option>
            <option value="full">Full lyrics only</option>
          </select>
        </label>
        {(theme !== 'all' || mood !== 'all' || availability !== 'all') && (
          <button type="button" onClick={reset}><RotateCcw aria-hidden="true" /> Reset</button>
        )}
      </div>

      {filtered.length ? (
        <div className="collection-list">
          {filtered.map((collection, collectionIndex) => (
            <section className="collection-section" id={collection.slug} key={collection.slug}>
              <header>
                <span className="collection-section__number">{String(collectionIndex + 1).padStart(2, '0')}</span>
                <div><span className="eyebrow">{collection.eyebrow}</span><h2>{collection.title}</h2><p>{collection.description}</p></div>
              </header>
              <CollectionCards itemRefs={collection.itemRefs} slug={collection.slug} title={collection.title} />
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="eyebrow">No matching sequence</span>
          <h2>Try a wider mix.</h2>
          <p>Reset one or more filters to bring collections back into view.</p>
          <button type="button" className="text-link" onClick={reset}><RotateCcw aria-hidden="true" /> Reset filters</button>
        </div>
      )}
    </div>
  );
}
