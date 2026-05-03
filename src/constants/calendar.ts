/**
 * @file Default calendar prop values and shared configuration constants.
 */
import { ECalendarViewType, EDayType } from "../types";

/** Test ID strings used to locate header dropdown elements in tests and automation. */
export const CALENDAR_STRINGS = {
  MONTH: "monthDropdown",
  YEAR: "yearDropdown",
};

/** View options shown in the header view switcher dropdown (excludes CustomDays, which is dynamic). */
export const VIEW_OPTIONS = [
  { label: "Day", value: ECalendarViewType.day },
  { label: "Week", value: ECalendarViewType.week },
  { label: "Month", value: ECalendarViewType.month },
  { label: "Schedule", value: ECalendarViewType.schedule },
];

/** Default values merged into `CalendarProps` by `useCalendarProps` when the consumer omits a prop. */
export const defaultCalendarProps = {
  events: [],
  view: ECalendarViewType.month,
  locale: "en",
  localeMessages: {
    today: "Today",
    day: "Day",
    week: "Week",
    month: "Month",
    schedule: "Schedule",
    days: "Days",
  },
  is12Hour: false,
  selectable: false,
  creatable: false,
  dayType: EDayType.half,
  pastYearLength: 5,
  futureYearLength: 5,
  showCurrentTime: false,
  autoScrollToCurrentTime: false,
  minHour: 0,
  maxHour: 24,
  weekStartsOn: 0,
  weekEndsOn: 6,
  theme: {},
  classNames: {},
  showAdjacentMonths: true,
  showWeekNumbers: false,
  resetDateOnViewChange: false,
  showAllDayRow: true,
  eventOverlapOffset: 0,
  enableEnrichedEvents: false,
  eventsAreSorted: false,
  isEventOrderingEnabled: true,
  sortedMonthView: true,
  testId: "calendar",
  isLoading: false,
};

/**
 * Locale primary subtags that default to RTL layout when no explicit `direction` prop is given.
 * Match is case-insensitive and handles BCP-47 region/script tags (e.g. ar-SA → ar).
 */
export const RTL_LOCALES = [
  "ar", // Arabic
  "he", // Hebrew
  "fa", // Persian / Farsi
  "ur", // Urdu
  "ps", // Pashto
  "sd", // Sindhi
  "ckb", // Central Kurdish (Sorani)
  "yi", // Yiddish
] as const;

/** Action type strings dispatched to the calendar reducer. */
export const CALENDAR_ACTIONS = {
  SET_DATE: "SET_DATE",
  SET_VIEW: "SET_VIEW",
  NEXT: "NEXT",
  PREV: "PREV",
  TODAY: "TODAY",
} as const;

/** Common time unit values used in duration and overlap calculations. */
export const TIME_CONSTANTS = {
  MINUTES_IN_HOUR: 60,
  HOURS_IN_DAY: 24,
  DAYS_IN_WEEK: 7,
  MS_PER_MINUTE: 60_000,
  MS_PER_HOUR: 3_600_000,
} as const;

/** Luxon format strings used throughout the calendar for date and time display. */
export const DATE_FORMATS = {
  DATE: "yyyy-MM-dd",
  TIME: "HH:mm",
  TIME_12H: "hh:mm a",
  HOUR_12H: "hh a",
  MONTH_YEAR: "MMMM yyyy",
  DAY_INDEX: "c",
  DAY_NUMBER: "d",
  FULL_DATE: "EEEE, MMMM d, yyyy",
  MONTH_DAY_YEAR: "MMMM d, yyyy",
  SHORT_MONTH_YEAR: "MMM yyyy",
  SHORT_MONTH: "MMM",
  SHORT_DAY: "EEE",
  DAY_DATE_SHORT_MONTH: "EEE, d MMM",
} as const;
