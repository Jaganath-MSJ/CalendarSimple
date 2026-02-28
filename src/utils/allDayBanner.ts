import { dateFn, DateType } from "./date";
import { isMultiDay } from "./eventLayout";
import { CalendarEvent } from "../types";
import { isAllDayEvent } from "./common";

export interface BannerLayoutEvent {
  event: CalendarEvent;
  startIndex: number;
  endIndex: number;
  isClippedLeft: boolean;
  isClippedRight: boolean;
  row: number;
}

export function getBannerViewState(
  days: DateType[],
  events: CalendarEvent[],
  isExpanded: boolean,
  maxVisibleRows: number = 3,
) {
  if (days.length === 0) {
    return {
      layoutEvents: [],
      rowCount: 0,
      effectiveMaxRows: maxVisibleRows,
      hiddenCounts: [],
      hasHiddenEvents: false,
      visibleLayoutEvents: [],
      containerHeight: 28,
      showExpandCollapse: false,
    };
  }

  const viewStart = dateFn(days[0]).startOf("day");
  const viewEnd = dateFn(days[days.length - 1]).startOf("day");

  // 1. Filter multi-day events and all-day events
  const multiDayEvents = events.filter(
    (e) => isMultiDay(e) || isAllDayEvent(e),
  );

  // 2. Filter events intersecting this view
  const intersectingEvents = multiDayEvents.filter((e) => {
    const eStart = dateFn(e.startDate).startOf("day");
    const eEnd = e.endDate ? dateFn(e.endDate).startOf("day") : eStart;
    // Intersects if start is before viewEnd AND end is after viewStart
    return (
      (eStart.isBefore(viewEnd) || eStart.isSame(viewEnd)) &&
      (eEnd.isAfter(viewStart) || eEnd.isSame(viewStart))
    );
  });

  // Sort by start date, then duration
  intersectingEvents.sort((a, b) => {
    const startA = dateFn(a.startDate).valueOf();
    const startB = dateFn(b.startDate).valueOf();
    if (startA === startB) {
      const durA = a.endDate ? dateFn(a.endDate).valueOf() - startA : 0;
      const durB = b.endDate ? dateFn(b.endDate).valueOf() - startB : 0;
      return durB - durA; // longest first
    }
    return startA - startB;
  });

  const rows: BannerLayoutEvent[][] = [];
  const layoutEvents: BannerLayoutEvent[] = [];

  intersectingEvents.forEach((event) => {
    const eStart = dateFn(event.startDate).startOf("day");
    const eEnd = event.endDate ? dateFn(event.endDate).startOf("day") : eStart;

    // Calculate indices for the current view
    let startIndex = days.findIndex((d) =>
      dateFn(d).startOf("day").isSame(eStart),
    );
    if (startIndex === -1 && eStart.isBefore(viewStart)) {
      startIndex = 0;
    }

    let endIndex = days.findIndex((d) => dateFn(d).startOf("day").isSame(eEnd));
    if (endIndex === -1 && eEnd.isAfter(viewEnd)) {
      endIndex = days.length - 1;
    }

    // It might happen that the event is completely outside the days, but we already filtered for intersections.
    if (startIndex === -1) startIndex = 0;
    if (endIndex === -1) endIndex = days.length - 1;

    const isClippedLeft = eStart.isBefore(viewStart);
    const isClippedRight = eEnd.isAfter(viewEnd);

    // Row stacking algorithm
    let rowIndex = 0;
    while (true) {
      if (!rows[rowIndex]) {
        rows[rowIndex] = [];
        break;
      }
      const hasOverlap = rows[rowIndex].some((existingEvent) => {
        return (
          startIndex <= existingEvent.endIndex &&
          endIndex >= existingEvent.startIndex
        );
      });
      if (!hasOverlap) {
        break;
      }
      rowIndex++;
    }

    const layoutEvent: BannerLayoutEvent = {
      event,
      startIndex,
      endIndex,
      isClippedLeft,
      isClippedRight,
      row: rowIndex,
    };

    rows[rowIndex].push(layoutEvent);
    layoutEvents.push(layoutEvent);
  });

  const rowCount = rows.length;

  const effectiveMaxRows =
    rowCount === maxVisibleRows + 1 ? maxVisibleRows + 1 : maxVisibleRows;

  const hiddenCounts = new Array(days.length).fill(0);
  layoutEvents.forEach((ev) => {
    if (ev.row >= effectiveMaxRows) {
      for (
        let i = Math.max(0, ev.startIndex);
        i <= Math.min(days.length - 1, ev.endIndex);
        i++
      ) {
        hiddenCounts[i]++;
      }
    }
  });

  const hasHiddenEvents = hiddenCounts.some((count) => count > 0);

  const visibleLayoutEvents = isExpanded
    ? layoutEvents
    : layoutEvents.filter((ev) => ev.row < effectiveMaxRows);

  const containerHeight = isExpanded
    ? Math.max(rowCount * 24 + 4, 28)
    : hasHiddenEvents
      ? Math.max((effectiveMaxRows + 1) * 24 + 4, 28)
      : Math.max(rowCount * 24 + 4, 28);

  const showExpandCollapse = hasHiddenEvents || isExpanded;

  return {
    layoutEvents,
    rowCount,
    effectiveMaxRows,
    hiddenCounts,
    hasHiddenEvents,
    visibleLayoutEvents,
    containerHeight,
    showExpandCollapse,
  };
}

export function getGmtOffset() {
  const offset = new Date().getTimezoneOffset();
  const sign = offset > 0 ? "-" : "+"; // timeZoneOffset returns negative if ahead of UTC
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;

  if (minutes === 0) {
    return `GMT${sign}${hours.toString().padStart(2, "0")}`;
  }
  return `GMT${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
