/**
 * @file useRecurringExpansion.ts
 * @description Expands recurring events (`rrule`) for the window around the
 * visible range, inside `CalendarProvider`.
 */
import { useEffect, useMemo, useRef } from "react";
import type { CalendarState } from "../context/CalendarContext";
import { CalendarConfig, ECalendarViewType } from "../types";
import { defaultCalendarProps } from "../constants";
import { dateFn, DateType } from "../utils/date";
import { getVisibleRange } from "../utils/visibleRange";
import {
  expandRecurringEvents,
  getExpansionWindow,
  isSeries,
  type VisibleRange,
} from "../utils/recurrence";

/** How far past `selectedDate` Schedule expands series. */
const SCHEDULE_MONTHS_AHEAD = 12;

/**
 * Schedule lists every event, but only series need a window: from two months
 * before `selectedDate` to 12 months after it, widened to whole quarters.
 * Every series, finite or endless, is cut there; other events pass through.
 */
function getScheduleExpansionWindow(selectedDate: DateType): VisibleRange {
  return {
    start: selectedDate.minus({ months: 2 }).startOf("quarter"),
    end: selectedDate.plus({ months: SCHEDULE_MONTHS_AHEAD }).endOf("quarter"),
  };
}

/**
 * Returns `config` with recurring events expanded into occurrences for the
 * window around the visible range (`getExpansionWindow`; Schedule uses its
 * own window, see above). Without recurring events, or with
 * `enableEnrichedEvents`, `config` is returned as is; otherwise its identity
 * changes only when the window moves. Each warning prints once per provider.
 */
export function useRecurringExpansion(
  config: CalendarConfig,
  state: CalendarState,
): CalendarConfig {
  const { events, enableEnrichedEvents, eventsAreSorted } = config;
  const {
    weekStartsOn = defaultCalendarProps.weekStartsOn,
    weekEndsOn = defaultCalendarProps.weekEndsOn,
  } = config;
  const { view, selectedDate, customDays } = state;

  const recurring = useMemo(() => !!events?.some(isSeries), [events]);

  const windowKey = useMemo(() => {
    if (!recurring || enableEnrichedEvents || !events) return "";
    const w =
      view === ECalendarViewType.schedule
        ? getScheduleExpansionWindow(selectedDate)
        : getExpansionWindow(
            getVisibleRange(view, selectedDate, {
              weekStartsOn,
              weekEndsOn,
              customDays,
            }),
          );
    return `${w.start.toISODate()}|${w.end.toISODate()}`;
  }, [
    recurring,
    enableEnrichedEvents,
    events,
    view,
    selectedDate,
    weekStartsOn,
    weekEndsOn,
    customDays,
  ]);

  // Keyed on the events and the window only, so a config change elsewhere
  // (an inline callback, a theme) keeps the occurrences by identity.
  const expanded = useMemo(() => {
    if (!windowKey || !events) return { events, warnings: [] as string[] };
    const [start, end] = windowKey.split("|");
    return expandRecurringEvents(
      events,
      { start: dateFn(start), end: dateFn(end) },
      { sorted: eventsAreSorted },
    );
  }, [events, eventsAreSorted, windowKey]);

  const result = useMemo(
    () =>
      expanded.events === events
        ? config
        : { ...config, events: expanded.events },
    [config, events, expanded],
  );

  // Each warning once per provider, not again on every window change.
  const warned = useRef(new Set<string>());
  useEffect(() => {
    for (const text of expanded.warnings) {
      if (warned.current.has(text)) continue;
      warned.current.add(text);
      console.warn(text);
    }
  }, [expanded.warnings]);

  return result;
}
