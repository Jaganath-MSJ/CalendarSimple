/**
 * @file useResizeObserver.ts
 * @description Hook to monitor and return the current dimensions of a referenced HTML element.
 *
 * This hook uses the native browser `ResizeObserver` API to observe changes
 * to an element's size, returning its current `width` and `height`. It is
 * useful for responsive rendering within specific container bounds.
 */

import { useEffect, useState, RefObject } from "react";

/**
 * Hook to observe the size of an element.
 *
 * @param ref - React ref object attached to the element to observe.
 * @param notNeeded - Optional flag to bypass the observer. Useful for performance
 *                    if the observer is conditionally required.
 * @returns An object containing the observed `width` and `height`.
 */
export default function useResizeObserver(
  ref: RefObject<HTMLElement | null>,
  notNeeded?: boolean,
) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (notNeeded) return;
    const element = ref.current;
    if (!element) return;

    // -------------------------------------------------------------------------
    // Set up the ResizeObserver instance
    // -------------------------------------------------------------------------
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) return;

      const entry = entries[0];
      const { width, height } = entry.contentRect;

      setSize({ width, height });
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, notNeeded]);

  return size;
}
