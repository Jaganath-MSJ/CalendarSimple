import React, { useMemo, memo, useEffect, CSSProperties, useRef } from "react";
import cx from "classnames";
import {
  CalendarProps,
  CalendarContentProps,
  ECalendarViewType,
} from "./types";
import {
  defaultCalendarProps,
  LAYOUT_CONSTANTS,
  CALENDAR_ACTIONS,
} from "./constants";
import { dateFn, resolveDirection } from "./utils";
import useResizeObserver from "./hooks/useResizeObserver";
import useEvents from "./hooks/useEvents";
import useColorScheme from "./hooks/useColorScheme";
import styles from "./Calendar.module.css";
import Header from "./components/layout/Header";
import DayView from "./components/views/day_view/DayView";
import WeekView from "./components/views/week_view/WeekView";
import MonthView from "./components/views/month_view/MonthView";
import ScheduleView from "./components/views/schedule_view/ScheduleView";
import CustomDaysView from "./components/views/custom_days_view/CustomDaysView";
import { CalendarProvider, useCalendar } from "./context/CalendarContext";
import View from "./components/views/View";
import useCalendarProps from "./hooks/useCalendarProps";
import CalendarErrorBoundary from "./components/ui/CalendarErrorBoundary";

function CalendarContent(props: CalendarContentProps) {
  const {
    testId,
    classNames,
    renderHeader,
    width,
    height,
    onNavigate,
    onViewChange,
    direction,
    locale,
    colorScheme,
  } = useCalendarProps(props);

  const dir = resolveDirection(direction, locale);
  const resolvedScheme = useColorScheme(colorScheme);

  const {
    state: { view, selectedDate },
    dispatch,
  } = useCalendar();

  // Sync view from props to context
  useEffect(() => {
    if (props.view) {
      dispatch({ type: "SET_VIEW", payload: props.view });
    }
  }, [props.view, dispatch]);

  // Sync external date prop to context if it changes
  useEffect(() => {
    if (props.selectedDate) {
      dispatch({ type: "SET_DATE", payload: dateFn(props.selectedDate) });
    }
  }, [props.selectedDate, dispatch]);

  // Sync customDays from props to context
  useEffect(() => {
    if (props.customDays) {
      dispatch({ type: "SET_CUSTOM_DAYS", payload: props.customDays });
    }
  }, [props.customDays, dispatch]);

  return (
    <section
      data-testid={`${testId}-container`}
      dir={dir}
      data-color-scheme={resolvedScheme}
      style={
        {
          "--calendar-width": `${width}px`,
          "--calendar-height": `${height}px`,
        } as CSSProperties
      }
      className={cx(styles.calendar, classNames?.root)}
    >
      {renderHeader ? (
        renderHeader({
          currentDate: selectedDate.toJSDate(),
          view,
          onNavigate: (date: Date) => {
            dispatch({
              type: CALENDAR_ACTIONS.SET_DATE,
              payload: dateFn(date),
            });
            if (onNavigate) onNavigate(date);
          },
          onViewChange: (newView: ECalendarViewType) => {
            dispatch({ type: CALENDAR_ACTIONS.SET_VIEW, payload: newView });
            if (onViewChange) onViewChange(newView);
          },
        })
      ) : (
        <Header />
      )}
      <View />
    </section>
  );
}

function Calendar(props: CalendarProps = defaultCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const allProps: CalendarProps = { ...defaultCalendarProps, ...props };
  const { width: observedWidth, height: observedHeight } = useResizeObserver(
    containerRef,
    !!allProps.width && !!allProps.height,
  );

  // Use props if provided, otherwise use observed size
  const width = allProps.width ?? observedWidth ?? 0;
  const mainHeight = allProps.height ?? observedHeight ?? 0;
  const height =
    (typeof mainHeight === "number" ? mainHeight : 0) -
    LAYOUT_CONSTANTS.HEADER_HEIGHT;

  const initialDate = useMemo(
    () => dateFn(props.selectedDate),
    [props.selectedDate],
  );

  // Filter out events where the end date is before the start date
  const validEvents = useEvents(
    allProps.events || [],
    allProps.eventsAreSorted,
    allProps.enableEnrichedEvents,
  );

  const dir = resolveDirection(allProps.direction, allProps.locale);
  const resolvedScheme = useColorScheme(allProps.colorScheme);

  return (
    <CalendarProvider
      initialDate={initialDate}
      initialView={allProps.view || ECalendarViewType.month}
      initialCustomDays={allProps.customDays}
      testId={allProps.testId}
      config={{ ...allProps, width, height, events: validEvents }}
    >
      <div
        ref={containerRef}
        data-testid={
          allProps.children ? `${allProps.testId}-container` : undefined
        }
        dir={dir}
        data-color-scheme={resolvedScheme}
        style={{
          width: allProps.width ?? "100%",
          height: allProps.height ?? "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          ...(allProps.children
            ? ({
                "--calendar-width": `${width}px`,
                "--calendar-height": `${height}px`,
              } as CSSProperties)
            : undefined),
        }}
        className={cx(
          allProps.children ? styles.calendar : undefined,
          allProps.children ? allProps.classNames?.root : undefined,
        )}
      >
        <CalendarErrorBoundary>
          {allProps.children ? (
            allProps.children
          ) : (
            <CalendarContent
              {...(allProps as unknown as CalendarContentProps)}
              width={width}
              height={height}
              events={validEvents}
            />
          )}
        </CalendarErrorBoundary>
      </div>
    </CalendarProvider>
  );
}

const MemoizedCalendar = memo(
  Calendar,
) as unknown as React.NamedExoticComponent<CalendarProps> & {
  Header: typeof Header;
  View: typeof View;
  DayView: typeof DayView;
  WeekView: typeof WeekView;
  MonthView: typeof MonthView;
  ScheduleView: typeof ScheduleView;
  CustomDaysView: typeof CustomDaysView;
};

MemoizedCalendar.Header = Header;
MemoizedCalendar.View = View;
MemoizedCalendar.DayView = DayView;
MemoizedCalendar.WeekView = WeekView;
MemoizedCalendar.MonthView = MonthView;
MemoizedCalendar.ScheduleView = ScheduleView;
MemoizedCalendar.CustomDaysView = CustomDaysView;

export default MemoizedCalendar;
