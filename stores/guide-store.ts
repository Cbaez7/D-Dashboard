import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SOP_PAGES, type SopPage } from "@/data/guide";

type GuideState = {
  pages: SopPage[];
  acknowledgments: Record<string, number>;
  acknowledge: (pageId: string, version: number) => void;
  savePage: (page: SopPage) => void;
};

export const useGuideStore = create<GuideState>()(
  persist(
    (set) => ({
      pages: SOP_PAGES,
      acknowledgments: {},
      acknowledge: (pageId, version) =>
        set((state) => ({
          acknowledgments: { ...state.acknowledgments, [pageId]: version },
        })),
      savePage: (page) =>
        set((state) => ({
          pages: state.pages.map((existing) =>
            existing.id === page.id
              ? { ...page, version: existing.version + 1, updatedAt: new Date().toISOString() }
              : existing,
          ),
        })),
    }),
    { name: "bng-guide" },
  ),
);
