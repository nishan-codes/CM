import { create } from "zustand";

export type SearchResult = {
  title: string;
  thumbnail: string;
  url: string;
};

export type SearchStore = {
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
  clearSearchResults: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  expectedCount: number;
  setExpectedCount: (count: number) => void;
};

export const useSearchStore = create<SearchStore>((set) => ({
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),
  clearSearchResults: () => set({ searchResults: [] }),
  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  expectedCount: 0,
  setExpectedCount: (count) => set({ expectedCount: count }),
}));
