import { Dayjs } from "dayjs";

export type DateType = Dayjs;

export interface CalendarType {
  dayType?: EDayType;
  data?: React.ReactNode[];
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
};

export interface DateDataType {
  date: number;
  data: React.ReactNode;
  className?: string;
  dataClassName?: string;
  isSelected: boolean;
  isToday: boolean;
  onClick?: (date: number) => void;
  selectedClassName?: string;
  todayClassName?: string;
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
