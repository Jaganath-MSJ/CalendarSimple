import React, { useMemo, memo, useEffect } from "react";
import cx from "classnames";
import { CalendarType, CalendarContentType } from "./types";
import { defaultCalenderProps, CALENDAR_CONSTANTS } from "./constants";
import { dateFn, useResizeObserver } from "./utils";
import styles from "./Calendar.module.css";
import Header from "./layout/Header";
import DayView from "./views/day/DayView";
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
  ...restProps
}: CalendarContentType) {
  const { state, dispatch } = useCalendar();
  const { currentDate: selectedDate, events: data, view } = state;

  // Sync data from props to context
  useEffect(() => {
    if (restProps.events) {
      dispatch({ type: "SET_EVENTS", payload: restProps.events });
    }
  }, [restProps.events]);

  // Sync view from props to context
  useEffect(() => {
    if (restProps.view) {
      dispatch({ type: "SET_VIEW", payload: restProps.view });
    }
  }, [restProps.view]);

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
        pastYearLength={restProps.pastYearLength}
        futureYearLength={restProps.futureYearLength}
      />
      {view === "day" ? (
        <DayView
          currentDate={selectedDate}
          events={data}
          onEventClick={onEventClick}
        />
      ) : (
        <MonthView
          {...restProps}
          currentDate={selectedDate}
          events={data}
          dayType={dayType}
          width={width}
          height={height}
          onEventClick={onEventClick}
          onDateClick={onDateClick}
          onMoreClick={onMoreClick}
          isSelectDate={isSelectDate}
        />
      )}
    </section>
  );
}

function Calendar(props: CalendarType = defaultCalenderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { width: observedWidth, height: observedHeight } =
    useResizeObserver(containerRef);

  const allProps = { ...defaultCalenderProps, ...props };
  const { events, selectedDate } = allProps;

  // Use props if provided, otherwise use observed size
  const width = props.width ?? observedWidth ?? 0;
  const mainHeight = props.height ?? observedHeight ?? 0;
  const height = mainHeight - CALENDAR_CONSTANTS.HEADER_HEIGHT;

  const initialDate = useMemo(
    () => (selectedDate ? dateFn(selectedDate) : undefined),
    [selectedDate],
  );

  return (
    <CalendarProvider
      initialEvents={events}
      initialDate={initialDate}
      initialView={props.view}
    >
      <div ref={containerRef} className={styles.calendarContainer}>
        <CalendarContent {...allProps} width={width} height={height} />
      </div>
    </CalendarProvider>
  );
}

export default memo(Calendar);
