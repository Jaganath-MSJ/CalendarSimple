import React, { useMemo } from "react";
import cx from "classnames";
import { DataType } from "../../types";
import {
  formatDate,
  dateFn,
  isSameDate,
  getDiffDays,
  checkIsToday,
} from "../../utils";
import { DATE_FORMATS, CALENDAR_CONSTANTS } from "../../constants";
import styles from "./ScheduleView.module.css";

interface ScheduleViewProps {
  events: DataType[];
  onEventClick?: (event: DataType) => void;
  is12Hour?: boolean;
}

export default function ScheduleView({
  events,
  onEventClick,
  is12Hour,
}: ScheduleViewProps) {
  const groupedEvents = useMemo(() => {
    // Sort events by start date
    const sorted = [...events].sort(
      (a, b) => dateFn(a.startDate).valueOf() - dateFn(b.startDate).valueOf(),
    );

    const groups: Record<string, DataType[]> = {};
    sorted.forEach((event) => {
      // Group by date string (e.g. "2023-10-25")
      const dateKey = formatDate(event.startDate, DATE_FORMATS.DATE);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return groups;
  }, [events]);

  const renderEventTime = (event: DataType) => {
    // If the event spans multiple days
    if (
      event.endDate &&
      !isSameDate(dateFn(event.startDate), dateFn(event.endDate))
    ) {
      return "All day";
    }

    // Normal time range
    const timeFormat = is12Hour ? DATE_FORMATS.TIME_12H : DATE_FORMATS.TIME;
    const startStr = formatDate(event.startDate, timeFormat).toLowerCase();
    const endStr = event.endDate
      ? formatDate(event.endDate, timeFormat).toLowerCase()
      : "";

    // Clean up formats like "09:00 am" to "9am" for Google style matching (optional detail but nice to have)
    const formatTime = (t: string) =>
      t.replace(/^0/, "").replace(":00", "").replace(" ", "");

    if (endStr) {
      return `${formatTime(startStr)} – ${formatTime(endStr)}`;
    }
    return formatTime(startStr);
  };

  const renderEventTitle = (event: DataType) => {
    if (
      event.endDate &&
      !isSameDate(dateFn(event.startDate), dateFn(event.endDate))
    ) {
      // Multi-day events showing (Day x/y)
      // Note: we'd ideally need the start day of the multi-day span, but typically
      // events are just listed on their start date in standard agenda views unless
      // they are flattened out. Given the current grouping, they appear once.
      // We will add a simplistic "(Multi-day)" label to mirror the requirement.
      const totalDays = getDiffDays(event.endDate, event.startDate) + 1;
      return `${event.value} (Day 1/${totalDays})`;
    }
    return event.value;
  };

  // simplistic way to show a current timeline on today's events list
  // The actual google calendar only shows the line if the time matches.
  // We'll just show it statically for visual demonstration of "today"
  const _renderCurrentTimeLine = () => {
    return <div className={styles.currentTimeLine} />;
  };

  return (
    <div className={styles.scheduleView}>
      {Object.keys(groupedEvents).length === 0 ? (
        <div className={styles.emptyState}>No events to display</div>
      ) : (
        Object.keys(groupedEvents).map((dateKey) => {
          const dayEvents = groupedEvents[dateKey];
          const dateObj = dateFn(dateKey);

          const isToday = checkIsToday(dateObj, dateObj.date());

          return (
            <div key={dateKey} className={styles.dateGroup}>
              {dayEvents.map((event, index) => {
                const eventColor =
                  event.color || CALENDAR_CONSTANTS.DEFAULT_EVENT_COLOR;

                const isFirstEventOfDay = index === 0;

                return (
                  <div
                    key={event.id || index}
                    className={styles.eventItemContainer}
                    onClick={() => onEventClick?.(event)}
                  >
                    {/* Column 1: Date Info (only shown on the first event of the day) */}
                    <div className={styles.dateInfoColumn}>
                      {isFirstEventOfDay && (
                        <>
                          <div
                            className={cx(styles.dateNumber, {
                              [styles.today]: isToday,
                            })}
                          >
                            {formatDate(dateObj, "D")}
                          </div>
                          <div className={styles.dateSubInfo}>
                            {formatDate(dateObj, "MMM").toUpperCase()},{" "}
                            {formatDate(dateObj, "ddd").toUpperCase()}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Column 2: Dot + Time */}
                    <div className={styles.dotTimeColumn}>
                      <div
                        className={styles.eventDot}
                        style={{ backgroundColor: eventColor }}
                      />
                      <div className={styles.eventTime}>
                        {renderEventTime(event)}
                      </div>
                    </div>

                    {/* Column 3: Title */}
                    <div className={styles.eventTitleColumn}>
                      {renderEventTitle(event)}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
