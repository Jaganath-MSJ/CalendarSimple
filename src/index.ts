import Calendar from "./Calendar";
import "./styles/variables.css";

export { EDayType, ECalendarViewType } from "./types";
export type {
  CalendarProps,
  CalendarEvent,
  CalendarContentProps,
  ColorScheme,
  CalendarTheme,
  ThemeScheme,
} from "./types";
export type { HeaderProps } from "./components/layout/Header";
export type { ViewProps } from "./components/views/View";
export type { MonthViewProps } from "./components/views/month_view/MonthView";
export type { WeekViewProps } from "./components/views/week_view/WeekView";
export type { DayViewProps } from "./components/views/day_view/DayView";
export type { ScheduleViewProps } from "./components/views/schedule_view/ScheduleView";
export type { CustomViewProps } from "./components/views/custom_days_view/CustomDaysView";

export { CalendarProvider, useCalendar } from "./context/CalendarContext";
export { CALENDAR_ACTIONS } from "./constants";

export default Calendar;
