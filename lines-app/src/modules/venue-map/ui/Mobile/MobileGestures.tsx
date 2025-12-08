/**
 * Mobile Gestures Component
 * Wrapper component for touch gesture handling on mobile
 */

"use client";

import { ReactNode, useRef } from "react";
import { useGestures, type GestureHandlers } from "../../hooks/useGestures";
import { useDevice } from "../../hooks/useDevice";

interface MobileGesturesProps {
  children: ReactNode;
  onTap?: (e: { x: number; y: number; target?: EventTarget }) => void;
  onDoubleTap?: (e: { x: number; y: number; target?: EventTarget }) => void;
  onLongPress?: (e: { x: number; y: number; target?: EventTarget }) => void;
  onPanStart?: (e: { x: number; y: number }) => void;
  onPan?: (e: { x: number; y: number; deltaX: number; deltaY: number }) => void;
  onPanEnd?: () => void;
  onPinchStart?: (e: { centerX: number; centerY: number; distance: number }) => void;
  onPinch?: (e: { centerX: number; centerY: number; scale: number; distance: number }) => void;
  onPinchEnd?: () => void;
  className?: string;
}

export function MobileGestures({
  children,
  onTap,
  onDoubleTap,
  onLongPress,
  onPanStart,
  onPan,
  onPanEnd,
  onPinchStart,
  onPinch,
  onPinchEnd,
  className = ""
}: MobileGesturesProps) {
  const device = useDevice();
  const containerRef = useRef<HTMLDivElement>(null);

  const gestureHandlers: GestureHandlers = {
    onTap,
    onDoubleTap,
    onLongPress,
    onPanStart,
    onPan,
    onPanEnd,
    onPinchStart,
    onPinch,
    onPinchEnd
  };

  const handlers = useGestures(gestureHandlers);

  // Only apply touch handlers on mobile/tablet
  if (!device.hasTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ touchAction: "none" }}
      {...handlers}
    >
      {children}
    </div>
  );
}

