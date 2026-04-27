/**
 * @file useDayEventLayout.ts
 * @description Core logic for calculating the visual layout of timed events in a day/week view.
 *
 * This utility computes the positioning (top, left, width, height) of events
 * so that they are displayed chronologically, and visually stacked/wrapped
 * when overlapping. It employs:
 * 1. Filtering out all-day and multi-day events.
 * 2. Sweep-line algorithm to group overlapping events into "clusters".
 * 3. Greedy slot assignment to place events in columns without overlapping.
 * 4. Width expansion to let events take up available empty space dynamically.
 */

import { CalendarEvent } from "../types";
import { useMemo } from "react";
import { dateFn, DateType, formatDate } from "../utils/date";
import { isAllDayEvent, getEventOverlapInHours } from "../utils/common";
import { DATE_FORMATS, TIME_CONSTANTS } from "../constants";

export interface UseDayEventLayoutOptions {
  enableEnrichedEvents?: boolean;
  enrichedEventsByDate?: Record<string, CalendarEvent[]>;
  eventsAreSorted?: boolean;
  isEventOrderingEnabled?: boolean;
}

/**
 * Represents the final calculated CSS positioning for an event in the day view.
 */
export interface DayEventLayout {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

/**
 * Internal representation of an event being processed during the layout algorithm.
 * Tracks temporary states like starting minute, ending minute, and assigned column.
 */
interface ProcessedEvent {
  id: string;
  start: number;
  end: number;
  duration: number;
  original: CalendarEvent;
  columnIndex?: number;
  left?: number;
  width?: number;
  expandCols?: number;
}

/**
 * Hook to calculate layout and positioning for timed events in a day or week view.
 *
 * @param events - The complete array of calendar events.
 * @param currentDateOrDates - A single date (for Day view) or array of dates (for Week view) to render.
 * @returns A layout array (for a single day) or a nested array of layouts (for multiple days).
 */
export default function useDayEventLayout(
  events: CalendarEvent[],
  currentDateOrDates: DateType | DateType[],
  minHour: number,
  maxHour: number,
  showAllDayRow: boolean,
  eventOverlapOffset: number,
  options: UseDayEventLayoutOptions = {},
): DayEventLayout[] | DayEventLayout[][] {
  const {
    enableEnrichedEvents,
    enrichedEventsByDate,
    eventsAreSorted,
    isEventOrderingEnabled = true,
  } = options;

  return useMemo(() => {
    const dates = Array.isArray(currentDateOrDates)
      ? currentDateOrDates
      : [currentDateOrDates];

    const generateLayoutForDate = (currentDate: DateType) => {
      // -------------------------------------------------------------------------
      // 1. Initial Filtering: Only process timed events for this specific day
      // -------------------------------------------------------------------------
      const getEventsForDay = () => {
        const filterFn = (event: CalendarEvent) => {
          const currentDay = dateFn(currentDate).startOf("day");

          // Check if event overlaps this calendar day at all
          const eventStart = dateFn(event.startDate).startOf("day");
          const eventEnd = event.endDate
            ? dateFn(event.endDate).endOf("day")
            : eventStart.endOf("day");

          const overlapsCurrentDay =
            currentDay >= eventStart.startOf("day") &&
            currentDay <= eventEnd.startOf("day");

          if (!overlapsCurrentDay) return false;

          const isAllDay = isAllDayEvent(event);

          if (showAllDayRow) {
            if (isAllDay) return false;
            if (getEventOverlapInHours(event, currentDay) >= 12) return false;

            // To ensure we restrict to visible operating hours
            const actStartMs = Math.max(
              dateFn(event.startDate).valueOf(),
              currentDay.valueOf(),
            );
            const actEndMs = Math.min(
              event.endDate ? dateFn(event.endDate).valueOf() : actStartMs,
              currentDay.endOf("day").valueOf() + 1,
            );

            const startMins = Math.floor(
              (actStartMs - currentDay.valueOf()) /
                TIME_CONSTANTS.MS_PER_MINUTE,
            );
            const endMins = Math.floor(
              (actEndMs - currentDay.valueOf()) / TIME_CONSTANTS.MS_PER_MINUTE,
            );

            const isWithinBounds =
              endMins > minHour * TIME_CONSTANTS.MINUTES_IN_HOUR &&
              startMins < maxHour * TIME_CONSTANTS.MINUTES_IN_HOUR;
            return isWithinBounds;
          }

          // If hiding the all-day row, we want to show all events that overlap this day
          return true;
        };

        if (enableEnrichedEvents && enrichedEventsByDate) {
          const dateStr = formatDate(currentDate, DATE_FORMATS.DATE);
          return (enrichedEventsByDate[dateStr] || []).filter(filterFn);
        }
        return events.filter(filterFn);
      };

      const eventsForDay = getEventsForDay();

      if (eventsForDay.length === 0) return [];

      // -------------------------------------------------------------------------
      // 2. Data Preparation: Convert dates to minutes from start of day
      // -------------------------------------------------------------------------
      const processedEvents: ProcessedEvent[] = eventsForDay.map(
        (event, index) => {
          const currentDayStartMs = dateFn(currentDate)
            .startOf("day")
            .valueOf();
          const currentDayEndMs = dateFn(currentDate).endOf("day").valueOf();

          const isAllDay = isAllDayEvent(event);
          const overlapHours = getEventOverlapInHours(event, currentDate);

          const actStartMs = Math.max(
            dateFn(event.startDate).valueOf(),
            currentDayStartMs,
          );
          const actEndMs = Math.min(
            event.endDate ? dateFn(event.endDate).valueOf() : actStartMs,
            currentDayEndMs + 1, // Add 1ms to include exact midnight
          );

          let start = Math.floor((actStartMs - currentDayStartMs) / 60000);
          let end = Math.floor((actEndMs - currentDayStartMs) / 60000);

          if (start === end) end += 1;

          if (!showAllDayRow && (isAllDay || overlapHours >= 12)) {
            // Force it to span the entire visible grid (minHour to maxHour)
            start = minHour * TIME_CONSTANTS.MINUTES_IN_HOUR;
            end = maxHour * TIME_CONSTANTS.MINUTES_IN_HOUR;
          }

          // Clamp start and end to boundaries for the algorithm
          const clampedStart = Math.max(
            start,
            minHour * TIME_CONSTANTS.MINUTES_IN_HOUR,
          );
          const clampedEnd = Math.min(
            end,
            maxHour * TIME_CONSTANTS.MINUTES_IN_HOUR,
          );

          return {
            id: `${index}-${event.title}`,
            start: clampedStart,
            end: clampedEnd,
            duration: clampedEnd - clampedStart,
            original: event,
          };
        },
      );

      // -------------------------------------------------------------------------
      // Phase 1 - Sorting: Start time asc, then Duration desc
      // -------------------------------------------------------------------------
      if (!eventsAreSorted) {
        processedEvents.sort((a, b) => {
          if (a.start === b.start) return b.duration - a.duration;
          return a.start - b.start;
        });
      }

      // If ordering is disabled, bypass expensive layout processing
      if (!isEventOrderingEnabled) {
        return processedEvents.map((event) => {
          event.columnIndex = 0; // Use a constant so zIndex stays 1 and naturally DOM-stacks without breaking header z-indexes
          event.left = 0;
          event.width = 1;
          return toLayout(event);
        });
      }

      // -------------------------------------------------------------------------
      // Phase 2 - Sweep-line Clustering: Group overlapping events
      //
      // Iterates through sorted events and groups them into "clusters".
      // Two events are in the same cluster if they overlap in time. A cluster
      // ends when the next event's start time is >= the maximum end time seen so far.
      // -------------------------------------------------------------------------
      const clusters: ProcessedEvent[][] = [];
      let currentCluster: ProcessedEvent[] = [];
      let clusterMaxEnd = -Infinity;

      for (const event of processedEvents) {
        if (currentCluster.length > 0 && event.start >= clusterMaxEnd) {
          clusters.push(currentCluster);
          currentCluster = [];
          clusterMaxEnd = -Infinity;
        }
        currentCluster.push(event);
        clusterMaxEnd = Math.max(clusterMaxEnd, event.end);
      }
      if (currentCluster.length > 0) clusters.push(currentCluster);

      // -------------------------------------------------------------------------
      // Phases 3–5: Calculate relative layout per cluster
      // -------------------------------------------------------------------------
      for (const cluster of clusters) {
        // Phase 3 - Greedy Column Assignment
        // Assign each event to the first column where it does not overlap with the
        // last event in that column. If it doesn't fit in any, add a new column.
        const columns: ProcessedEvent[][] = [];

        for (const event of cluster) {
          let placed = false;
          for (let c = 0; c < columns.length; c++) {
            const lastEvent = columns[c][columns[c].length - 1];
            if (lastEvent.end <= event.start) {
              columns[c].push(event);
              event.columnIndex = c;
              placed = true;
              break;
            }
          }

          if (!placed) {
            event.columnIndex = columns.length;
            columns.push([event]);
          }
        }

        const totalCols = columns.length;

        // Phase 4 - Initialise default dimensions
        for (const event of cluster) {
          if (eventOverlapOffset > 0) {
            // Stacked layout: each column is shifted by offset
            event.left = (event.columnIndex! * eventOverlapOffset) / 100;
            event.width = 1 - event.left;
          } else {
            // Tiled layout: equal width
            event.left = event.columnIndex! / totalCols;
            event.width = 1 / totalCols;
          }
        }

        // Phase 5 - Width Expansion (Only for tiled layout)
        if (eventOverlapOffset === 0) {
          const colMap: Map<number, ProcessedEvent[]> = new Map();
          for (const event of cluster) {
            const c = event.columnIndex!;
            if (!colMap.has(c)) colMap.set(c, []);
            colMap.get(c)!.push(event);
          }

          for (const event of cluster) {
            let expandCols = 1;

            for (let c = event.columnIndex! + 1; c < totalCols; c++) {
              const colEvents = colMap.get(c) ?? [];
              const blocked = colEvents.some(
                (other) => other.start < event.end && event.start < other.end,
              );
              if (blocked) break;
              expandCols++;
            }

            const maxPossibleCols = totalCols - event.columnIndex!;
            event.expandCols = Math.min(expandCols, maxPossibleCols);
            event.width = event.expandCols / totalCols;
          }
        }
      }

      function toLayout(event: ProcessedEvent): DayEventLayout {
        const rawHeight = event.end - event.start;
        // Shift top by the minHour offset
        const top = event.start - minHour * TIME_CONSTANTS.MINUTES_IN_HOUR;

        return {
          event: event.original,
          top: Math.max(0, top), // ensure it never renders above container
          height: Math.max(rawHeight, 15),
          left: parseFloat((event.left! * 100).toFixed(4)),
          width: parseFloat((event.width! * 100).toFixed(4)),
          zIndex: Math.min(event.columnIndex! + 1, 14), // Cap z-index below 15 (timeHeaderSpacer) and 20 (stickyTopContainer)
        };
      }

      return clusters.flatMap((cluster) => cluster.map(toLayout));
    };

    if (Array.isArray(currentDateOrDates)) {
      return dates.map((d) => generateLayoutForDate(d));
    }
    return generateLayoutForDate(dates[0]);
  }, [
    events,
    currentDateOrDates,
    minHour,
    maxHour,
    showAllDayRow,
    eventOverlapOffset,
    enableEnrichedEvents,
    enrichedEventsByDate,
    eventsAreSorted,
    isEventOrderingEnabled,
  ]);
}
