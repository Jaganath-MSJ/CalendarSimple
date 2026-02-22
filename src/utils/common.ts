import { CALENDAR_CONSTANTS, DATE_FORMATS } from "../constants";
import { CalendarEvent, ECalendarViewType } from "../types";
import { formatDate } from "./date";

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
 * Generates the tooltip text for an event based on the view type.
 */
export function generateTooltipText(
  event: CalendarEvent,
  viewType: ECalendarViewType,
  is12Hour?: boolean,
): string {
  const timeFormat = is12Hour ? DATE_FORMATS.TIME_12H : DATE_FORMATS.TIME;
  const formatStr =
    viewType === ECalendarViewType.month ? DATE_FORMATS.DATE : timeFormat;

  let tooltipText = `${event.title} (${formatDate(event.startDate, formatStr)}`;
  if (event.endDate) {
    tooltipText += ` - ${formatDate(event.endDate, formatStr)}`;
  }
  tooltipText += `)`;

  return tooltipText;
}
