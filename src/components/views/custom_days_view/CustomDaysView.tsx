import React, { useMemo, useRef } from "react";
import cx from "classnames";
import {
  getDayOfWeek,
  dateFn,
  formatDate,
  getDayListNames,
  resolveTheme,
} from "../../../utils";
import useDayEventLayout, {
  DayEventLayout,
} from "../../../hooks/useDayEventLayout";
import { CalendarContentProps } from "../../../types";
import { DATE_FORMATS } from "../../../constants";
import styles from "./CustomDaysView.module.css";
import { useCalendar } from "../../../context/CalendarContext";
import useMessages from "../../../hooks/useMessages";
import useAutoScrollToNow from "../../../hooks/useAutoScrollToNow";
import usePinchZoom from "../../../hooks/usePinchZoom";
import useCalendarProps from "../../../hooks/useCalendarProps";
import TimeColumn from "../../core/time_column/TimeColumn";
import DayColumn from "../../core/day_column/DayColumn";
import AllDayBanner from "../../core/all_day_banner/AllDayBanner";

export type CustomViewProps = Partial<
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
    | "creatable"
    | "onSlotClick"
  >
>;

function CustomView(props: CustomViewProps) {
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
    creatable,
    onSlotClick,
  } = useCalendarProps(props);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, testId, colorScheme } = useCalendar();
  const messages = useMessages();
  const { selectedDate } = state;

  const viewDays = useMemo(() => {
    return Array.from({ length: customDays }, (_, i) =>
      selectedDate.plus({ days: i }),
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

  usePinchZoom(containerRef);
  const { hourHeight } = useCalendar();
  useAutoScrollToNow(containerRef, {
    scale: hourHeight / 60,
    enabled: !!autoScrollToCurrentTime,
    days: viewDays,
    minHour,
    maxHour,
  });

  return (
    <div
      role="region"
      aria-label={messages.nDaysView(customDays)}
      className={styles.customView}
      ref={containerRef}
      data-calendar-scroll=""
      data-testid={`${testId}-custom-days-view`}
    >
      <div className={styles.stickyTopContainer}>
        <div className={styles.customHeader}>
          <div className={styles.timeHeaderSpacer} />
          {viewDays.map((date, index) => {
            const isToday = dateFn().hasSame(date, "day");
            const resolvedTheme = resolveTheme(theme, colorScheme);
            const todayStyle = isToday
              ? {
                  color: resolvedTheme.today?.color,
                  backgroundColor: resolvedTheme.today?.bgColor,
                }
              : undefined;

            return renderDateCell ? (
              <React.Fragment key={index}>
                {renderDateCell({
                  date: date.toJSDate(),
                  isToday,
                })}
              </React.Fragment>
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

export default CustomView;
