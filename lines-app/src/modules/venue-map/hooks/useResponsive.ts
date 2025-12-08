/**
 * Responsive Utilities Hook
 * Provides responsive values based on device type
 */

import { useDevice } from "./useDevice";
import { useMemo } from "react";

export interface ResponsiveValue<T> {
  mobile: T;
  tablet: T;
  desktop: T;
}

export function useResponsive<T>(values: ResponsiveValue<T>): T {
  const device = useDevice();

  return useMemo(() => {
    if (device.isMobile) return values.mobile;
    if (device.isTablet) return values.tablet;
    return values.desktop;
  }, [device.isMobile, device.isTablet, values]);
}

export function useResponsiveValue<T>(mobile: T, tablet: T, desktop: T): T {
  return useResponsive({ mobile, tablet, desktop });
}

/**
 * Responsive grid size based on device
 */
export function useGridSize(): number {
  return useResponsiveValue(10, 15, 20);
}

/**
 * Responsive canvas size based on device
 */
export function useCanvasSize(): { width: number; height: number } {
  const device = useDevice();

  return useMemo(() => {
    if (device.isMobile) {
      // Mobile: smaller canvas, optimized for touch
      return { width: 1000, height: 1000 };
    }
    if (device.isTablet) {
      // Tablet: medium canvas
      return { width: 1500, height: 1500 };
    }
    // Desktop: full canvas
    return { width: 2000, height: 2000 };
  }, [device.isMobile, device.isTablet]);
}

/**
 * Responsive toolbar height
 */
export function useToolbarHeight(): number {
  return useResponsiveValue(60, 70, 80);
}

/**
 * Responsive element size defaults
 */
export function useElementSizes(): {
  table: number;
  zone: number;
  area: number;
} {
  return useResponsive({
    mobile: { table: 60, zone: 150, area: 80 },
    tablet: { table: 70, zone: 175, area: 90 },
    desktop: { table: 80, zone: 200, area: 100 }
  });
}
