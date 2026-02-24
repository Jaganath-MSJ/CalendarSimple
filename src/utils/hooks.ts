import { useEffect, useState, RefObject } from "react";

/**
 * Hook to observe the size of an element.
 * @param ref React ref object of the element to observe
 * @returns The width and height of the element
 */
export function useResizeObserver(
  ref: RefObject<HTMLElement | null>,
  notNeeded?: boolean,
) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (notNeeded) return;
    const element = ref.current;
    if (!element) return;

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
