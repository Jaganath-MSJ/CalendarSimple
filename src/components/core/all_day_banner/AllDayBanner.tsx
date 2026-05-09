import React, { useState, useEffect } from "react";
import cx from "classnames";
import {
  DateType,
  getGmtOffset,
  generateTooltipText,
  getContrastColor,
  handleKeyboardActivation,
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
        role="region"
        aria-label="All-day events"
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
      role="region"
      aria-label="All-day events"
      className={styles.bannerWrapper}
      data-testid={`${testId}-all-day-banner`}
    >
      <div className={styles.timeHeaderSpacer}>
        <span className={styles.timezoneLabel}>{gmtLabel}</span>
        {showExpandCollapse && (
          <div
            role="button"
            tabIndex={0}
            className={cx(styles.expandIcon, {
              [styles.expanded]: isExpanded,
            })}
            data-testid={`${testId}-all-day-expand-icon`}
            aria-label={
              isExpanded ? "Collapse all-day events" : "Expand all-day events"
            }
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((prev) => !prev)}
            onKeyDown={handleKeyboardActivation(() =>
              setIsExpanded((prev) => !prev),
            )}
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
            const topPx = row * LAYOUT_CONSTANTS.ALL_DAY_ROW_HEIGHT + 2;

            const eventBgColor =
              event.style?.backgroundColor ||
              LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR;
            const textColor = getContrastColor(String(eventBgColor));

            return (
              <div
                key={event.id || `banner-evt-${idx}`}
                role="button"
                tabIndex={0}
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
                aria-label={generateTooltipText(
                  event,
                  ECalendarViewType.week,
                  is12Hour,
                  locale,
                )}
                onClick={() => onEventClick?.(event)}
                onKeyDown={handleKeyboardActivation(() =>
                  onEventClick?.(event),
                )}
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
            const topPx =
              effectiveMaxRows * LAYOUT_CONSTANTS.ALL_DAY_ROW_HEIGHT + 2;

            return (
              <div
                key={`more-${idx}`}
                role="button"
                tabIndex={0}
                className={styles.moreChip}
                style={{
                  top: `${topPx}px`,
                  left: `${leftPct}%`,
                  width: `calc(${widthPct}% - 4px)`,
                }}
                data-testid={`${testId}-${idx}-all-day-more-chip`}
                aria-label={`${count} more all-day events, click to expand`}
                onClick={() => setIsExpanded(true)}
                onKeyDown={handleKeyboardActivation(() => setIsExpanded(true))}
              >
                + {count} more
              </div>
            );
          })}
      </div>
    </div>
  );
}
