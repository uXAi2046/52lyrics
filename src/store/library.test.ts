import { beforeEach, describe, expect, it } from 'vitest';
import { useLibraryStore } from './library';

describe('local library store', () => {
  beforeEach(() => {
    localStorage.clear();
    useLibraryStore.setState({ saved: [], recentlyViewed: [], recentQueries: [], hydrated: true });
  });

  it('toggles saved catalog references without duplicates', () => {
    expect(useLibraryStore.getState().toggleSaved('song', 'alb23_t1')).toBe(true);
    expect(useLibraryStore.getState().toggleSaved('song', 'alb23_t1')).toBe(false);
    expect(useLibraryStore.getState().saved).toHaveLength(0);
  });

  it('keeps recent views and searches unique and bounded', () => {
    const store = useLibraryStore.getState();
    for (let index = 0; index < 8; index += 1) store.recordView('song', `song-${index}`);
    store.recordView('song', 'song-3');
    expect(useLibraryStore.getState().recentlyViewed).toHaveLength(6);
    expect(useLibraryStore.getState().recentlyViewed[0].id).toBe('song-3');

    ['City', 'Adele', 'Neon', 'City'].forEach((query) => useLibraryStore.getState().recordQuery(query));
    expect(useLibraryStore.getState().recentQueries).toEqual(['City', 'Neon', 'Adele']);
  });

  it('falls back to an empty library when persisted data is damaged', async () => {
    localStorage.setItem('52lyrics:library:v1', '{not valid json');
    useLibraryStore.setState({ saved: [], recentlyViewed: [], recentQueries: [], hydrated: false });

    await useLibraryStore.persist.rehydrate();

    expect(useLibraryStore.getState().saved).toEqual([]);
    expect(useLibraryStore.getState().hydrated).toBe(true);
  });
});
