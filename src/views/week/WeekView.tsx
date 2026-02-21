import React, { useMemo } from "react";
import cx from "classnames";
import {
  dateFn,
  formatDate,
  DateType,
  calculateEventLayout,
} from "../../utils";
import { DataType, EDayType } from "../../types";
import { DAY_LIST_NAME } from "../../constants";
import styles from "./WeekView.module.css";
import { useCalendar } from "../../context/CalendarContext";

interface WeekViewProps {
  events: DataType[];
  onEventClick?: (event: DataType) => void;
  dayType?: EDayType;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function WeekView({ events, onEventClick, dayType = "HALF" }: WeekViewProps) {
  const { state } = useCalendar();
  const { currentDate } = state;
  const startOfWeek = useMemo(() => currentDate.startOf("week"), [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));
  }, [startOfWeek]);

  // Calculate events for each day of the week
  const weekEvents = useMemo(() => {
    return weekDays.map((dayDate) => calculateEventLayout(events, dayDate));
  }, [events, weekDays]);

  return (
    <div className={styles.weekView}>
      <div className={styles.weekHeader}>
        <div className={styles.timeHeaderSpacer} />
        {weekDays.map((date, index) => (
          <div key={index} className={styles.dayHeader}>
            <div className={styles.dayName}>
              {DAY_LIST_NAME[dayType][index]}
            </div>
            <div
              className={cx(styles.dayNumber, {
                [styles.today]: dateFn().isSame(date, "day"),
              })}
            >
              {formatDate(date, "D")}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.timeGrid}>
        <div className={styles.timeColumn}>
          {HOURS.map((hour) => (
            <div key={hour} className={styles.timeSlot}>
              {formatDate(dateFn().hour(hour).minute(0), "HH:mm")}
            </div>
          ))}
        </div>
        <div className={styles.eventsGrid}>
          {weekDays.map((date, dayIndex) => (
            <div key={dayIndex} className={styles.dayColumn}>
              {HOURS.map((hour) => (
                <div key={hour} className={styles.eventSlot} />
              ))}
              {weekEvents[dayIndex].map((item, index) => {
                const eventColor = item.event.color || "#3b82f6";
                let tooltipText = `${item.event.value} (${formatDate(
                  item.event.startDate,
                  "HH:mm",
                )}`;
                if (item.event.endDate) {
                  tooltipText += ` - ${formatDate(
                    item.event.endDate,
                    "HH:mm",
                  )}`;
                }
                tooltipText += `)`;

                return (
                  <div
                    key={index}
                    className={cx(styles.eventItem, {
                      [styles.eventItemSmall]:
                        item.height < 40 && item.height >= 20,
                      [styles.eventItemTiny]: item.height < 20,
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
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeekView;
