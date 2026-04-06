import React, { useMemo, useEffect, useRef } from "react";
import cx from "classnames";
import { getDayOfWeek, dateFn, formatDate } from "../../../utils";
import useDayEventLayout, {
  DayEventLayout,
} from "../../../hooks/useDayEventLayout";
import { CalendarContentProps } from "../../../types";
import { getDayListNames, DATE_FORMATS } from "../../../constants";
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
  | "renderEvent"
  | "renderHourCell"
  | "renderDateCell"
  | "showAllDayRow"
  | "eventOverlapOffset"
  | "enableEnrichedEvents"
  | "enrichedEventsByDate"
  | "eventsAreSorted"
  | "isEventOrderingEnabled"
  | "locale"
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
}: CustomViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, testId } = useCalendar();
  const { selectedDate } = state;

  const viewDays = useMemo(() => {
    return Array.from({ length: customDays }, (_, i) =>
      selectedDate.plus({ day: i }),
    );
  }, [selectedDate, customDays]);

  const viewEvents = useDayEventLayout(
    events,
    viewDays,
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

  const hasToday = useMemo(() => {
    const now = dateFn();
    return viewDays.some((day) => now.hasSame(day, "day"));
  }, [viewDays]);

  useEffect(() => {
    if (autoScrollToCurrentTime && containerRef.current && hasToday) {
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
  }, [autoScrollToCurrentTime, hasToday]);

  return (
    <div
      className={styles.customView}
      ref={containerRef}
      data-testid={`${testId}-custom-days-view`}
    >
      <div className={styles.stickyTopContainer}>
        <div className={styles.customHeader}>
          <div className={styles.timeHeaderSpacer} />
          {viewDays.map((date, index) => {
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
            days={viewDays}
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
          {viewDays.map((date, dayIndex) => {
            const isToday = dateFn().hasSame(date, "day");
            return (
              <div
                key={dayIndex}
                className={cx(styles.dayColumn, classNames?.dayColumn)}
                data-testid={`${testId}-day-column`}
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
                  renderEvent={renderEvent}
                  renderHourCell={renderHourCell}
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
