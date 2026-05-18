/**
 * @file useEvents.ts
 * @description Hook to sanitize and prepare a list of calendar events.
 *
 * This utility currently acts as a basic validation layer, filtering out
 * completely invalid events (e.g., events where the end date chronologically
 * precedes the start date).
 */

import { useEffect, useMemo } from "react";
import { dateFn } from "../utils/date";
import { CalendarEvent } from "../types/events";

/**
 * Hook to filter and return only valid calendar events.
 *
 * Events where `endDate` is chronologically before `startDate` are silently removed.
 * This is intentional — such events have no renderable duration (C-TC3).
 *
 * @param events - The raw array of calendar events to process. Events with
 *   `endDate < startDate` are filtered out (negative-duration guard).
 * @param eventsAreSorted - When `true`, skips validation and returns events as-is (caller guarantees
 *   events are pre-sorted by `startDate` ascending). **Caveat:** unsorted input will render in the
 *   provided order — the library never re-sorts the array.
 * @param enableEnrichedEvents - When `true`, skips validation (caller supplies pre-enriched events via `enrichedEventsByDate`).
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

  const validEvents = useMemo(() => {
    // -------------------------------------------------------------------------
    // 1. Basic Validation: Filter invalid date ranges
    // -------------------------------------------------------------------------
    if (eventsAreSorted || enableEnrichedEvents) {
      return events;
    }

    return events.filter((event) => {
      if (!event.endDate) return true;
      return dateFn(event.endDate) >= dateFn(event.startDate);
    });
  }, [events, eventsAreSorted, enableEnrichedEvents]);

  return validEvents;
}
