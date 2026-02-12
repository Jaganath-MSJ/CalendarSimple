import { CALENDAR_CONSTANTS } from "../constants";

/**
 * Calculates the maximum number of events that can be displayed in a cell based on the calendar height.
 *
 * @param height - The total height of the calendar
 * @returns The maximum number of events to display
 */
export const calculateMaxEvents = (
  height: number,
  rowsInView: number,
): number => {
  const { DATE_LABEL_HEIGHT, CELL_PADDING, EVENT_HEIGHT } = CALENDAR_CONSTANTS;

  const cellHeight = height / rowsInView;
  const availableHeight = cellHeight - DATE_LABEL_HEIGHT - CELL_PADDING;
  const calculatedMax = Math.round(availableHeight / EVENT_HEIGHT) - 1; // -1 for "more" button

  return Math.max(0, calculatedMax);
};
