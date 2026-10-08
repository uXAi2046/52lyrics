import { Bookmark, Check, Share2 } from 'lucide-react';
import type { CatalogItemType } from '../../types';
import { useLibraryStore } from '../../store/library';
import { useToast } from './Toast';

interface SaveButtonProps {
  type: CatalogItemType;
  id: string;
  label?: string;
  compact?: boolean;
}

export function SaveButton({ type, id, label = 'Save', compact = false }: SaveButtonProps) {
  const hydrated = useLibraryStore((state) => state.hydrated);
  const isSaved = useLibraryStore((state) => state.saved.some((item) => item.type === type && item.id === id));
  const toggleSaved = useLibraryStore((state) => state.toggleSaved);
  const { showToast } = useToast();

  const onClick = () => {
    const next = toggleSaved(type, id);
    if (next) {
      showToast(`${label}d to your library`, 'success');
      return;
    }

    showToast('Removed from your library', 'success', {
      label: 'Undo',
      onClick: () => toggleSaved(type, id),
    });
  };

  return (
    <button
      type="button"
      className={`action-button ${isSaved ? 'action-button--active' : ''} ${compact ? 'action-button--compact' : ''}`}
      onClick={onClick}
      aria-pressed={hydrated ? isSaved : false}
      disabled={!hydrated}
    >
      {isSaved ? <Check aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
      {!compact && <span>{isSaved ? 'Saved' : label}</span>}
    </button>
  );
}

interface ShareButtonProps {
  title: string;
  text: string;
  compact?: boolean;
}

export function ShareButton({ title, text, compact = false }: ShareButtonProps) {
  const { showToast } = useToast();

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        showToast('Shared', 'success');
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast('Link copied', 'success');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      showToast('Could not share this page. Copy the address from your browser.', 'error');
    }
  };

  return (
    <button type="button" className={`action-button ${compact ? 'action-button--compact' : ''}`} onClick={onShare}>
      <Share2 aria-hidden="true" />
      {!compact && <span>Share</span>}
    </button>
  );
}
