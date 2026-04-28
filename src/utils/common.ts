/**
 * @file common.ts
 * @description Common utility functions used across the calendar components.
 *
 * Provides generalized helpers for event-type checking (all-day, multi-day)
 * and spatial calculations like the maximum number of viewable events per cell.
 */

import { KeyboardEvent } from "react";
import {
  KEYBOARD_SHORTCUTS,
  LAYOUT_CONSTANTS,
  TIME_CONSTANTS,
} from "../constants";
import { CalendarEvent } from "../types";
import { dateFn, DateType } from "./date";

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
 * contain only a date (e.g. yyyy-MM-dd) and no time component (no 'T' or space).
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
  return !start.equals(dateFn(end));
}

/**
 * Calculates the overlap duration in hours of an event with a specific calendar day boundary (00:00 to 23:59).
 *
 * @param event - The calendar event.
 * @param date - The day to check the overlap against.
 * @returns The overlap duration in hours (e.g., 2.5). Returns 24 for all-day events.
 */
export function getEventOverlapInHours(
  event: CalendarEvent,
  date: DateType,
): number {
  if (isAllDayEvent(event)) return TIME_CONSTANTS.HOURS_IN_DAY;

  const dayStart = dateFn(date).startOf("day");
  const dayEnd = dateFn(date).endOf("day");

  const eventStart = dateFn(event.startDate);
  const eventEnd = event.endDate ? dateFn(event.endDate) : eventStart;

  const overlapStart = eventStart > dayStart ? eventStart : dayStart;
  const overlapEnd = eventEnd < dayEnd ? eventEnd : dayEnd;

  const overlapMs = overlapEnd.valueOf() - overlapStart.valueOf();
  if (overlapMs <= 0) return 0;

  return overlapMs / TIME_CONSTANTS.MS_PER_HOUR;
}

export function handleKeyboardActivation(handler: (e: KeyboardEvent) => void) {
  return (e: KeyboardEvent) => {
    if (
      e.key === KEYBOARD_SHORTCUTS.OPEN ||
      e.key === KEYBOARD_SHORTCUTS.ACTIVATE
    ) {
      e.preventDefault();
      e.stopPropagation();
      handler(e);
    }
  };
}
