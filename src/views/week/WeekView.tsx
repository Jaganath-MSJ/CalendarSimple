import React, { useMemo } from "react";
import cx from "classnames";
import { dateFn, formatDate, calculateEventLayout } from "../../utils";
import { CalendarContentProps } from "../../types";
import { DAY_LIST_NAME, DATE_FORMATS } from "../../constants";
import styles from "./WeekView.module.css";
import { useCalendar } from "../../context/CalendarContext";
import TimeColumn from "../../common/time_column/TimeColumn";
import DayColumn from "../../common/day_column/DayColumn";
import AllDayBanner from "../../common/all_day_banner/AllDayBanner";

interface WeekViewProps extends Pick<
  CalendarContentProps,
  "events" | "is12Hour" | "dayType" | "onEventClick" | "theme" | "classNames"
> {}

function WeekView({
  events,
  onEventClick,
  dayType,
  is12Hour,
  theme,
  classNames,
}: WeekViewProps) {
  const { state } = useCalendar();
  const { selectedDate } = state;
  const startOfWeek = useMemo(
    () => selectedDate.startOf("week"),
    [selectedDate],
  );

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
        {weekDays.map((date, index) => {
          const isToday = dateFn().isSame(date, "day");
          const todayStyle = isToday
            ? {
                color: theme?.today?.color,
                backgroundColor: theme?.today?.bgColor,
              }
            : undefined;

          return (
            <div
              key={index}
              className={cx(styles.dayHeader, classNames?.dayHeader)}
            >
              <div className={cx(styles.dayName, classNames?.dayName)}>
                {DAY_LIST_NAME[dayType][index]}
              </div>
              <div
                className={cx(styles.dayNumber, classNames?.dayNumber, {
                  [styles.today]: isToday,
                })}
                style={todayStyle}
              >
                {formatDate(date, DATE_FORMATS.DAY_NUMBER)}
              </div>
            </div>
          );
        })}
      </div>
      <AllDayBanner
        days={weekDays}
        events={events || []}
        onEventClick={onEventClick}
        classNames={classNames}
      />
      <div className={styles.timeGrid}>
        <TimeColumn is12Hour={is12Hour} classNames={classNames} />
        <div className={styles.eventsGrid}>
          {weekDays.map((_, dayIndex) => (
            <div
              key={dayIndex}
              className={cx(styles.dayColumn, classNames?.dayColumn)}
            >
              <DayColumn
                dayEvents={weekEvents[dayIndex]}
                onEventClick={onEventClick}
                is12Hour={is12Hour}
                classNames={classNames}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeekView;
