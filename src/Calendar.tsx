import React, { useMemo, memo, useEffect } from "react";
import cx from "classnames";
import { CalendarType, CalendarContentType, ECalendarViewType } from "./types";
import { defaultCalenderProps, CALENDAR_CONSTANTS } from "./constants";
import { dateFn, useResizeObserver } from "./utils";
import styles from "./Calendar.module.css";
import Header from "./layout/Header";
import DayView from "./views/day/DayView";
import WeekView from "./views/week/WeekView";
import MonthView from "./views/month/MonthView";
import { CalendarProvider, useCalendar } from "./context/CalendarContext";

function CalendarContent({
  dayType,
  width,
  height,
  onDateClick,
  onEventClick,
  onMoreClick,
  isSelectDate,
  events,
  ...restProps
}: CalendarContentType) {
  const {
    state: { view },
    dispatch,
  } = useCalendar();

  // Sync view from props to context
  useEffect(() => {
    if (restProps.view) {
      dispatch({ type: "SET_VIEW", payload: restProps.view });
    }
  }, [restProps.view]);

  const getViewComponent = (view: ECalendarViewType) => {
    switch (view) {
      case ECalendarViewType.day:
        return <DayView events={events} onEventClick={onEventClick} />;
      case ECalendarViewType.week:
        return (
          <WeekView
            events={events}
            onEventClick={onEventClick}
            dayType={dayType}
          />
        );
      case ECalendarViewType.month:
        return (
          <MonthView
            {...restProps}
            events={events}
            onEventClick={onEventClick}
            dayType={dayType}
            width={width}
            height={height}
            onDateClick={onDateClick}
            onMoreClick={onMoreClick}
            isSelectDate={isSelectDate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section
      style={
        {
          "--calendar-width": `${width}px`,
          "--calendar-height": `${height}px`,
        } as React.CSSProperties
      }
      className={cx(styles.calendar, restProps.className)}
    >
      <Header
        headerClassName={restProps.headerClassName}
        onMonthChange={restProps.onMonthChange}
        onViewChange={restProps.onViewChange}
        pastYearLength={restProps.pastYearLength}
        futureYearLength={restProps.futureYearLength}
      />
      {getViewComponent(view)}
    </section>
  );
}

function Calendar(props: CalendarType = defaultCalenderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { width: observedWidth, height: observedHeight } =
    useResizeObserver(containerRef);

  const allProps = { ...defaultCalenderProps, ...props };
  const { selectedDate } = allProps;

  // Use props if provided, otherwise use observed size
  const width = props.width ?? observedWidth ?? 0;
  const mainHeight = props.height ?? observedHeight ?? 0;
  const height = mainHeight - CALENDAR_CONSTANTS.HEADER_HEIGHT;

  const initialDate = useMemo(
    () => (selectedDate ? dateFn(selectedDate) : undefined),
    [selectedDate],
  );

  return (
    <CalendarProvider initialDate={initialDate} initialView={props.view}>
      <div ref={containerRef} className={styles.calendarContainer}>
        <CalendarContent {...allProps} width={width} height={height} />
      </div>
    </CalendarProvider>
  );
}

export default memo(Calendar);
