import React, { useMemo, useEffect, useRef } from "react";
import cx from "classnames";
import { getDayOfWeek, dateFn, formatDate } from "../../../utils";
import useDayEventLayout, {
  DayEventLayout,
} from "../../../hooks/useDayEventLayout";
import { CalendarContentProps } from "../../../types";
import { getDayListNames, DATE_FORMATS } from "../../../constants";
import styles from "./WeekView.module.css";
import { useCalendar } from "../../../context/CalendarContext";
import useCalendarProps from "../../../hooks/useCalendarProps";
import TimeColumn from "../../core/time_column/TimeColumn";
import DayColumn from "../../core/day_column/DayColumn";
import AllDayBanner from "../../core/all_day_banner/AllDayBanner";

export type WeekViewProps = Partial<
  Pick<
    CalendarContentProps,
    | "is12Hour"
    | "dayType"
    | "onEventClick"
    | "theme"
    | "classNames"
    | "showCurrentTime"
    | "maxEvents"
    | "autoScrollToCurrentTime"
    | "weekStartsOn"
    | "weekEndsOn"
    | "minHour"
    | "maxHour"
    | "renderEvent"
    | "renderHourCell"
    | "renderDateCell"
    | "showAllDayRow"
    | "eventOverlapOffset"
    | "enableEnrichedEvents"
    | "enrichedEventsByDate"
    | "eventsAreSorted"
    | "isEventOrderingEnabled"
    | "creatable"
    | "onSlotClick"
  >
>;

function WeekView(props: WeekViewProps) {
  const {
    events,
    onEventClick,
    dayType,
    is12Hour,
    theme,
    classNames,
    showCurrentTime,
    maxEvents,
    autoScrollToCurrentTime,
    weekStartsOn,
    weekEndsOn,
    minHour,
    maxHour,
    renderEvent,
    renderHourCell,
    renderDateCell,
    showAllDayRow,
    eventOverlapOffset,
    enableEnrichedEvents,
    enrichedEventsByDate,
    eventsAreSorted,
    isEventOrderingEnabled,
    locale,
    creatable,
    onSlotClick,
  } = useCalendarProps(props);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, testId } = useCalendar();
  const { selectedDate } = state;
  const startOfWeek = useMemo(() => {
    const currentDay = getDayOfWeek(selectedDate);
    const diff =
      currentDay >= weekStartsOn
        ? weekStartsOn - currentDay
        : weekStartsOn - currentDay - 7;
    return selectedDate.plus({ days: diff }).startOf("day");
  }, [selectedDate, weekStartsOn]);

  const weekDays = useMemo(() => {
    let length = weekEndsOn - weekStartsOn + 1;
    if (length <= 0) length += 7;
    return Array.from({ length }, (_, i) => startOfWeek.plus({ days: i }));
  }, [startOfWeek, weekStartsOn, weekEndsOn]);

  const weekEvents = useDayEventLayout(
    events,
    weekDays,
    minHour,
    maxHour,
    showAllDayRow,
    eventOverlapOffset,
    {
      enableEnrichedEvents,
      enrichedEventsByDate,
      eventsAreSorted,
      isEventOrderingEnabled,
    },
  ) as DayEventLayout[][];

  const isCurrentWeek = useMemo(() => {
    const now = dateFn();
    return weekDays.some((day) => now.hasSame(day, "day"));
  }, [weekDays]);

  useEffect(() => {
    if (autoScrollToCurrentTime && containerRef.current && isCurrentWeek) {
      const now = dateFn();
      const hours = now.hour;
      const minutes = now.minute;
      const totalMinutes = hours * 60 + minutes;

      const container = containerRef.current;
      const targetScroll = Math.max(
        0,
        totalMinutes - container.clientHeight / 2,
      );

      container.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, [autoScrollToCurrentTime, isCurrentWeek]);

  return (
    <div
      role="region"
      aria-label="Week view"
      className={styles.weekView}
      ref={containerRef}
      data-testid={`${testId}-week-view`}
    >
      <div className={styles.stickyTopContainer}>
        <div className={styles.weekHeader}>
          <div className={styles.timeHeaderSpacer} />
          {weekDays.map((date, index) => {
            const isToday = dateFn().hasSame(date, "day");
            const todayStyle = isToday
              ? {
                  color: theme?.today?.color,
                  backgroundColor: theme?.today?.bgColor,
                }
              : undefined;

            return renderDateCell ? (
              renderDateCell({
                date: date.toJSDate(),
                isToday,
              })
            ) : (
              <div
                key={index}
                className={cx(styles.dayHeader, classNames?.dayHeader)}
              >
                <div className={cx(styles.dayName, classNames?.dayName)}>
                  {getDayListNames(dayType, locale)[getDayOfWeek(date)]}
                </div>
                <div
                  className={cx(styles.dayNumber, classNames?.dayNumber, {
                    [styles.today]: isToday,
                  })}
                  style={todayStyle}
                >
                  {formatDate(date, DATE_FORMATS.DAY_NUMBER, locale)}
                </div>
              </div>
            );
          })}
        </div>
        {showAllDayRow && (
          <AllDayBanner
            days={weekDays}
            events={events || []}
            maxEvents={maxEvents}
            onEventClick={onEventClick}
            classNames={classNames}
            is12Hour={is12Hour}
            renderEvent={renderEvent}
            locale={locale}
          />
        )}
      </div>
      <div className={styles.timeGrid}>
        <TimeColumn
          is12Hour={is12Hour}
          classNames={classNames}
          minHour={minHour}
          maxHour={maxHour}
          locale={locale}
        />
        <div className={styles.eventsGrid}>
          {weekDays.map((date, dayIndex) => {
            const isToday = dateFn().hasSame(date, "day");
            return (
              <div
                key={dayIndex}
                className={cx(styles.dayColumn, classNames?.dayColumn)}
                data-testid={`${testId}-day-column`}
              >
                <DayColumn
                  dayEvents={weekEvents[dayIndex]}
                  date={date}
                  onEventClick={onEventClick}
                  is12Hour={is12Hour}
                  classNames={classNames}
                  isToday={isToday}
                  showCurrentTime={showCurrentTime}
                  minHour={minHour}
                  maxHour={maxHour}
                  renderEvent={renderEvent}
                  renderHourCell={renderHourCell}
                  creatable={creatable}
                  onSlotClick={onSlotClick}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WeekView;
