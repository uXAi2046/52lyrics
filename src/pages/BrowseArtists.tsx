import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { CatalogCard } from '../components/ui/CatalogCard';
import { EmptyState } from '../components/ui/Status';
import { ARTISTS } from '../data/catalog';
import { normalizeCatalogText } from '../data/normalize';
import { paginate } from '../data/pagination';
import { Pagination } from '../components/ui/Pagination';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const meta = () => [
  { title: 'Artist index A–Z — 52lyrics' },
  { name: 'description', content: 'Browse the 52lyrics artist catalog alphabetically or search by name and genre.' },
];

export default function BrowseArtists() {
  const [params, setParams] = useSearchParams();
  const letter = LETTERS.includes(params.get('letter')) ? params.get('letter') : 'all';
  const query = params.get('q') || '';
  const setQuery = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set('q', value); else next.delete('q');
    next.delete('page');
    setParams(next, { replace: true });
  };
  const setLetter = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete('letter'); else next.set('letter', value);
    next.delete('page');
    setParams(next);
  };

  const artists = useMemo(() => ARTISTS.filter((artist) => {
    const matchesLetter = letter === 'all' || normalizeCatalogText(artist.name).toUpperCase().startsWith(letter);
    const normalizedQuery = normalizeCatalogText(query);
    const matchesQuery = !normalizedQuery || [artist.name, ...artist.genres].some((value) => normalizeCatalogText(value).includes(normalizedQuery));
    return matchesLetter && matchesQuery;
  }).sort((left, right) => left.name.localeCompare(right.name, 'en') || left.id.localeCompare(right.id)), [letter, query]);
  const pagination = paginate(artists.length, params.get('page'));

  return (
    <div className="shell page">
      <header className="page-intro page-intro--split">
        <div><span className="eyebrow">A–Z catalog</span><h1>Every voice,<br /><em>within reach.</em></h1></div>
        <div className="artist-search">
          <Search aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by name or genre" aria-label="Filter artists" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear artist filter"><X aria-hidden="true" /></button>}
        </div>
      </header>

      <nav className="alphabet-nav" aria-label="Artist first letter">
        <button type="button" onClick={() => setLetter('all')} className={letter === 'all' ? 'is-active' : ''} aria-current={letter === 'all' ? 'page' : undefined}>All</button>
        {LETTERS.map((value) => (
          <button type="button" key={value} onClick={() => setLetter(value)} className={letter === value ? 'is-active' : ''} aria-current={letter === value ? 'page' : undefined}>{value}</button>
        ))}
      </nav>

      <div className="catalog-summary">
        <span><strong>{artists.length}</strong> matching artists</span>
        <span><strong>{artists.reduce((total, artist) => total + artist.songCount, 0)}</strong> cataloged tracks</span>
        <span>Metadata and availability are clearly labeled</span>
      </div>

      {artists.length ? (
        <>
        <Pagination pagination={pagination} label="Artist pages" anchor="artist-results" />
        <div className="artist-index" id="artist-results">
          {artists.slice(pagination.offset, pagination.end).map((artist, index) => (
            <CatalogCard key={artist.id} itemRef={{ type: 'artist', id: artist.id }} index={pagination.offset + index} />
          ))}
        </div>
        <Pagination pagination={pagination} label="Artist pages" anchor="artist-results" position="bottom" />
        </>
      ) : (
        <EmptyState
          eyebrow="No artist match"
          title="Try another part of the alphabet."
          description="Clear the text filter or choose All to return to the full index."
          action={<button type="button" className="text-link" onClick={() => { setQuery(''); setParams({}); }}>Show all artists</button>}
        />
      )}
      <p className="page-footnote">Looking for a song instead? <Link to="/search">Search the full catalog.</Link></p>
    </div>
  );
}
