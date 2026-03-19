/**
 * @file common.ts
 * @description Common utility functions used across the calendar components.
 *
 * Provides generalized helpers for event-type checking (all-day, multi-day)
 * and spatial calculations like the maximum number of viewable events per cell.
 */

import { LAYOUT_CONSTANTS } from "../constants";
import { CalendarEvent } from "../types";
import { dateFn } from "./date";

/**
 * Calculates the maximum number of events that can be displayed in a cell based on the calendar height.
 *
 * @param height - The total height of the calendar
 * @returns The maximum number of events to display
 */
export function calculateMaxEvents(height: number, rowsInView: number): number {
  const { DATE_LABEL_HEIGHT, CELL_PADDING, EVENT_HEIGHT } = LAYOUT_CONSTANTS;

  const cellHeight = height / rowsInView;
  const availableHeight = cellHeight - DATE_LABEL_HEIGHT - CELL_PADDING;
  const calculatedMax = Math.round(availableHeight / EVENT_HEIGHT) - 1; // -1 for "more" button

  return Math.max(0, calculatedMax);
}

/**
 * Helper to determine if an event is an all-day event.
 * An event is considered "all-day" if its start and end date strings
 * contain only a date (e.g. YYYY-MM-DD) and no time component (no 'T' or space).
 *
 * @param event - The calendar event to check.
 * @returns True if the event has no time payload.
 */
export function isAllDayEvent(event: CalendarEvent): boolean {
  const isDateOnly = (dateStr: string) => {
    return !dateStr.includes("T") && !dateStr.includes(" ");
  };

  if (!isDateOnly(event.startDate)) {
    return false;
  }

  if (event.endDate && !isDateOnly(event.endDate)) {
    return false;
  }

  return true;
}

/**
 * Helper to determine if an event spans across multiple distinct calendar days.
 * Compares the start of the day for both startDate and endDate.
 *
 * @param event - The calendar event to check.
 * @returns True if the event starts and ends on different days.
 */
export function isMultiDay(event: CalendarEvent): boolean {
  if (!event.endDate) return false;
  const start = dateFn(event.startDate).startOf("day");
  const end = dateFn(event.endDate).startOf("day");
  return !start.isSame(end);
}
