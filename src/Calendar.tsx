import React, { useMemo, memo, useEffect, CSSProperties, useRef } from "react";
import cx from "classnames";
import {
  CalendarEvent,
  CalendarProps,
  CalendarContentProps,
  ECalendarViewType,
} from "./types";
import {
  defaultCalendarProps,
  LAYOUT_CONSTANTS,
  CALENDAR_ACTIONS,
} from "./constants";
import { dateFn, mergeDefined, resolveDirection, toCssLength } from "./utils";
import useResizeObserver from "./hooks/useResizeObserver";
import useEvents from "./hooks/useEvents";
import useColorScheme from "./hooks/useColorScheme";
import useShallowStable from "./hooks/useShallowStable";
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

// Syncs controlled props into context. Rendered in both plain and compound
// mode. Dispatches only when a prop differs from the last synced value (the
// reducer is already initialised from props, and StrictMode re-runs effects) and
// compares the date by value so an equal new Date does not reset navigation.
function PropSync({
  view,
  selectedDate,
  customDays,
}: Pick<CalendarProps, "view" | "selectedDate" | "customDays">) {
  const { dispatch } = useCalendar();
  const time = selectedDate ? dateFn(selectedDate).toMillis() : undefined;
  const lastView = useRef(view);
  const lastTime = useRef(time);
  const lastCustomDays = useRef(customDays);

  useEffect(() => {
    if (view && view !== lastView.current) {
      dispatch({ type: "SET_VIEW", payload: view });
    }
    lastView.current = view;
  }, [view, dispatch]);

  useEffect(() => {
    if (selectedDate && time !== lastTime.current) {
      dispatch({ type: "SET_DATE", payload: dateFn(selectedDate) });
    }
    lastTime.current = time;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, dispatch]);

  useEffect(() => {
    if (customDays && customDays !== lastCustomDays.current) {
      dispatch({ type: "SET_CUSTOM_DAYS", payload: customDays });
    }
    lastCustomDays.current = customDays;
  }, [customDays, dispatch]);

  return null;
}

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

  return (
    <section
      data-testid={`${testId}-container`}
      dir={dir}
      data-color-scheme={resolvedScheme}
      style={
        {
          "--calendar-width": toCssLength(width),
          "--calendar-height": toCssLength(height),
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

  const allProps = mergeDefined<CalendarProps>(defaultCalendarProps, props);
  const { width: observedWidth, height: observedHeight } = useResizeObserver(
    containerRef,
    typeof allProps.width === "number" && typeof allProps.height === "number",
  );

  // Use props if provided, otherwise use observed size. Either may be a number
  // (px) or any CSS string per the documented contract; string heights subtract
  // the header via calc() so the content area stays a valid CSS length.
  const width = allProps.width ?? observedWidth ?? 0;
  const rawHeight = allProps.height ?? observedHeight ?? 0;
  const height =
    typeof rawHeight === "number"
      ? rawHeight - LAYOUT_CONSTANTS.HEADER_HEIGHT
      : `calc(${rawHeight} - ${LAYOUT_CONSTANTS.HEADER_HEIGHT}px)`;

  const bodySize = useMemo(() => {
    const w =
      typeof allProps.width === "number" ? allProps.width : observedWidth;
    const h =
      typeof allProps.height === "number" ? allProps.height : observedHeight;
    return {
      width: w,
      height: Math.max(0, h - LAYOUT_CONSTANTS.HEADER_HEIGHT),
    };
  }, [allProps.width, allProps.height, observedWidth, observedHeight]);

  const initialDate = useMemo(
    () => dateFn(props.selectedDate),
    [props.selectedDate],
  );

  // Filter out events where the end date is before the start date
  const validEvents = useEvents(
    allProps.events || [],
    allProps.eventsAreSorted,
    allProps.enableEnrichedEvents,
    allProps.enrichedEventsByDate,
  );

  const dir = resolveDirection(allProps.direction, allProps.locale);
  const resolvedScheme = useColorScheme(allProps.colorScheme);
  const configProps = { ...allProps };
  delete configProps.children;
  // With "locale", the week ends the day before it starts unless the caller
  // passed weekEndsOn, so drop the injected default and let the provider resolve.
  const deriveWeekEnd =
    props.weekStartsOn === "locale" && props.weekEndsOn === undefined;
  if (deriveWeekEnd) delete configProps.weekEndsOn;
  // Raw "locale" values must not reach CalendarContent: they would override
  // the resolved ones from context in useCalendarProps.
  const contentProps = { ...allProps };
  delete contentProps.weekStartsOn;
  delete contentProps.is12Hour;
  if (deriveWeekEnd) delete contentProps.weekEndsOn;
  const config = useShallowStable({
    ...configProps,
    width,
    height,
    events: validEvents,
  });

  return (
    <CalendarProvider
      initialDate={initialDate}
      initialView={allProps.view || ECalendarViewType.month}
      initialCustomDays={allProps.customDays}
      testId={allProps.testId}
      bodySize={bodySize}
      config={config}
    >
      <PropSync
        view={props.view}
        selectedDate={props.selectedDate}
        customDays={props.customDays}
      />
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
                "--calendar-width": toCssLength(width),
                "--calendar-height": toCssLength(height),
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
              {...(contentProps as unknown as CalendarContentProps)}
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

/**
 * `<Calendar>` component type. Generic over the event shape so
 * `<Calendar<MyEvent> …>` types `events` and the event callbacks; `memo`
 * drops generics, hence the explicit call signature.
 */
export type CalendarComponent = (<TEvent extends CalendarEvent = CalendarEvent>(
  props: CalendarProps<TEvent>,
) => React.ReactElement | null) & {
  displayName?: string;
  Header: typeof Header;
  View: typeof View;
  DayView: typeof DayView;
  WeekView: typeof WeekView;
  MonthView: typeof MonthView;
  ScheduleView: typeof ScheduleView;
  CustomDaysView: typeof CustomDaysView;
};

const MemoizedCalendar = memo(Calendar) as unknown as CalendarComponent;

MemoizedCalendar.Header = Header;
MemoizedCalendar.View = View;
MemoizedCalendar.DayView = DayView;
MemoizedCalendar.WeekView = WeekView;
MemoizedCalendar.MonthView = MonthView;
MemoizedCalendar.ScheduleView = ScheduleView;
MemoizedCalendar.CustomDaysView = CustomDaysView;

export default MemoizedCalendar;
