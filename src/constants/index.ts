import { ECalendarViewType, EDayType, MonthListType } from "../types";

const DAY_LIST = {
  SUNDAY: {
    FULL: "Sunday",
    HALF: "Sun",
  },
  MONDAY: {
    FULL: "Monday",
    HALF: "Mon",
  },
  TUESDAY: {
    FULL: "Tuesday",
    HALF: "Tue",
  },
  WEDNESDAY: {
    FULL: "Wednesday",
    HALF: "Wed",
  },
  THURSDAY: {
    FULL: "Thursday",
    HALF: "Thu",
  },
  FRIDAY: {
    FULL: "Friday",
    HALF: "Fri",
  },
  SATURDAY: {
    FULL: "Saturday",
    HALF: "Sat",
  },
};

export const DAY_LIST_NAME = {
  FULL: [
    DAY_LIST.SUNDAY.FULL,
    DAY_LIST.MONDAY.FULL,
    DAY_LIST.TUESDAY.FULL,
    DAY_LIST.WEDNESDAY.FULL,
    DAY_LIST.THURSDAY.FULL,
    DAY_LIST.FRIDAY.FULL,
    DAY_LIST.SATURDAY.FULL,
  ],
  HALF: [
    DAY_LIST.SUNDAY.HALF,
    DAY_LIST.MONDAY.HALF,
    DAY_LIST.TUESDAY.HALF,
    DAY_LIST.WEDNESDAY.HALF,
    DAY_LIST.THURSDAY.HALF,
    DAY_LIST.FRIDAY.HALF,
    DAY_LIST.SATURDAY.HALF,
  ],
};

const MONTHS = {
  JAN: { label: "January", value: 0 },
  FEB: { label: "February", value: 1 },
  MAR: { label: "March", value: 2 },
  APR: { label: "April", value: 3 },
  MAY: { label: "May", value: 4 },
  JUN: { label: "June", value: 5 },
  JUL: { label: "July", value: 6 },
  AUG: { label: "August", value: 7 },
  SEP: { label: "September", value: 8 },
  OCT: { label: "October", value: 9 },
  NOV: { label: "November", value: 10 },
  DEC: { label: "December", value: 11 },
};

export const MONTH_LIST: MonthListType[] = Object.values(MONTHS);

export const CALENDER_STRINGS = {
  MONTH: "monthDropdown",
  YEAR: "yearDropdown",
};

export const VIEW_OPTIONS = [
  { label: "Day", value: ECalendarViewType.day },
  { label: "Week", value: ECalendarViewType.week },
  { label: "Month", value: ECalendarViewType.month },
  { label: "Schedule", value: ECalendarViewType.schedule },
];

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

export const defaultCalenderProps = {
  events: [],
  view: ECalendarViewType.month,
  is12Hour: false,
  selectable: false,
  dayType: EDayType.halfName,
  pastYearLength: 5,
  futureYearLength: 5,
  theme: defaultTheme,
  classNames: {},
};

export const CALENDAR_CONSTANTS = {
  HEADER_HEIGHT: 122,
  DATE_LABEL_HEIGHT: 28,
  CELL_PADDING: 8,
  EVENT_HEIGHT: 26,
  DEFAULT_ROWS: 6,
  MIN_ROWS: 4,
  DAYS_IN_WEEK: 7,
  EVENT_ITEM_PADDING: 16, // used in width calculation
  SMALL_EVENT_HEIGHT: 40,
  TINY_EVENT_HEIGHT: 20,
  DEFAULT_EVENT_COLOR: "#3b82f6",
};

export const DATE_FORMATS = {
  DATE: "YYYY-MM-DD",
  TIME: "HH:mm",
  TIME_12H: "hh:mm A",
  MONTH_YEAR: "MMMM YYYY",
  DAY_INDEX: "d",
  DAY_NUMBER: "D",
  FULL_DATE: "dddd, MMMM D, YYYY",
  MONTH_DAY_YEAR: "MMMM D, YYYY",
  SHORT_MONTH_YEAR: "MMM YYYY",
  SHORT_MONTH: "MMM",
  SHORT_DAY: "ddd",
  DAY_DATE_SHORT_MONTH: "ddd, D MMM",
};

export const CALENDAR_ACTIONS = {
  SET_DATE: "SET_DATE",
  SET_VIEW: "SET_VIEW",
  NEXT: "NEXT",
  PREV: "PREV",
  TODAY: "TODAY",
} as const;
