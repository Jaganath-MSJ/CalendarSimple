/**
 * @file Core event type definitions for the calendar.
 */
import { CSSProperties } from "react";

/**
 * Represents a single calendar event.
 */
export interface CalendarEvent {
  /** Unique identifier for the event. Used for deduplication and React keying. */
  id?: string;
  /** ISO 8601 start date. Use `YYYY-MM-DD` for all-day events, `YYYY-MM-DDTHH:mm:ss` for timed events. */
  startDate: string;
  /** ISO 8601 end date. Omit for single-day events; set to a later date for multi-day spanning events. */
  endDate?: string;
  /** Display title shown on the event chip. */
  title: string;
  /** Inline styles applied directly to the event element. */
  style?: CSSProperties;
  /** Allows arbitrary custom fields to be attached and accessed in custom renderers. */
  [key: string]: unknown;
}

/**
 * Internal enriched event type used by layout algorithms.
 * Extends `CalendarEvent` with week-boundary clipping fields, or marks the slot as a spacer
 * to preserve grid positions when events overflow the visible row limit.
 */
export type EventListType =
  | (CalendarEvent & {
      startDateWeek: string;
      endDateWeek?: string;
      isSpacer?: false;
    })
  | (CalendarEvent & { isSpacer: true });
