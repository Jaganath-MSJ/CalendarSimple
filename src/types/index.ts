import { DateType } from "../utils";

export interface ThemeStyle {
  color?: string;
  bgColor?: string;
}

export interface CalendarTheme {
  default?: ThemeStyle;
  selected?: ThemeStyle;
  today?: ThemeStyle;
}

export interface DataType {
  id?: string;
  startDate: string;
  endDate?: string;
  value: string;
  color?: string;
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
  fullName: "FULL",
  halfName: "HALF",
} as const;

export type EDayType = (typeof EDayType)[keyof typeof EDayType];

export interface CalendarType {
  view?: ECalendarViewType;
  dayType?: EDayType;
  events?: DataType[];
  width?: number;
  height?: number;
  selectedDate?: Date;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: DataType) => void;
  onMoreClick?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  onViewChange?: (view: ECalendarViewType) => void;
  isSelectDate?: boolean;
  className?: string;
  headerClassName?: string;
  tableClassName?: string;
  tableDateClassName?: string;
  dataClassName?: string;
  selectedClassName?: string;
  todayClassName?: string;
  pastYearLength?: number;
  futureYearLength?: number;
  theme?: CalendarTheme;
  maxEvents?: number;
  is12Hour?: boolean;
}

export interface CalendarContentType extends CalendarType {
  dayType: EDayType;
  events: DataType[];
  width: number;
  height: number;
  isSelectDate: boolean;
  pastYearLength: number;
  futureYearLength: number;
  is12Hour?: boolean;
}

export type DataTypeList =
  | (DataType & {
      startDateWeek: string;
      endDateWeek?: string;
      isSpacer?: false;
    })
  | (DataType & { isSpacer: true });

export interface DateDataType {
  date: number;
  dateObj: DateType;
  data: (DataTypeList | null)[];
  cellWidth: number;
  className?: string;
  dataClassName?: string;
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  onClick?: (date: DateType) => void;
  onEventClick?: (event: DataType) => void;
  onMoreClick?: (date: DateType) => void;
  selectedClassName?: string;
  todayClassName?: string;
  theme?: CalendarTheme;
  maxEvents: number;
  totalEvents?: number;
  is12Hour?: boolean;
}

export interface MonthListType {
  label: string;
  value: number;
}

export enum EMonthOption {
  add = "add",
  sub = "sub",
}

export enum EYearOption {
  month = "month",
  year = "year",
}
