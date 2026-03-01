import React, { useMemo, memo, useEffect, CSSProperties, useRef } from "react";
import cx from "classnames";
import {
  CalendarProps,
  CalendarContentProps,
  ECalendarViewType,
} from "./types";
import { defaultCalenderProps, CALENDAR_CONSTANTS } from "./constants";
import { dateFn, useResizeObserver } from "./utils";
import styles from "./Calendar.module.css";
import Header from "./layout/Header";
import DayView from "./views/day/DayView";
import WeekView from "./views/week/WeekView";
import MonthView from "./views/month/MonthView";
import ScheduleView from "./views/schedule/ScheduleView";
import { CalendarProvider, useCalendar } from "./context/CalendarContext";

function CalendarContent({
  events,
  is12Hour,
  dayType,
  pastYearLength,
  futureYearLength,
  width,
  height,
  onEventClick,
  onNavigate,
  onViewChange,
  theme,
  classNames,
  showCurrentTime,
  maxEvents,
  autoScrollToCurrentTime,
  ...restProps
}: CalendarContentProps) {
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
    const commonProps = {
      events,
      is12Hour,
      dayType,
      onEventClick,
      theme,
      classNames,
      showCurrentTime,
      maxEvents,
      autoScrollToCurrentTime,
    };
    switch (view) {
      case ECalendarViewType.day:
        return <DayView {...commonProps} />;
      case ECalendarViewType.week:
        return <WeekView {...commonProps} />;
      case ECalendarViewType.month:
        return (
          <MonthView
            {...commonProps}
            {...restProps}
            width={width}
            height={height}
          />
        );
      case ECalendarViewType.schedule:
        return <ScheduleView {...commonProps} />;
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
        } as CSSProperties
      }
      className={cx(styles.calendar, classNames?.root)}
    >
      <Header
        headerClassName={classNames?.header}
        events={events}
        onNavigate={onNavigate}
        onViewChange={onViewChange}
        pastYearLength={pastYearLength}
        futureYearLength={futureYearLength}
      />
      {getViewComponent(view)}
    </section>
  );
}

function Calendar({
  selectedDate,
  ...props
}: CalendarProps = defaultCalenderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const allProps = { ...defaultCalenderProps, ...props };
  const { width: observedWidth, height: observedHeight } = useResizeObserver(
    containerRef,
    !!allProps.width && !!allProps.height,
  );

  // Use props if provided, otherwise use observed size
  const width = allProps.width ?? observedWidth ?? 0;
  const mainHeight = allProps.height ?? observedHeight ?? 0;
  const height =
    (typeof mainHeight === "number" ? mainHeight : 0) -
    CALENDAR_CONSTANTS.HEADER_HEIGHT;

  const initialDate = useMemo(() => dateFn(selectedDate), [selectedDate]);

  return (
    <CalendarProvider initialDate={initialDate} initialView={allProps.view}>
      <div
        ref={containerRef}
        style={{
          width: allProps.width ?? "100%",
          height: allProps.height ?? "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <CalendarContent {...allProps} width={width} height={height} />
      </div>
    </CalendarProvider>
  );
}

export default memo(Calendar);
