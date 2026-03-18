import React, { useMemo, useEffect, useRef } from "react";
import cx from "classnames";
import { dateFn, formatDate } from "../../../utils";
import useDayEventLayout, {
  DayEventLayout,
} from "../../../hooks/useDayEventLayout";
import { CalendarContentProps } from "../../../types";
import { DAY_LIST_NAME, DATE_FORMATS } from "../../../constants";
import styles from "./CustomDaysView.module.css";
import { useCalendar } from "../../../context/CalendarContext";
import TimeColumn from "../../core/time_column/TimeColumn";
import DayColumn from "../../core/day_column/DayColumn";
import AllDayBanner from "../../core/all_day_banner/AllDayBanner";

interface CustomViewProps extends Pick<
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
  | "minHour"
  | "maxHour"
  | "customDays"
> {}

function CustomView({
  events,
  onEventClick,
  dayType,
  is12Hour,
  theme,
  classNames,
  showCurrentTime,
  maxEvents,
  autoScrollToCurrentTime,
  minHour,
  maxHour,
  customDays = 3,
}: CustomViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useCalendar();
  const { selectedDate } = state;

  const viewDays = useMemo(() => {
    return Array.from({ length: customDays }, (_, i) =>
      selectedDate.add(i, "day"),
    );
  }, [selectedDate, customDays]);

  const viewEvents = useDayEventLayout(
    events,
    viewDays,
    minHour,
    maxHour,
  ) as DayEventLayout[][];

  const hasToday = useMemo(() => {
    const now = dateFn();
    return viewDays.some((day) => now.isSame(day, "day"));
  }, [viewDays]);

  useEffect(() => {
    if (autoScrollToCurrentTime && containerRef.current && hasToday) {
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
  }, [autoScrollToCurrentTime, hasToday]);

  return (
    <div className={styles.customView} ref={containerRef}>
      <div className={styles.stickyTopContainer}>
        <div className={styles.customHeader}>
          <div className={styles.timeHeaderSpacer} />
          {viewDays.map((date, index) => {
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
                  {DAY_LIST_NAME[dayType][date.day()]}
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
          days={viewDays}
          events={events || []}
          maxEvents={maxEvents}
          onEventClick={onEventClick}
          classNames={classNames}
          is12Hour={is12Hour}
        />
      </div>
      <div className={styles.timeGrid}>
        <TimeColumn
          is12Hour={is12Hour}
          classNames={classNames}
          minHour={minHour}
          maxHour={maxHour}
        />
        <div className={styles.eventsGrid}>
          {viewDays.map((date, dayIndex) => {
            const isToday = dateFn().isSame(date, "day");
            return (
              <div
                key={dayIndex}
                className={cx(styles.dayColumn, classNames?.dayColumn)}
              >
                <DayColumn
                  dayEvents={viewEvents[dayIndex]}
                  onEventClick={onEventClick}
                  is12Hour={is12Hour}
                  classNames={classNames}
                  isToday={isToday}
                  showCurrentTime={showCurrentTime}
                  minHour={minHour}
                  maxHour={maxHour}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CustomView;
