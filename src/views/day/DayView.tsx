import React, { useMemo } from "react";
import cx from "classnames";
import { dateFn, formatDate, calculateEventLayout } from "../../utils";
import { CalendarContentType } from "../../types";
import { DAY_LIST_NAME, DATE_FORMATS } from "../../constants";
import styles from "./DayView.module.css";
import { useCalendar } from "../../context/CalendarContext";
import TimeColumn from "../../common/time_column/TimeColumn";
import DayColumn from "../../common/day_column/DayColumn";

interface DayViewProps extends Pick<
  CalendarContentType,
  "events" | "onEventClick" | "dayType" | "is12Hour"
> {}

function DayView({ events, onEventClick, dayType, is12Hour }: DayViewProps) {
  const { state } = useCalendar();
  const { currentDate } = state;
  const dayEvents = useMemo(
    () => calculateEventLayout(events, currentDate),
    [events, currentDate],
  );

  return (
    <div className={styles.dayView}>
      <div className={styles.dayHeaderContainer}>
        <div className={styles.timeHeaderSpacer} />
        <div className={styles.dayHeader}>
          <div className={styles.dayName}>
            {DAY_LIST_NAME[dayType][currentDate.day()]}
          </div>
          <div
            className={cx(styles.dayNumber, {
              [styles.today]: dateFn().isSame(currentDate, "day"),
            })}
          >
            {formatDate(currentDate, DATE_FORMATS.DAY_NUMBER)}
          </div>
        </div>
      </div>
      <div className={styles.timeGrid}>
        <TimeColumn is12Hour={is12Hour} />
        <div className={styles.eventsColumn}>
          <DayColumn
            dayEvents={dayEvents}
            onEventClick={onEventClick}
            is12Hour={is12Hour}
          />
        </div>
      </div>
    </div>
  );
}

export default DayView;
