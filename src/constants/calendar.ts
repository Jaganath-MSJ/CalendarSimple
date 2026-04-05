import { ECalendarViewType, EDayType, MonthListType } from "../types";
import { dateFn } from "../utils/date";

export function getDayListNames(dayType: EDayType, locale?: string): string[] {
  const format = dayType === EDayType.full ? "dddd" : "ddd";
  return Array.from({ length: 7 }, (_, i) =>
    dateFn()
      .day(i)
      .locale(locale || "en")
      .format(format),
  );
}

export function getMonthList(locale?: string): MonthListType[] {
  return Array.from({ length: 12 }, (_, i) => ({
    label: dateFn()
      .month(i)
      .locale(locale || "en")
      .format("MMMM"),
    value: i,
  }));
}

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
  resetDateOnViewChange: false,
  showAllDayRow: true,
  eventOverlapOffset: 0,
  enableEnrichedEvents: false,
  eventsAreSorted: false,
  isEventOrderingEnabled: true,
  sortedMonthView: true,
  testId: "calendar",
};

export const DATE_FORMATS = {
  DATE: "YYYY-MM-DD",
  TIME: "HH:mm",
  TIME_12H: "hh:mm A",
  HOUR_12H: "hh A",
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
