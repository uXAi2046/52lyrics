import type { Song } from '../../types';

export function AvailabilityBadge({ song }: { song: Song }) {
  const full = song.lyricsAvailability === 'full';
  return <span className={`availability ${full ? 'availability--full' : ''}`}>{full ? (song.rights === 'public-domain' ? 'Public-domain lyrics' : 'Full lyrics') : 'Song notes'}</span>;
}

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
