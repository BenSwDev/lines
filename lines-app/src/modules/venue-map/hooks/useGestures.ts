/**
 * Touch & Mouse Gestures Hook
 * Unified gesture handling for touch and mouse
 */

import { useRef, useCallback } from "react";
import * as React from "react";
import { useDevice } from "./useDevice";

export interface GestureHandlers {
  onTap?: (e: { x: number; y: number; target?: EventTarget }) => void;
  onDoubleTap?: (e: { x: number; y: number; target?: EventTarget }) => void;
  onLongPress?: (e: { x: number; y: number; target?: EventTarget }) => void;
  onPanStart?: (e: { x: number; y: number }) => void;
  onPan?: (e: { x: number; y: number; deltaX: number; deltaY: number }) => void;
  onPanEnd?: () => void;
  onPinchStart?: (e: { centerX: number; centerY: number; distance: number }) => void;
  onPinch?: (e: { centerX: number; centerY: number; scale: number; distance: number }) => void;
  onPinchEnd?: () => void;
}

const LONG_PRESS_DURATION = 500; // ms
const DOUBLE_TAP_DURATION = 300; // ms

export function useGestures(handlers: GestureHandlers) {
  const device = useDevice();
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const pinchStartRef = useRef<{ centerX: number; centerY: number; distance: number } | null>(null);

  // Calculate distance between two points
  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Get touch or mouse coordinates
  const getCoordinates = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
    if ("touches" in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if ("clientX" in e) {
      return { x: e.clientX, y: e.clientY };
    }
    return { x: 0, y: 0 };
  };

  // Handle tap (click or touch)
  const handleTap = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const coords = getCoordinates(e);
      const target = e.target;

      // Check for double tap
      const now = Date.now();
      if (lastTapRef.current) {
        const timeDiff = now - lastTapRef.current.time;
        const distance = getDistance(coords, lastTapRef.current);
        
        if (timeDiff < DOUBLE_TAP_DURATION && distance < 50) {
          // Double tap detected
          handlers.onDoubleTap?.({ x: coords.x, y: coords.y, target: target as EventTarget });
          lastTapRef.current = null;
          return;
        }
      }

      lastTapRef.current = { time: now, x: coords.x, y: coords.y };

      // Single tap (with delay to detect double tap)
      setTimeout(() => {
        if (lastTapRef.current && Date.now() - lastTapRef.current.time < DOUBLE_TAP_DURATION) {
          handlers.onTap?.({ x: coords.x, y: coords.y, target: target as EventTarget });
        }
      }, DOUBLE_TAP_DURATION);
    },
    [handlers]
  );

  // Handle long press
  const handleLongPressStart = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const coords = getCoordinates(e);
      const target = e.target;

      longPressTimerRef.current = setTimeout(() => {
        handlers.onLongPress?.({ x: coords.x, y: coords.y, target: target as EventTarget });
      }, LONG_PRESS_DURATION);
    },
    [handlers]
  );

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Handle pan (drag)
  const handlePanStart = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const coords = getCoordinates(e);
      panStartRef.current = coords;
      handlers.onPanStart?.(coords);
    },
    [handlers]
  );

  const handlePan = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!panStartRef.current) return;
      
      const coords = getCoordinates(e);
      const deltaX = coords.x - panStartRef.current.x;
      const deltaY = coords.y - panStartRef.current.y;

      handlers.onPan?.({
        x: coords.x,
        y: coords.y,
        deltaX,
        deltaY
      });
    },
    [handlers]
  );

  const handlePanEnd = useCallback(() => {
    panStartRef.current = null;
    handlers.onPanEnd?.();
  }, [handlers]);

  // Handle pinch (zoom)
  const handlePinchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      
      const touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      const distance = getDistance(touch1, touch2);
      const centerX = (touch1.x + touch2.x) / 2;
      const centerY = (touch1.y + touch2.y) / 2;

      pinchStartRef.current = { centerX, centerY, distance };
      handlers.onPinchStart?.({ centerX, centerY, distance });
    },
    [handlers]
  );

  const handlePinch = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchStartRef.current) return;

      const touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      const distance = getDistance(touch1, touch2);
      const scale = distance / pinchStartRef.current.distance;
      const centerX = (touch1.x + touch2.x) / 2;
      const centerY = (touch1.y + touch2.y) / 2;

      handlers.onPinch?.({
        centerX,
        centerY,
        scale,
        distance
      });
    },
    [handlers]
  );

  const handlePinchEnd = useCallback(() => {
    pinchStartRef.current = null;
    handlers.onPinchEnd?.();
  }, [handlers]);

  // Mouse event handlers - React events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (device.hasMouse) {
        handleLongPressStart(e.nativeEvent);
        handlePanStart(e.nativeEvent);
      }
    },
    [device.hasMouse, handleLongPressStart, handlePanStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (device.hasMouse && panStartRef.current) {
        handlePan(e.nativeEvent);
      }
    },
    [device.hasMouse, handlePan]
  );

  const handleMouseUp = useCallback(() => {
    if (device.hasMouse) {
      handleLongPressEnd();
      handlePanEnd();
    }
  }, [device.hasMouse, handleLongPressEnd, handlePanEnd]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (device.hasMouse) {
        handleTap(e.nativeEvent);
      }
    },
    [device.hasMouse, handleTap]
  );

  // Touch event handlers - React events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (device.hasTouch) {
        if (e.touches.length === 1) {
          handleLongPressStart(e.nativeEvent);
          handlePanStart(e.nativeEvent);
        } else if (e.touches.length === 2) {
          handlePinchStart(e.nativeEvent);
        }
      }
    },
    [device.hasTouch, handleLongPressStart, handlePanStart, handlePinchStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (device.hasTouch) {
        if (e.touches.length === 1 && panStartRef.current) {
          handlePan(e.nativeEvent);
        } else if (e.touches.length === 2) {
          handlePinch(e.nativeEvent);
        }
      }
    },
    [device.hasTouch, handlePan, handlePinch]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (device.hasTouch) {
        handleLongPressEnd();
        if (e.touches.length === 0) {
          handlePanEnd();
          handlePinchEnd();
        } else if (e.touches.length === 1) {
          handlePinchEnd();
        }
      }
    },
    [device.hasTouch, handleLongPressEnd, handlePanEnd, handlePinchEnd]
  );

  const handleTouchCancel = useCallback(() => {
    if (device.hasTouch) {
      handleLongPressEnd();
      handlePanEnd();
      handlePinchEnd();
    }
  }, [device.hasTouch, handleLongPressEnd, handlePanEnd, handlePinchEnd]);

  return {
    // Mouse handlers
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onClick: handleClick,
    // Touch handlers
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel
  };
}

