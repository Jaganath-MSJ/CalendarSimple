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
  zIndex: number;
  columnIndex: number;
  totalColumns: number;
  clusterSize: number;
}

interface ProcessedEvent {
  id: string;
  start: number;
  end: number;
  duration: number;
  original: DataType;
  _columnIndex?: number;
  _totalColumns?: number;
  _left?: number;
  _width?: number;
  _expandCols?: number;
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

  // 2. Process events
  const processedEvents: ProcessedEvent[] = eventsForDay.map((event, index) => {
    const start = getMinutes(event.startDate);
    let end = event.endDate ? getMinutes(event.endDate) : start + 60;

    // Edge Case: Zero-duration event treated as 1 minute logically
    if (end === start) end = start + 1;

    // Clamp end to 1440 (24h) if needed, simplified
    if (end < start) end = 1440;

    return {
      id: `${index}-${event.value}`,
      start,
      end,
      duration: end - start,
      original: event,
      _columnIndex: undefined,
      _totalColumns: undefined,
      _expandCols: undefined,
      _left: undefined,
      _width: undefined,
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
          event._columnIndex = c;
          placed = true;
          break;
        }
      }

      if (!placed) {
        event._columnIndex = columns.length;
        columns.push([event]);
      }
    }

    const totalCols = columns.length;
    for (const event of cluster) {
      event._totalColumns = totalCols;
    }

    // Phase 4 - Initialise left and width
    for (const event of cluster) {
      event._left = event._columnIndex! / totalCols;
      event._width = 1 / totalCols;
    }

    // Phase 5 - Expand to fill free adjacent columns
    const colMap: Map<number, ProcessedEvent[]> = new Map();
    for (const event of cluster) {
      const c = event._columnIndex!;
      if (!colMap.has(c)) colMap.set(c, []);
      colMap.get(c)!.push(event);
    }

    for (const event of cluster) {
      let expandCols = 1;

      for (let c = event._columnIndex! + 1; c < totalCols; c++) {
        const colEvents = colMap.get(c) ?? [];
        const blocked = colEvents.some(
          (other) => other.start < event.end && event.start < other.end,
        );
        if (blocked) break;
        expandCols++;
      }

      const maxPossibleCols = totalCols - event._columnIndex!;
      event._expandCols = Math.min(expandCols, maxPossibleCols);
      event._width = event._expandCols / totalCols;
    }
  }

  function toLayout(
    event: ProcessedEvent,
    clusterSize: number,
  ): DayEventLayout {
    const rawHeight = event.end - event.start;
    return {
      event: event.original,
      top: event.start,
      height: Math.max(rawHeight, 15),
      left: parseFloat((event._left! * 100).toFixed(4)),
      width: parseFloat((event._width! * 100).toFixed(4)),
      zIndex: event._columnIndex! + 1,
      columnIndex: event._columnIndex!,
      totalColumns: event._totalColumns!,
      clusterSize,
    };
  }

  return clusters.flatMap((cluster) =>
    cluster.map((event) => toLayout(event, cluster.length)),
  );
}
