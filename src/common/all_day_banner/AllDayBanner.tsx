import React, { useMemo, useState, useEffect } from "react";
import cx from "classnames";
import { DateType, getAllDayBannerLayout } from "../../utils";
import { CalendarEvent, CalendarContentProps } from "../../types";
import styles from "./AllDayBanner.module.css";

interface AllDayBannerProps {
  days: DateType[];
  events: CalendarEvent[];
  onEventClick?: CalendarContentProps["onEventClick"];
  classNames?: CalendarContentProps["classNames"];
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

  const bannerEvents = useMemo(() => {
    return getAllDayBannerLayout(days, events);
  }, [events, days]);

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
        <div className={styles.timeHeaderSpacer}>
          <span className={styles.timezoneLabel}>GMT+00</span>
        </div>
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
