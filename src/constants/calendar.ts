import { ECalendarViewType, EDayType } from "../types";

export const CALENDAR_STRINGS = {
  MONTH: "monthDropdown",
  YEAR: "yearDropdown",
};

export const VIEW_OPTIONS = [
  { label: "Day", value: ECalendarViewType.day },
  { label: "Week", value: ECalendarViewType.week },
  { label: "Month", value: ECalendarViewType.month },
  { label: "Schedule", value: ECalendarViewType.schedule },
];

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

export const CALENDAR_ACTIONS = {
  SET_DATE: "SET_DATE",
  SET_VIEW: "SET_VIEW",
  NEXT: "NEXT",
  PREV: "PREV",
  TODAY: "TODAY",
} as const;

export const TIME_CONSTANTS = {
  MINUTES_IN_HOUR: 60,
  HOURS_IN_DAY: 24,
  DAYS_IN_WEEK: 7,
  MS_PER_MINUTE: 60_000,
  MS_PER_HOUR: 3_600_000,
} as const;

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
