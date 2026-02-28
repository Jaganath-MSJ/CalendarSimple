import { dateFn, DateType } from "./date";
import { isMultiDay } from "./eventLayout";
import { CalendarEvent } from "../types";

interface BannerLayoutEvent {
  event: CalendarEvent;
  startIndex: number;
  endIndex: number;
  isClippedLeft: boolean;
  isClippedRight: boolean;
  row: number;
}

export function getAllDayBannerLayout(
  days: DateType[],
  events: CalendarEvent[],
): { layoutEvents: BannerLayoutEvent[]; rowCount: number } {
  if (days.length === 0) {
    return { layoutEvents: [], rowCount: 0 };
  }

  const viewStart = dateFn(days[0]).startOf("day");
  const viewEnd = dateFn(days[days.length - 1]).startOf("day");

  // 1. Filter multi-day events
  const multiDayEvents = events.filter((e) => isMultiDay(e));

  // 2. Filter events intersecting this view
  const intersectingEvents = multiDayEvents.filter((e) => {
    const eStart = dateFn(e.startDate).startOf("day");
    const eEnd = e.endDate
      ? dateFn(e.endDate).startOf("day")
      : dateFn(e.startDate).startOf("day");
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
    const eEnd = event.endDate
      ? dateFn(event.endDate).startOf("day")
      : dateFn(event.startDate).startOf("day");

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

  return { layoutEvents, rowCount: rows.length };
}
