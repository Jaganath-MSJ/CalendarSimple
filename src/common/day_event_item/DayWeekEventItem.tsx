import React from "react";
import cx from "classnames";
import { formatDate, generateTooltipText } from "../../utils";
import { DataType } from "../../types";
import { DayEventLayout } from "../../utils/eventLayout";
import styles from "./DayWeekEventItem.module.css";

interface DayWeekEventItemProps {
  item: DayEventLayout;
  onEventClick?: (event: DataType) => void;
}

export function DayWeekEventItem({
  item,
  onEventClick,
}: DayWeekEventItemProps) {
  const eventColor = item.event.color || "#3b82f6";
  const tooltipText = generateTooltipText(item.event, "day");

  const isSmall = item.height < 40 && item.height >= 20;
  const isTiny = item.height < 20;

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
      onClick={() => onEventClick?.(item.event)}
      title={tooltipText}
    >
      <div className={styles.eventTitle}>{item.event.value}</div>
      <div className={styles.eventTime}>
        {formatDate(item.event.startDate, "HH:mm")}
      </div>
    </div>
  );
}
