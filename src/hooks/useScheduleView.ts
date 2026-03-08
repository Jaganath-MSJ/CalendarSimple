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
import { CalendarEvent } from "../types";
import {
  formatDate,
  dateFn,
  isSameDate,
  getDiffDays,
  isAllDayEvent,
} from "../utils";
import { DATE_FORMATS } from "../constants";

/**
 * Properties for configuring the schedule view hook.
 */
interface UseScheduleViewProps {
  events: CalendarEvent[];
  autoScrollToCurrentTime?: boolean;
  is12Hour?: boolean;
}

/**
 * Hook to process calendar events into grouped daily lists for the Schedule agenda.
 *
 * @param props - Configuration properties { events, autoScrollToCurrentTime, is12Hour }
 * @returns Object with a ref to attach to "today", the grouped event map, and formatters.
 */
export default function useScheduleView({
  events,
  autoScrollToCurrentTime,
  is12Hour,
}: UseScheduleViewProps) {
  const todayRef = useRef<HTMLDivElement>(null);

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
      const end = event.endDate
        ? dateFn(event.endDate).startOf("day")
        : current;

      while (current.isBefore(end) || current.isSame(end)) {
        const dateKey = formatDate(current, DATE_FORMATS.DATE);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(event);
        current = current.add(1, "day");
      }
    });

    return groups;
  }, [events]);

  useEffect(() => {
    if (autoScrollToCurrentTime && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [autoScrollToCurrentTime, groupedEvents]);

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
      return "All day";
    }

    const currentDay = dateFn(dateKey).startOf("day");
    const startDay = dateFn(event.startDate).startOf("day");
    const endDay = event.endDate
      ? dateFn(event.endDate).startOf("day")
      : startDay;
    const isMultiDay = !startDay.isSame(endDay);

    const timeFormat = is12Hour ? DATE_FORMATS.TIME_12H : DATE_FORMATS.TIME;
    const formatTime = (t: string) => t.replace(/^0/, "").replace(":00", " ");

    const isMidnight = (d: string) =>
      dateFn(d).hour() === 0 && dateFn(d).minute() === 0;
    const isEndOfDay = (d: string) =>
      dateFn(d).hour() === 23 && dateFn(d).minute() === 59;

    if (isMultiDay) {
      if (currentDay.isSame(startDay)) {
        return isMidnight(event.startDate)
          ? "All day"
          : `${formatTime(formatDate(event.startDate, timeFormat))}`;
      } else if (currentDay.isSame(endDay)) {
        return isEndOfDay(event.endDate!)
          ? "All day"
          : `Until ${formatTime(formatDate(event.endDate!, timeFormat))}`;
      } else {
        return "All day";
      }
    }

    // Normal single day time range
    const startStr = formatDate(event.startDate, timeFormat);
    if (event.endDate) {
      if (isMidnight(event.startDate) && isEndOfDay(event.endDate)) {
        return "All day";
      }
      const endStr = formatDate(event.endDate, timeFormat);
      return `${formatTime(startStr)} – ${formatTime(endStr)}`;
    }
    return formatTime(startStr);
  };

  /**
   * Formats the title of an event. Appends descriptive text if the event
   * spans multiple days (e.g., "Event Name (Day 2/3)").
   */
  const renderEventTitle = (event: CalendarEvent, dateKey: string) => {
    if (
      event.endDate &&
      !isSameDate(dateFn(event.startDate), dateFn(event.endDate))
    ) {
      const currentDay = dateFn(dateKey).startOf("day");
      const startDay = dateFn(event.startDate).startOf("day");
      const dayIndex = getDiffDays(currentDay, startDay) + 1;
      const totalDays = getDiffDays(event.endDate, event.startDate) + 1;
      return `${event.title} (Day ${dayIndex}/${totalDays})`;
    }
    return event.title;
  };

  return {
    todayRef,
    groupedEvents,
    renderEventTime,
    renderEventTitle,
  };
}
