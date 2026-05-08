/**
 * @file useEvents.ts
 * @description Hook to sanitize and prepare a list of calendar events.
 *
 * This utility currently acts as a basic validation layer, filtering out
 * completely invalid events (e.g., events where the end date chronologically
 * precedes the start date).
 */

import { useMemo } from "react";
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
 * @returns A memoized array containing only logically valid events.
 */
export default function useEvents(
  events: CalendarEvent[],
  eventsAreSorted?: boolean,
  enableEnrichedEvents?: boolean,
) {
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
