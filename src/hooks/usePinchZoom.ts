/**
 * @file `pinchToZoom` on web: Ctrl/⌘ + wheel (browsers also report a
 * trackpad pinch as a wheel event with `ctrlKey`) changes the hour height
 * between `minHourHeight` and `maxHourHeight`. `onHourHeightChange` fires
 * once the gesture stops. As calendar-simple-native, a set `hourHeight`
 * stays in control: the new height is only reported.
 */
import { RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { useCalendar } from "../context/CalendarContext";
import useCalendarProps from "./useCalendarProps";

/** Quiet time after the last wheel event that ends a pinch, in ms. */
export const PINCH_END_MS = 250;
/** How strongly one wheel unit zooms. */
const ZOOM_PER_DELTA = 0.002;

export default function usePinchZoom(ref: RefObject<HTMLElement | null>) {
  const { hourHeight, setHourHeight, config } = useCalendar();
  const { pinchToZoom, minHourHeight, maxHourHeight, onHourHeightChange } =
    useCalendarProps({});
  const latest = useRef({
    height: hourHeight,
    controlled: config.hourHeight !== undefined,
    min: minHourHeight,
    max: maxHourHeight,
    onHourHeightChange,
  });
  useEffect(() => {
    latest.current = {
      height: hourHeight,
      controlled: config.hourHeight !== undefined,
      min: minHourHeight,
      max: maxHourHeight,
      onHourHeightChange,
    };
  });
  // The gesture's own height: a controlled value does not move while pinching.
  const pinchHeight = useRef<number | null>(null);
  // Minute at the top of the view when the gesture started; restored after
  // the grid has been drawn at the new height (setting scrollTop earlier is
  // clamped to the old content height).
  const anchorMinute = useRef<number | null>(null);
  // Set when the gesture stopped: the next redraw (a controlled parent
  // applying onHourHeightChange) is the last one to restore the anchor.
  const gestureEnded = useRef(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && anchorMinute.current !== null) {
      el.scrollTop = (anchorMinute.current * hourHeight) / 60;
    }
    if (gestureEnded.current) {
      gestureEnded.current = false;
      anchorMinute.current = null;
    }
  }, [hourHeight, ref]);

  useEffect(() => {
    const el = ref.current;
    if (!pinchToZoom || !el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const l = latest.current;
      const from = pinchHeight.current ?? l.height;
      const next = Math.min(
        l.max,
        Math.max(
          l.min,
          Math.round(from * Math.exp(-e.deltaY * ZOOM_PER_DELTA)),
        ),
      );
      pinchHeight.current = next;
      if (gestureEnded.current) {
        // The previous gesture's redraw never came (height unchanged).
        gestureEnded.current = false;
        anchorMinute.current = null;
      }
      if (anchorMinute.current === null && l.height > 0) {
        anchorMinute.current = (el.scrollTop * 60) / l.height;
      }
      if (!l.controlled && next !== l.height) setHourHeight(next);
      clearTimeout(timer);
      timer = setTimeout(() => {
        const end = pinchHeight.current;
        pinchHeight.current = null;
        gestureEnded.current = true;
        if (end !== null) latest.current.onHourHeightChange?.(end);
      }, PINCH_END_MS);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(timer);
    };
  }, [pinchToZoom, ref, setHourHeight]);
}
