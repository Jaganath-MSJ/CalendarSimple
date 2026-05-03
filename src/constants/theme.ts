/**
 * @file Default theme values and layout/keyboard constants.
 */

/** Fallback color theme applied when no `theme` prop is provided. */
export const defaultTheme = {
  default: {
    color: "#000",
    bgColor: "#fff",
  },
  selected: {
    color: "#fff",
    bgColor: "#007bff",
  },
  today: {
    color: "#007bff",
    bgColor: "#e6f2ff",
  },
};

/** Pixel dimensions used by layout algorithms to calculate cell sizes and event positioning. */
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: 122,
  DATE_LABEL_HEIGHT: 28,
  CELL_PADDING: 8,
  EVENT_HEIGHT: 26,
  DEFAULT_ROWS: 6,
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
