type RequiredSome<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export interface CalendarEvent {
  id?: string;
  startDate: string;
  endDate?: string;
  title: string;
  color?: string;
  [key: string]: unknown;
}

interface CalendarClassNames {
  root?: string;
  header?: string;

  // Month view
  table?: string;
  tableHeader?: string;
  tableDate?: string;

  // Shared events
  event?: string;
  selected?: string;
  today?: string;

  // Week & Day view
  dayHeader?: string;
  dayName?: string;
  dayNumber?: string;
  timeColumn?: string;
  timeSlot?: string;
  dayColumn?: string;

  // Schedule view
  scheduleDateGroup?: string;
  scheduleDateNumber?: string;
  scheduleDateSubInfo?: string;
  scheduleTime?: string;
  scheduleTitle?: string;
}

interface ThemeStyle {
  color?: string;
  bgColor?: string;
}

interface CalendarTheme {
  default?: ThemeStyle;
  selected?: ThemeStyle;
  today?: ThemeStyle;
}

export const ECalendarViewType = {
  month: "month",
  week: "week",
  day: "day",
  schedule: "schedule",
} as const;

export type ECalendarViewType =
  (typeof ECalendarViewType)[keyof typeof ECalendarViewType];

export const EDayType = {
  full: "full",
  half: "half",
} as const;

export type EDayType = (typeof EDayType)[keyof typeof EDayType];

export interface CalendarProps {
  // --- Data & State ---
  events?: CalendarEvent[];
  selectedDate?: Date;
  view?: ECalendarViewType;

  // --- Configuration ---
  is12Hour?: boolean;
  selectable?: boolean;
  maxEvents?: number;
  dayType?: EDayType;
  pastYearLength?: number;
  futureYearLength?: number;
  showCurrentTime?: boolean;

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
}

export interface CalendarContentProps extends RequiredSome<
  Omit<CalendarProps, "selectedDate">,
  | "events"
  | "view"
  | "is12Hour"
  | "selectable"
  | "dayType"
  | "pastYearLength"
  | "futureYearLength"
  | "width"
  | "height"
  | "theme"
  | "classNames"
> {}

export type EventListType =
  | (CalendarEvent & {
      startDateWeek: string;
      endDateWeek?: string;
      isSpacer?: false;
    })
  | (CalendarEvent & { isSpacer: true });

export interface MonthListType {
  label: string;
  value: number;
}
