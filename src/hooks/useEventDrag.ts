/**
 * @file Pointer drag for event items (move and resize), with no dependency.
 *
 * Mouse and pen start after a 4 px move; touch starts after a 300 ms hold.
 * The live offset is snapped (x to whole cells, y to whole steps) so the
 * preview shows where the event will land. Escape and `pointercancel` cancel;
 * the click that follows a drag is swallowed so it does not open the event.
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type React from "react";
import { cellsMoved, getAxisBounds, stepsMoved } from "../utils/drag";

const MOVE_THRESHOLD_PX = 4;
const TOUCH_HOLD_MS = 300;
/** How long after a drag the following click is swallowed. */
const CLICK_SUPPRESS_MS = 500;

/** Sizes read from the DOM when a drag starts. */
export interface DragMeasure {
  /** Width of one cell (day column or month cell), px. */
  cellWidth: number;
  /** Logical index of the event's cell in its row. */
  columnIndex: number;
  /** Cells in the row. */
  columnCount: number;
  /** Pixels per y step (snap minutes in a time grid, row height in Month). */
  stepPx: number;
  /** Allowed y offset, px; unbounded when omitted. */
  yBounds?: { min: number; max: number };
  /**
   * Offsets (px, sorted, including 0 for the start row) the y movement snaps
   * to, for rows of different heights. One step per stop; overrides `stepPx`.
   */
  yStops?: number[];
}

export interface UseEventDragOptions {
  enabled: boolean;
  /** Axes that move: `x` cells, `y` steps. */
  axis: "both" | "x" | "y";
  /** Whether the row is drawn right to left. */
  reversed: boolean;
  /** Reads sizes from the dragged element when the drag starts. */
  measure: (el: HTMLElement) => DragMeasure | null;
  /** Called on release with the whole cells and steps moved (not both 0). */
  onCommit: (cells: number, steps: number) => void;
}

export interface EventDragResult {
  handlers: {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
    onClickCapture: (e: React.MouseEvent<HTMLElement>) => void;
  };
  /** Snapped on-screen offset while dragging, else `null`. */
  offset: { x: number; y: number } | null;
  dragging: boolean;
}

interface Session {
  pointerId: number;
  x0: number;
  y0: number;
  el: HTMLElement;
  active: boolean;
  measure: DragMeasure | null;
  cells: number;
  steps: number;
  timer?: ReturnType<typeof setTimeout>;
  cleanup: () => void;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function useEventDrag(options: UseEventDragOptions): EventDragResult {
  const optsRef = useRef(options);
  useLayoutEffect(() => {
    optsRef.current = options;
  });
  const session = useRef<Session | null>(null);
  /** Time until which a click is swallowed (the click a drag ends with). */
  const suppressUntil = useRef(0);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);

  const end = useCallback((commit: boolean) => {
    const s = session.current;
    if (!s) return;
    session.current = null;
    s.cleanup();
    if (s.timer) clearTimeout(s.timer);
    if (s.active) {
      suppressUntil.current = Date.now() + CLICK_SUPPRESS_MS;
      setOffset(null);
      if (commit && optsRef.current.enabled && (s.cells || s.steps)) {
        optsRef.current.onCommit(s.cells, s.steps);
      }
    }
  }, []);

  useEffect(() => () => end(false), [end]);

  // Dragging turned off mid-drag: cancel rather than commit on release.
  useEffect(() => {
    if (!options.enabled) end(false);
  }, [options.enabled, end]);

  const activate = (s: Session) => {
    s.active = true;
    s.measure = optsRef.current.measure(s.el);
    // A press-and-move would otherwise start selecting text across the grid.
    window.getSelection?.()?.removeAllRanges();
    try {
      s.el.setPointerCapture?.(s.pointerId);
    } catch {
      // The pointer may already be gone; window listeners still track it.
    }
    setOffset({ x: 0, y: 0 });
  };

  const update = (s: Session, dx: number, dy: number) => {
    const m = s.measure;
    if (!m) return;
    const { axis, reversed } = optsRef.current;
    let x = 0;
    let cells = 0;
    if (axis !== "y" && m.cellWidth > 0) {
      const b = getAxisBounds(
        m.columnIndex,
        m.columnCount,
        m.cellWidth,
        reversed,
      );
      x = clamp(Math.round(dx / m.cellWidth) * m.cellWidth, b.min, b.max);
      cells = cellsMoved(x, m.cellWidth, reversed);
    }
    let y = 0;
    let steps = 0;
    if (axis !== "x" && m.yStops?.length) {
      const stops = m.yStops;
      let best = 0;
      stops.forEach((stop, i) => {
        if (Math.abs(stop - dy) < Math.abs(stops[best] - dy)) best = i;
      });
      steps = best - stops.indexOf(0);
      y = stops[best];
    } else if (axis !== "x" && m.stepPx > 0) {
      steps = stepsMoved(dy, m.stepPx);
      if (m.yBounds) {
        // Clamp whole steps so rounding never crosses the bound.
        steps = clamp(
          steps,
          Math.ceil(m.yBounds.min / m.stepPx),
          Math.floor(m.yBounds.max / m.stepPx),
        );
      }
      y = steps * m.stepPx;
    }
    if (cells === s.cells && steps === s.steps) return;
    s.cells = cells;
    s.steps = steps;
    setOffset({ x: x || 0, y: y || 0 });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (!optsRef.current.enabled || e.button !== 0) return;
    end(false);
    suppressUntil.current = 0;
    e.stopPropagation();
    const el = e.currentTarget;
    const isTouch = e.pointerType === "touch";

    const onMove = (ev: PointerEvent) => {
      const s = session.current;
      if (!s || ev.pointerId !== s.pointerId) return;
      const dx = ev.clientX - s.x0;
      const dy = ev.clientY - s.y0;
      if (!s.active) {
        if (Math.hypot(dx, dy) < MOVE_THRESHOLD_PX) return;
        // Touch that moves before the hold is a scroll, not a drag.
        if (isTouch) return end(false);
        activate(s);
      }
      ev.preventDefault();
      update(s, dx, dy);
    };
    const onUp = (ev: PointerEvent) => {
      if (session.current && ev.pointerId === session.current.pointerId) {
        end(true);
      }
    };
    const onCancel = (ev: PointerEvent) => {
      if (session.current && ev.pointerId === session.current.pointerId) {
        end(false);
      }
    };
    // Capture phase on window: runs first, so the Escape that cancels a
    // drag does not also close a popover or reach other handlers.
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape" || !session.current) return;
      ev.preventDefault();
      ev.stopPropagation();
      end(false);
    };

    // touch-action is fixed at touchstart, so once a touch drag is active
    // the page scroll is stopped by cancelling touchmove instead.
    const onTouchMove = (ev: TouchEvent) => {
      if (session.current?.active && ev.cancelable) ev.preventDefault();
    };
    if (isTouch) {
      el.addEventListener("touchmove", onTouchMove, { passive: false });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey, true);

    const s: Session = {
      pointerId: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      el,
      active: false,
      measure: null,
      cells: 0,
      steps: 0,
      cleanup: () => {
        el.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        window.removeEventListener("keydown", onKey, true);
      },
    };
    if (isTouch) {
      s.timer = setTimeout(() => {
        if (session.current === s) activate(s);
      }, TOUCH_HOLD_MS);
    }
    session.current = s;
  };

  const onClickCapture = (e: React.MouseEvent<HTMLElement>) => {
    if (Date.now() >= suppressUntil.current) return;
    suppressUntil.current = 0;
    e.stopPropagation();
    e.preventDefault();
  };

  return {
    handlers: { onPointerDown, onClickCapture },
    offset,
    dragging: offset !== null,
  };
}

export default useEventDrag;
