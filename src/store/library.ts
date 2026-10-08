import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { CatalogItemRef, CatalogItemType } from '../types';

interface LibraryState {
  saved: CatalogItemRef[];
  recentlyViewed: CatalogItemRef[];
  recentQueries: string[];
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  isSaved: (type: CatalogItemType, id: string) => boolean;
  toggleSaved: (type: CatalogItemType, id: string) => boolean;
  removeSaved: (type: CatalogItemType, id: string) => void;
  clearSaved: () => void;
  recordView: (type: CatalogItemType, id: string) => void;
  recordQuery: (query: string) => void;
}

const isCatalogItemRef = (value: unknown): value is CatalogItemRef => {
  if (!value || typeof value !== 'object') return false;
  const ref = value as Partial<CatalogItemRef>;
  return ['song', 'artist', 'album'].includes(ref.type || '') && typeof ref.id === 'string';
};

const safeStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    try {
      const value = window.localStorage.getItem(name);
      if (!value) return null;
      JSON.parse(value);
      return value;
    } catch {
      try {
        window.localStorage.removeItem(name);
      } catch {
        // Ignore cleanup failures when storage access itself is blocked.
      }
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Saving remains usable for the current render even when persistence is unavailable.
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      // A blocked storage API should never break navigation.
    }
  },
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      saved: [],
      recentlyViewed: [],
      recentQueries: [],
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      isSaved: (type, id) => get().saved.some((item) => item.type === type && item.id === id),
      toggleSaved: (type, id) => {
        const exists = get().saved.some((item) => item.type === type && item.id === id);
        if (exists) {
          set({ saved: get().saved.filter((item) => !(item.type === type && item.id === id)) });
          return false;
        }
        set({ saved: [{ type, id, savedAt: Date.now() }, ...get().saved] });
        return true;
      },
      removeSaved: (type, id) =>
        set({ saved: get().saved.filter((item) => !(item.type === type && item.id === id)) }),
      clearSaved: () => set({ saved: [] }),
      recordView: (type, id) => {
        const next = [
          { type, id },
          ...get().recentlyViewed.filter((item) => !(item.type === type && item.id === id)),
        ].slice(0, 6) as CatalogItemRef[];
        set({ recentlyViewed: next });
      },
      recordQuery: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set({
          recentQueries: [
            trimmed,
            ...get().recentQueries.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
          ].slice(0, 5),
        });
      },
    }),
    {
      name: '52lyrics:library:v1',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ saved, recentlyViewed, recentQueries }) => ({
        saved,
        recentlyViewed,
        recentQueries,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState && typeof persistedState === 'object'
          ? persistedState as Partial<LibraryState>
          : {};
        return {
          ...currentState,
          saved: Array.isArray(persisted.saved) ? persisted.saved.filter(isCatalogItemRef) : [],
          recentlyViewed: Array.isArray(persisted.recentlyViewed) ? persisted.recentlyViewed.filter(isCatalogItemRef) : [],
          recentQueries: Array.isArray(persisted.recentQueries)
            ? persisted.recentQueries.filter((query): query is string => typeof query === 'string').slice(0, 5)
            : [],
        };
      },
      skipHydration: true,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useLibraryStore.setState({ saved: [], recentlyViewed: [], recentQueries: [], hydrated: true });
          return;
        }
        state?.setHydrated(true);
      },
    },
  ),
);
