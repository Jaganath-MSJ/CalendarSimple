/**
 * @file Calendar component prop types, view enums, and render callback interfaces.
 */
import { ReactNode } from "react";
import { CalendarEvent } from "./events";
import { CalendarTheme, CalendarClassNames } from "./theme";

/**
 * Makes a specific subset of keys required while leaving the rest unchanged.
 * Used to enforce that `CalendarContentProps` always has defaults applied.
 */
export type RequiredSome<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Available calendar view modes.
 * Use as values for the `view` prop or `onViewChange` callback.
 */
export const ECalendarViewType = {
  month: "month",
  week: "week",
  day: "day",
  schedule: "schedule",
  customDays: "customDays",
} as const;

export type ECalendarViewType =
  (typeof ECalendarViewType)[keyof typeof ECalendarViewType];

/**
 * Controls how much of the day is shown in the time grid.
 * `full` shows all 24 hours; `half` shows 12 hours (combined with `minHour`/`maxHour`).
 */
export const EDayType = {
  full: "full",
  half: "half",
} as const;

export type EDayType = (typeof EDayType)[keyof typeof EDayType];

/**
 * Props passed to the `renderHeader` custom renderer.
 * Provides the current navigation state and handlers to build a fully custom header.
 */
export interface RenderHeaderProps {
  /** The currently displayed date (first day of the visible period). */
  currentDate: Date;
  /** The active view mode. */
  view: ECalendarViewType;
  /** Call with a target date to programmatically navigate the calendar. */
  onNavigate: (date: Date) => void;
  /** Call to switch the active view. */
  onViewChange: (view: ECalendarViewType) => void;
}

/**
 * Props passed to the `renderDateCell` custom renderer in Month view.
 * Allows replacing the default date number with a fully custom cell.
 */
export interface RenderDateCellProps {
  /** The date this cell represents. */
  date: Date;
  /** Whether this cell is today's date. */
  isToday: boolean;
  /** Whether this cell is the currently selected date. */
  isSelected?: boolean;
  /** Whether this date belongs to the currently displayed month (false for adjacent-month cells). */
  isCurrentMonth?: boolean;
}

/**
 * Top-level props for the `<Calendar>` component.
 */
export interface CalendarProps {
  /** Child components rendered inside the calendar layout (e.g. custom header). */
  children?: ReactNode;

  // --- Data & State ---
  /** Events to display. Each must have at minimum `startDate` and `title`. */
  events?: CalendarEvent[];
  /** Initially selected date. Defaults to today if omitted. */
  selectedDate?: Date;
  /** Active view mode. Defaults to `month`. */
  view?: ECalendarViewType;
  /** `data-testid` attribute placed on the root element for testing. */
  testId?: string;

  // --- Loading State ---
  /** When `true`, renders the loading indicator instead of the calendar body. */
  isLoading?: boolean;
  /** Custom loading indicator renderer. Falls back to a built-in spinner when omitted. */
  renderLoading?: () => ReactNode;

  // --- Configuration ---
  /** Use 12-hour clock format (AM/PM) in time grids. Defaults to `false`. */
  is12Hour?: boolean;
  /** Allow date cells to be clicked and selected. Defaults to `true`. */
  selectable?: boolean;
  /** Maximum number of events shown per day cell before a "+N more" overflow link appears. */
  maxEvents?: number;
  /** Controls time-grid range. `full` = all 24 h; `half` = respects `minHour`/`maxHour`. */
  dayType?: EDayType;
  /** Number of years before today available in the year picker. */
  pastYearLength?: number;
  /** Number of years after today available in the year picker. */
  futureYearLength?: number;
  /** Show a line indicating the current time in Week / Day views. */
  showCurrentTime?: boolean;
  /** Scroll the time grid to the current time on initial render. */
  autoScrollToCurrentTime?: boolean;
  /** Earliest hour shown in the time grid (0–23). */
  minHour?: number;
  /** Latest hour shown in the time grid (0–23). */
  maxHour?: number;
  /** First day of the week: 0 = Sunday, 1 = Monday … 6 = Saturday. */
  weekStartsOn?: number;
  /** Last day of the week: 0–6, must be after `weekStartsOn`. */
  weekEndsOn?: number;
  /** Show dates from the previous / next month in the month grid. */
  showAdjacentMonths?: boolean;
  /** Show ISO week numbers in the leftmost column of the month grid. */
  showWeekNumbers?: boolean;
  /** Number of days shown in the CustomDays view. */
  customDays?: number;
  /** Reset the selected date to today when switching views. */
  resetDateOnViewChange?: boolean;
  /** Show the all-day event banner row in Week / Day views. */
  showAllDayRow?: boolean;
  /** Custom renderer for the date separator in Schedule view. */
  renderScheduleSeparator?: (date: Date) => ReactNode;
  /** Pixel offset added between overlapping events in the time grid to keep them readable. */
  eventOverlapOffset?: number;

  // --- Layout ---
  /** CSS width of the calendar container (number = px, string = any CSS value). */
  width?: number | string;
  /** CSS height of the calendar container (number = px, string = any CSS value). */
  height?: number | string;

  // --- Event Callbacks ---
  /** Called when a date cell is clicked. */
  onDateClick?: (date: Date) => void;
  /** Called when an event chip is clicked. */
  onEventClick?: (event: CalendarEvent) => void;
  /** Called when the "+N more" overflow link is clicked. Receives the date and the hidden events. */
  onMoreClick?: (date: Date, hiddenEvents?: CalendarEvent[]) => void;
  /** Called when the calendar navigates to a different date. */
  onNavigate?: (date: Date) => void;
  /** Called when the user switches views. */
  onViewChange?: (view: ECalendarViewType) => void;
  /** Allow clicking empty time slots to create new events. */
  creatable?: boolean;
  /** Called when an empty time slot is clicked; receives the slot's start and end date. */
  onSlotClick?: (startDate: Date, endDate: Date) => void;

  // --- Appearance ---
  /** Color theme overrides for selected, today, and default states. */
  theme?: CalendarTheme;
  /** CSS class name overrides for individual calendar elements. */
  classNames?: CalendarClassNames;

  // --- Custom Renderers ---
  /** Replaces the default event chip with a fully custom renderer. */
  renderEvent?: (event: CalendarEvent) => ReactNode;
  /** Replaces the entire header bar with a custom renderer. */
  renderHeader?: (props: RenderHeaderProps) => ReactNode;
  /** Replaces the default hour label in the time grid left column. */
  renderHourCell?: (date: Date) => ReactNode;
  /** Replaces the default date number in Month view cells. */
  renderDateCell?: (props: RenderDateCellProps) => ReactNode;

  // --- Performance Options ---
  /** Pre-built O(1) lookup map of events keyed by date string. Avoids re-filtering on each render. */
  enrichedEventsByDate?: Record<string, CalendarEvent[]>;
  /** Enable O(1) event lookup via `enrichedEventsByDate`. */
  enableEnrichedEvents?: boolean;
  /** Skip internal sort when events are already sorted by `startDate` ascending. */
  eventsAreSorted?: boolean;
  /** Maintain stable visual ordering of overlapping events across re-renders. */
  isEventOrderingEnabled?: boolean;
  /** Sort events within Month view cells. Pass `true` for default sort or a comparator for custom order. */
  sortedMonthView?: boolean | ((a: CalendarEvent, b: CalendarEvent) => number);

  // --- Localization ---
  /** Luxon locale code (e.g. `'en'`, `'fr'`, `'es-MX'`). Controls date formatting language. */
  locale?: string;

  /**
   * Layout direction. When omitted, falls back to `'rtl'` if `locale` is in the RTL locale list
   * (ar, he, fa, ur, ps, sd, ckb, yi); otherwise `'ltr'`.
   */
  direction?: "ltr" | "rtl";

  /** Overrides for built-in UI strings (navigation buttons, view names, etc.). */
  localeMessages?: {
    today?: string;
    day?: string;
    week?: string;
    month?: string;
    schedule?: string;
    /** Label suffix in the custom days dropdown (e.g. `'Days'` → "3 Days"). */
    days?: string;
  };
}

/**
 * Internal props type used by all view components after defaults have been applied.
 * Extends `CalendarProps` with a required subset of keys so views never need to null-check defaults.
 */
export interface CalendarContentProps extends RequiredSome<
  CalendarProps,
  | "events"
  | "view"
  | "is12Hour"
  | "selectable"
  | "creatable"
  | "dayType"
  | "pastYearLength"
  | "futureYearLength"
  | "showCurrentTime"
  | "autoScrollToCurrentTime"
  | "minHour"
  | "maxHour"
  | "weekStartsOn"
  | "weekEndsOn"
  | "showAdjacentMonths"
  | "showWeekNumbers"
  | "resetDateOnViewChange"
  | "showAllDayRow"
  | "width"
  | "height"
  | "theme"
  | "classNames"
  | "eventOverlapOffset"
  | "enableEnrichedEvents"
  | "eventsAreSorted"
  | "isEventOrderingEnabled"
  | "sortedMonthView"
  | "testId"
  | "locale"
  | "localeMessages"
> {}

/**
 * A month entry used in the month picker dropdown.
 */
export interface MonthListType {
  /** Localized month name (e.g. "January"). */
  label: string;
  /** 1-based month number (1 = January … 12 = December). */
  value: number;
}
