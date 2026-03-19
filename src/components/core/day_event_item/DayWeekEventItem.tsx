import React, { CSSProperties } from "react";
import cx from "classnames";
import { formatDate, generateTooltipText } from "../../../utils";
import { CalendarContentProps } from "../../../types";
import { DayEventLayout } from "../../../hooks/useDayEventLayout";
import { LAYOUT_CONSTANTS, DATE_FORMATS } from "../../../constants";
import styles from "./DayWeekEventItem.module.css";

interface DayWeekEventItemProps extends Pick<
  CalendarContentProps,
  "onEventClick" | "is12Hour" | "classNames"
> {
  item: DayEventLayout;
}

export function DayWeekEventItem({
  item,
  onEventClick,
  is12Hour,
  classNames,
}: DayWeekEventItemProps) {
  const eventColor = item.event.color || LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR;
  const tooltipText = generateTooltipText(item.event, "day", is12Hour);

  const isSmall =
    item.height < LAYOUT_CONSTANTS.SMALL_EVENT_HEIGHT &&
    item.height >= LAYOUT_CONSTANTS.TINY_EVENT_HEIGHT;
  const isTiny = item.height < LAYOUT_CONSTANTS.TINY_EVENT_HEIGHT;

  return (
    <div
      className={cx(styles.eventItem, classNames?.event, {
        [styles.eventItemSmall]: isSmall,
        [styles.eventItemTiny]: isTiny,
      })}
      style={
        {
          top: `${item.top}px`,
          height: `${item.height}px`,
          left: `${item.left}%`,
          zIndex: item.zIndex,
          "--event-width": `${item.width}%`,
          backgroundColor: eventColor,
          position: "absolute",
        } as CSSProperties
      }
      id={item.event.id}
      onClick={() => onEventClick?.(item.event)}
      title={tooltipText}
    >
      <div className={styles.eventTitle}>{item.event.title}</div>
      <div className={styles.eventTime}>
        {formatDate(
          item.event.startDate,
          is12Hour ? DATE_FORMATS.TIME_12H : DATE_FORMATS.TIME,
        )}
      </div>
    </div>
  );
}
