/**
 * @file Calendar component prop types, view enums, and render callback interfaces.
 */
import { ReactNode } from "react";
import { CalendarEvent } from "./events";
import {
  CalendarTheme,
  CalendarClassNames,
  CalendarPaletteOverrides,
} from "./theme";

/** Days the Custom Days view can show. */
export type CustomDaysCount = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Color palette modes accepted by `CalendarProps.colorScheme`. */
export type ColorScheme = "light" | "dark" | "auto";

/**
 * Blocks inference from a position, like TypeScript 5.4+ `NoInfer`, but works on
 * older compilers: the deferred conditional index stops `T` being inferred here.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NoInferCompat<T> = [T][T extends any ? 0 : never];

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
 * Weekday name length: `full` = long names (Monday), `half` = short (Mon).
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
  /** Whether this adjacent-month cell is today's date (today falls outside the displayed month). */
  isTodayAdjacent?: boolean;
}

/**
 * Top-level props for the `<Calendar>` component.
 *
 * @typeParam TEvent - Your event shape (must extend `CalendarEvent`). Types
 * `events` and every callback / renderer that receives events. Set only via an
 * explicit type argument (`NoInferCompat`); it is never inferred from `events`.
 */
export interface CalendarProps<TEvent extends CalendarEvent = CalendarEvent> {
  /** Child components rendered inside the calendar layout (e.g. custom header). */
  children?: ReactNode;

  // --- Data & State ---
  /** Events to display. Each must have at minimum `startDate` and `title`. */
  events?: NoInferCompat<TEvent>[];
  /** Initially selected date. Defaults to today if omitted. */
  selectedDate?: Date;
  /** Active view mode. Defaults to `month`. */
  view?: ECalendarViewType;
  /** `data-testid` attribute placed on the root element for testing. */
  testId?: string;
  /** Alias of `testId` (the calendar-simple-native name); `testId` wins when both are set. */
  testID?: string;

  // --- Loading State ---
  /**
   * When `true`, activates loading mode. Behaviour depends on whether events are present:
   * - **No events:** replaces the calendar body with a skeleton (or `renderLoading()` if provided).
   * - **Events present:** keeps the calendar visible but wraps it in a non-interactive overlay
   *   so existing data stays on screen during a background refresh (DI-3).
   */
  isLoading?: boolean;
  /**
   * Custom loading indicator renderer. Called only when `isLoading=true` and no events are
   * present. Falls back to a built-in view-specific skeleton when omitted.
   */
  renderLoading?: () => ReactNode;

  // --- Configuration ---
  /**
   * Use 12-hour clock format (AM/PM) in time grids. Pass `"locale"` to follow
   * the `locale`'s convention (Intl `hourCycle`). Defaults to `false`.
   */
  is12Hour?: boolean | "locale";
  /** Allow date cells to be clicked and selected. Defaults to `false`. */
  selectable?: boolean;
  /** Maximum number of events shown per day cell before a "+N more" overflow link appears. */
  maxEvents?: number;
  /**
   * Keyboard navigation (as calendar-simple-native): Month has one tab stop
   * and ← → ↑ ↓, Home / End, PageUp / PageDown (Shift: a year) and T move
   * between days; the time grids turn the period with PageUp / PageDown and
   * ← / →; Schedule moves between rows with ↑ / ↓. T goes to today.
   * Defaults to `true`.
   */
  keyboardNavigation?: boolean;
  /**
   * Pixels per hour in the Day / Week / Custom Days grids (default 60). Set
   * it to control the zoom (update it from `onHourHeightChange`); leave it
   * out to let `pinchToZoom` change it.
   */
  hourHeight?: number;
  /** Smallest hour height a pinch reaches (default 30). */
  minHourHeight?: number;
  /** Largest hour height a pinch reaches (default 180). */
  maxHourHeight?: number;
  /** A zoom gesture (Ctrl/⌘ + wheel) ended at a new hour height. */
  onHourHeightChange?: (hourHeight: number) => void;
  /** Swipe left / right on touch screens to turn the period in Month and the time grids (mirrored in RTL; not in Schedule). Default `false`, as calendar-simple-native on web. */
  swipeNavigation?: boolean;
  /** Zoom the time grids with Ctrl/⌘ + wheel (a trackpad pinch where the browser reports it that way). Default `false`. */
  pinchToZoom?: boolean;
  /** Open the built-in popover when "+N more" is activated in Month view. Set `false` to handle it yourself via `onMoreClick`. Defaults to `true`. */
  showMorePopover?: boolean;
  /** Switches weekday names between long and short. */
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
  /**
   * First day of the week: 0 = Sunday, 1 = Monday … 6 = Saturday. Pass
   * `"locale"` to use the `locale`'s first day (Intl week info, then CLDR
   * region table). Defaults to `0`.
   */
  weekStartsOn?: number | "locale";
  /** Last day of the week: 0–6, must be after `weekStartsOn`. */
  weekEndsOn?: number;
  /** Show dates from the previous / next month in the month grid. */
  showAdjacentMonths?: boolean;
  /** Show ISO week numbers in the leftmost column of the month grid. */
  showWeekNumbers?: boolean;
  /** Number of days shown in the Custom Days view: 1–7 (default 3). Other values from JavaScript are rounded and clamped. */
  customDays?: CustomDaysCount;
  /** Reset the selected date to today when switching views. */
  resetDateOnViewChange?: boolean;
  /** Show the all-day event banner row in Week / Day views. */
  showAllDayRow?: boolean;
  /** Custom renderer for the date separator in Schedule view. */
  renderScheduleSeparator?: (date: Date) => ReactNode;
  /** Percentage of the column width each overlapping column is offset by (0 = tiled). */
  eventOverlapOffset?: number;

  // --- Layout ---
  /** CSS width of the calendar container (number = px, string = any CSS value). */
  width?: number | string;
  /** CSS height of the calendar container (number = px, string = any CSS value). */
  height?: number | string;

  // --- Drag & resize ---
  /** Let events be dragged to a new time or day (Day, Week, Custom Days, Month, all-day row). `true` for all events or a predicate per event. Needs `onEventDrop`. */
  draggable?: boolean | ((event: NoInferCompat<TEvent>) => boolean);
  /** Called when an event is dropped at a new time or day. The calendar does not move the event itself: update `events`. */
  onEventDrop?: (info: EventDropInfo<NoInferCompat<TEvent>>) => void;
  /** Minutes a timed event snaps to while dragged in a time grid. Defaults to `15`. */
  dragSnapMinutes?: number;
  /** Let timed events be resized from their top or bottom edge in time grids. `true` for all events or a predicate per event. Needs `onEventResize`. */
  resizable?: boolean | ((event: NoInferCompat<TEvent>) => boolean);
  /** Called when a timed event is resized. The calendar does not change the event itself: update `events`. */
  onEventResize?: (info: EventResizeInfo<NoInferCompat<TEvent>>) => void;
  /** Minutes a resize edge snaps to. Defaults to `15`. */
  resizeSnapMinutes?: number;
  /** Shortest length a resize can leave, in minutes. Defaults to `15`. */
  minEventDurationMinutes?: number;

  // --- Event Callbacks ---
  /** Called when a date cell is clicked. */
  onDateClick?: (date: Date) => void;
  /** Called when an event chip is clicked. */
  onEventClick?: (event: NoInferCompat<TEvent>) => void;
  /** Called when the "+N more" overflow link is clicked. Receives the date and the hidden events. */
  onMoreClick?: (date: Date, hiddenEvents: NoInferCompat<TEvent>[]) => void;
  /** Called when the calendar navigates to a different date. */
  onNavigate?: (date: Date) => void;
  /** Called when the user switches views. */
  onViewChange?: (view: ECalendarViewType) => void;
  /**
   * Called with the first and last visible day (inclusive, start of day) and
   * the active view. Fires on mount, navigation and view change (after
   * `onNavigate`/`onViewChange`), debounced by 16 ms. Schedule reports the
   * span of all events, so in Schedule it also fires when `events` change and
   * cannot drive lazy-loading; with `enableEnrichedEvents` it reports
   * `selectedDate…selectedDate`.
   */
  onDateRangeChange?: (start: Date, end: Date, view: ECalendarViewType) => void;
  /** Allow clicking empty time slots to create new events. */
  creatable?: boolean;
  /** Called when an empty time slot is clicked; receives the slot's start and end date. */
  onSlotClick?: (startDate: Date, endDate: Date) => void;

  // --- Appearance ---
  /** Color theme overrides for selected, today, and default states. */
  theme?: CalendarTheme;
  /**
   * Palette overrides per scheme, with calendar-simple-native's keys
   * (`primary`, `bg`, `nowLine`…). Each key sets a CSS custom property on the
   * calendar root (and the "+N more" popover). `theme` still wins.
   */
  palette?: CalendarPaletteOverrides;
  /** CSS class name overrides for individual calendar elements. */
  classNames?: CalendarClassNames;

  // --- Custom Renderers ---
  /** Replaces the default event chip with a fully custom renderer. */
  renderEvent?: (event: NoInferCompat<TEvent>) => ReactNode;
  /** Replaces the entire header bar with a custom renderer. */
  renderHeader?: (props: RenderHeaderProps) => ReactNode;
  /** Renders custom content inside each hour slot of the Day, Week and Custom Days grids. Receives the slot's start time on that column's own date. */
  renderHourCell?: (date: Date) => ReactNode;
  /** Replaces the default date number in Month view cells. */
  renderDateCell?: (props: RenderDateCellProps) => ReactNode;

  // --- Performance Options ---
  /**
   * Pre-built O(1) lookup map of events keyed by date string. Avoids re-filtering on each render.
   * Must be provided when `enableEnrichedEvents=true` — omitting it emits a `console.warn`.
   */
  enrichedEventsByDate?: Record<string, NoInferCompat<TEvent>[]>;
  /**
   * Enable O(1) event lookup via `enrichedEventsByDate`.
   * Skips the reversed-range filter; events with unparseable dates are still dropped.
   * Emits a `console.warn` if `enrichedEventsByDate` is not provided alongside this flag (K-05).
   */
  enableEnrichedEvents?: boolean;
  /**
   * Skip the re-sort / reversed-range check when events are already sorted by `startDate` ascending.
   * Events with unparseable dates are still dropped (with a one-time `console.warn`).
   *
   * **Caveat:** the library does not re-sort the array. If unsorted events are passed with this
   * flag set to `true`, they will render in the order provided. Only set this flag when the
   * input is guaranteed to be sorted. A `console.warn` is emitted if the array is detected
   * to be unsorted (K-03).
   */
  eventsAreSorted?: boolean;
  /** Maintain stable visual ordering of overlapping events across re-renders. */
  isEventOrderingEnabled?: boolean;
  /** Sort events within Month view cells. Pass `true` for default sort or a comparator for custom order. */
  sortedMonthView?:
    boolean | ((a: NoInferCompat<TEvent>, b: NoInferCompat<TEvent>) => number);

  // --- Localization ---
  /** Luxon locale code (e.g. `'en'`, `'fr'`, `'es-MX'`). Controls date formatting language. */
  locale?: string;

  /**
   * Layout direction. When omitted, falls back to `'rtl'` if `locale` is in the RTL locale list
   * (ar, he, fa, ur, ps, sd, ckb, yi); otherwise `'ltr'`.
   */
  direction?: "ltr" | "rtl";

  /**
   * Controls the color palette of the calendar.
   * - `'auto'` (default): follows the OS `prefers-color-scheme` preference and updates live
   *   when the user toggles their OS theme.
   * - `'light'` / `'dark'`: forces the palette regardless of OS preference.
   *
   * The resolved scheme is applied as `data-color-scheme="light"|"dark"` on the calendar root,
   * which switches the CSS custom-property palette via attribute-selector overrides in
   * `src/styles/variables.css`. The `theme` prop (per-event inline color overrides) still wins.
   */
  colorScheme?: ColorScheme;

  /** Overrides for built-in UI strings (navigation buttons, view names, etc.). */
  localeMessages?: Partial<CalendarMessages>;
}

/**
 * Every built-in string the calendar shows or announces. Parameterised
 * messages are functions. Pass any subset via `localeMessages`.
 */
export interface CalendarMessages {
  today: string;
  day: string;
  week: string;
  month: string;
  schedule: string;
  /** Label suffix in the custom days dropdown (e.g. `'Days'` → "3 Days"). */
  days: string;
  /** "All day" */
  allDay: string;
  /** "Until" */
  until: string;
  /** "No events to display" */
  noEvents: string;
  /** "No title" — accessibility label only; visible text stays blank. */
  noTitle: string;
  /** "Previous period" */
  previous: string;
  /** "Next period" */
  next: string;
  selectView: string;
  selectMonth: string;
  selectYear: string;
  calendarNavigation: string;
  allDayEvents: string;
  expandAllDay: string;
  collapseAllDay: string;
  weekView: string;
  dayView: string;
  scheduleView: string;
  /** Week-number suffix in the week title ("W45"). */
  weekNumber: (n: number) => string;
  /** "3 days view" */
  nDaysView: (n: number) => string;
  /** "+ 3 more" */
  more: (n: number) => string;
  /** "3 more all-day events, click to expand" */
  moreAllDay: (n: number) => string;
  /** "3 more events on March 4" (month "+N more" aria-label) */
  moreEventsOn: (n: number, date: string) => string;
  /** "(Day 1/3)" */
  dayOfTotal: (i: number, n: number) => string;
  /** "Events on March 4" */
  eventsOn: (date: string) => string;
  /** "Create event at 14:00, March 4" */
  createEventAt: (time: string, date: string) => string;
  // --- Shared with calendar-simple-native (same keys and English wording) ---
  /** Label of a close button ("Close"). */
  close: string;
  /** "+ New event" action in the day's "+N more" popover (`creatable`). */
  newEvent: string;
  /** Label of the loading skeleton ("Loading events"). */
  loading: string;
  /** "no events", "1 event", "3 events": the month cell label. */
  eventCount: (n: number) => string;
  /** "Move 15 minutes earlier" (draggable event). */
  moveEarlier: (minutes: number) => string;
  /** "Move 15 minutes later" (draggable event). */
  moveLater: (minutes: number) => string;
  /** "Move to the previous day" (draggable event). */
  movePreviousDay: string;
  /** "Move to the next day" (draggable event). */
  moveNextDay: string;
  /** "Make 15 minutes longer" (resizable event). */
  makeLonger: (minutes: number) => string;
  /** "Make 15 minutes shorter" (resizable event). */
  makeShorter: (minutes: number) => string;
}

/**
 * Internal props type used by all view components after defaults have been applied.
 * Extends `CalendarProps` with a required subset of keys so views never need to null-check defaults.
 */
export interface CalendarContentProps<
  TEvent extends CalendarEvent = CalendarEvent,
> extends RequiredSome<
  Omit<CalendarProps<TEvent>, "weekStartsOn" | "is12Hour">,
  | "events"
  | "view"
  | "selectable"
  | "creatable"
  | "dayType"
  | "pastYearLength"
  | "futureYearLength"
  | "showCurrentTime"
  | "autoScrollToCurrentTime"
  | "minHour"
  | "maxHour"
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
  | "keyboardNavigation"
  | "pinchToZoom"
  | "swipeNavigation"
  | "minHourHeight"
  | "maxHourHeight"
  | "dragSnapMinutes"
  | "resizeSnapMinutes"
  | "minEventDurationMinutes"
  | "localeMessages"
> {
  /** Resolved first day of the week (0–6); never `"locale"`. */
  weekStartsOn: number;
  /** Resolved 12-hour clock flag; never `"locale"`. */
  is12Hour: boolean;
}

/** Config as seen inside the context (locale-dependent values resolved). */
export type CalendarConfig<TEvent extends CalendarEvent = CalendarEvent> = Omit<
  CalendarProps<TEvent>,
  "children" | "selectedDate" | "view" | "weekStartsOn" | "is12Hour"
> & {
  weekStartsOn?: number;
  is12Hour?: boolean;
};

/**
 * A month entry used in the month picker dropdown.
 */
export interface MonthListType {
  /** Localized month name (e.g. "January"). */
  label: string;
  /** 0-based month index (0 = January … 11 = December). */
  value: number;
}

/** What `onEventDrop` receives when an event is dropped at a new time or day. */
export interface EventDropInfo<TEvent extends CalendarEvent = CalendarEvent> {
  /** The event as passed in `events` (for a recurring event, the occurrence). */
  event: TEvent;
  /** New start. */
  start: Date;
  /** New end (equals `start` when the event had no end). */
  end: Date;
  /** Whether the event is an all-day (date-only) event. */
  allDay: boolean;
  /** View the drop happened in. */
  view: ECalendarViewType;
}

/** What `onEventResize` receives when a timed event is resized. */
export interface EventResizeInfo<TEvent extends CalendarEvent = CalendarEvent> {
  /** The event as passed in `events` (for a recurring event, the occurrence). */
  event: TEvent;
  /** New start. */
  start: Date;
  /** New end. */
  end: Date;
  /** Edge that was dragged. */
  edge: "top" | "bottom";
  /** View the resize happened in. */
  view: ECalendarViewType;
}
