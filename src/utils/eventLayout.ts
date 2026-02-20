// Adjust import path if needed, DataType is in types/index.ts usually?
// Actually DataType in index.ts imports DateType from utils.
// Let's check where DataType is defined. It is in `src/types/index.ts`.
// And `dateFn` is in `src/utils/date.ts`.

import { DataType } from "../types";
import { dateFn, DateType } from "./date";

export interface DayEventLayout {
  event: DataType;
  top: number;
  height: number;
  left: number;
  width: number;
}

interface ProcessedEvent {
  original: DataType;
  start: number;
  end: number;
  duration: number;
  id: string; // generated ID for internal tracking
}

export function calculateEventLayout(
  events: DataType[],
  currentDate: DateType,
): DayEventLayout[] {
  // 1. Filter events for the current day
  const eventsForDay = events.filter((event) => {
    const eventDate = dateFn(event.startDate).startOf("day");
    const currentDay = dateFn(currentDate).startOf("day");
    return eventDate.isSame(currentDay);
  });

  if (eventsForDay.length === 0) return [];

  // Helper to get minutes from start of day
  const getMinutes = (dateStr: string) => {
    const d = dateFn(dateStr);
    return d.hour() * 60 + d.minute();
  };

  // 2. Process and sort events
  const processedEvents: ProcessedEvent[] = eventsForDay.map((event, index) => {
    const start = getMinutes(event.startDate);
    let end = event.endDate ? getMinutes(event.endDate) : start + 60;

    // Clamp end to 1440 (24h) if needed, simplified
    if (end < start) end = 1440;

    return {
      original: event,
      start,
      end,
      duration: end - start,
      id: `${index}-${event.value}`,
    };
  });

  // Sort by start time, then duration
  processedEvents.sort((a, b) => {
    if (a.start === b.start) return b.duration - a.duration;
    return a.start - b.start;
  });

  // 3. Group into clusters
  const clusters: ProcessedEvent[][] = [];
  let currentCluster: ProcessedEvent[] = [];

  processedEvents.forEach((event) => {
    if (currentCluster.length === 0) {
      currentCluster.push(event);
    } else {
      const clusterEnd = Math.max(...currentCluster.map((e) => e.end));
      // Overlap if start < clusterEnd
      if (event.start < clusterEnd) {
        currentCluster.push(event);
      } else {
        clusters.push(currentCluster);
        currentCluster = [event];
      }
    }
  });
  if (currentCluster.length > 0) clusters.push(currentCluster);

  // 4. Assign columns and calculate layout
  const finalEvents: DayEventLayout[] = [];

  clusters.forEach((cluster) => {
    const columns: ProcessedEvent[] = [];
    const eventColumns = new Map<ProcessedEvent, number>();

    cluster.forEach((event) => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const lastEventInColumn = columns[i];
        if (lastEventInColumn.end <= event.start) {
          columns[i] = event;
          eventColumns.set(event, i);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push(event);
        eventColumns.set(event, columns.length - 1);
      }
    });

    const numColumns = columns.length;

    cluster.forEach((event) => {
      const colIndex = eventColumns.get(event) ?? 0;
      // Cascading layout: shift right by fixed percentage per column
      const left = colIndex * 7;
      // Take up remaining width, or at least a good chunk.
      // Google Calendar style: extend to right edge (approx).
      const width = 100 - left;

      finalEvents.push({
        event: event.original,
        top: (event.start / 60) * 60,
        height: (event.duration / 60) * 60,
        left: left,
        width: width,
      });
    });
  });

  return finalEvents;
}
