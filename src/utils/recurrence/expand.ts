/**
 * @file Expands recurring events (`rrule`) into occurrences inside a window.
 */
import type { DateTime, Duration } from "luxon";
import { dateFn, type DateType } from "../date";
import type { CalendarEvent } from "../../types";
import { parseRRule, type RRule } from "./parseRRule";

/** A span of days, both ends inclusive. */
export interface VisibleRange {
  start: DateType;
  end: DateType;
}

/** Occurrences per event per window before expansion stops. */
export const MAX_OCCURRENCES = 1000;

/** Periods scanned per event at most (guards rules that never match). */
const MAX_PERIODS = 50_000;

/**
 * The days to expand for a visible range: at least two months either side
 * (the pager's neighbour pages), widened to whole quarters so occurrences
 * are recomputed only when navigation crosses a quarter.
 */
export function getExpansionWindow(range: VisibleRange): VisibleRange {
  return {
    start: range.start.minus({ months: 2 }).startOf("quarter"),
    end: range.end.plus({ months: 2 }).endOf("quarter"),
  };
}

export interface ExpandOptions {
  /** Keep the output sorted by start (`eventsAreSorted`). */
  sorted?: boolean;
}

export interface ExpandResult<E> {
  events: E[];
  /** Development warnings (ignored rules, capped expansions). */
  warnings: string[];
}

const OFFSET = /(?:[zZ]|[+-]\d{2}:?\d{2})$/;

/** A series to expand: a non-empty `rrule`, and not itself an occurrence. */
export const isSeries = (e: CalendarEvent) =>
  typeof e.rrule === "string" &&
  e.rrule !== "" &&
  e.recurringEventId === undefined;

const nameOf = (e: CalendarEvent) =>
  e.id !== undefined ? `"${e.id}"` : `"${e.title}"`;

/** First day of the week containing `day`, for a week starting on `wkst`. */
const weekStart = (day: DateTime, wkst: number) =>
  day.startOf("day").minus({ days: (day.weekday - wkst + 7) % 7 });

/** First day of period `k` (start of day). */
function periodStart(rule: RRule, start: DateTime, k: number): DateTime {
  const step = k * rule.interval;
  switch (rule.freq) {
    case "DAILY":
      return start.startOf("day").plus({ days: step });
    case "WEEKLY":
      return weekStart(start, rule.wkst).plus({ weeks: step });
    case "MONTHLY":
      return start.startOf("month").plus({ months: step });
    case "YEARLY":
      return start.startOf("year").plus({ years: step });
  }
}

/** Candidate days of one month for MONTHLY / YEARLY rules, ascending. */
function monthDays(month: DateTime, rule: RRule, start: DateTime): DateTime[] {
  const size = month.daysInMonth ?? 31;
  let days: Set<number> | undefined;
  if (rule.byMonthDay) {
    days = new Set(
      rule.byMonthDay
        .map((n) => (n > 0 ? n : size + 1 + n))
        .filter((n) => n >= 1 && n <= size),
    );
  }
  if (rule.byDay) {
    const fromWeekdays = new Set<number>();
    const first = month.weekday; // weekday of day 1
    for (const { weekday, nth } of rule.byDay) {
      const firstMatch = 1 + ((weekday - first + 7) % 7);
      const all: number[] = [];
      for (let d = firstMatch; d <= size; d += 7) all.push(d);
      if (nth === undefined) all.forEach((d) => fromWeekdays.add(d));
      else {
        const pick = nth > 0 ? all[nth - 1] : all[all.length + nth];
        if (pick !== undefined) fromWeekdays.add(pick);
      }
    }
    days = days
      ? new Set([...days].filter((d) => fromWeekdays.has(d)))
      : fromWeekdays;
  }
  if (!days) days = new Set(start.day <= size ? [start.day] : []);
  return [...days].sort((a, b) => a - b).map((d) => month.set({ day: d }));
}

/** Candidate days of period `k` (start of day, ascending). */
function periodDays(rule: RRule, start: DateTime, k: number): DateTime[] {
  const step = k * rule.interval;
  const inMonths = (d: DateTime) =>
    !rule.byMonth || rule.byMonth.includes(d.month);
  switch (rule.freq) {
    case "DAILY": {
      const day = start.startOf("day").plus({ days: step });
      const ok =
        inMonths(day) &&
        (!rule.byDay || rule.byDay.some((b) => b.weekday === day.weekday)) &&
        (!rule.byMonthDay ||
          monthDays(
            day.startOf("month"),
            { ...rule, byDay: undefined },
            start,
          ).some((d) => d.day === day.day));
      return ok ? [day] : [];
    }
    case "WEEKLY": {
      const week = weekStart(start, rule.wkst).plus({ weeks: step });
      const weekdays = rule.byDay?.map((b) => b.weekday) ?? [start.weekday];
      return [...new Set(weekdays)]
        .map((wd) => week.plus({ days: (wd - rule.wkst + 7) % 7 }))
        .filter(inMonths)
        .sort((a, b) => a.toMillis() - b.toMillis());
    }
    case "MONTHLY": {
      const month = start.startOf("month").plus({ months: step });
      return inMonths(month) ? monthDays(month, rule, start) : [];
    }
    case "YEARLY": {
      const year = start.startOf("year").plus({ years: step });
      const months =
        rule.byMonth ??
        (rule.byMonthDay || rule.byDay
          ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          : [start.month]);
      return [...months]
        .sort((a, b) => a - b)
        .flatMap((m) => monthDays(year.set({ month: m }), rule, start));
    }
  }
}

/** Index of the first period that can reach `from` (rules without COUNT). */
function firstPeriod(rule: RRule, start: DateTime, from: DateTime): number {
  if (rule.count !== undefined || from <= start) return 0;
  const unit =
    rule.freq === "DAILY"
      ? "days"
      : rule.freq === "WEEKLY"
        ? "weeks"
        : rule.freq === "MONTHLY"
          ? "months"
          : "years";
  const span = Math.floor(from.diff(start, unit).as(unit));
  return Math.max(0, Math.floor(span / rule.interval) - 1);
}

function format(dt: DateTime, allDay: boolean, withOffset: boolean): string {
  if (allDay) return dt.toISODate() ?? "";
  return withOffset
    ? (dt.toISO({ suppressMilliseconds: true }) ?? "")
    : dt.toFormat("yyyy-MM-dd'T'HH:mm:ss");
}

/**
 * Expands one recurring event into its occurrences that overlap `window`.
 * Each occurrence copies the event with its own `startDate` / `endDate`,
 * `id` `"<id>::<occurrence start>"`, `recurringEventId` and
 * `occurrenceDate`.
 */
function expandOne<E extends CalendarEvent>(
  event: E,
  rule: RRule,
  window: VisibleRange,
): { occurrences: E[]; capped: boolean } {
  const allDay = !event.startDate.includes("T");
  const withOffset = OFFSET.test(event.startDate);
  const start = dateFn(event.startDate);
  const end = event.endDate ? dateFn(event.endDate) : undefined;
  // Calendar-aware length, so a 09:00–10:00 meeting stays so across DST.
  const length: Duration | undefined = end
    ? end.diff(start, ["days", "hours", "minutes", "seconds", "milliseconds"])
    : undefined;
  const lengthDays =
    end && allDay ? Math.round(end.diff(start, "days").days) : 0;

  const excluded = new Set<string>();
  for (const x of event.exdates ?? []) {
    const d = dateFn(x);
    if (!d.isValid) continue;
    excluded.add(
      x.includes("T") ? String(d.toMillis()) : (d.toISODate() ?? ""),
    );
  }

  const windowStart = window.start.startOf("day");
  const windowEnd = window.end.endOf("day");
  const time = {
    hour: start.hour,
    minute: start.minute,
    second: start.second,
    millisecond: start.millisecond,
  };
  const out: E[] = [];
  let generated = 0;
  const from = windowStart.minus(length ?? { days: 0 }).minus({ days: 1 });

  const first = firstPeriod(rule, start, from);
  for (let k = first; k < first + MAX_PERIODS; k++) {
    const begin = periodStart(rule, start, k);
    // Nothing after the window is shown, and nothing after UNTIL exists.
    if (begin > windowEnd || (rule.until && begin > rule.until)) break;
    for (const day of periodDays(rule, start, k)) {
      const occ = allDay ? day : day.set(time);
      if (occ < start) continue;
      if (occ > windowEnd || (rule.until && occ > rule.until))
        return { occurrences: out, capped: false };
      generated++;
      if (rule.count !== undefined && generated > rule.count)
        return { occurrences: out, capped: false };
      const occEnd = end
        ? allDay
          ? occ.plus({ days: lengthDays })
          : occ.plus(length!)
        : occ;
      if (occEnd < windowStart) continue;
      const key = allDay ? (occ.toISODate() ?? "") : String(occ.toMillis());
      if (excluded.has(key) || excluded.has(occ.toISODate() ?? "")) continue;
      const startText = format(occ, allDay, withOffset);
      out.push({
        ...event,
        id: `${event.id ?? event.startDate}::${startText}`,
        recurringEventId: event.id,
        occurrenceDate: startText,
        startDate: startText,
        ...(end ? { endDate: format(occEnd, allDay, withOffset) } : {}),
      });
      if (out.length >= MAX_OCCURRENCES)
        return { occurrences: out, capped: true };
    }
  }
  return { occurrences: out, capped: false };
}

/**
 * Replaces each event with an `rrule` by its occurrences inside `window`;
 * other events pass through. An unusable rule shows the event once, with a
 * warning. With `sorted`, the result is sorted by start (stable).
 */
export function expandRecurringEvents<E extends CalendarEvent>(
  events: E[],
  window: VisibleRange,
  options: ExpandOptions = {},
): ExpandResult<E> {
  const warnings: string[] = [];
  if (!events.some(isSeries)) return { events, warnings };

  const out: E[] = [];
  for (const event of events) {
    // Occurrences (an app's own, or ours fed back) and invalid dates pass
    // through unexpanded; the calendar's date validation handles the latter.
    if (
      typeof event.rrule !== "string" ||
      !event.rrule ||
      event.recurringEventId !== undefined ||
      !dateFn(event.startDate).isValid ||
      (event.endDate !== undefined && !dateFn(event.endDate).isValid)
    ) {
      out.push(event);
      continue;
    }
    const parsed = parseRRule(event.rrule);
    if (!parsed.ok) {
      warnings.push(
        `[calendar] event ${nameOf(event)}: rrule ignored (${parsed.reason}); showing it once.`,
      );
      out.push(event);
      continue;
    }
    const { occurrences, capped } = expandOne(event, parsed.rule, window);
    if (capped)
      warnings.push(
        `[calendar] event ${nameOf(event)}: more than ${MAX_OCCURRENCES} occurrences in view; the rest are not shown.`,
      );
    out.push(...occurrences);
  }
  if (options.sorted) {
    const keyed = out.map((e, i) => ({
      e,
      i,
      t: dateFn(e.startDate).toMillis(),
    }));
    keyed.sort((a, b) => a.t - b.t || a.i - b.i);
    return { events: keyed.map((k) => k.e), warnings };
  }
  return { events: out, warnings };
}
