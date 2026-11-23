import React, { CSSProperties, useRef } from "react";
import type { DateTime } from "luxon";
import cx from "classnames";
import {
  canDrag,
  clampWallClock,
  dateFn,
  formatDate,
  getLastEventDay,
  generateTooltipText,
  getContrastColor,
  handleKeyboardActivation,
  moveWallClock,
  resizeWallClock,
  resolveDirection,
  stripLayoutStyle,
} from "../../../utils";
import { CalendarContentProps } from "../../../types";
import { DayEventLayout } from "../../../hooks/useDayEventLayout";
import {
  LAYOUT_CONSTANTS,
  DATE_FORMATS,
  defaultCalendarProps,
} from "../../../constants";
import {
  markFocusAfterMove,
  useFocusAfterMove,
} from "../../../hooks/useFocusAfterMove";
import useEventDrag, { type DragMeasure } from "../../../hooks/useEventDrag";
import type { ResizeEdge } from "../../../utils/drag";
import styles from "./DayWeekEventItem.module.css";
import { useCalendar } from "../../../context/CalendarContext";
import useMessages from "../../../hooks/useMessages";

interface DayWeekEventItemProps extends Pick<
  CalendarContentProps,
  "onEventClick" | "is12Hour" | "classNames" | "renderEvent"
> {
  item: DayEventLayout;
  /** Day of the column this segment is drawn in. */
  day?: DateTime;
}

/** Items shorter than this (px) get no resize edges, so they stay clickable. */
const MIN_RESIZE_HEIGHT = 24;

export function DayWeekEventItem({
  item,
  onEventClick,
  is12Hour,
  classNames,
  renderEvent,
  day,
}: DayWeekEventItemProps) {
  const { testId, config, state, hourHeight } = useCalendar();
  // Layout is in minutes; the grid draws hourHeight px per hour.
  const scale = hourHeight / 60;
  const topPx = item.top * scale;
  const heightPx = item.height * scale;
  const messages = useMessages();
  const locale = config.locale;
  const tooltipText = generateTooltipText(item.event, "day", is12Hour, locale);

  const isSmall =
    heightPx < LAYOUT_CONSTANTS.SMALL_EVENT_HEIGHT &&
    heightPx >= LAYOUT_CONSTANTS.TINY_EVENT_HEIGHT;
  const isTiny = heightPx < LAYOUT_CONSTANTS.TINY_EVENT_HEIGHT;

  const eventBgColor =
    item.event.style?.backgroundColor || LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR;
  // Text contrast is computed from the hex fallback; overriding
  // --cal-event-default does not recompute it.
  const textColor = getContrastColor(String(eventBgColor));

  const { event } = item;
  const reversed = resolveDirection(config.direction, config.locale) === "rtl";
  const snap = config.dragSnapMinutes ?? defaultCalendarProps.dragSnapMinutes;
  const minHour = config.minHour ?? defaultCalendarProps.minHour;
  const maxHour = config.maxHour ?? defaultCalendarProps.maxHour;
  const canMove = canDrag(config.draggable, event, config.onEventDrop);
  const eventStart = dateFn(event.startDate);
  const ref = useRef<HTMLDivElement>(null);
  const focusKey = event.id ? `${testId}:${event.id}` : undefined;
  useFocusAfterMove(focusKey, ref);
  const lastDay = getLastEventDay(event);
  // Only events within one day are kept inside minHour–maxHour.
  const isOneDay = lastDay.hasSame(eventStart, "day");

  /** Reports the event moved by `days` and wall-clock `minutes`. */
  const moveBy = (days: number, minutes: number) => {
    const start = dateFn(event.startDate);
    const end = event.endDate ? dateFn(event.endDate) : undefined;
    let next = moveWallClock(start, end, days, minutes);
    if (isOneDay) {
      // Keep an event inside the hours, but never pull one that already
      // starts before minHour (or ends after maxHour) to that edge.
      const from = (start.hour * 60 + start.minute) / 60;
      const to = from + (end ? end.diff(start, "minutes").minutes / 60 : 0);
      next = clampWallClock(
        next.start,
        next.end,
        Math.min(minHour, from),
        Math.max(maxHour, to),
      );
    }
    config.onEventDrop?.({
      event,
      start: next.start.toJSDate(),
      end: next.end.toJSDate(),
      allDay: false,
      view: state.view,
    });
  };

  const move = useEventDrag({
    enabled: canMove,
    axis: "both",
    reversed,
    measure: (el) => {
      const column = el.closest<HTMLElement>('[data-testid$="-day-column"]');
      const row = column?.parentElement;
      if (!column || !row) return null;
      const columns = Array.from(row.children).filter(
        (c) => c.getAttribute("data-testid") === column.dataset.testid,
      );
      const gridHeight = (maxHour - minHour) * 60 * scale;
      return {
        cellWidth: column.getBoundingClientRect().width,
        columnIndex: columns.indexOf(column),
        columnCount: columns.length,
        stepPx: snap * scale,
        yBounds: isOneDay
          ? { min: -topPx, max: gridHeight - topPx - heightPx }
          : undefined,
      };
    },
    onCommit: (cells, steps) => moveBy(cells, steps * snap),
  });

  const resizeSnap =
    config.resizeSnapMinutes ?? defaultCalendarProps.resizeSnapMinutes;
  const minLength =
    config.minEventDurationMinutes ??
    defaultCalendarProps.minEventDurationMinutes;
  const canResize = canDrag(config.resizable, event, config.onEventResize);
  const gridHeight = (maxHour - minHour) * 60 * scale;

  /** Reports the event with its `edge` moved by wall-clock `minutes`. */
  const resizeBy = (edge: ResizeEdge, minutes: number) => {
    const start = dateFn(event.startDate);
    const end = event.endDate ? dateFn(event.endDate) : undefined;
    let next = resizeWallClock(start, end, edge, minutes, minLength);
    const latest = hourOf(start, maxHour);
    if (edge === "bottom" && (end ?? start) <= latest && next.end > latest) {
      next = { ...next, end: latest };
    }
    const earliest = hourOf(start, minHour);
    if (edge === "top" && start >= earliest && next.start < earliest) {
      next = { ...next, start: earliest };
    }
    config.onEventResize?.({
      event,
      start: next.start.toJSDate(),
      end: next.end.toJSDate(),
      edge,
      view: state.view,
    });
  };

  const resizeMeasure = (min: number, max: number) => (): DragMeasure => ({
    cellWidth: 0,
    columnIndex: 0,
    columnCount: 1,
    stepPx: resizeSnap * scale,
    yBounds: { min, max },
  });
  const top = useEventDrag({
    enabled: canResize,
    axis: "y",
    reversed,
    measure: resizeMeasure(-topPx, heightPx - minLength * scale),
    onCommit: (_c, steps) => resizeBy("top", steps * resizeSnap),
  });
  const bottom = useEventDrag({
    enabled: canResize,
    axis: "y",
    reversed,
    measure: resizeMeasure(
      minLength * scale - heightPx,
      gridHeight - topPx - heightPx,
    ),
    onCommit: (_c, steps) => resizeBy("bottom", steps * resizeSnap),
  });
  const topShift = top.offset?.y ?? 0;
  const heightShift = (bottom.offset?.y ?? 0) - topShift;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (canResize && e.altKey && e.shiftKey) {
      const delta = { ArrowUp: -resizeSnap, ArrowDown: resizeSnap }[e.key];
      if (delta) {
        e.preventDefault();
        markFocusAfterMove(focusKey);
        resizeBy("bottom", delta);
        return;
      }
    }
    if (canMove && e.altKey && !e.shiftKey) {
      const step: Record<string, [number, number]> = {
        ArrowUp: [0, -snap],
        ArrowDown: [0, snap],
        ArrowLeft: [reversed ? 1 : -1, 0],
        ArrowRight: [reversed ? -1 : 1, 0],
      };
      const delta = step[e.key];
      if (delta) {
        e.preventDefault();
        markFocusAfterMove(focusKey);
        moveBy(delta[0], delta[1]);
        return;
      }
    }
    handleKeyboardActivation(() => onEventClick?.(event))(e);
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      className={cx(styles.eventItem, classNames?.event, {
        [styles.eventItemSmall]: isSmall,
        [styles.eventItemTiny]: isTiny,
        [styles.draggable]: canMove,
        [styles.dragging]: move.dragging || top.dragging || bottom.dragging,
      })}
      data-testid={`${testId}-${item.event.id}-day-event-item`}
      style={
        {
          backgroundColor: "var(--cal-event-default)",
          color: textColor,
          ...stripLayoutStyle(item.event.style),
          top: `${topPx + topShift}px`,
          height: `${heightPx + heightShift}px`,
          insetInlineStart: `${item.left}%`,
          zIndex: item.zIndex,
          "--event-width": `${item.width}%`,
          position: "absolute",
          ...(move.offset && {
            transform: `translate(${move.offset.x}px, ${move.offset.y}px)`,
          }),
        } as CSSProperties
      }
      id={item.event.id}
      aria-label={`${item.event.title || messages.noTitle}, ${tooltipText}`}
      aria-keyshortcuts={
        [
          canMove && "Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight",
          canResize && "Alt+Shift+ArrowUp Alt+Shift+ArrowDown",
        ]
          .filter(Boolean)
          .join(" ") || undefined
      }
      aria-description={
        [
          ...(canMove
            ? [
                messages.moveEarlier(snap),
                messages.moveLater(snap),
                messages.movePreviousDay,
                messages.moveNextDay,
              ]
            : []),
          ...(canResize
            ? [
                messages.makeLonger(resizeSnap),
                messages.makeShorter(resizeSnap),
              ]
            : []),
        ].join(". ") || undefined
      }
      onPointerDown={move.handlers.onPointerDown}
      onClickCapture={(e) => {
        move.handlers.onClickCapture(e);
        top.handlers.onClickCapture(e);
        bottom.handlers.onClickCapture(e);
      }}
      onClick={() => onEventClick?.(item.event)}
      onKeyDown={handleKeyDown}
      title={tooltipText}
    >
      {renderEvent ? (
        renderEvent(item.event)
      ) : (
        <>
          <div className={styles.eventTitle}>{item.event.title}</div>
          <div className={styles.eventTime}>
            {formatDate(
              item.event.startDate,
              is12Hour ? DATE_FORMATS.TIME_12H : DATE_FORMATS.TIME,
              locale,
            )}
          </div>
        </>
      )}
      {canResize &&
        heightPx >= MIN_RESIZE_HEIGHT &&
        (["top", "bottom"] as const)
          .filter(
            (edge) =>
              // A multi-day event: the top edge on its first day, the bottom on its last.
              !day ||
              (edge === "top" ? eventStart : lastDay).hasSame(day, "day"),
          )
          .map((edge) => (
            <div
              key={edge}
              aria-hidden="true"
              className={cx(styles.resizeHandle, styles[`resize-${edge}`])}
              data-testid={`${testId}-${item.event.id}-resize-${edge}`}
              onPointerDown={
                (edge === "top" ? top : bottom).handlers.onPointerDown
              }
            />
          ))}
    </div>
  );
}

/** `hour` o'clock on `day` (24 = the next midnight). */
function hourOf(day: DateTime, hour: number): DateTime {
  const midnight = day.startOf("day");
  return hour >= 24 ? midnight.plus({ days: 1 }) : midnight.set({ hour });
}
