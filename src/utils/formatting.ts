/**
 * @file formatting.ts
 * @description Utilities to format data for user interface presentation.
 *
 * Includes logic to generate contextual strings based on current calendar views,
 * such as tooltip strings and dynamic GMT offsets.
 */

import { DATE_FORMATS } from "../constants";
import { CalendarEvent, ECalendarViewType } from "../types";
import { formatDate, dateFn } from "./date";
import { isAllDayEvent } from "./common";

/**
 * Generates the tooltip text for an event based on the view type.
 * Adapts the formatting (whether to include explicit dates, times, or both)
 * dynamically based on if it's month/week view, or all-day vs timed.
 *
 * @param event - The calendar event hovering over.
 * @param viewType - The current enum view mode of the calendar.
 * @param is12Hour - Boolean indicating if the user is employing a 12-hour clock.
 * @returns A formatted string ready for tooltip display.
 */
export function generateTooltipText(
  event: CalendarEvent,
  viewType: ECalendarViewType,
  is12Hour?: boolean,
): string {
  const timeFormat = is12Hour ? DATE_FORMATS.TIME_12H : DATE_FORMATS.TIME;
  const isMulti =
    event.endDate && !dateFn(event.startDate).isSame(event.endDate, "day");
  const isAllDay = isAllDayEvent(event);

  let formatStr = timeFormat;

  if (viewType === ECalendarViewType.month || isAllDay) {
    formatStr = DATE_FORMATS.DATE;
  } else if (isMulti) {
    // Include both date and time for multi-day events in day/week/schedule views
    formatStr = `${DATE_FORMATS.DATE} ${timeFormat}`;
  }

  let tooltipText = `${event.title} (${formatDate(event.startDate, formatStr)}`;
  if (event.endDate) {
    tooltipText += ` - ${formatDate(event.endDate, formatStr)}`;
  }
  tooltipText += `)`;

  return tooltipText;
}

/**
 * Returns a formatted GMT offset string based on the user's local timezone.
 * Useful for displaying timezone indicators on the calendar grid.
 *
 * @returns A formatted string like "GMT+05:30" or "GMT-08".
 */
export function getGmtOffset() {
  const offset = new Date().getTimezoneOffset();
  const sign = offset > 0 ? "-" : "+"; // timeZoneOffset returns negative if ahead of UTC
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;

  if (minutes === 0) {
    return `GMT${sign}${hours.toString().padStart(2, "0")}`;
  }
  return `GMT${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
