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
 * @param events - The raw array of calendar events to process.
 * @returns A memoized array containing only logically valid events.
 */
export default function useEvents(events: CalendarEvent[]) {
  const validEvents = useMemo(() => {
    // -------------------------------------------------------------------------
    // 1. Basic Validation: Filter invalid date ranges
    // -------------------------------------------------------------------------
    return events.filter((event) => {
      if (!event.endDate) return true;
      return !dateFn(event.endDate).isBefore(dateFn(event.startDate));
    });
  }, [events]);

  return validEvents;
}
