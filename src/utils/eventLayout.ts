import { CalendarEvent } from "../types";
import { dateFn, DateType } from "./date";

export function isMultiDay(event: CalendarEvent): boolean {
  if (!event.endDate) return false;
  const start = dateFn(event.startDate).startOf("day");
  const end = dateFn(event.endDate).startOf("day");
  return !start.isSame(end);
}

export interface DayEventLayout {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

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

export function calculateEventLayout(
  events: CalendarEvent[],
  currentDate: DateType,
): DayEventLayout[] {
  // 1. Filter events for the current day
  const eventsForDay = events.filter((event) => {
    const eventDate = dateFn(event.startDate).startOf("day");
    const currentDay = dateFn(currentDate).startOf("day");
    return eventDate.isSame(currentDay) && !isMultiDay(event);
  });

  if (eventsForDay.length === 0) return [];

  // Helper to get minutes from start of day
  const getMinutes = (dateStr: string) => {
    const d = dateFn(dateStr);
    return d.hour() * 60 + d.minute();
  };

  // 2. Process events
  const processedEvents: ProcessedEvent[] = eventsForDay.map((event, index) => {
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
  });

  // Phase 1 - Sort by start time, then duration descending
  processedEvents.sort((a, b) => {
    if (a.start === b.start) return b.duration - a.duration;
    return a.start - b.start;
  });

  // Phase 2 - Group into overlap clusters using sweep-line max-end approach
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

  // Phases 3–5 - Assign columns and calculate widths per cluster
  for (const cluster of clusters) {
    // Phase 3 - Greedy column assignment
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

    // Phase 4 - Initialise left and width
    for (const event of cluster) {
      event.left = event.columnIndex! / totalCols;
      event.width = 1 / totalCols;
    }

    // Phase 5 - Expand to fill free adjacent columns
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
}
