/**
 * @file Whole-day drag and keyboard moves for Month chips and the all-day
 * row. x moves by days; in Month, y moves by weeks (one row = 7 days).
 * Times of timed events are kept.
 */
import { useRef } from "react";
import type React from "react";
import type { CSSProperties } from "react";
import { useCalendar } from "../context/CalendarContext";
import type { CalendarEvent } from "../types";
import {
  canDrag,
  dateFn,
  isAllDayEvent,
  moveWallClock,
  resolveDirection,
} from "../utils";
import useEventDrag, { type DragMeasure } from "./useEventDrag";
import { markFocusAfterMove, useFocusAfterMove } from "./useFocusAfterMove";

const DAYS_PER_ROW = 7;

export interface UseDayMoveOptions {
  /** `both` in Month (rows are weeks); `x` in the all-day row. */
  axis: "both" | "x";
  measure: (el: HTMLElement) => DragMeasure | null;
}

export function useDayMove(event: CalendarEvent, options: UseDayMoveOptions) {
  const { config, state, testId } = useCalendar();
  const ref = useRef<HTMLDivElement>(null);
  const focusKey = event.id ? `${testId}:${event.id}` : undefined;
  useFocusAfterMove(focusKey, ref);
  const reversed = resolveDirection(config.direction, config.locale) === "rtl";
  const canMove = canDrag(config.draggable, event, config.onEventDrop);

  const moveBy = (days: number) => {
    if (!days) return;
    const start = dateFn(event.startDate);
    const end = event.endDate ? dateFn(event.endDate) : undefined;
    const next = moveWallClock(start, end, days, 0);
    config.onEventDrop?.({
      event,
      start: next.start.toJSDate(),
      end: next.end.toJSDate(),
      allDay: isAllDayEvent(event),
      view: state.view,
    });
  };

  const drag = useEventDrag({
    enabled: canMove,
    axis: options.axis,
    reversed,
    measure: options.measure,
    onCommit: (cells, steps) => moveBy(cells + steps * DAYS_PER_ROW),
  });

  /** Handles Alt+arrow moves; returns `true` when the key was used. */
  const handleKey = (e: React.KeyboardEvent<HTMLElement>): boolean => {
    if (!canMove || !e.altKey || e.shiftKey) return false;
    const keys: Record<string, number> = {
      ArrowLeft: reversed ? 1 : -1,
      ArrowRight: reversed ? -1 : 1,
      ...(options.axis === "both" && {
        ArrowUp: -DAYS_PER_ROW,
        ArrowDown: DAYS_PER_ROW,
      }),
    };
    const days = keys[e.key];
    if (!days) return false;
    e.preventDefault();
    e.stopPropagation();
    markFocusAfterMove(focusKey);
    moveBy(days);
    return true;
  };

  const style: CSSProperties | undefined = drag.offset
    ? { transform: `translate(${drag.offset.x}px, ${drag.offset.y}px)` }
    : undefined;

  return {
    ref,
    canMove,
    dragging: drag.dragging,
    handlers: drag.handlers,
    handleKey,
    style,
    keyShortcuts: canMove
      ? options.axis === "both"
        ? "Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
        : "Alt+ArrowLeft Alt+ArrowRight"
      : undefined,
  };
}

/** Month cell geometry for a chip: cells in its week row, rows in the month. */
export function measureMonthCell(el: HTMLElement): DragMeasure | null {
  const cell = el.closest<HTMLElement>('[data-testid$="-month-cell"]');
  const row = cell?.parentElement;
  const body = row?.parentElement;
  if (!cell || !row || !body) return null;
  const isCell = (c: Element) =>
    c.getAttribute("data-testid")?.endsWith("-month-cell") ?? false;
  const cells = Array.from(row.children).filter(isCell);
  const rows = Array.from(body.children).filter((r) =>
    Array.from(r.children).some(isCell),
  );
  const rect = cell.getBoundingClientRect();
  const rowIndex = rows.indexOf(row);
  // Rows can differ in height, so snap to each row's real top.
  const rowTop = (r: Element) =>
    (Array.from(r.children).find(isCell) as Element).getBoundingClientRect()
      .top;
  const yStops = rows.map((r) => rowTop(r) - rect.top);
  return {
    cellWidth: rect.width,
    columnIndex: cells.indexOf(cell),
    columnCount: cells.length,
    stepPx: rect.height,
    yBounds: {
      min: -rowIndex * rect.height,
      max: (rows.length - 1 - rowIndex) * rect.height,
    },
    yStops,
  };
}

export default useDayMove;
