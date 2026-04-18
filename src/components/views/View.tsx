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
  const {
    state: { view, customDays },
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
    if (renderLoading) {
      return <div className={styles.viewBody}>{renderLoading()}</div>;
    }
    switch (view) {
      case ECalendarViewType.month:
        return <MonthSkeleton />;
      case ECalendarViewType.day:
      case ECalendarViewType.week:
      case ECalendarViewType.customDays:
        return <TimeGridSkeleton />;
      case ECalendarViewType.schedule:
        return <ScheduleSkeleton />;
      default:
        return <MonthSkeleton />;
    }
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
        if (!customDays || customDays < 1 || customDays > 10) return null;
        return <CustomDaysView {...props} customDays={customDays} />;
      default:
        return null;
    }
  };

  // When loading but events exist — show them but block interactions
  if (isLoading) {
    return <div className={styles.loadingOverlay}>{renderActiveView()}</div>;
  }

  // Normal render with optional fade-in after loading completes
  const activeView = renderActiveView();
  if (!activeView) return null;
  return (
    <div className={cx({ [styles.fadeIn]: showFadeIn })}>{activeView}</div>
  );
}
