import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { NormalizedIssue, UploadedFile, Filters, Theme } from "@/lib/types";

const DB_NAME = "linear-dashboard";
const DB_VERSION = 1;
const STORE_NAME = "issues";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

const saveToIndexedDB = async (issues: NormalizedIssue[]): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  store.clear();
  for (const issue of issues) {
    store.put(issue);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const loadFromIndexedDB = async (): Promise<NormalizedIssue[]> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

const clearIndexedDB = async (): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

interface IssuesState {
  issues: NormalizedIssue[];
  file: UploadedFile | null;
  filters: Filters;
  theme: Theme;
  isLoading: boolean;
  error: string | null;
  hasCheckedStorage: boolean;

  setIssues: (issues: NormalizedIssue[], file: UploadedFile) => Promise<void>;
  clearIssues: () => Promise<void>;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initFromStorage: () => Promise<void>;
}

const defaultFilters: Filters = {
  status: [],
  priority: [],
  assignee: [],
  project: [],
  dateRange: { from: null, to: null },
};

export const useIssuesStore = create<IssuesState>()(
  persist(
    (set, get) => ({
      issues: [],
      file: null,
      filters: defaultFilters,
      theme: "light",
      isLoading: false,
      error: null,
      hasCheckedStorage: false,

      setIssues: async (issues, file) => {
        try {
          set({ isLoading: true, error: null });
          await saveToIndexedDB(issues);
          set({ issues, file, isLoading: false });
        } catch (e) {
          set({ error: "Failed to save data", isLoading: false });
        }
      },

      clearIssues: async () => {
        try {
          await clearIndexedDB();
          set({ issues: [], file: null, filters: defaultFilters });
        } catch (e) {
          set({ error: "Failed to clear data" });
        }
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
        set({ theme });
        document.documentElement.classList.toggle("dark", theme === "dark");
      },

      toggleTheme: () => {
        const newTheme = get().theme === "light" ? "dark" : "light";
        get().setTheme(newTheme);
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      initFromStorage: async () => {
        if (get().hasCheckedStorage) return;

        try {
          set({ isLoading: true });
          const issues = await loadFromIndexedDB();
          const stored = localStorage.getItem("linear-dashboard-storage");

          let file: UploadedFile | null = null;
          let theme: Theme = "light";

          if (stored) {
            const parsed = JSON.parse(stored);
            file = parsed.state?.file || null;
            theme = parsed.state?.theme || "light";
          }

          set({
            issues,
            file,
            theme,
            isLoading: false,
            hasCheckedStorage: true,
          });

          document.documentElement.classList.toggle("dark", theme === "dark");
        } catch (e) {
          set({ isLoading: false, hasCheckedStorage: true });
        }
      },
    }),
    {
      name: "linear-dashboard-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        file: state.file,
        filters: state.filters,
        theme: state.theme,
      }),
    }
  )
);