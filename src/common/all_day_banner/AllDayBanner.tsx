import React, { useMemo, useState, useEffect } from "react";
import cx from "classnames";
import { dateFn, DateType } from "../../utils";
import { isMultiDay } from "../../utils/eventLayout";
import { CalendarEvent, CalendarContentProps } from "../../types";
import styles from "./AllDayBanner.module.css";

interface AllDayBannerProps {
  days: DateType[];
  events: CalendarEvent[];
  onEventClick?: CalendarContentProps["onEventClick"];
  classNames?: CalendarContentProps["classNames"];
}

interface BannerLayoutEvent {
  event: CalendarEvent;
  startIndex: number;
  endIndex: number;
  isClippedLeft: boolean;
  isClippedRight: boolean;
  row: number;
}

export default function AllDayBanner({
  days,
  events,
  onEventClick,
  classNames,
}: AllDayBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_VISIBLE_ROWS = 3;

  useEffect(() => {
    setIsExpanded(false);
  }, [days]);

  const viewStart = useMemo(() => dateFn(days[0]).startOf("day"), [days]);
  const viewEnd = useMemo(
    () => dateFn(days[days.length - 1]).startOf("day"),
    [days],
  );

  const bannerEvents = useMemo(() => {
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
  }, [events, days, viewStart, viewEnd]);

  // If showing "+ 1 more" takes up the same space as just showing the max + 1 row,
  // we can simply allow 1 more row to be visible and avoid the chip entirely.
  const effectiveMaxRows =
    bannerEvents.rowCount === MAX_VISIBLE_ROWS + 1
      ? MAX_VISIBLE_ROWS + 1
      : MAX_VISIBLE_ROWS;

  const hiddenCounts = useMemo(() => {
    const counts = new Array(days.length).fill(0);
    bannerEvents.layoutEvents.forEach((ev) => {
      if (ev.row >= effectiveMaxRows) {
        for (
          let i = Math.max(0, ev.startIndex);
          i <= Math.min(days.length - 1, ev.endIndex);
          i++
        ) {
          counts[i]++;
        }
      }
    });
    return counts;
  }, [bannerEvents.layoutEvents, days.length, effectiveMaxRows]);

  const hasHiddenEvents = hiddenCounts.some((count) => count > 0);

  const visibleLayoutEvents = isExpanded
    ? bannerEvents.layoutEvents
    : bannerEvents.layoutEvents.filter((ev) => ev.row < effectiveMaxRows);

  if (bannerEvents.layoutEvents.length === 0) {
    return (
      <div className={styles.bannerWrapper} style={{ borderBottom: "none" }}>
        <div className={styles.timeHeaderSpacer} />
        <div
          className={styles.bannerContainer}
          style={{ minHeight: 0, paddingBottom: 0, borderBottom: "none" }}
        />
      </div>
    );
  }

  const containerHeight = isExpanded
    ? Math.max(bannerEvents.rowCount * 24 + 4, 28)
    : hasHiddenEvents
      ? Math.max((effectiveMaxRows + 1) * 24 + 4, 28)
      : Math.max(bannerEvents.rowCount * 24 + 4, 28);

  const totalCols = days.length;

  const showExpandCollapse = hasHiddenEvents || isExpanded;

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.timeHeaderSpacer}>
        <span className={styles.timezoneLabel}>GMT+00</span>
        {showExpandCollapse && (
          <div
            className={cx(styles.expandIcon, {
              [styles.expanded]: isExpanded,
            })}
            onClick={() => setIsExpanded(!isExpanded)}
            title={
              isExpanded ? "Collapse all day events" : "Expand all day events"
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        )}
      </div>
      <div
        className={styles.bannerContainer}
        style={{ height: containerHeight }}
      >
        {visibleLayoutEvents.map((layoutEvent, idx) => {
          const {
            event,
            row,
            startIndex,
            endIndex,
            isClippedLeft,
            isClippedRight,
          } = layoutEvent;

          const leftPct = (startIndex / totalCols) * 100;
          const widthPct = ((endIndex - startIndex + 1) / totalCols) * 100;
          const topPx = row * 24 + 2;

          const bgColor = event.color || "#1a73e8"; // Default Google Blue

          return (
            <div
              key={event.id || `banner-evt-${idx}`}
              className={cx(styles.bannerChip, classNames?.event, {
                [styles.clippedLeft]: isClippedLeft,
                [styles.clippedRight]: isClippedRight,
              })}
              style={{
                top: `${topPx}px`,
                left: `${leftPct}%`,
                width: `calc(${widthPct}% - 4px)`,
                backgroundColor: bgColor,
                // Lighter background with darker border for pastel look as per docs
                // We'll approximate this by just using opacity on background or keeping it solid depending on design.
                // For simplicity, using solid color for now as per minimal requirements:
              }}
              onClick={() => onEventClick?.(event)}
            >
              <span className={styles.title}>{event.title}</span>
            </div>
          );
        })}
        {!isExpanded &&
          hiddenCounts.map((count, idx) => {
            if (count < 2) return null; // Only show '+ X more' if there are 2 or more hidden events
            const leftPct = (idx / totalCols) * 100;
            const widthPct = (1 / totalCols) * 100;
            const topPx = effectiveMaxRows * 24 + 2;

            return (
              <div
                key={`more-${idx}`}
                className={styles.moreChip}
                style={{
                  top: `${topPx}px`,
                  left: `${leftPct}%`,
                  width: `calc(${widthPct}% - 4px)`,
                }}
                onClick={() => setIsExpanded(true)}
              >
                + {count} more
              </div>
            );
          })}
      </div>
    </div>
  );
}
