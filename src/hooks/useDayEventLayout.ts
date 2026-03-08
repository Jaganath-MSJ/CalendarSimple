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
import { dateFn, DateType } from "../utils/date";
import { isAllDayEvent, isMultiDay } from "../utils/common";

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
): DayEventLayout[] | DayEventLayout[][] {
  return useMemo(() => {
    const dates = Array.isArray(currentDateOrDates)
      ? currentDateOrDates
      : [currentDateOrDates];

    const generateLayoutForDate = (currentDate: DateType) => {
      // -------------------------------------------------------------------------
      // 1. Initial Filtering: Only process timed events for this specific day
      // -------------------------------------------------------------------------
      const eventsForDay = events.filter((event) => {
        const eventDate = dateFn(event.startDate).startOf("day");
        const currentDay = dateFn(currentDate).startOf("day");
        return (
          eventDate.isSame(currentDay) &&
          !isMultiDay(event) &&
          !isAllDayEvent(event)
        );
      });

      if (eventsForDay.length === 0) return [];

      // Helper to get minutes from start of day
      const getMinutes = (dateStr: string) => {
        const d = dateFn(dateStr);
        return d.hour() * 60 + d.minute();
      };

      // -------------------------------------------------------------------------
      // 2. Data Preparation: Convert dates to minutes from start of day
      // -------------------------------------------------------------------------
      const processedEvents: ProcessedEvent[] = eventsForDay.map(
        (event, index) => {
          const start = getMinutes(event.startDate);
          let end = event.endDate ? getMinutes(event.endDate) : start + 1;

          // Edge Case: Zero-duration event treated as 1 minute logically
          if (end === start) end = start + 1;

          // Clamp end to 1440 (24h) if needed, simplified
          if (end < start) end = 1440;

          return {
            id: `${index}-${event.title}`,
            start,
            end,
            duration: end - start,
            original: event,
          };
        },
      );

      // -------------------------------------------------------------------------
      // Phase 1 - Sorting: Start time asc, then Duration desc
      // -------------------------------------------------------------------------
      processedEvents.sort((a, b) => {
        if (a.start === b.start) return b.duration - a.duration;
        return a.start - b.start;
      });

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
        // Initially, assign equal width (1/totalCols) to every event.
        for (const event of cluster) {
          event.left = event.columnIndex! / totalCols;
          event.width = 1 / totalCols;
        }

        // Phase 5 - Width Expansion
        // Allow events to expand horizontally and occupy adjacent empty columns
        // if those columns have no competing events at that exact time slice.
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

      function toLayout(event: ProcessedEvent): DayEventLayout {
        const rawHeight = event.end - event.start;
        return {
          event: event.original,
          top: event.start,
          height: Math.max(rawHeight, 15),
          left: parseFloat((event.left! * 100).toFixed(4)),
          width: parseFloat((event.width! * 100).toFixed(4)),
          zIndex: event.columnIndex! + 1,
        };
      }

      return clusters.flatMap((cluster) => cluster.map(toLayout));
    };

    if (Array.isArray(currentDateOrDates)) {
      return dates.map((d) => generateLayoutForDate(d));
    }
    return generateLayoutForDate(dates[0]);
  }, [events, currentDateOrDates]);
}
