/**
 * Calculates the maximum number of events that can be displayed in a cell based on the calendar height.
 *
 * @param height - The total height of the calendar
 * @returns The maximum number of events to display
 */
export const calculateMaxEvents = (height: number): number => {
  const ROWS_IN_VIEW = 6;
  const DATE_LABEL_HEIGHT = 28; // height of the date circle + margins
  const CELL_PADDING = 8; // approx padding
  const EVENT_HEIGHT = 26; // 24px height + 2px margin

  const cellHeight = height / ROWS_IN_VIEW;
  const availableHeight = cellHeight - DATE_LABEL_HEIGHT - CELL_PADDING;
  const calculatedMax = Math.round(availableHeight / EVENT_HEIGHT) - 1; // -1 for "more" button

  return Math.max(0, calculatedMax);
};
