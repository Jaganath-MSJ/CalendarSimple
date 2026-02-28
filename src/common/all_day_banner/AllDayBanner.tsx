import React, { useMemo, useState, useEffect } from "react";
import cx from "classnames";
import {
  DateType,
  getBannerViewState,
  getGmtOffset,
  generateTooltipText,
} from "../../utils";
import {
  CalendarEvent,
  CalendarContentProps,
  ECalendarViewType,
} from "../../types";
import styles from "./AllDayBanner.module.css";

interface AllDayBannerProps extends Pick<
  CalendarContentProps,
  "maxEvents" | "onEventClick" | "classNames" | "is12Hour"
> {
  days: DateType[];
  events: CalendarEvent[];
}

export default function AllDayBanner({
  days,
  events,
  maxEvents,
  onEventClick,
  classNames,
  is12Hour,
}: AllDayBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_VISIBLE_ROWS = maxEvents ?? 3;

  useEffect(() => {
    setIsExpanded(false);
  }, [days]);

  const {
    layoutEvents,
    effectiveMaxRows,
    hiddenCounts,
    visibleLayoutEvents,
    containerHeight,
    showExpandCollapse,
  } = useMemo(() => {
    return getBannerViewState(days, events, isExpanded, MAX_VISIBLE_ROWS);
  }, [days, events, isExpanded]);

  const renderGridBg = () => (
    <div className={styles.bannerGridBg}>
      {days.map((_, idx) => (
        <div key={idx} className={styles.bannerGridCell} />
      ))}
    </div>
  );

  const gmtLabel = getGmtOffset();

  if (layoutEvents.length === 0) {
    return (
      <div className={styles.bannerWrapper}>
        <div className={styles.timeHeaderSpacer}>
          <span className={styles.timezoneLabel}>{gmtLabel}</span>
        </div>
        <div className={styles.bannerContainer}>{renderGridBg()}</div>
      </div>
    );
  }

  const totalCols = days.length;

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.timeHeaderSpacer}>
        <span className={styles.timezoneLabel}>{gmtLabel}</span>
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
        {renderGridBg()}
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

          const bgColor = event.color || "#1a73e8";

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
              title={generateTooltipText(
                event,
                ECalendarViewType.week,
                is12Hour,
              )}
            >
              <span className={styles.title}>{event.title}</span>
            </div>
          );
        })}
        {!isExpanded &&
          hiddenCounts.map((count, idx) => {
            if (count === 0) return null;
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
