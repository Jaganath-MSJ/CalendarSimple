import dayjs, { Dayjs, ManipulateType } from "dayjs";

export type { ManipulateType };
export type DateType = Dayjs;
export type DateInputType = Date | DateType | string | number;

export const dateFn = dayjs;

export function getMonthStartingDay(date: DateType): number {
  return Number(dateFn(date).startOf("month").format("d"));
}

export function convertToDate(dayjsDate: DateType): Date {
  return dateFn(dayjsDate).toDate();
}

export function getYearList(
  pastLength: number,
  futureLength: number,
  selectedYear: number,
): number[] {
  const yearLength = pastLength + futureLength;
  const yearStarting = dateFn().year() - pastLength;
  const yearList = Array.from(
    { length: yearLength },
    (_, index) => index + yearStarting,
  );

  if (!yearList.includes(selectedYear)) {
    if (dateFn().year() <= selectedYear) {
      yearList.push(selectedYear);
    } else {
      return [selectedYear, ...yearList];
    }
  }
  return yearList;
}

export function checkIsToday(selectedDate: DateType, dates: number): boolean {
  const cloneSelectedDate = dateFn(selectedDate).date(dates);

  const isToday = dateFn().isSame(cloneSelectedDate, "day");
  return isToday;
}

export function getStartOfDay(date: DateInputType): DateType {
  return dateFn(date).startOf("day");
}

export function getStartOfMonth(date: DateType): DateType {
  return dateFn(date).startOf("month");
}

export function addDays(date: DateType, days: number): DateType {
  return dateFn(date).add(days, "day");
}

export function subDays(date: DateType, days: number): DateType {
  return dateFn(date).subtract(days, "day");
}

export function getDiffDays(
  date1: DateInputType,
  date2: DateInputType,
): number {
  return dateFn(date1).diff(dateFn(date2), "day");
}

export function isBeforeDate(date1: DateType, date2: DateType): boolean {
  return dateFn(date1).isBefore(dateFn(date2), "day");
}

export function isAfterDate(date1: DateType, date2: DateType): boolean {
  return dateFn(date1).isAfter(dateFn(date2), "day");
}

export function isSameDate(date1: DateType, date2: DateType): boolean {
  return dateFn(date1).isSame(dateFn(date2), "day");
}

export function formatDate(date: DateInputType, format: string): string {
  return dateFn(date).format(format);
}

export function setDate(date: DateType, day: number): DateType {
  return dateFn(date).date(day);
}

export function setMonth(date: DateType, month: number): DateType {
  return dateFn(date).month(month);
}

export function setYear(date: DateType, year: number): DateType {
  return dateFn(date).year(year);
}

export function getDate(date: DateType): number {
  return dateFn(date).date();
}

export function getMonth(date: DateType): number {
  return dateFn(date).month();
}

export function getYear(date: DateType): number {
  return dateFn(date).year();
}
