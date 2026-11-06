import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CarsUiState {
  searchText: string;
  showOnlyFavorites: boolean;
  favoriteIds: string[];
  setSearchText: (searchText: string) => void;
  setShowOnlyFavorites: (showOnlyFavorites: boolean) => void;
  toggleFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  syncFavorites: (existingIds: string[]) => void;
}

export const useCarsUiStore = create<CarsUiState>()(
  persist(
    (set) => ({
      searchText: '',
      showOnlyFavorites: false,
      favoriteIds: [],

      setSearchText: (searchText) => set({ searchText }),
      setShowOnlyFavorites: (showOnlyFavorites) => set({ showOnlyFavorites }),

      toggleFavorite: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds.filter((favoriteId) => favoriteId !== id)
            : [...state.favoriteIds, id],
        })),

      removeFavorite: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((favoriteId) => favoriteId !== id),
        })),

      syncFavorites: (existingIds) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => existingIds.includes(id)),
        })),
    }),
    {
      name: 'cars-ui',
      partialize: (state) => ({ favoriteIds: state.favoriteIds }),
    }
  )
);
