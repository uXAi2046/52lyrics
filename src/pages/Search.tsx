import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search as SearchIcon, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { CatalogCard } from '../components/ui/CatalogCard';
import { Pagination } from '../components/ui/Pagination';
import { paginate } from '../data/pagination';
import { EmptyState } from '../components/ui/Status';
import { searchCatalog, type SearchType } from '../data/search';
import { useLibraryStore } from '../store/library';
import type { CatalogItemRef } from '../types';

const FILTERS: { value: SearchType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'songs', label: 'Songs' },
  { value: 'artists', label: 'Artists' },
  { value: 'albums', label: 'Albums' },
];

export const meta = () => [
  { title: 'Search the catalog — 52lyrics' },
  { name: 'description', content: 'Search 52lyrics by song, artist, album, theme, or mood.' },
  { name: 'robots', content: 'noindex' },
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const paramType = params.get('type');
  const type = FILTERS.some((filter) => filter.value === paramType) ? paramType as SearchType : 'all';
  const [draft, setDraft] = useState(query);
  const recordQuery = useLibraryStore((state) => state.recordQuery);
  const results = useMemo(() => searchCatalog(query, type), [query, type]);

  useEffect(() => setDraft(query), [query]);

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setParams({});
      return;
    }
    recordQuery(trimmed);
    setParams({ q: trimmed, type });
  };

  const refs: CatalogItemRef[] = [
    ...results.songs.map((song) => ({ type: 'song' as const, id: song.id })),
    ...results.artists.map((artist) => ({ type: 'artist' as const, id: artist.id })),
    ...results.albums.map((album) => ({ type: 'album' as const, id: album.id })),
  ];
  const pagination = paginate(refs.length, params.get('page'));

  return (
    <div className="shell page">
      <header className="page-intro">
        <span className="eyebrow">Catalog search</span>
        <h1>{query ? <>Results for <em>“{query}”</em></> : <>Find a song<br /><em>from any angle.</em></>}</h1>
      </header>

      <form className="search-page-form" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <SearchIcon aria-hidden="true" />
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Song, artist, album, theme, or mood" aria-label="Search query" />
        {draft && <button type="button" onClick={() => setDraft('')} aria-label="Clear query"><X aria-hidden="true" /></button>}
        <button type="submit">Search <ArrowRight aria-hidden="true" /></button>
      </form>

      {query && (
        <div className="result-toolbar">
          <div className="filter-tabs" aria-label="Result type">
            {FILTERS.map((filter) => (
              <button
                type="button"
                key={filter.value}
                className={type === filter.value ? 'is-active' : ''}
                aria-pressed={type === filter.value}
                onClick={() => setParams({ q: query, type: filter.value })}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <span>{results.total} {results.total === 1 ? 'result' : 'results'}</span>
        </div>
      )}

      {!query ? (
        <EmptyState
          eyebrow="Start typing"
          title="Search the whole sleeve."
          description="Names, titles, themes such as “change,” and moods such as “neon” all work."
          action={<Link to="/discover">Browse Discover <ArrowRight aria-hidden="true" /></Link>}
        />
      ) : refs.length ? (
        <>
        <Pagination pagination={pagination} label="Search result pages" anchor="search-results" />
        <div className="catalog-grid catalog-grid--results" id="search-results">
          {refs.slice(pagination.offset, pagination.end).map((ref, index) => <CatalogCard itemRef={ref} index={pagination.offset + index} key={`${ref.type}-${ref.id}`} />)}
        </div>
        <Pagination pagination={pagination} label="Search result pages" anchor="search-results" position="bottom" />
        </>
      ) : (
        <EmptyState
          eyebrow="No match"
          title={`Nothing matched “${query}.”`}
          description="Try a shorter phrase, check the spelling, or browse a curated route instead."
          action={<><button type="button" className="text-link" onClick={() => { setDraft(''); setParams({}); }}>Clear search</button><Link to="/discover">Open Discover <ArrowRight aria-hidden="true" /></Link></>}
        />
      )}
    </div>
  );
}
