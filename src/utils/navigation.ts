/**
 * @file Shared navigation maths for the reducer and the header's onNavigate.
 */
import type { CalendarState } from "../context/CalendarContext";
import { ECalendarViewType } from "../types";
import type { DateType } from "./date";

/**
 * Returns the date `NEXT` (`direction = 1`) or `PREV` (`-1`) moves to.
 * month/week/day move one unit, `customDays` moves by `customDays` (default 3).
 * `schedule` has no Prev/Next, so the date is returned unchanged.
 */
export function getNavigatedDate(
  state: Pick<CalendarState, "selectedDate" | "view" | "customDays">,
  direction: 1 | -1,
): DateType {
  const { selectedDate, view, customDays } = state;
  if (view === ECalendarViewType.schedule) return selectedDate;
  if (view === ECalendarViewType.customDays) {
    return selectedDate.plus({ days: direction * (customDays || 3) });
  }
  return selectedDate.plus({ [view]: direction });
}
