import React, { useRef, useState, useEffect } from "react";
import cx from "classnames";
import { ECalendarViewType, CalendarContentProps } from "../../types";
import { useCalendar } from "../../context/CalendarContext";
import useCalendarProps from "../../hooks/useCalendarProps";
import DayView from "./day_view/DayView";
import WeekView from "./week_view/WeekView";
import MonthView from "./month_view/MonthView";
import ScheduleView from "./schedule_view/ScheduleView";
import CustomDaysView from "./custom_days_view/CustomDaysView";
import MonthSkeleton from "../ui/skeleton/MonthSkeleton";
import TimeGridSkeleton from "../ui/skeleton/TimeGridSkeleton";
import ScheduleSkeleton from "../ui/skeleton/ScheduleSkeleton";
import styles from "./View.module.css";
import useMessages from "../../hooks/useMessages";
import {
  usePeriodKeys,
  useSwipeNavigation,
} from "../../hooks/usePeriodNavigation";
import { clampCustomDays } from "../../utils/customDays";

export type ViewProps = Partial<
  Omit<
    CalendarContentProps,
    | "events"
    | "locale"
    | "pastYearLength"
    | "futureYearLength"
    | "onNavigate"
    | "onViewChange"
    | "resetDateOnViewChange"
    | "localeMessages"
  >
>;

export default function View(props: ViewProps) {
  const { isLoading, events, renderLoading } = useCalendarProps({});
  const messages = useMessages();
  const onPeriodKey = usePeriodKeys();
  const swipe = useSwipeNavigation();
  const {
    state: { view, customDays },
    hourHeight,
  } = useCalendar();

  // Track loading→loaded transition to trigger fadeIn animation
  const prevIsLoadingRef = useRef(isLoading);
  const [showFadeIn, setShowFadeIn] = useState(false);

  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading) {
      setShowFadeIn(true);
      const t = setTimeout(() => setShowFadeIn(false), 150);
      prevIsLoadingRef.current = false;
      return () => clearTimeout(t);
    }
    prevIsLoadingRef.current = isLoading;
  }, [isLoading]);

  const isEmpty = !events || events.length === 0;
  const showLoadingUi = isLoading && isEmpty;

  // Show skeleton (or custom loading UI) when loading with no events
  if (showLoadingUi) {
    const timeGrid =
      view === ECalendarViewType.day ||
      view === ECalendarViewType.week ||
      view === ECalendarViewType.customDays;
    const skeleton = renderLoading ? (
      renderLoading()
    ) : view === ECalendarViewType.schedule ? (
      <ScheduleSkeleton />
    ) : timeGrid ? (
      <TimeGridSkeleton />
    ) : (
      <MonthSkeleton />
    );
    return (
      <div
        className={styles.viewBody}
        role="status"
        aria-busy="true"
        aria-label={messages.loading}
      >
        {skeleton}
      </div>
    );
  }

  const renderActiveView = () => {
    switch (view) {
      case ECalendarViewType.day:
        return <DayView {...props} />;
      case ECalendarViewType.week:
        return <WeekView {...props} />;
      case ECalendarViewType.month:
        return <MonthView {...props} />;
      case ECalendarViewType.schedule:
        return <ScheduleView {...props} />;
      case ECalendarViewType.customDays:
        return (
          <CustomDaysView {...props} customDays={clampCustomDays(customDays)} />
        );
      default:
        return null;
    }
  };

  // When loading but events exist — show them but block interactions
  if (isLoading) {
    return (
      <div
        className={styles.loadingOverlay}
        data-testid="calendar-loading-overlay"
        aria-busy="true"
      >
        {renderActiveView()}
      </div>
    );
  }

  // Normal render with optional fade-in after loading completes
  const activeView = renderActiveView();
  if (!activeView) return null;
  return (
    <div
      className={cx(styles.views, { [styles.fadeIn]: showFadeIn })}
      data-calendar-views=""
      style={
        {
          "--cal-hour-height": `${hourHeight}px`,
          // Swipes turn the period; keep vertical scrolling to the browser.
          ...(swipe && { touchAction: "pan-y" }),
        } as React.CSSProperties
      }
      {...swipe}
      tabIndex={onPeriodKey ? -1 : undefined}
      onKeyDown={onPeriodKey}
    >
      {activeView}
    </div>
  );
}
