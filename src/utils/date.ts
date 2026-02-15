import dayjs, { Dayjs } from "dayjs";

export type DateType = Dayjs;
export type DateInputType = Date | DateType | string | number;
export const dateFn = dayjs;

export function getNoOfDays(date: DateType): number {
  return dayjs(date).daysInMonth();
}

export function getMonthStartingDay(date: DateType): number {
  return Number(dayjs(date).startOf("month").format("d"));
}

export function convertToDate(dayjsDate: DateType): Date {
  return dayjs(dayjsDate).toDate();
}

export function getYearList(
  pastLength: number,
  futureLength: number,
  selectedYear: number,
): number[] {
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
}

export function checkIsToday(selectedDate: DateType, dates: number): boolean {
  const cloneSelectedDate = dayjs(selectedDate).date(dates);

  const isToday = dayjs().isSame(cloneSelectedDate, "day");
  return isToday;
}

export function getStartOfDay(date: DateInputType): DateType {
  return dayjs(date).startOf("day");
}

export function getEndOfDay(date: DateInputType): DateType {
  return dayjs(date).endOf("day");
}

export function getStartOfMonth(date: DateType): DateType {
  return dayjs(date).startOf("month");
}

export function getEndOfMonth(date: DateType): DateType {
  return dayjs(date).endOf("month");
}

export function addDays(date: DateType, days: number): DateType {
  return dayjs(date).add(days, "day");
}

export function subDays(date: DateType, days: number): DateType {
  return dayjs(date).subtract(days, "day");
}

export function addMonths(date: DateType, months: number): DateType {
  return dayjs(date).add(months, "month");
}

export function subMonths(date: DateType, months: number): DateType {
  return dayjs(date).subtract(months, "month");
}

export function getDiffDays(
  date1: DateInputType,
  date2: DateInputType,
): number {
  return dayjs(date1).diff(dayjs(date2), "day");
}

export function isBeforeDate(date1: DateType, date2: DateType): boolean {
  return dayjs(date1).isBefore(dayjs(date2), "day");
}

export function isAfterDate(date1: DateType, date2: DateType): boolean {
  return dayjs(date1).isAfter(dayjs(date2), "day");
}

export function isSameDate(date1: DateType, date2: DateType): boolean {
  return dayjs(date1).isSame(dayjs(date2), "day");
}

export function formatDate(date: DateInputType, format: string): string {
  return dayjs(date).format(format);
}

export function setDate(date: DateType, day: number): DateType {
  return dayjs(date).date(day);
}

export function setMonth(date: DateType, month: number): DateType {
  return dayjs(date).month(month);
}

export function setYear(date: DateType, year: number): DateType {
  return dayjs(date).year(year);
}

export function getDate(date: DateType): number {
  return dayjs(date).date();
}

export function getMonth(date: DateType): number {
  return dayjs(date).month();
}

export function getYear(date: DateType): number {
  return dayjs(date).year();
}

export function getDay(date: DateType): number {
  return dayjs(date).day();
}
