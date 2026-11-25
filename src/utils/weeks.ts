/**
 * @file weeks.ts
 * @description Helpers for the days shown in a week row and its week number.
 */
import { TIME_CONSTANTS } from "../constants";
import { DateType, getDayOfWeek } from "./date";

/** Start-of-day dates the week view shows for the week containing `selectedDate`. */
export function getVisibleWeekDays(
  selectedDate: DateType,
  weekStartsOn: number,
  weekEndsOn: number,
): DateType[] {
  const currentDay = getDayOfWeek(selectedDate);
  const diff =
    currentDay >= weekStartsOn
      ? weekStartsOn - currentDay
      : weekStartsOn - currentDay - TIME_CONSTANTS.DAYS_IN_WEEK;
  const startOfWeek = selectedDate.plus({ days: diff }).startOf("day");
  let length = weekEndsOn - weekStartsOn + 1;
  if (length <= 0) length += TIME_CONSTANTS.DAYS_IN_WEEK;
  return Array.from({ length }, (_, i) => startOfWeek.plus({ days: i }));
}

/** ISO week number of the Thursday on or after `rowStart`. */
export function getRowWeekNumber(rowStart: DateType): number {
  const offset = (4 - rowStart.weekday + 7) % 7; // Luxon weekday: Mon=1 … Sun=7
  return rowStart.plus({ days: offset }).weekNumber;
}
