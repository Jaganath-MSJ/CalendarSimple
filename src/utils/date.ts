import dayjs, { Dayjs } from "dayjs";

export type DateType = Dayjs;
export type DateInputType = Date | DateType | string | number;
export const dateFn = dayjs;

export const getNoOfDays = (date: DateType): number => {
  return dayjs(date).daysInMonth();
};

export const getMonthStartingDay = (date: DateType): number => {
  return Number(dayjs(date).startOf("month").format("d"));
};

export const convertToDate = (dayjsDate: DateType): Date => {
  return dayjs(dayjsDate).toDate();
};

export const getYearList = (
  pastLength: number,
  futureLength: number,
  selectedYear: number,
): number[] => {
  const yearLength = pastLength + futureLength;
  const yearStarting = dayjs().year() - pastLength;
  const yearList = Array.from(
    { length: yearLength },
    (_, index) => index + yearStarting,
  );

  if (!yearList.includes(selectedYear)) {
    if (dayjs().year() <= selectedYear) {
      yearList.push(selectedYear);
    } else {
      return [selectedYear, ...yearList];
    }
  }
  return yearList;
};

export const checkIsToday = (
  selectedDate: DateType,
  dates: number,
): boolean => {
  const cloneSelectedDate = dayjs(selectedDate).date(dates);

  const isToday = dayjs().isSame(cloneSelectedDate, "day");
  return isToday;
};

export const getStartOfDay = (date: DateInputType): DateType => {
  return dayjs(date).startOf("day");
};

export const getEndOfDay = (date: DateInputType): DateType => {
  return dayjs(date).endOf("day");
};

export const getStartOfMonth = (date: DateType): DateType => {
  return dayjs(date).startOf("month");
};

export const getEndOfMonth = (date: DateType): DateType => {
  return dayjs(date).endOf("month");
};

export const addDays = (date: DateType, days: number): DateType => {
  return dayjs(date).add(days, "day");
};

export const subDays = (date: DateType, days: number): DateType => {
  return dayjs(date).subtract(days, "day");
};

export const addMonths = (date: DateType, months: number): DateType => {
  return dayjs(date).add(months, "month");
};

export const subMonths = (date: DateType, months: number): DateType => {
  return dayjs(date).subtract(months, "month");
};

export const getDiffDays = (
  date1: DateInputType,
  date2: DateInputType,
): number => {
  return dayjs(date1).diff(dayjs(date2), "day");
};

export const isBeforeDate = (date1: DateType, date2: DateType): boolean => {
  return dayjs(date1).isBefore(dayjs(date2), "day");
};

export const isAfterDate = (date1: DateType, date2: DateType): boolean => {
  return dayjs(date1).isAfter(dayjs(date2), "day");
};

export const isSameDate = (date1: DateType, date2: DateType): boolean => {
  return dayjs(date1).isSame(dayjs(date2), "day");
};

export const formatDate = (date: DateInputType, format: string): string => {
  return dayjs(date).format(format);
};

export const setDate = (date: DateType, day: number): DateType => {
  return dayjs(date).date(day);
};

export const setMonth = (date: DateType, month: number): DateType => {
  return dayjs(date).month(month);
};

export const setYear = (date: DateType, year: number): DateType => {
  return dayjs(date).year(year);
};

export const getDate = (date: DateType): number => {
  return dayjs(date).date();
};

export const getMonth = (date: DateType): number => {
  return dayjs(date).month();
};

export const getYear = (date: DateType): number => {
  return dayjs(date).year();
};

export const getDay = (date: DateType): number => {
  return dayjs(date).day();
};
