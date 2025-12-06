/**
 * Zustand store for managing layout state
 * Best practices 2026: Type-safe, immutable, validated state management
 */

import { create } from "zustand";
import type { VenueLayout } from "../types";
import { createDefaultLayout, normalizeLayout } from "../utils/layoutUtils";

interface LayoutState {
  layout: VenueLayout;
  history: VenueLayout[];
  historyIndex: number;
  selectedElementId: string | null;
  toolMode: "select" | "zone" | "table" | "area" | "entrance" | "exit";
  viewMode: "edit" | "view";
  zoom: number;
  showGrid: boolean;
  panOffset: { x: number; y: number };
  isDragging: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  setLayout: (layout: VenueLayout | Partial<VenueLayout> | null | undefined) => void;
  updateLayout: (updater: (layout: VenueLayout) => VenueLayout) => void;
  selectElement: (id: string | null) => void;
  setToolMode: (mode: LayoutState["toolMode"]) => void;
  setViewMode: (mode: "edit" | "view") => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;

  // History management
  pushToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  reset: () => void;
}

const MAX_HISTORY = 50;

/**
 * Deep clone a layout for history
 */
function cloneLayout(layout: VenueLayout): VenueLayout {
  return JSON.parse(JSON.stringify(layout)) as VenueLayout;
}

export const useLayoutStore = create<LayoutState>((set, get) => {
  const defaultLayout = createDefaultLayout();

  return {
    layout: defaultLayout,
    history: [cloneLayout(defaultLayout)],
    historyIndex: 0,
    selectedElementId: null,
    toolMode: "select",
    viewMode: "edit",
    zoom: 1,
    showGrid: true,
    panOffset: { x: 0, y: 0 },
    isDragging: false,
    isSaving: false,
    error: null,

    setLayout: (layout) => {
      const normalized = normalizeLayout(layout);
      const cloned = cloneLayout(normalized);
      set({
        layout: normalized,
        history: [cloned],
        historyIndex: 0,
        selectedElementId: null,
        error: null
      });
    },

    updateLayout: (updater) => {
      const current = get().layout;
      const updated = updater(current);
      const normalized = normalizeLayout(updated);
      set({ layout: normalized, error: null });
    },

    selectElement: (id) => set({ selectedElementId: id }),

    setToolMode: (mode) => set({ toolMode: mode }),

    setViewMode: (mode) => set({ viewMode: mode }),

    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

    setPanOffset: (offset) => set({ panOffset: offset }),

    setIsDragging: (isDragging) => set({ isDragging }),

    setIsSaving: (isSaving) => set({ isSaving }),

    setError: (error) => set({ error }),

    pushToHistory: () => {
      const { layout, history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(cloneLayout(layout));

      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      } else {
        // Only increment index if we didn't remove items
        set({
          history: newHistory,
          historyIndex: newHistory.length - 1
        });
        return;
      }

      set({
        history: newHistory,
        historyIndex: newHistory.length - 1
      });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const previousLayout = history[historyIndex - 1];
        set({
          layout: cloneLayout(previousLayout),
          historyIndex: historyIndex - 1,
          error: null
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextLayout = history[historyIndex + 1];
        set({
          layout: cloneLayout(nextLayout),
          historyIndex: historyIndex + 1,
          error: null
        });
      }
    },

    canUndo: () => {
      const { historyIndex } = get();
      return historyIndex > 0;
    },

    canRedo: () => {
      const { history, historyIndex } = get();
      return historyIndex < history.length - 1;
    },

    clearHistory: () => {
      const { layout } = get();
      const cloned = cloneLayout(layout);
      set({
        history: [cloned],
        historyIndex: 0
      });
    },

    reset: () => {
      const defaultLayout = createDefaultLayout();
      const cloned = cloneLayout(defaultLayout);
      set({
        layout: defaultLayout,
        history: [cloned],
        historyIndex: 0,
        selectedElementId: null,
        toolMode: "select",
        zoom: 1,
        panOffset: { x: 0, y: 0 },
        error: null
      });
    }
  };
});
