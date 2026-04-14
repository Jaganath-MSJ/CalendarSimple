import React from "react";
import { ECalendarViewType, CalendarContentProps } from "../../types";
import { useCalendar } from "../../context/CalendarContext";
import DayView from "./day_view/DayView";
import WeekView from "./week_view/WeekView";
import MonthView from "./month_view/MonthView";
import ScheduleView from "./schedule_view/ScheduleView";
import CustomDaysView from "./custom_days_view/CustomDaysView";

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
  const {
    state: { view, customDays },
  } = useCalendar();

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
}
