/**
 * Zustand store for managing layout state
 * Provides centralized state management with undo/redo support
 */

import { create } from "zustand";
import type { VenueLayout } from "../types";

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
  setLayout: (layout: VenueLayout) => void;
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
}

const MAX_HISTORY = 50;

export const useLayoutStore = create<LayoutState>((set, get) => ({
  layout: {
    layoutData: {
      width: 1200,
      height: 800,
      scale: 1,
      gridSize: 20,
      showGrid: true,
      backgroundColor: "#f8f9fa"
    },
    zones: [],
    tables: [],
    areas: []
  },
  history: [],
  historyIndex: -1,
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
    set({ layout, history: [layout], historyIndex: 0 });
  },

  updateLayout: (updater) => {
    const current = get().layout;
    const updated = updater(current);
    set({ layout: updated });
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
    newHistory.push(JSON.parse(JSON.stringify(layout))); // Deep clone

    // Limit history size
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
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
        layout: JSON.parse(JSON.stringify(previousLayout)),
        historyIndex: historyIndex - 1
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextLayout = history[historyIndex + 1];
      set({
        layout: JSON.parse(JSON.stringify(nextLayout)),
        historyIndex: historyIndex + 1
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
    set({
      history: [JSON.parse(JSON.stringify(layout))],
      historyIndex: 0
    });
  }
}));

