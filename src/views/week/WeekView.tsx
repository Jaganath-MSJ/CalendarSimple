import React, { useMemo } from "react";
import cx from "classnames";
import { dateFn, formatDate, calculateEventLayout } from "../../utils";
import { CalendarContentType } from "../../types";
import { DAY_LIST_NAME, DATE_FORMATS } from "../../constants";
import styles from "./WeekView.module.css";
import { useCalendar } from "../../context/CalendarContext";
import TimeColumn from "../../common/time_column/TimeColumn";
import DayColumn from "../../common/day_column/DayColumn";

interface WeekViewProps extends Pick<
  CalendarContentType,
  "events" | "onEventClick" | "dayType" | "is12Hour"
> {}

function WeekView({ events, onEventClick, dayType, is12Hour }: WeekViewProps) {
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
              {formatDate(date, DATE_FORMATS.DAY_NUMBER)}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.timeGrid}>
        <TimeColumn is12Hour={is12Hour} />
        <div className={styles.eventsGrid}>
          {weekDays.map((_, dayIndex) => (
            <div key={dayIndex} className={styles.dayColumn}>
              <DayColumn
                dayEvents={weekEvents[dayIndex]}
                onEventClick={onEventClick}
                is12Hour={is12Hour}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeekView;
