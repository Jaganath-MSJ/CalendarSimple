import React, { useMemo } from "react";
import cx from "classnames";
import {
  dateFn,
  formatDate,
  DateType,
  calculateEventLayout,
} from "../../utils";
import { DataType } from "../../types";
import styles from "./DayView.module.css";

interface DayViewProps {
  currentDate: DateType;
  events: DataType[];
  onEventClick?: (event: DataType) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function DayView({ currentDate, events, onEventClick }: DayViewProps) {
  const dayEvents = useMemo(
    () => calculateEventLayout(events, currentDate),
    [events, currentDate],
  );

  return (
    <div className={styles.dayView}>
      <div className={styles.dayHeader}>
        {formatDate(currentDate, "dddd, MMMM D, YYYY")}
      </div>
      <div className={styles.timeGrid}>
        <div className={styles.timeColumn}>
          {HOURS.map((hour) => (
            <div key={hour} className={styles.timeSlot}>
              {formatDate(dateFn().hour(hour).minute(0), "HH:mm")}
            </div>
          ))}
        </div>
        <div className={styles.eventsColumn}>
          {HOURS.map((hour) => (
            <div key={hour} className={styles.eventSlot} />
          ))}
          {dayEvents.map((item, index) => (
            <div
              key={index}
              className={styles.eventItem}
              style={{
                top: `${item.top}px`,
                height: `${item.height}px`,
                left: `${item.left}%`,
                width: `${item.width}%`,
                backgroundColor: item.event.color,
                position: "absolute", // Ensure it's absolute
              }}
              onClick={() => onEventClick?.(item.event)}
              title={`${item.event.value} (${formatDate(item.event.startDate, "HH:mm")} - ${item.event.endDate ? formatDate(item.event.endDate, "HH:mm") : ""})`}
            >
              <div className={styles.eventTitle}>{item.event.value}</div>
              <div className={styles.eventTime}>
                {formatDate(item.event.startDate, "HH:mm")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DayView;
