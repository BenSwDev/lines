/**
 * Performance Utilities
 * Lazy loading, memoization, and performance optimizations
 */

import { useMemo, useCallback, RefObject, useState, useEffect } from "react";
import * as React from "react";

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoized element filter
 */
export function useFilteredElements<T extends { type: string }>(
  elements: T[],
  filterType?: string
) {
  return useMemo(() => {
    if (!filterType || filterType === "all") {
      return elements;
    }
    return elements.filter((el) => el.type === filterType);
  }, [elements, filterType]);
}

/**
 * Memoized element search
 */
export function useSearchElements<T extends { name: string; type?: string }>(
  elements: T[],
  searchQuery: string
) {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return elements;
    }

    const query = searchQuery.toLowerCase();
    return elements.filter(
      (el) =>
        el.name.toLowerCase().includes(query) || (el.type && el.type.toLowerCase().includes(query))
    );
  }, [elements, searchQuery]);
}

/**
 * Virtual scrolling helper
 */
export function useVirtualScroll<T>(
  items: T[],
  containerRef: RefObject<HTMLElement>,
  itemHeight: number = 50
) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const handleScroll = throttle(() => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 5, items.length);

      setVisibleRange({ start, end });
    }, 16); // ~60fps

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => container.removeEventListener("scroll", handleScroll);
  }, [items.length, itemHeight, containerRef]);

  const visibleItems = useMemo(
    () => items.slice(visibleRange.start, visibleRange.end),
    [items, visibleRange]
  );

  return {
    visibleItems,
    startIndex: visibleRange.start,
    totalHeight: items.length * itemHeight
  };
}

/**
 * Intersection Observer for lazy loading
 */
export function useIntersectionObserver(
  ref: RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Memoized expensive calculations
 */
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(calculation, dependencies);
}

/**
 * Callback memoization helper
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, []) as T;
}
