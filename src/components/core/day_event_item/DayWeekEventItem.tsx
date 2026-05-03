import React, { CSSProperties } from "react";
import cx from "classnames";
import {
  formatDate,
  generateTooltipText,
  getContrastColor,
  handleKeyboardActivation,
} from "../../../utils";
import { CalendarContentProps } from "../../../types";
import { DayEventLayout } from "../../../hooks/useDayEventLayout";
import { LAYOUT_CONSTANTS, DATE_FORMATS } from "../../../constants";
import styles from "./DayWeekEventItem.module.css";
import { useCalendar } from "../../../context/CalendarContext";

interface DayWeekEventItemProps extends Pick<
  CalendarContentProps,
  "onEventClick" | "is12Hour" | "classNames" | "renderEvent"
> {
  item: DayEventLayout;
}

export function DayWeekEventItem({
  item,
  onEventClick,
  is12Hour,
  classNames,
  renderEvent,
}: DayWeekEventItemProps) {
  const { testId } = useCalendar();
  const tooltipText = generateTooltipText(item.event, "day", is12Hour);

  const isSmall =
    item.height < LAYOUT_CONSTANTS.SMALL_EVENT_HEIGHT &&
    item.height >= LAYOUT_CONSTANTS.TINY_EVENT_HEIGHT;
  const isTiny = item.height < LAYOUT_CONSTANTS.TINY_EVENT_HEIGHT;

  const eventBgColor =
    item.event.style?.backgroundColor || LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR;
  const textColor = getContrastColor(String(eventBgColor));

  return (
    <div
      role="button"
      tabIndex={0}
      className={cx(styles.eventItem, classNames?.event, {
        [styles.eventItemSmall]: isSmall,
        [styles.eventItemTiny]: isTiny,
      })}
      data-testid={`${testId}-${item.event.id}-day-event-item`}
      style={
        {
          top: `${item.top}px`,
          height: `${item.height}px`,
          left: `${item.left}%`,
          zIndex: item.zIndex,
          "--event-width": `${item.width}%`,
          backgroundColor: LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR,
          color: textColor,
          position: "absolute",
          ...item.event.style,
        } as CSSProperties
      }
      id={item.event.id}
      aria-label={`${item.event.title}, ${tooltipText}`}
      onClick={() => onEventClick?.(item.event)}
      onKeyDown={handleKeyboardActivation(() => onEventClick?.(item.event))}
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
            )}
          </div>
        </>
      )}
    </div>
  );
}
