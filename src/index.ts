import Calendar from "./Calendar";
import "./styles/variables.css";
import { EDayType, ECalendarViewType } from "./types";

export { CalendarProvider, useCalendar } from "./context/CalendarContext";
export { default as useEvents } from "./hooks/useEvents";
export { CALENDAR_ACTIONS } from "./constants";

export { EDayType, ECalendarViewType };
export type {
  CalendarProps,
  CalendarEvent,
  CalendarContentProps,
} from "./types";
export type { HeaderProps } from "./components/layout/Header";
export type { MonthViewProps } from "./components/views/month_view/MonthView";
export type { WeekViewProps } from "./components/views/week_view/WeekView";
export type { DayViewProps } from "./components/views/day_view/DayView";
export type { ScheduleViewProps } from "./components/views/schedule_view/ScheduleView";
export type { CustomViewProps } from "./components/views/custom_days_view/CustomDaysView";

export default Calendar;
