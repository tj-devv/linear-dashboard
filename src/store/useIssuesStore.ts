import { create } from "zustand";
import type { NormalizedIssue, UploadedFile, Filters, Theme } from "@/lib/types";

interface IssuesState {
  issues: NormalizedIssue[];
  file: UploadedFile | null;
  filters: Filters;
  theme: Theme;
  isLoading: boolean;
  error: string | null;

  setIssues: (issues: NormalizedIssue[], file: UploadedFile) => void;
  clearIssues: () => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: Filters = {
  status: [],
  priority: [],
  assignee: [],
  project: [],
  dateRange: { from: null, to: null },
};

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem("linear-dashboard-theme");
  return (stored === "dark" || stored === "light") ? stored : "light";
};

export const useIssuesStore = create<IssuesState>()((set, get) => ({
  issues: [],
  file: null,
  filters: defaultFilters,
  theme: getStoredTheme(),
  isLoading: false,
  error: null,

  setIssues: (issues, file) => {
    set({ issues, file, error: null });
  },

  clearIssues: () => {
    set({ issues: [], file: null, filters: defaultFilters });
  },

  setFilters: (filtersUpdate) => {
    set((state) => ({
      filters: { ...state.filters, ...filtersUpdate },
    }));
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
  },

  setTheme: (theme) => {
    localStorage.setItem("linear-dashboard-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },

  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    get().setTheme(newTheme);
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
