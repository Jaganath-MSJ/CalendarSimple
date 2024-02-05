import { date } from "./Calender.utils";

export const DAY_LIST = {
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

export const DAY_LIST_FULL_NAME = [
  DAY_LIST.SUNDAY.FULL,
  DAY_LIST.MONDAY.FULL,
  DAY_LIST.TUESDAY.FULL,
  DAY_LIST.WEDNESDAY.FULL,
  DAY_LIST.THURSDAY.FULL,
  DAY_LIST.FRIDAY.FULL,
  DAY_LIST.SATURDAY.FULL,
];

export const DAY_LIST_HALF_NAME = [
  DAY_LIST.SUNDAY.HALF,
  DAY_LIST.MONDAY.HALF,
  DAY_LIST.TUESDAY.HALF,
  DAY_LIST.WEDNESDAY.HALF,
  DAY_LIST.THURSDAY.HALF,
  DAY_LIST.FRIDAY.HALF,
  DAY_LIST.SATURDAY.HALF,
];

export const MONTHS = {
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

export const MONTH_WITH_30_DAYS = [
  MONTHS.APR.value,
  MONTHS.JUN.value,
  MONTHS.SEP.value,
  MONTHS.NOV.value,
];

export const MONTH_LIST: { label: string; value: number }[] =
  Object.values(MONTHS);

export const YEAR_LIST_PAST_LENGTH = 10;
export const YEAR_LIST_FUTURE_LENGTH = 0;
export const YEAR_LIST_STARTING = date().year() - YEAR_LIST_PAST_LENGTH + 1;

export const CALENDER_STRINGS = {
  MONTH: "monthDropdown",
  YEAR: "yearDropdown",
};
