/**
 * @file useEvents.ts
 * @description Hook to sanitize and prepare a list of calendar events.
 *
 * This utility acts as a basic validation layer. Events with unparseable dates
 * are dropped on every path (with a one-time warning per distinct invalid set);
 * events whose end date precedes the start date are also silently dropped,
 * except when `eventsAreSorted` / `enableEnrichedEvents` skip that check.
 */

import { useEffect, useMemo } from "react";
import { dateFn } from "../utils/date";
import { CalendarEvent } from "../types/events";
import { hasValidDates } from "../utils/common";

/**
 * Hook to filter and return only valid calendar events.
 *
 * Events where `endDate` is chronologically before `startDate` are silently removed.
 * This is intentional — such events have no renderable duration (C-TC3).
 *
 * @param events - The raw array of calendar events to process. Events with
 *   `endDate < startDate` are filtered out (negative-duration guard).
 * @param eventsAreSorted - When `true`, skips the reversed-range filter (invalid-date events are still dropped; caller guarantees
 *   events are pre-sorted by `startDate` ascending). **Caveat:** unsorted input will render in the
 *   provided order — the library never re-sorts the array.
 * @param enableEnrichedEvents - When `true`, skips the reversed-range filter (invalid-date events are still dropped; caller supplies pre-enriched events via `enrichedEventsByDate`).
 * @param enrichedEventsByDate - Required companion map when `enableEnrichedEvents=true`.
 * @returns A memoized array containing only logically valid events.
 */
export default function useEvents(
  events: CalendarEvent[],
  eventsAreSorted?: boolean,
  enableEnrichedEvents?: boolean,
  enrichedEventsByDate?: Record<string, CalendarEvent[]>,
) {
  // K-03: Warn in dev when eventsAreSorted=true but the array is not actually sorted.
  useEffect(() => {
    if (eventsAreSorted) {
      for (let i = 1; i < events.length; i++) {
        if (dateFn(events[i].startDate) < dateFn(events[i - 1].startDate)) {
          console.warn(
            "[calendar] eventsAreSorted=true but the provided events array is not sorted by startDate ascending. " +
              "Events may render in the wrong visual order. " +
              "Either sort the array before passing it, or remove the eventsAreSorted flag.",
          );
          break;
        }
      }
    }
  }, [events, eventsAreSorted]);

  // K-05: Warn in dev when enableEnrichedEvents=true but enrichedEventsByDate is absent.
  useEffect(() => {
    if (enableEnrichedEvents && enrichedEventsByDate === undefined) {
      console.warn(
        "[calendar] enableEnrichedEvents=true but enrichedEventsByDate was not provided. " +
          "The calendar will fall back to flat-array event lookup — multi-day events may render incorrectly. " +
          "Pass a valid enrichedEventsByDate map alongside enableEnrichedEvents.",
      );
    }
  }, [enableEnrichedEvents, enrichedEventsByDate]);

  const { validEvents, droppedKey } = useMemo(() => {
    // Events with unparseable dates are dropped on every path (single pass).
    const parseable: CalendarEvent[] = [];
    const dropped: string[] = [];
    for (const event of events) {
      if (hasValidDates(event)) parseable.push(event);
      else dropped.push(String(event.id ?? event.startDate));
    }
    const droppedKey =
      dropped.length > 0 ? `${dropped.length}:${dropped.join("|")}` : "";

    if (eventsAreSorted || enableEnrichedEvents) {
      return {
        validEvents: dropped.length === 0 ? events : parseable,
        droppedKey,
      };
    }

    return {
      validEvents: parseable.filter((event) => {
        if (!event.endDate) return true;
        return dateFn(event.endDate) >= dateFn(event.startDate);
      }),
      droppedKey,
    };
  }, [events, eventsAreSorted, enableEnrichedEvents]);

  useEffect(() => {
    if (droppedKey) {
      const count = droppedKey.slice(0, droppedKey.indexOf(":"));
      console.warn(
        `[calendar] dropped ${count} event(s) with an invalid startDate or endDate.`,
      );
    }
  }, [droppedKey]);

  return validEvents;
}
