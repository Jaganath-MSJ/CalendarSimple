import Calendar from "./Calendar";
import "./styles/variables.css";

export { EDayType, ECalendarViewType } from "./types";
export type {
  CalendarProps,
  CalendarConfig,
  CalendarMessages,
  CalendarEvent,
  CalendarContentProps,
  ColorScheme,
  CalendarTheme,
  ThemeScheme,
  CalendarPalette,
  CalendarPaletteOverrides,
  CalendarClassNames,
  RenderHeaderProps,
  RenderDateCellProps,
  CustomDaysCount,
  EventDropInfo,
  EventResizeInfo,
} from "./types";
export type { CalendarComponent } from "./Calendar";
export type { HeaderProps } from "./components/layout/Header";
export type { ViewProps } from "./components/views/View";
export type { MonthViewProps } from "./components/views/month_view/MonthView";
export type { WeekViewProps } from "./components/views/week_view/WeekView";
export type { DayViewProps } from "./components/views/day_view/DayView";
export type { ScheduleViewProps } from "./components/views/schedule_view/ScheduleView";
export type { CustomViewProps } from "./components/views/custom_days_view/CustomDaysView";

export { CalendarProvider, useCalendar } from "./context/CalendarContext";
export { CALENDAR_ACTIONS, DEFAULT_MESSAGES } from "./constants";

export default Calendar;
