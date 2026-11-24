/**
 * @file monthMatrix.ts
 * @description Luxon replacement for `calendarize`: the weeks of a month as day numbers.
 */
import { getDayOfWeek, type DateType } from "./date";
import { TIME_CONSTANTS } from "../constants";

/**
 * Builds the month matrix for the month of `selectedDate`, with the same shape
 * as `calendarize(date, weekStartsOn)`: rows of 7 day numbers, `0` for cells
 * outside the month, and only as many rows as the month needs (no padding to 6).
 *
 * @param selectedDate - Any date in the target month.
 * @param weekStartsOn - First day of the week (0 = Sunday … 6 = Saturday).
 */
export function buildMonthMatrix(
  selectedDate: DateType,
  weekStartsOn: number,
): number[][] {
  const { DAYS_IN_WEEK } = TIME_CONSTANTS;
  const first = selectedDate.startOf("month");
  const daysInMonth = first.daysInMonth ?? 0;
  const offset =
    (getDayOfWeek(first) - weekStartsOn + DAYS_IN_WEEK) % DAYS_IN_WEEK;

  const weeks: number[][] = [];
  let day = 1 - offset;
  while (day <= daysInMonth) {
    const week: number[] = [];
    for (let i = 0; i < DAYS_IN_WEEK; i++, day++) {
      week.push(day >= 1 && day <= daysInMonth ? day : 0);
    }
    weeks.push(week);
  }
  return weeks;
}
