/**
 * @file useAllDayBanner.ts
 * @description Core logic for calculating the layout of the all-day and multi-day events banner.
 *
 * This utility handles the complex task of:
 * 1. Filtering events that span multiple days or are marked as all-day.
 * 2. Identifying intersecting events within the currently visible days.
 * 3. Sorting events to optimize visual flow (longest events first).
 * 4. Stacking events vertically using a Tetris-like row assignment algorithm to avoid overlap.
 * 5. Calculating expand/collapse states and dynamically resolving container heights.
 */

import { useMemo } from "react";
import { dateFn, DateType } from "../utils/date";
import { CalendarEvent } from "../types";
import { isAllDayEvent, isMultiDay } from "../utils/common";

/**
 * Represents the layout information for an event displayed in the all-day banner.
 */
export interface BannerLayoutEvent {
  /** The original calendar event data */
  event: CalendarEvent;
  /** The index of the day where the event starts within the current view */
  startIndex: number;
  /** The index of the day where the event ends within the current view */
  endIndex: number;
  /** Indicates if the event starts before the current view's start date */
  isClippedLeft: boolean;
  /** Indicates if the event ends after the current view's end date */
  isClippedRight: boolean;
  /** The vertical row index where the event should be positioned to avoid overlap */
  row: number;
}

/**
 * Hook to calculate layout and positioning for multi-day and all-day events in a banner view.
 * It determines which events are visible, how they stack vertically to avoid overlapping,
 * and handles an expanded/collapsed state when there are too many concurrent events.
 *
 * @param days - The array of days currently visible in the calendar view.
 * @param events - The complete array of calendar events to filter and layout.
 * @param isExpanded - Whether the banner is currently expanded to show all stacked events.
 * @param maxVisibleRows - The maximum number of event rows to show before collapsing (default: 3).
 * @returns An object containing layout details:
 * - `layoutEvents`: All calculated events that intersect with the current view.
 * - `rowCount`: The total number of rows required to display all events without overlap.
 * - `effectiveMaxRows`: The effective limit on visible rows.
 * - `hiddenCounts`: An array representing the number of hidden events for each day index.
 * - `hasHiddenEvents`: A boolean flag indicating if any events exceed the `maxVisibleRows`.
 * - `visibleLayoutEvents`: The events that should currently be rendered based on the `isExpanded` state.
 * - `containerHeight`: The computed height of the banner container.
 * - `showExpandCollapse`: A boolean flag indicating if the expand/collapse button should be rendered.
 */
export default function useAllDayBanner(
  days: DateType[],
  events: CalendarEvent[],
  isExpanded: boolean,
  maxVisibleRows: number = 3,
) {
  return useMemo(() => {
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

    // -------------------------------------------------------------------------
    // 1. Event Filtering: Multi-day and All-day events
    // -------------------------------------------------------------------------
    const multiDayEvents = events.filter(
      (e) => isMultiDay(e) || isAllDayEvent(e),
    );

    // -------------------------------------------------------------------------
    // 2. Event Identification: Intersecting Events
    // -------------------------------------------------------------------------
    const intersectingEvents = multiDayEvents.filter((e) => {
      const eStart = dateFn(e.startDate).startOf("day");
      const eEnd = e.endDate ? dateFn(e.endDate).startOf("day") : eStart;
      // Intersects if start is before viewEnd AND end is after viewStart
      return (
        (eStart.isBefore(viewEnd) || eStart.isSame(viewEnd)) &&
        (eEnd.isAfter(viewStart) || eEnd.isSame(viewStart))
      );
    });

    // -------------------------------------------------------------------------
    // 3. Event Sorting: Start Date asc, then Duration desc
    //
    // Sorting by start date ensures chronological order left-to-right.
    // Secondary sorting by duration (descending) puts longer events at the top,
    // reducing visual fragmentation and allowing shorter events to tile underneath nicely.
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // 4. Slot Assignment: "Tetris" Algorithm
    //
    // The goal here is to calculate the start and end column index for each event
    // and assign a vertical "row" index so no overlapping events share a row.
    // -------------------------------------------------------------------------
    intersectingEvents.forEach((event) => {
      const eStart = dateFn(event.startDate).startOf("day");
      const eEnd = event.endDate
        ? dateFn(event.endDate).startOf("day")
        : eStart;

      // Calculate bound indices for the current visible view
      let startIndex = days.findIndex((d) =>
        dateFn(d).startOf("day").isSame(eStart),
      );
      if (startIndex === -1 && eStart.isBefore(viewStart)) {
        startIndex = 0;
      }

      let endIndex = days.findIndex((d) =>
        dateFn(d).startOf("day").isSame(eEnd),
      );
      if (endIndex === -1 && eEnd.isAfter(viewEnd)) {
        endIndex = days.length - 1;
      }

      // It might happen that the event is completely outside the days, but we already filtered for intersections.
      if (startIndex === -1) startIndex = 0;
      if (endIndex === -1) endIndex = days.length - 1;

      const isClippedLeft = eStart.isBefore(viewStart);
      const isClippedRight = eEnd.isAfter(viewEnd);

      // Row stacking: Find the lowest row index where the event fits without overlap
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
    // -------------------------------------------------------------------------
    // 5. Overflow and Display Calculation
    //
    // Manage which events are hidden under an "expand" toggle if there
    // are too many concurrent rows, and compute height/visibility states accordingly.
    // -------------------------------------------------------------------------
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
  }, [days, events, isExpanded, maxVisibleRows]);
}
