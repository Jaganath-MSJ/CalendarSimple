/**
 * @file useScheduleView.ts
 * @description Hook to manage and format data for the 'Schedule' (agenda) layout view.
 *
 * This hook handles:
 * 1. Sorting events broadly by start date.
 * 2. Grouping events into discrete days (replicating events that span multiple days).
 * 3. Formatting specific time displays and titles accommodating multi-day spans.
 * 4. Handling auto-scrolling to the current day indicator.
 */

import { useMemo, useEffect, useRef } from "react";
import { CalendarEvent, CalendarMessages } from "../types";
import type { DateType } from "../utils";
import {
  formatDate,
  dateFn,
  getDiffDays,
  getStartOfDay,
  isAllDayEvent,
  getLastEventDay,
} from "../utils";
import { DATE_FORMATS, resolveMessages } from "../constants";

/**
 * Properties for configuring the schedule view hook.
 */
interface UseScheduleViewProps {
  events: CalendarEvent[];
  /** Date the list scrolls to; defaults to today. */
  selectedDate?: DateType;
  /** Changes on every Today / SET_DATE navigation, even to the same date. */
  navigationId?: number;
  autoScrollToCurrentTime?: boolean;
  is12Hour?: boolean;
  locale?: string;
  /** Resolved UI strings; defaults to the English messages. */
  messages?: CalendarMessages;
}

/**
 * Hook to process calendar events into grouped daily lists for the Schedule agenda.
 *
 * @param props - Configuration properties { events, autoScrollToCurrentTime, is12Hour }
 * @returns Object with a ref to attach to "today", the grouped event map, and formatters.
 */
export default function useScheduleView({
  events,
  selectedDate,
  navigationId,
  autoScrollToCurrentTime,
  is12Hour,
  locale,
  messages = resolveMessages(),
}: UseScheduleViewProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const groupedEvents = useMemo(() => {
    // -------------------------------------------------------------------------
    // 1. Initial Sorting
    // -------------------------------------------------------------------------
    // Sort events by start date
    const sorted = [...events].sort(
      (a, b) => dateFn(a.startDate).valueOf() - dateFn(b.startDate).valueOf(),
    );

    const groups: Record<string, CalendarEvent[]> = {};

    // -------------------------------------------------------------------------
    // 2. Multi-day span resolution and Grouping
    // -------------------------------------------------------------------------
    sorted.forEach((event) => {
      // Group by every date the event spans
      let current = dateFn(event.startDate).startOf("day");
      const end = getLastEventDay(event);

      while (current < end || current.equals(end)) {
        const dateKey = formatDate(current, DATE_FORMATS.DATE);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(event);
        current = current.plus({ days: 1 });
      }
    });

    return groups;
  }, [events]);

  const selectedKey = (selectedDate ?? dateFn()).toISODate();

  // First group on or after the selected date, else the last group
  const targetDateKey = useMemo(() => {
    const keys = Object.keys(groupedEvents).sort();
    if (keys.length === 0) return undefined;
    return keys.find((key) => selectedKey && key >= selectedKey) ?? keys.at(-1);
  }, [groupedEvents, selectedKey]);

  const scrollToTarget = () => {
    if (targetRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elementRect = targetRef.current.getBoundingClientRect();
      containerRef.current.scrollTop += elementRect.top - containerRect.top;
    }
  };

  // On mount (and when events change) scroll only if autoScrollToCurrentTime
  useEffect(() => {
    if (autoScrollToCurrentTime) scrollToTarget();
  }, [autoScrollToCurrentTime, groupedEvents]);

  // Every later navigation (even to the same date) scrolls; first run skipped
  const lastNavigationId = useRef(navigationId);
  useEffect(() => {
    if (lastNavigationId.current === navigationId) return;
    lastNavigationId.current = navigationId;
    scrollToTarget();
  }, [navigationId]);

  // ---------------------------------------------------------------------------
  // 3. Presentation formatting helpers
  // ---------------------------------------------------------------------------

  /**
   * Formats the time range string for an event on a specific day.
   * Modifies display smartly if it's a multi-day event continuing from a prior day
   * or ending on a subsequent day (e.g. "All day", "Until 10PM").
   */
  const renderEventTime = (event: CalendarEvent, dateKey: string) => {
    if (isAllDayEvent(event)) {
      return messages.allDay;
    }

    const currentDay = dateFn(dateKey).startOf("day");
    const startDay = dateFn(event.startDate).startOf("day");
    const endDay = getLastEventDay(event);
    const isMultiDay = !startDay.equals(endDay);

    const timeFormat = is12Hour ? DATE_FORMATS.TIME_12H : DATE_FORMATS.TIME;
    const formatTime = (t: string) =>
      t.replace(/^0/, "").replace(":00", " ").replace(/\s+/g, " ").trim();

    const isMidnight = (d: string) =>
      dateFn(d).hour === 0 && dateFn(d).minute === 0;
    const isEndOfDay = (d: string) =>
      dateFn(d).hour === 23 && dateFn(d).minute === 59;

    if (isMultiDay) {
      if (currentDay.equals(startDay)) {
        return isMidnight(event.startDate)
          ? messages.allDay
          : `${formatTime(formatDate(event.startDate, timeFormat, locale))}`;
      } else if (currentDay.equals(endDay)) {
        // A 00:00 end means the event runs to the end of its last day
        return isEndOfDay(event.endDate!) || isMidnight(event.endDate!)
          ? messages.allDay
          : `${messages.until} ${formatTime(formatDate(event.endDate!, timeFormat, locale))}`;
      } else {
        return messages.allDay;
      }
    }

    // Normal single day time range
    const startStr = formatDate(event.startDate, timeFormat, locale);
    if (event.endDate) {
      const endsAtNextMidnight =
        isMidnight(event.endDate) &&
        dateFn(event.endDate) > dateFn(event.startDate);
      if (
        isMidnight(event.startDate) &&
        (isEndOfDay(event.endDate) || endsAtNextMidnight)
      ) {
        return messages.allDay;
      }
      const endStr = formatDate(event.endDate, timeFormat, locale);
      return `${formatTime(startStr)} – ${formatTime(endStr)}`;
    }
    return formatTime(startStr);
  };

  /**
   * Formats the title of an event. Appends descriptive text if the event
   * spans multiple days (e.g., "Event Name (Day 2/3)").
   */
  const renderEventTitle = (event: CalendarEvent, dateKey: string) => {
    const startDay = getStartOfDay(event.startDate);
    const lastDay = getLastEventDay(event);
    if (!startDay.equals(lastDay)) {
      const currentDay = getStartOfDay(dateKey);
      const dayIndex = getDiffDays(currentDay, startDay) + 1;
      // Compare day starts so partial days count as whole calendar days
      const totalDays = getDiffDays(lastDay, startDay) + 1;
      return `${event.title} ${messages.dayOfTotal(dayIndex, totalDays)}`;
    }
    return event.title;
  };

  return {
    targetRef,
    todayRef: targetRef,
    targetDateKey,
    containerRef,
    groupedEvents,
    renderEventTime,
    renderEventTitle,
  };
}
