/**
 * @file useDateRangeNotifier.ts
 * @description Debounced `onDateRangeChange` notifications.
 */
import { useEffect, useMemo, useRef } from "react";
import type { CalendarState } from "../context/CalendarContext";
import type { CalendarConfig } from "../types";
import { getVisibleRange } from "../utils/visibleRange";
import { defaultCalendarProps } from "../constants";

const DELAY_MS = 16;

/**
 * Call once inside the provider. When the visible range key
 * `"<view>|<startISO>|<endISO>"` changes (mount, navigation, view change),
 * fires `onDateRangeChange(start, end, view)` after 16 ms; a newer key
 * cancels the pending call.
 */
export function useDateRangeNotifier(
  state: CalendarState,
  config: CalendarConfig,
): void {
  const { view, selectedDate, customDays } = state;
  const {
    weekStartsOn = defaultCalendarProps.weekStartsOn,
    weekEndsOn = defaultCalendarProps.weekEndsOn,
    events,
    onDateRangeChange,
  } = config;

  const range = useMemo(
    () =>
      getVisibleRange(view, selectedDate, {
        weekStartsOn,
        weekEndsOn,
        customDays,
        events,
      }),
    [view, selectedDate, weekStartsOn, weekEndsOn, customDays, events],
  );
  const key = `${view}|${range.start.toISODate()}|${range.end.toISODate()}`;

  const latest = useRef({ onDateRangeChange, range, view });
  useEffect(() => {
    latest.current = { onDateRangeChange, range, view };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const { onDateRangeChange: cb, range: r, view: v } = latest.current;
      cb?.(r.start.toJSDate(), r.end.toJSDate(), v);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [key]);
}
