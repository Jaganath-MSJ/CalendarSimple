import { Dayjs } from "dayjs";

export type DateType = Dayjs;

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
  startDate: string;
  endDate?: string;
  value: string;
}

export interface CalendarType {
  dayType?: EDayType;
  data?: DataType[];
  width?: number;
  height?: number;
  selectedDate?: Date;
  onDateClick?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
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
}

export enum EDayType {
  fullName = "FULL",
  halfName = "HALF",
}

export const defaultCalenderProps = {
  dayType: EDayType.halfName,
  data: [],
  width: 400,
  height: 400,
  isSelectDate: false,
  pastYearLength: 5,
  futureYearLength: 5,
  maxEvents: 3,
};

export interface DataTypeList extends DataType {
  startDateWeek?: string;
  endDateWeek?: string;
  isSpacer?: boolean;
}

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
  onMoreClick?: (date: DateType) => void;
  selectedClassName?: string;
  todayClassName?: string;
  theme?: CalendarTheme;
  maxEvents?: number;
  totalEvents?: number;
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
