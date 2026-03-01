import React, { useMemo, useEffect, useRef } from "react";
import cx from "classnames";
import { dateFn, formatDate, calculateEventLayout } from "../../utils";
import { CalendarContentProps } from "../../types";
import { DAY_LIST_NAME, DATE_FORMATS } from "../../constants";
import styles from "./DayView.module.css";
import { useCalendar } from "../../context/CalendarContext";
import TimeColumn from "../../common/time_column/TimeColumn";
import DayColumn from "../../common/day_column/DayColumn";
import AllDayBanner from "../../common/all_day_banner/AllDayBanner";

interface DayViewProps extends Pick<
  CalendarContentProps,
  | "events"
  | "is12Hour"
  | "dayType"
  | "onEventClick"
  | "theme"
  | "classNames"
  | "showCurrentTime"
  | "maxEvents"
  | "autoScrollToCurrentTime"
> {}

function DayView({
  events,
  onEventClick,
  dayType,
  is12Hour,
  theme,
  classNames,
  showCurrentTime,
  maxEvents,
  autoScrollToCurrentTime,
}: DayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useCalendar();
  const { selectedDate } = state;
  const dayEvents = useMemo(
    () => calculateEventLayout(events, selectedDate),
    [events, selectedDate],
  );

  const isToday = dateFn().isSame(selectedDate, "day");

  const todayStyle = isToday
    ? {
        color: theme?.today?.color,
        backgroundColor: theme?.today?.bgColor,
      }
    : undefined;

  useEffect(() => {
    if (autoScrollToCurrentTime && containerRef.current && isToday) {
      const now = dateFn();
      const hours = now.hour();
      const minutes = now.minute();
      const totalMinutes = hours * 60 + minutes;

      const container = containerRef.current;
      const targetScroll = Math.max(
        0,
        totalMinutes - container.clientHeight / 2,
      );

      container.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [autoScrollToCurrentTime, isToday]);

  return (
    <div className={styles.dayView} ref={containerRef}>
      <div className={styles.stickyTopContainer}>
        <div className={styles.dayHeaderContainer}>
          <div className={styles.timeHeaderSpacer} />
          <div className={cx(styles.dayHeader, classNames?.dayHeader)}>
            <div className={cx(styles.dayName, classNames?.dayName)}>
              {DAY_LIST_NAME[dayType][selectedDate.day()]}
            </div>
            <div
              className={cx(styles.dayNumber, classNames?.dayNumber, {
                [styles.today]: isToday,
              })}
              style={todayStyle}
            >
              {formatDate(selectedDate, DATE_FORMATS.DAY_NUMBER)}
            </div>
          </div>
        </div>
        <AllDayBanner
          days={[selectedDate]}
          events={events || []}
          maxEvents={maxEvents}
          onEventClick={onEventClick}
          classNames={classNames}
          is12Hour={is12Hour}
        />
      </div>
      <div className={styles.timeGrid}>
        <TimeColumn is12Hour={is12Hour} classNames={classNames} />
        <div className={cx(styles.eventsColumn, classNames?.dayColumn)}>
          <DayColumn
            dayEvents={dayEvents}
            onEventClick={onEventClick}
            is12Hour={is12Hour}
            classNames={classNames}
            isToday={isToday}
            showCurrentTime={showCurrentTime}
          />
        </div>
      </div>
    </div>
  );
}

export default DayView;
