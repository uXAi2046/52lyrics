import { useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { CatalogCard } from '../components/ui/CatalogCard';
import { Pagination } from '../components/ui/Pagination';
import { paginate } from '../data/pagination';
import { FULL_LYRIC_WORKS } from '../data/catalog';
import type { CatalogItemRef, RightsStatus } from '../types';

export const meta = () => [
  { title: 'Complete lyrics — read every full text on 52lyrics' },
  { name: 'description', content: 'Browse every song published with complete lyrics on 52lyrics: verified public-domain texts and original works, each with a fixed source edition and rights note.' },
];

const FILTERS: Array<{ key: 'all' | RightsStatus; label: string }> = [
  { key: 'all', label: 'All complete texts' },
  { key: 'public-domain', label: 'Public domain' },
  { key: 'original', label: 'Original works' },
];

// One card per distinct work; duplicate release pages are not listed twice.
export default function CompleteLyrics() {
  const [filter, setFilter] = useState<'all' | RightsStatus>('all');
  const [params] = useSearchParams();

  const works = useMemo(() => (filter === 'all' ? FULL_LYRIC_WORKS : FULL_LYRIC_WORKS.filter((song) => song.rights === filter)), [filter]);
  const pagination = paginate(works.length, params.get('page'));
  const itemRefs: CatalogItemRef[] = useMemo(() => works.map((song) => ({ type: 'song' as const, id: song.id })), [works]);

  const publicDomainCount = FULL_LYRIC_WORKS.filter((song) => song.rights === 'public-domain').length;
  const originalCount = FULL_LYRIC_WORKS.filter((song) => song.rights === 'original').length;

  return (
    <div className="shell page">
      <header className="page-intro page-intro--wide">
        <span className="eyebrow">Every text you can read here</span>
        <h1>Complete lyrics,<br /><em>source and all.</em></h1>
        <p>{FULL_LYRIC_WORKS.length} distinct works publish complete lyric text on 52lyrics: {publicDomainCount} verified public-domain editions and {originalCount} original works. Each text page names its fixed source edition, retrieval date, and rights evidence. Duplicate releases are listed once.</p>
        <p>New entries appear after their text has been checked stanza by stanza against a pinned source revision. Nothing is counted here until the complete words are on the page. Want editorial routes instead? <Link className="text-link" to="/discover">Explore Discover →</Link></p>
      </header>

      <div className="filter-bar" aria-label="Filter complete lyrics">
        <BookOpen aria-hidden="true" />
        {FILTERS.map((option) => (
          <button key={option.key} type="button" aria-pressed={filter === option.key} onClick={() => setFilter(option.key)}>{option.label}</button>
        ))}
      </div>

      {works.length ? (
        <>
          <Pagination pagination={pagination} label="Complete lyrics pages" anchor="lyrics-index" parameter="page" />
          <div className="catalog-grid" id="lyrics-index">
            {itemRefs.slice(pagination.offset, pagination.end).map((ref, index) => <CatalogCard key={ref.id} itemRef={ref} index={pagination.offset + index} />)}
          </div>
          <Pagination pagination={pagination} label="Complete lyrics pages" anchor="lyrics-index" parameter="page" position="bottom" />
        </>
      ) : (
        <div className="empty-state">
          <span className="eyebrow">No texts in this category yet</span>
          <h2>Nothing published in this rights category.</h2>
          <p>Lyrics are added only after review of their source and rights.</p>
        </div>
      )}
    </div>
  );
}
