import React, { useEffect, useRef } from "react";
import cx from "classnames";
import { getDayOfWeek, dateFn, formatDate } from "../../../utils";
import useDayEventLayout, {
  DayEventLayout,
} from "../../../hooks/useDayEventLayout";
import { CalendarContentProps } from "../../../types";
import { getDayListNames, DATE_FORMATS } from "../../../constants";
import styles from "./DayView.module.css";
import { useCalendar } from "../../../context/CalendarContext";
import useCalendarProps from "../../../hooks/useCalendarProps";
import TimeColumn from "../../core/time_column/TimeColumn";
import DayColumn from "../../core/day_column/DayColumn";
import AllDayBanner from "../../core/all_day_banner/AllDayBanner";

export type DayViewProps = Partial<
  Pick<
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
  >
>;

function DayView(props: DayViewProps) {
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
  } = useCalendarProps(props);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, testId } = useCalendar();
  const { selectedDate } = state;
  const dayEvents = useDayEventLayout(
    events,
    selectedDate,
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
  ) as DayEventLayout[];

  const isToday = dateFn().hasSame(selectedDate, "day");

  const todayStyle = isToday
    ? {
        color: theme?.today?.color,
        backgroundColor: theme?.today?.bgColor,
      }
    : undefined;

  useEffect(() => {
    if (autoScrollToCurrentTime && containerRef.current && isToday) {
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
  }, [autoScrollToCurrentTime, isToday]);

  return (
    <div
      className={styles.dayView}
      ref={containerRef}
      data-testid={`${testId}-day-view`}
    >
      <div className={styles.stickyTopContainer}>
        <div className={styles.dayHeaderContainer}>
          <div className={styles.timeHeaderSpacer} />
          {renderDateCell ? (
            renderDateCell({
              date: selectedDate.toJSDate(),
              isToday,
            })
          ) : (
            <div className={cx(styles.dayHeader, classNames?.dayHeader)}>
              <div className={cx(styles.dayName, classNames?.dayName)}>
                {getDayListNames(dayType, locale)[getDayOfWeek(selectedDate)]}
              </div>
              <div
                className={cx(styles.dayNumber, classNames?.dayNumber, {
                  [styles.today]: isToday,
                })}
                style={todayStyle}
              >
                {formatDate(selectedDate, DATE_FORMATS.DAY_NUMBER, locale)}
              </div>
            </div>
          )}
        </div>
        {showAllDayRow && (
          <AllDayBanner
            days={[selectedDate]}
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
        <div
          className={cx(styles.eventsColumn, classNames?.dayColumn)}
          data-testid={`${testId}-day-column`}
        >
          <DayColumn
            dayEvents={dayEvents}
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
      </div>
    </div>
  );
}

export default DayView;
