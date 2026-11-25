/**
 * @file Keyboard period navigation (`keyboardNavigation`), as in
 * calendar-simple-native: `navigate` (next / previous / a date) and the
 * `onKeyDown` for the time grids and Schedule. Month has its own roving
 * focus (`MonthView`).
 */
import { useRef } from "react";
import type React from "react";
import { useCalendar } from "../context/CalendarContext";
import { CALENDAR_ACTIONS } from "../constants";
import { ECalendarViewType } from "../types";
import {
  dateFn,
  getNavigatedDate,
  getPeriodKeyAction,
  resolveDirection,
  type DateType,
  type KeyInput,
} from "../utils";
import useCalendarProps from "./useCalendarProps";

/** True while typing in a field: keys belong to the field. */
export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  const tag = el?.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el?.isContentEditable === true
  );
}

/** `navigate(1 | -1 | date)`: dispatches and calls `onNavigate`. */
export function useNavigate() {
  const { state, dispatch } = useCalendar();
  const { onNavigate } = useCalendarProps({});
  return (target: 1 | -1 | DateType) => {
    if (typeof target === "number") {
      const next = getNavigatedDate(state, target);
      if (next.equals(state.selectedDate)) return;
      dispatch({
        type: target === 1 ? CALENDAR_ACTIONS.NEXT : CALENDAR_ACTIONS.PREV,
      });
      onNavigate?.(next.toJSDate());
      return;
    }
    dispatch({ type: CALENDAR_ACTIONS.SET_DATE, payload: target });
    onNavigate?.(target.toJSDate());
  };
}

/** Moves focus to the previous / next row button in `list`. */
function moveRowFocus(
  list: HTMLElement,
  from: EventTarget | null,
  direction: 1 | -1,
): boolean {
  const rows = Array.from(
    list.querySelectorAll<HTMLElement>('[role="button"][tabindex="0"]'),
  );
  const index = rows.indexOf(from as HTMLElement);
  const next = rows[index === -1 ? 0 : index + direction];
  if (!next) return false;
  next.focus();
  next.scrollIntoView?.({ block: "nearest" });
  return true;
}

/**
 * `onKeyDown` for the view wrapper, or `undefined` when keyboard navigation
 * is off or the view handles its own keys (Month).
 *
 * - Day / Week / Custom Days: PageUp / PageDown and ← / → (mirrored in RTL)
 *   turn the period; T goes to today.
 * - Schedule: T goes to today; ↑ / ↓ move between rows. It has no periods.
 */
export function usePeriodKeys():
  ((e: React.KeyboardEvent<HTMLElement>) => void) | undefined {
  const { state } = useCalendar();
  const { keyboardNavigation, direction, locale } = useCalendarProps({});
  const navigate = useNavigate();
  const flip = resolveDirection(direction, locale) === "rtl";
  if (!keyboardNavigation || state.view === ECalendarViewType.month) {
    return undefined;
  }
  const schedule = state.view === ECalendarViewType.schedule;
  return (e) => {
    if (e.defaultPrevented || isTypingTarget(e.target)) return;
    const key: KeyInput = e;
    if (
      schedule &&
      (key.key === "ArrowDown" || key.key === "ArrowUp") &&
      !key.altKey &&
      !key.ctrlKey &&
      !key.metaKey
    ) {
      if (
        moveRowFocus(
          e.currentTarget,
          e.target,
          key.key === "ArrowDown" ? 1 : -1,
        )
      ) {
        e.preventDefault();
      }
      return;
    }
    const action = getPeriodKeyAction(key, { flip, arrows: !schedule });
    if (action === null || (schedule && action !== "today")) return;
    e.preventDefault();
    navigate(action === "today" ? dateFn().startOf("day") : action);
    // The focused event may belong to the old period and unmount: keep
    // focus in the view so the next key still works.
    e.currentTarget.focus({ preventScroll: true });
  };
}

/** Shortest horizontal swipe that turns the period, in px. */
export const SWIPE_MIN_PX = 50;

/**
 * Touch swipe between periods (`swipeNavigation`, default off on web as in
 * calendar-simple-native): a mostly horizontal touch swipe of at least
 * 50 px on Month or a time grid turns the period; left = next (mirrored in
 * RTL). Never in Schedule. Returns the pointer handlers, or `undefined`.
 */
export function useSwipeNavigation():
  | {
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
      onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
      onPointerCancel: () => void;
    }
  | undefined {
  const { state } = useCalendar();
  const { swipeNavigation, direction, locale } = useCalendarProps({});
  const navigate = useNavigate();
  const flip = resolveDirection(direction, locale) === "rtl";
  const startRef = useRef<{ id: number; x: number; y: number } | null>(null);
  if (!swipeNavigation || state.view === ECalendarViewType.schedule) {
    return undefined;
  }
  return {
    onPointerDown: (e) => {
      startRef.current =
        e.pointerType === "touch"
          ? { id: e.pointerId, x: e.clientX, y: e.clientY }
          : null;
    },
    onPointerUp: (e) => {
      const s = startRef.current;
      startRef.current = null;
      if (!s || e.pointerId !== s.id) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < 1.5 * Math.abs(dy)) {
        return;
      }
      const forward = dx < 0 !== flip;
      navigate(forward ? 1 : -1);
    },
    onPointerCancel: () => {
      startRef.current = null;
    },
  };
}
