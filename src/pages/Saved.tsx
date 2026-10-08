import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Trash2, X } from 'lucide-react';
import { Link } from 'react-router';
import { CatalogCard } from '../components/ui/CatalogCard';
import { EmptyState } from '../components/ui/Status';
import { useToast } from '../components/ui/Toast';
import { resolveCatalogItem } from '../data/catalog';
import { useLibraryStore } from '../store/library';
import type { CatalogItemType } from '../types';

type SavedFilter = 'all' | CatalogItemType;

export const meta = () => [
  { title: 'Your saved library — 52lyrics' },
  { name: 'description', content: 'Return to songs, artists, and albums saved locally on this device.' },
  { name: 'robots', content: 'noindex' },
];

export default function Saved() {
  const [filter, setFilter] = useState<SavedFilter>('all');
  const [confirming, setConfirming] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const hydrated = useLibraryStore((state) => state.hydrated);
  const saved = useLibraryStore((state) => state.saved);
  const clearSaved = useLibraryStore((state) => state.clearSaved);
  const { showToast } = useToast();
  const visible = useMemo(() =>
    saved.filter((ref) => (filter === 'all' || ref.type === filter) && resolveCatalogItem(ref)),
  [saved, filter]);

  const clear = () => {
    clearSaved();
    setConfirming(false);
    showToast('Saved library cleared', 'success');
  };

  useEffect(() => {
    if (!confirming) return;

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setConfirming(false);
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hasAttribute('disabled'));
      const first = focusable[0];
      const last = focusable.at(-1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [confirming]);

  return (
    <div className="shell page">
      <header className="page-intro page-intro--split">
        <div><span className="eyebrow">Private to this device</span><h1>Your saved<br /><em>liner notes.</em></h1></div>
        <p>Keep songs, artists, and albums close without creating an account. Your library stays in this browser.</p>
      </header>

      {!hydrated ? (
        <div className="skeleton-row" aria-label="Loading saved library"><span /><span /><span /></div>
      ) : saved.length ? (
        <>
          <div className="result-toolbar">
            <div className="filter-tabs" aria-label="Saved item type">
              {(['all', 'song', 'artist', 'album'] as SavedFilter[]).map((value) => (
                <button type="button" key={value} className={filter === value ? 'is-active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>
                  {value === 'all' ? 'All' : `${value[0].toUpperCase()}${value.slice(1)}s`}
                </button>
              ))}
            </div>
            <button type="button" className="danger-link" onClick={() => setConfirming(true)}><Trash2 aria-hidden="true" /> Clear all</button>
          </div>
          {visible.length ? (
            <div className="catalog-grid catalog-grid--results">
              {visible.map((ref, index) => <CatalogCard key={`${ref.type}-${ref.id}`} itemRef={ref} index={index} />)}
            </div>
          ) : (
            <EmptyState eyebrow="Nothing in this view" title={`No saved ${filter}s yet.`} description="Switch filters or save something new from the catalog." />
          )}
        </>
      ) : (
        <EmptyState
          eyebrow="Your library is open"
          title="Save the pieces worth returning to."
          description="Use Save on any song, artist, or album. It will stay here on this device."
          action={<Link to="/discover">Start discovering <ArrowRight aria-hidden="true" /></Link>}
        />
      )}

      {confirming && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setConfirming(false)}>
          <div ref={dialogRef} className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="clear-title" aria-describedby="clear-description" onMouseDown={(event) => event.stopPropagation()}>
            <button className="confirm-dialog__close" type="button" onClick={() => setConfirming(false)} aria-label="Close"><X aria-hidden="true" /></button>
            <span className="eyebrow">Clear local library</span>
            <h2 id="clear-title">Remove every saved item?</h2>
            <p id="clear-description">This only affects this browser. The action cannot be undone.</p>
            <div><button ref={cancelRef} type="button" className="action-button" onClick={() => setConfirming(false)}>Keep library</button><button type="button" className="action-button action-button--danger" onClick={clear}>Clear all</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
