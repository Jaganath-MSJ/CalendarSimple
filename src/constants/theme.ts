/**
 * @file Layout/keyboard constants.
 */

/** Pixel dimensions used by layout algorithms to calculate cell sizes and event positioning. */
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: 122,
  DATE_LABEL_HEIGHT: 28,
  CELL_PADDING: 8,
  EVENT_HEIGHT: 26,
  WEEK_NUMBER_WIDTH: 36,
  MIN_ROWS: 4,
  ALL_DAY_ROW_HEIGHT: 24,
  EVENT_ITEM_PADDING: 16,
  SMALL_EVENT_HEIGHT: 40,
  TINY_EVENT_HEIGHT: 20,
  DEFAULT_EVENT_COLOR: "#3b82f6",
} as const;

/** Keyboard key values that trigger interactive calendar actions. */
export const KEYBOARD_SHORTCUTS = {
  OPEN: "Enter",
  ACTIVATE: " ",
  CLOSE: "Escape",
} as const;
