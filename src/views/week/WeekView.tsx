import React, { useMemo } from "react";
import cx from "classnames";
import { dateFn, formatDate, calculateEventLayout } from "../../utils";
import { DataType, EDayType } from "../../types";
import { DAY_LIST_NAME } from "../../constants";
import styles from "./WeekView.module.css";
import { useCalendar } from "../../context/CalendarContext";
import TimeColumn from "../../common/time_column/TimeColumn";
import DayColumn from "../../common/day_column/DayColumn";

interface WeekViewProps {
  events: DataType[];
  onEventClick?: (event: DataType) => void;
  dayType?: EDayType;
  is12Hour?: boolean;
}

function WeekView({
  events,
  onEventClick,
  dayType = "HALF",
  is12Hour,
}: WeekViewProps) {
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
        <TimeColumn is12Hour={is12Hour} />
        <div className={styles.eventsGrid}>
          {weekDays.map((date, dayIndex) => (
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
