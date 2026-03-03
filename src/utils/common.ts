import { CALENDAR_CONSTANTS } from "../constants";
import { CalendarEvent } from "../types";
import { dateFn } from "./date";

/**
 * Calculates the maximum number of events that can be displayed in a cell based on the calendar height.
 *
 * @param height - The total height of the calendar
 * @returns The maximum number of events to display
 */
export function calculateMaxEvents(height: number, rowsInView: number): number {
  const { DATE_LABEL_HEIGHT, CELL_PADDING, EVENT_HEIGHT } = CALENDAR_CONSTANTS;

  const cellHeight = height / rowsInView;
  const availableHeight = cellHeight - DATE_LABEL_HEIGHT - CELL_PADDING;
  const calculatedMax = Math.round(availableHeight / EVENT_HEIGHT) - 1; // -1 for "more" button

  return Math.max(0, calculatedMax);
}

/**
 * Helper to determine if an event is an all-day event (date only, no time).
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

export function isMultiDay(event: CalendarEvent): boolean {
  if (!event.endDate) return false;
  const start = dateFn(event.startDate).startOf("day");
  const end = dateFn(event.endDate).startOf("day");
  return !start.isSame(end);
}
