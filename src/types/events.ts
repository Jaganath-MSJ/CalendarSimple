import { CSSProperties } from "react";

export interface CalendarEvent {
  id?: string;
  startDate: string;
  endDate?: string;
  title: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

export type EventListType =
  | (CalendarEvent & {
      startDateWeek: string;
      endDateWeek?: string;
      isSpacer?: false;
    })
  | (CalendarEvent & { isSpacer: true });
