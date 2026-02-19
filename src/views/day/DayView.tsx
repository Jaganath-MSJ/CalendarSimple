import React, { useMemo } from "react";
import cx from "classnames";
import { dateFn, formatDate, DateType } from "../../utils";
import { CalendarContentType, DataType } from "../../types";
import styles from "./DayView.module.css";

interface DayViewProps {
  currentDate: DateType;
  events: DataType[];
  onEventClick?: (event: DataType) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function DayView({ currentDate, events, onEventClick }: DayViewProps) {
  const dayEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = dateFn(event.startDate).startOf("day");
      const currentDay = dateFn(currentDate).startOf("day");
      return eventDate.isSame(currentDay);
    });
  }, [events, currentDate]);

  const getEventStyle = (event: DataType) => {
    const start = dateFn(event.startDate);
    const end = event.endDate ? dateFn(event.endDate) : start.add(1, "hour");

    // Calculate top position based on start time (minutes from start of day)
    const startMinutes = start.hour() * 60 + start.minute();
    const top = `${(startMinutes / 60) * 60}px`; // 60px per hour

    // Calculate height based on duration
    const durationMinutes = end.diff(start, "minute");
    const height = `${(durationMinutes / 60) * 60}px`;

    return {
      top,
      height,
      backgroundColor: event.color,
    };
  };

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
          {dayEvents.map((event, index) => (
            <div
              key={index}
              className={styles.eventItem}
              style={getEventStyle(event)}
              onClick={() => onEventClick?.(event)}
              title={`${event.value} (${formatDate(event.startDate, "HH:mm")} - ${event.endDate ? formatDate(event.endDate, "HH:mm") : ""})`}
            >
              <div className={styles.eventTitle}>{event.value}</div>
              <div className={styles.eventTime}>
                {formatDate(event.startDate, "HH:mm")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DayView;
