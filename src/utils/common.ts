import { CALENDAR_CONSTANTS, DATE_FORMATS } from "../constants";
import { DataType, ECalendarViewType } from "../types";
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
  event: DataType,
  viewType: ECalendarViewType,
): string {
  if (viewType === ECalendarViewType.month) {
    let tooltipText = formatDate(event.startDate, DATE_FORMATS.DATE);
    if (event.endDate) {
      tooltipText += ` to ${formatDate(event.endDate, DATE_FORMATS.DATE)}`;
    }
    tooltipText += ` - ${event.value}`;
    return tooltipText;
  }

  // Day or Week view format
  let tooltipText = `${event.value} (${formatDate(event.startDate, DATE_FORMATS.TIME)}`;
  if (event.endDate) {
    tooltipText += ` - ${formatDate(event.endDate, DATE_FORMATS.TIME)}`;
  }
  tooltipText += `)`;
  return tooltipText;
}
