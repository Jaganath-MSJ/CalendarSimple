import React, { useMemo } from "react";
import cx from "classnames";
import { dateFn, formatDate, calculateEventLayout } from "../../utils";
import { CalendarContentProps } from "../../types";
import { DAY_LIST_NAME, DATE_FORMATS } from "../../constants";
import styles from "./DayView.module.css";
import { useCalendar } from "../../context/CalendarContext";
import TimeColumn from "../../common/time_column/TimeColumn";
import DayColumn from "../../common/day_column/DayColumn";

interface DayViewProps extends Pick<
  CalendarContentProps,
  "events" | "onEventClick" | "dayType" | "is12Hour" | "theme" | "classNames"
> {}

function DayView({ events, onEventClick, dayType, is12Hour }: DayViewProps) {
  const { state } = useCalendar();
  const { selectedDate } = state;
  const dayEvents = useMemo(
    () => calculateEventLayout(events, selectedDate),
    [events, selectedDate],
  );

  return (
    <div className={styles.dayView}>
      <div className={styles.dayHeaderContainer}>
        <div className={styles.timeHeaderSpacer} />
        <div className={styles.dayHeader}>
          <div className={styles.dayName}>
            {DAY_LIST_NAME[dayType][selectedDate.day()]}
          </div>
          <div
            className={cx(styles.dayNumber, {
              [styles.today]: dateFn().isSame(selectedDate, "day"),
            })}
          >
            {formatDate(selectedDate, DATE_FORMATS.DAY_NUMBER)}
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
