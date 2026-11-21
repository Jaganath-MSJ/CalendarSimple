/**
 * @file visibleRange.ts
 * @description First and last visible day (inclusive) of each calendar view.
 */
import { TIME_CONSTANTS } from "../constants";
import { CalendarEvent, ECalendarViewType } from "../types";
import { getLastEventDay } from "./common";
import { dateFn, DateType, getDayOfWeek } from "./date";
import { getVisibleWeekDays } from "./weeks";

/** Options for `getVisibleRange`. */
export interface VisibleRangeOptions {
  weekStartsOn: number;
  weekEndsOn: number;
  customDays?: number;
  /** Used by the schedule view, which shows every event. */
  events?: CalendarEvent[];
}

/**
 * Returns the visible days of `view` around `selectedDate`, both ends
 * inclusive and at start of day. Month spans the first to the last grid cell
 * (adjacent-month cells included); Schedule spans all events.
 */
export function getVisibleRange(
  view: ECalendarViewType,
  selectedDate: DateType,
  opts: VisibleRangeOptions,
): { start: DateType; end: DateType } {
  const { DAYS_IN_WEEK } = TIME_CONSTANTS;
  const day = selectedDate.startOf("day");

  switch (view) {
    case ECalendarViewType.month: {
      const first = day.startOf("month");
      const offset =
        (getDayOfWeek(first) - opts.weekStartsOn + DAYS_IN_WEEK) % DAYS_IN_WEEK;
      const rows = Math.ceil((offset + day.daysInMonth!) / DAYS_IN_WEEK);
      const length =
        ((opts.weekEndsOn - opts.weekStartsOn + DAYS_IN_WEEK) % DAYS_IN_WEEK) +
        1;
      const start = first.minus({ days: offset });
      return {
        start,
        end: start.plus({ days: (rows - 1) * DAYS_IN_WEEK + length - 1 }),
      };
    }
    case ECalendarViewType.week: {
      const days = getVisibleWeekDays(day, opts.weekStartsOn, opts.weekEndsOn);
      return { start: days[0], end: days[days.length - 1] };
    }
    case ECalendarViewType.customDays:
      return {
        start: day,
        end: day.plus({ days: Math.max(opts.customDays ?? 3, 1) - 1 }),
      };
    case ECalendarViewType.schedule: {
      const events = opts.events ?? [];
      if (events.length === 0) return { start: day, end: day };
      let start = dateFn(events[0].startDate).startOf("day");
      let end = getLastEventDay(events[0]);
      for (const event of events) {
        const s = dateFn(event.startDate).startOf("day");
        const e = getLastEventDay(event);
        if (s < start) start = s;
        if (e > end) end = e;
      }
      return { start, end };
    }
    default:
      return { start: day, end: day };
  }
}
