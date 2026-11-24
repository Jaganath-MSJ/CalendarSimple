/**
 * @file Drag-to-move and resize maths (pure): pixel offsets to cells and
 * steps, and the new times. Ported from calendar-simple-native
 * (`core/drag/drop.ts`); the time helpers work in wall-clock minutes so a
 * move or resize on a DST day lands on the time shown in the grid.
 */
import type { DateTime } from "luxon";

/** Allowed offset on one axis, in px (`min` ≤ 0 ≤ `max`). */
export interface AxisBounds {
  min: number;
  max: number;
}

/** Which edge of a timed event is dragged. */
export type ResizeEdge = "top" | "bottom";

const MINUTES_PER_DAY = 1440;

/**
 * Bounds along a row of `count` cells of `size` px for the cell at logical
 * `index`. When the row is drawn `reversed` (right to left on screen),
 * logical index 0 is the rightmost cell.
 */
export function getAxisBounds(
  index: number,
  count: number,
  size: number,
  reversed = false,
): AxisBounds {
  const visual = reversed ? count - 1 - index : index;
  return { min: -visual * size, max: (count - 1 - visual) * size };
}

/** Whole cells moved for an on-screen offset, in logical order. */
export function cellsMoved(
  offset: number,
  size: number,
  reversed = false,
): number {
  if (size <= 0) return 0;
  const cells = Math.round(offset / size);
  return (reversed ? -cells : cells) || 0;
}

/** Whole steps moved for an offset (minutes = steps × step minutes). */
export function stepsMoved(offset: number, stepPx: number): number {
  return stepPx > 0 ? Math.round(offset / stepPx) || 0 : 0;
}

function wallMinute(dt: DateTime): number {
  return dt.hour * 60 + dt.minute;
}

/** Adds wall-clock minutes (the hour/minute shown), not elapsed time. */
function addWallMinutes(dt: DateTime, minutes: number): DateTime {
  const total = wallMinute(dt) + minutes;
  const days = Math.floor(total / MINUTES_PER_DAY);
  const m = total - days * MINUTES_PER_DAY;
  return dt
    .startOf("day")
    .plus({ days })
    .set({ hour: Math.floor(m / 60), minute: m % 60, second: dt.second });
}

/** Wall-clock minutes from `a` to `b`. */
function wallLength(a: DateTime, b: DateTime): number {
  const days = Math.round(b.startOf("day").diff(a.startOf("day"), "days").days);
  return days * MINUTES_PER_DAY + wallMinute(b) - wallMinute(a);
}

/**
 * The event's new start and end after moving `days` and `minutes`. The
 * wall-clock length is kept; an event without `end` ends at its new start.
 */
export function moveWallClock(
  start: DateTime,
  end: DateTime | undefined,
  days: number,
  minutes: number,
): { start: DateTime; end: DateTime } {
  const nextStart = addWallMinutes(start.plus({ days }), minutes);
  if (!end) return { start: nextStart, end: nextStart };
  return {
    start: nextStart,
    end: addWallMinutes(nextStart, wallLength(start, end)),
  };
}

/**
 * The event's new start and end after its `edge` moves by `minutes`. A
 * resize never leaves less than `minMinutes` and never moves an edge the
 * wrong way; an event without `end` is treated as `start + minMinutes`
 * (how it is drawn).
 */
export function resizeWallClock(
  start: DateTime,
  end: DateTime | undefined,
  edge: ResizeEdge,
  minutes: number,
  minMinutes: number,
): { start: DateTime; end: DateTime } {
  const last = end ?? addWallMinutes(start, minMinutes);
  const length = wallLength(start, last);
  if (edge === "top") {
    const shift =
      minutes > 0
        ? Math.min(minutes, Math.max(0, length - minMinutes))
        : minutes;
    return { start: addWallMinutes(start, shift), end: last };
  }
  const grow =
    minutes < 0 ? Math.max(minutes, Math.min(0, minMinutes - length)) : minutes;
  return { start, end: addWallMinutes(last, grow) };
}

/**
 * Whether an event can be dragged or resized: the flag (or the predicate for
 * this event) allows it and the callback that reports the change is set.
 */
export function canDrag<T>(
  flag: boolean | ((event: T) => boolean) | undefined,
  event: T,
  callback: unknown,
): boolean {
  if (typeof callback !== "function" || !flag) return false;
  return flag === true || flag(event);
}

/**
 * Shifts a same-day timed event so it fits between `minHour` and `maxHour`
 * on its start day, keeping its wall-clock length. Events longer than the
 * window start at `minHour`.
 */
export function clampWallClock(
  start: DateTime,
  end: DateTime,
  minHour: number,
  maxHour: number,
): { start: DateTime; end: DateTime } {
  const from = wallMinute(start);
  const length = wallLength(start, end);
  const latest = maxHour * 60 - length;
  const target = Math.max(minHour * 60, Math.min(from, latest));
  if (target === from) return { start, end };
  return moveWallClock(start, end, 0, target - from);
}
