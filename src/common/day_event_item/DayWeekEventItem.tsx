import React from "react";
import cx from "classnames";
import { formatDate, generateTooltipText } from "../../utils";
import { DataType } from "../../types";
import { DayEventLayout } from "../../utils/eventLayout";
import { CALENDAR_CONSTANTS, DATE_FORMATS } from "../../constants";
import styles from "./DayWeekEventItem.module.css";

interface DayWeekEventItemProps {
  item: DayEventLayout;
  onEventClick?: (event: DataType) => void;
  is12Hour?: boolean;
}

export function DayWeekEventItem({
  item,
  onEventClick,
  is12Hour,
}: DayWeekEventItemProps) {
  const eventColor = item.event.color || CALENDAR_CONSTANTS.DEFAULT_EVENT_COLOR;
  const tooltipText = generateTooltipText(item.event, "day", is12Hour);

  const isSmall =
    item.height < CALENDAR_CONSTANTS.SMALL_EVENT_HEIGHT &&
    item.height >= CALENDAR_CONSTANTS.TINY_EVENT_HEIGHT;
  const isTiny = item.height < CALENDAR_CONSTANTS.TINY_EVENT_HEIGHT;

  return (
    <div
      className={cx(styles.eventItem, {
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
        } as React.CSSProperties
      }
      id={item.event.id}
      onClick={() => onEventClick?.(item.event)}
      title={tooltipText}
    >
      <div className={styles.eventTitle}>{item.event.value}</div>
      <div className={styles.eventTime}>
        {formatDate(
          item.event.startDate,
          is12Hour ? DATE_FORMATS.TIME_12H : DATE_FORMATS.TIME,
        )}
      </div>
    </div>
  );
}
