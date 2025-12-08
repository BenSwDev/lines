/**
 * Hook for zooming to elements
 * Provides zoom functionality that focuses on specific elements
 */

import { useCallback } from "react";
import type { FloorPlanElement } from "../types";

interface ZoomState {
  zoom: number;
  pan: { x: number; y: number };
}

interface UseZoomToElementReturn {
  zoomToElement: (
    element: FloorPlanElement,
    containerSize: { width: number; height: number }
  ) => ZoomState;
  zoomToFit: (
    elements: FloorPlanElement[],
    containerSize: { width: number; height: number },
    padding?: number
  ) => ZoomState;
}

export function useZoomToElement(): UseZoomToElementReturn {
  const zoomToElement = useCallback(
    (
      element: FloorPlanElement,
      containerSize: { width: number; height: number }
    ): ZoomState => {
      // Calculate element center
      const elementCenterX = element.x + element.width / 2;
      const elementCenterY = element.y + element.height / 2;

      // Calculate optimal zoom (fit element with some padding)
      const padding = 100; // pixels
      const zoomX = (containerSize.width - padding * 2) / element.width;
      const zoomY = (containerSize.height - padding * 2) / element.height;
      const newZoom = Math.min(zoomX, zoomY, 2); // Max zoom 2x
      const finalZoom = Math.max(newZoom, 0.5); // Min zoom 0.5x

      // Calculate pan to center element
      const canvasCenterX = containerSize.width / 2;
      const canvasCenterY = containerSize.height / 2;

      const newPanX = canvasCenterX - elementCenterX * finalZoom;
      const newPanY = canvasCenterY - elementCenterY * finalZoom;

      return {
        zoom: finalZoom,
        pan: { x: newPanX, y: newPanY }
      };
    },
    []
  );

  const zoomToFit = useCallback(
    (
      elements: FloorPlanElement[],
      containerSize: { width: number; height: number },
      padding = 50
    ): ZoomState => {
      if (elements.length === 0) {
        return { zoom: 1, pan: { x: 0, y: 0 } };
      }

      // Calculate bounding box
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      elements.forEach((element) => {
        minX = Math.min(minX, element.x);
        minY = Math.min(minY, element.y);
        maxX = Math.max(maxX, element.x + element.width);
        maxY = Math.max(maxY, element.y + element.height);
      });

      const width = maxX - minX;
      const height = maxY - minY;
      const centerX = minX + width / 2;
      const centerY = minY + height / 2;

      // Calculate zoom to fit
      const zoomX = (containerSize.width - padding * 2) / width;
      const zoomY = (containerSize.height - padding * 2) / height;
      const newZoom = Math.min(zoomX, zoomY, 1.5);
      const finalZoom = Math.max(newZoom, 0.3);

      // Calculate pan to center
      const canvasCenterX = containerSize.width / 2;
      const canvasCenterY = containerSize.height / 2;

      const newPanX = canvasCenterX - centerX * finalZoom;
      const newPanY = canvasCenterY - centerY * finalZoom;

      return {
        zoom: finalZoom,
        pan: { x: newPanX, y: newPanY }
      };
    },
    []
  );

  return { zoomToElement, zoomToFit };
}

