import { Moment } from "moment";

export type DateType = Moment;

export interface CalenderType {
  dayType?: EDayType;
  data?: React.ReactNode[];
  width?: number;
  height?: number;
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
  fututeYearLength?: number;
}

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

export enum EDayType {
  fullName = "fullName",
  halfName = "halfName",
}

export interface SelectedDataType {
  date: number;
  month: number;
  year: number;
}

export enum EMonthOption {
  add = "add",
  sub = "sub",
}

export enum EYearOption {
  month = "month",
  year = "year",
}
