import React, { useState, useEffect } from "react";
import cx from "classnames";
import {
  DateType,
  getGmtOffset,
  generateTooltipText,
  getContrastColor,
} from "../../../utils";
import {
  CalendarEvent,
  CalendarContentProps,
  ECalendarViewType,
} from "../../../types";
import useAllDayBanner, {
  BannerLayoutEvent,
} from "../../../hooks/useAllDayBanner";
import styles from "./AllDayBanner.module.css";
import { LAYOUT_CONSTANTS } from "../../../constants";
import { useCalendar } from "../../../context/CalendarContext";

interface AllDayBannerProps extends Pick<
  CalendarContentProps,
  | "maxEvents"
  | "onEventClick"
  | "classNames"
  | "is12Hour"
  | "renderEvent"
  | "locale"
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
  renderEvent,
  locale,
}: AllDayBannerProps) {
  const { testId } = useCalendar();
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
  } = useAllDayBanner(days, events, isExpanded, MAX_VISIBLE_ROWS);

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
      <div
        className={styles.bannerWrapper}
        data-testid={`${testId}-all-day-banner`}
      >
        <div className={styles.timeHeaderSpacer}>
          <span className={styles.timezoneLabel}>{gmtLabel}</span>
        </div>
        <div className={styles.bannerContainer}>{renderGridBg()}</div>
      </div>
    );
  }

  const totalCols = days.length;

  return (
    <div
      className={styles.bannerWrapper}
      data-testid={`${testId}-all-day-banner`}
    >
      <div className={styles.timeHeaderSpacer}>
        <span className={styles.timezoneLabel}>{gmtLabel}</span>
        {showExpandCollapse && (
          <div
            className={cx(styles.expandIcon, {
              [styles.expanded]: isExpanded,
            })}
            data-testid={`${testId}-all-day-expand-icon`}
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
        {visibleLayoutEvents.map(
          (layoutEvent: BannerLayoutEvent, idx: number) => {
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

            const eventBgColor =
              event.style?.backgroundColor ||
              LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR;
            const textColor = getContrastColor(String(eventBgColor));

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
                  backgroundColor: LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR,
                  color: textColor,
                  ...event.style,
                }}
                data-testid={`${testId}-${event.id}-all-day-event`}
                onClick={() => onEventClick?.(event)}
                title={generateTooltipText(
                  event,
                  ECalendarViewType.week,
                  is12Hour,
                  locale,
                )}
              >
                {renderEvent ? (
                  renderEvent(event)
                ) : (
                  <span className={styles.title}>{event.title}</span>
                )}
              </div>
            );
          },
        )}
        {!isExpanded &&
          hiddenCounts.map((count: number, idx: number) => {
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
                data-testid={`${testId}-${idx}-all-day-more-chip`}
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
