import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, Clock3, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { albumPath, artistPath, songPath } from '../../data/catalog';
import { searchCatalog } from '../../data/search';
import { useLibraryStore } from '../../store/library';

interface GlobalSearchProps {
  autoFocus?: boolean;
  onNavigate?: () => void;
  variant?: 'header' | 'hero' | 'mobile';
}

export default function GlobalSearch({ autoFocus, onNavigate, variant = 'header' }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const recentQueries = useLibraryStore((state) => state.recentQueries);
  const recordQuery = useLibraryStore((state) => state.recordQuery);
  const results = useMemo(() => searchCatalog(query, 'all', 3), [query]);

  const options = useMemo(() => [
    ...results.songs.map((song) => ({
      key: `song-${song.id}`,
      label: song.title,
      meta: `${song.artistName} · ${song.lyricsAvailability === 'full' ? 'Full lyrics' : 'Song notes'}`,
      path: songPath(song),
      group: 'Songs',
    })),
    ...results.artists.map((artist) => ({
      key: `artist-${artist.id}`,
      label: artist.name,
      meta: artist.genres.join(' · '),
      path: artistPath(artist),
      group: 'Artists',
    })),
    ...results.albums.map((album) => ({
      key: `album-${album.id}`,
      label: album.title,
      meta: `${album.artistName} · ${album.type === 'Songbook' ? 'Songbook' : album.year ?? 'Date not supplied'}`,
      path: albumPath(album),
      group: 'Albums',
    })),
  ], [results]);

  const go = (path: string, searchQuery = query) => {
    recordQuery(searchQuery);
    setOpen(false);
    setActiveIndex(-1);
    navigate(path);
    onNavigate?.();
  };

  const submit = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    go(`/search?q=${encodeURIComponent(trimmed)}&type=all`, trimmed);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, -1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && options[activeIndex]) go(options[activeIndex].path);
      else submit();
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const showPanel = open && Boolean(query.trim() || recentQueries.length > 0);

  return (
    <div className={`global-search global-search--${variant}`}>
      <div className="global-search__field">
        <Search aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          autoFocus={autoFocus}
          placeholder={variant === 'hero' ? 'Try “City Lights” or “Adele”' : 'Search songs, artists, albums'}
          aria-label="Search songs, artists, and albums"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="global-search-results"
          aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }} aria-label="Clear search">
            <X aria-hidden="true" />
          </button>
        )}
        <button type="button" className="global-search__submit" onMouseDown={(event) => event.preventDefault()} onClick={submit} aria-label="View all search results">
          <ArrowRight aria-hidden="true" />
        </button>
      </div>

      {showPanel && (
        <div className="search-panel" id="global-search-results" role="listbox">
          {!query.trim() ? (
            <div className="search-panel__recent">
              <span className="eyebrow">Recent searches</span>
              {recentQueries.map((recent) => (
                <button key={recent} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => {
                  setQuery(recent);
                  go(`/search?q=${encodeURIComponent(recent)}&type=all`, recent);
                }}>
                  <Clock3 aria-hidden="true" /><span>{recent}</span>
                </button>
              ))}
            </div>
          ) : options.length ? (
            <>
              {['Songs', 'Artists', 'Albums'].map((group) => {
                const grouped = options.filter((option) => option.group === group);
                if (!grouped.length) return null;
                return (
                  <div className="search-panel__group" key={group}>
                    <span className="eyebrow">{group}</span>
                    {grouped.map((option) => {
                      const index = options.indexOf(option);
                      return (
                        <button
                          type="button"
                          id={`search-option-${index}`}
                          key={option.key}
                          role="option"
                          aria-selected={index === activeIndex}
                          className={index === activeIndex ? 'is-active' : ''}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => go(option.path)}
                        >
                          <span><strong>{option.label}</strong><small>{option.meta}</small></span>
                          <ArrowRight aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              <button className="search-panel__all" type="button" onMouseDown={(event) => event.preventDefault()} onClick={submit}>
                View all results for “{query.trim()}” <ArrowRight aria-hidden="true" />
              </button>
            </>
          ) : (
            <div className="search-panel__empty">
              <span className="eyebrow">No match</span>
              <p>Try an artist name, album title, or a shorter phrase.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
