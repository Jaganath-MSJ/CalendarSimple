import { ReactNode } from "react";
import { CalendarEvent } from "./events";
import { CalendarTheme, CalendarClassNames } from "./theme";

export type RequiredSome<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

export const ECalendarViewType = {
  month: "month",
  week: "week",
  day: "day",
  schedule: "schedule",
  customDays: "customDays",
} as const;

export type ECalendarViewType =
  (typeof ECalendarViewType)[keyof typeof ECalendarViewType];

export const EDayType = {
  full: "full",
  half: "half",
} as const;

export type EDayType = (typeof EDayType)[keyof typeof EDayType];

export interface RenderHeaderProps {
  currentDate: Date;
  view: ECalendarViewType;
  onNavigate: (date: Date) => void;
  onViewChange: (view: ECalendarViewType) => void;
}

export interface RenderDateCellProps {
  date: Date;
  isToday: boolean;
  isSelected?: boolean;
  isCurrentMonth?: boolean;
}

export interface CalendarProps {
  // --- Data & State ---
  events?: CalendarEvent[];
  selectedDate?: Date;
  view?: ECalendarViewType;
  testId?: string;

  // --- Configuration ---
  is12Hour?: boolean;
  selectable?: boolean;
  maxEvents?: number;
  dayType?: EDayType;
  pastYearLength?: number;
  futureYearLength?: number;
  showCurrentTime?: boolean;
  autoScrollToCurrentTime?: boolean;
  minHour?: number;
  maxHour?: number;
  weekStartsOn?: number; // 0 (Sunday) to 6 (Saturday)
  weekEndsOn?: number; // 0 to 6
  showAdjacentMonths?: boolean;
  customDays?: number;
  resetDateOnViewChange?: boolean;
  showAllDayRow?: boolean;
  renderScheduleSeparator?: (date: Date) => ReactNode;
  eventOverlapOffset?: number;

  // --- Layout ---
  width?: number | string;
  height?: number | string;

  // --- Event Callbacks ---
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onMoreClick?: (date: Date, hiddenEvents?: CalendarEvent[]) => void;
  onNavigate?: (date: Date) => void;
  onViewChange?: (view: ECalendarViewType) => void;

  // --- Appearance ---
  theme?: CalendarTheme;
  classNames?: CalendarClassNames;

  // --- Custom Renderers ---
  renderEvent?: (event: CalendarEvent) => ReactNode;
  renderHeader?: (props: RenderHeaderProps) => ReactNode;
  renderHourCell?: (date: Date) => ReactNode;
  renderDateCell?: (props: RenderDateCellProps) => ReactNode;

  // --- Performance Options ---
  enrichedEventsByDate?: Record<string, CalendarEvent[]>;
  enableEnrichedEvents?: boolean;
  eventsAreSorted?: boolean;
  isEventOrderingEnabled?: boolean;
  sortedMonthView?: boolean | ((a: CalendarEvent, b: CalendarEvent) => number);

  // --- Localization ---
  /** the luxon locale code (e.g., 'en', 'fr', 'es-mx'). */
  locale?: string;

  /** Translations for built-in calendar text elements */
  localeMessages?: {
    today?: string;
    day?: string;
    week?: string;
    month?: string;
    schedule?: string;
    days?: string; // used in custom days dropdown like '3 Days'
  };
}

export interface CalendarContentProps extends RequiredSome<
  CalendarProps,
  | "events"
  | "view"
  | "is12Hour"
  | "selectable"
  | "dayType"
  | "pastYearLength"
  | "futureYearLength"
  | "showCurrentTime"
  | "autoScrollToCurrentTime"
  | "minHour"
  | "maxHour"
  | "weekStartsOn"
  | "weekEndsOn"
  | "showAdjacentMonths"
  | "resetDateOnViewChange"
  | "showAllDayRow"
  | "width"
  | "height"
  | "theme"
  | "classNames"
  | "eventOverlapOffset"
  | "enableEnrichedEvents"
  | "eventsAreSorted"
  | "isEventOrderingEnabled"
  | "sortedMonthView"
  | "locale"
  | "localeMessages"
> {}

export interface MonthListType {
  label: string;
  value: number;
}
