/**
 * @file date.ts
 * @description Date manipulation and formatting wrappers.
 *
 * This file encapsulates `luxon` logic and exposes standardized, reusable
 * utility functions for date calculations throughout the application.
 */

import { DateTime } from "luxon";

export type DateType = DateTime;
export type DateInputType = Date | DateTime | string | number;

/**
 * Normalizes various date inputs into a Luxon DateTime object.
 */
export function dateFn(date?: DateInputType): DateTime {
  if (date === undefined) return DateTime.now();
  if (date instanceof DateTime) return date;
  if (date instanceof Date) return DateTime.fromJSDate(date);
  if (typeof date === "string") return DateTime.fromISO(date);
  if (typeof date === "number") return DateTime.fromMillis(date);
  return DateTime.now();
}

// ---------------------------------------------------------------------------
// Basic Wrapping Utilities (Getters, Setters, Navigators)
// These functions wrap common operations to maintain a consistent API
// and reduce direct framework dependency across the components.
// ---------------------------------------------------------------------------

export function getStartOfDay(date: DateInputType): DateType {
  return dateFn(date).startOf("day");
}

export function getStartOfMonth(date: DateType): DateType {
  return dateFn(date).startOf("month");
}

export function addDays(date: DateType, days: number): DateType {
  return dateFn(date).plus({ days });
}

export function subDays(date: DateType, days: number): DateType {
  return dateFn(date).minus({ days });
}

export function getDiffDays(
  date1: DateInputType,
  date2: DateInputType,
): number {
  return Math.floor(dateFn(date1).diff(dateFn(date2), "day").days);
}

export function setDate(date: DateType, day: number): DateType {
  return date.set({ day });
}

// Adapting to 0-indexed behavior for backward compatibility across components
export function setMonth(date: DateType, month: number): DateType {
  return date.set({ month: month + 1 });
}

export function setYear(date: DateType, year: number): DateType {
  return date.set({ year });
}

export function getDate(date: DateType): number {
  return date.day;
}

// Adapting to 0-indexed behavior for backward compatibility across components
export function getMonth(date: DateType): number {
  return date.month - 1;
}

export function getYear(date: DateType): number {
  return date.year;
}

// ---------------------------------------------------------------------------
// Comparisons & Formatting
// ---------------------------------------------------------------------------

export function isBeforeDate(
  date1: DateInputType,
  date2: DateInputType,
): boolean {
  return dateFn(date1).startOf("day") < dateFn(date2).startOf("day");
}

export function isAfterDate(
  date1: DateInputType,
  date2: DateInputType,
): boolean {
  return dateFn(date1).startOf("day") > dateFn(date2).startOf("day");
}

export function isSameDate(
  date1: DateInputType,
  date2: DateInputType,
): boolean {
  return dateFn(date1).hasSame(dateFn(dateFn(date2)), "day");
}

export function formatDate(
  date: DateInputType,
  format: string,
  locale?: string,
): string {
  return dateFn(date)
    .setLocale(locale || "en")
    .toFormat(format);
}

export function convertToDate(luxonDate: DateType): Date {
  return luxonDate.toJSDate();
}

// ---------------------------------------------------------------------------
// Complex Date Calculations
// ---------------------------------------------------------------------------

/**
 * Determines the day of the week (0-6)
 *
 * @param date - A DateType representing the target date.
 * @returns The numeric index of the day (0 = Sunday, 1 = Monday, etc.).
 */
export function getDayOfWeek(date: DateType): number {
  return date.weekday === 7 ? 0 : date.weekday;
}

/**
 * Determines the day of the week (0-6) on which a given month starts.
 *
 * @param date - A DateType representing the target month.
 * @returns The numeric index of the starting day (0 = Sunday, 1 = Monday, etc.).
 */
export function getMonthStartingDay(date: DateType): number {
  return getDayOfWeek(date.startOf("month"));
}

/**
 * Checks whether a specific numeric date within a targeted month matches today's date.
 *
 * @param selectedDate - The base month/year context.
 * @param dates - The specific numeric day of the month (1-31).
 * @returns True if the assembled date is the exact current calendar day.
 */
export function checkIsToday(selectedDate: DateType, dates: number): boolean {
  const cloneSelectedDate = selectedDate.set({ day: dates });
  return DateTime.now().hasSame(dateFn(cloneSelectedDate), "day");
}

/**
 * Generates an array of years centered around or including the `selectedYear`.
 * Useful for populating year-selection dropdowns or pickers.
 *
 * @param pastLength - Number of historical years to include from the current date.
 * @param futureLength - Number of future years to include from the current date.
 * @param selectedYear - Ensures this year is included in the array if it falls outside the requested bounds.
 * @returns An array of numeric years.
 */
export function getYearList(
  pastLength: number,
  futureLength: number,
  selectedYear: number,
): number[] {
  // length should include past years, future years, and the current year (+1)
  const yearLength = pastLength + futureLength + 1;
  const yearStarting = DateTime.now().year - pastLength;
  const yearList = Array.from(
    { length: yearLength },
    (_, index) => index + yearStarting,
  );

  if (!yearList.includes(selectedYear)) {
    if (DateTime.now().year <= selectedYear) {
      yearList.push(selectedYear);
    } else {
      return [selectedYear, ...yearList];
    }
  }
  return yearList;
}
