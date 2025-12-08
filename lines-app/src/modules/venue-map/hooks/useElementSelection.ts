/**
 * Hook for managing element selection
 * Handles single and multi-selection with navigation
 */

import { useState, useCallback } from "react";
import type { FloorPlanElement } from "../types";

interface UseElementSelectionReturn {
  selectedElementId: string | null;
  selectedElementIds: Set<string>;
  selectElement: (id: string | null) => void;
  toggleSelection: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  selectNext: () => void;
  selectPrevious: () => void;
  getSelectedElement: (elements: FloorPlanElement[]) => FloorPlanElement | null;
  getSelectedElements: (elements: FloorPlanElement[]) => FloorPlanElement[];
}

export function useElementSelection(): UseElementSelectionReturn {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(new Set());

  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
    setSelectedElementIds(id ? new Set([id]) : new Set());
  }, []);

  const toggleSelection = useCallback(
    (id: string, multiSelect = false) => {
      if (multiSelect) {
        setSelectedElementIds((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
            newSet.delete(id);
            if (newSet.size === 0) {
              setSelectedElementId(null);
            } else if (newSet.size === 1) {
              setSelectedElementId(Array.from(newSet)[0]);
            }
          } else {
            newSet.add(id);
            setSelectedElementId(id);
          }
          return newSet;
        });
      } else {
        setSelectedElementId(id);
        setSelectedElementIds(new Set([id]));
      }
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedElementId(null);
    setSelectedElementIds(new Set());
  }, []);

  const selectNext = useCallback(() => {
    // Will be implemented with elements list
  }, []);

  const selectPrevious = useCallback(() => {
    // Will be implemented with elements list
  }, []);

  const getSelectedElement = useCallback(
    (elements: FloorPlanElement[]): FloorPlanElement | null => {
      if (!selectedElementId) return null;
      return elements.find((e) => e.id === selectedElementId) || null;
    },
    [selectedElementId]
  );

  const getSelectedElements = useCallback(
    (elements: FloorPlanElement[]): FloorPlanElement[] => {
      return elements.filter((e) => selectedElementIds.has(e.id));
    },
    [selectedElementIds]
  );

  return {
    selectedElementId,
    selectedElementIds,
    selectElement,
    toggleSelection,
    clearSelection,
    selectNext,
    selectPrevious,
    getSelectedElement,
    getSelectedElements
  };
}

