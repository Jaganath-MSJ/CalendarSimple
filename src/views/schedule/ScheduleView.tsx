import React, { useMemo } from "react";
import cx from "classnames";
import {
  CalendarContentProps,
  CalendarEvent,
  ECalendarViewType,
} from "../../types";
import {
  formatDate,
  dateFn,
  isSameDate,
  getDiffDays,
  checkIsToday,
  generateTooltipText,
} from "../../utils";
import { DATE_FORMATS, CALENDAR_CONSTANTS } from "../../constants";
import styles from "./ScheduleView.module.css";

interface ScheduleViewProps extends Pick<
  CalendarContentProps,
  "events" | "is12Hour" | "dayType" | "onEventClick" | "theme" | "classNames"
> {}

export default function ScheduleView({
  events,
  onEventClick,
  is12Hour,
  theme,
  classNames,
}: ScheduleViewProps) {
  const groupedEvents = useMemo(() => {
    // Sort events by start date
    const sorted = [...events].sort(
      (a, b) => dateFn(a.startDate).valueOf() - dateFn(b.startDate).valueOf(),
    );

    const groups: Record<string, CalendarEvent[]> = {};
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

  const renderEventTime = (event: CalendarEvent) => {
    // If the event spans multiple days
    if (
      event.endDate &&
      !isSameDate(dateFn(event.startDate), dateFn(event.endDate))
    ) {
      return "All day";
    }

    // Normal time range
    const timeFormat = is12Hour ? DATE_FORMATS.TIME_12H : DATE_FORMATS.TIME;
    const startStr = formatDate(event.startDate, timeFormat);

    const formatTime = (t: string) => t.replace(/^0/, "").replace(":00", " ");

    if (event.endDate) {
      const endStr = formatDate(event.endDate, timeFormat);
      return `${formatTime(startStr)} – ${formatTime(endStr)}`;
    }
    return formatTime(startStr);
  };

  const renderEventTitle = (event: CalendarEvent) => {
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
      return `${event.title} (Day 1/${totalDays})`;
    }
    return event.title;
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
          const todayStyle = isToday
            ? {
                color: theme?.today?.color,
                backgroundColor: theme?.today?.bgColor,
              }
            : undefined;

          return (
            <div
              key={dateKey}
              className={cx(styles.dateGroup, classNames?.scheduleDateGroup)}
            >
              {dayEvents.map((event, index) => {
                const eventColor =
                  event.color || CALENDAR_CONSTANTS.DEFAULT_EVENT_COLOR;

                const isFirstEventOfDay = index === 0;

                return (
                  <div
                    key={event.id || index}
                    className={cx(styles.eventItemContainer, classNames?.event)}
                    onClick={() => onEventClick?.(event)}
                    title={generateTooltipText(
                      event,
                      ECalendarViewType.schedule,
                      is12Hour,
                    )}
                  >
                    {/* Column 1: Date Info (only shown on the first event of the day) */}
                    <div className={styles.dateInfoColumn}>
                      {isFirstEventOfDay && (
                        <>
                          <div
                            className={cx(
                              styles.dateNumber,
                              classNames?.scheduleDateNumber,
                              {
                                [styles.today]: isToday,
                              },
                            )}
                            style={todayStyle}
                          >
                            {formatDate(dateObj, DATE_FORMATS.DAY_NUMBER)}
                          </div>
                          <div
                            className={cx(
                              styles.dateSubInfo,
                              classNames?.scheduleDateSubInfo,
                            )}
                          >
                            {formatDate(
                              dateObj,
                              DATE_FORMATS.SHORT_MONTH,
                            ).toUpperCase()}
                            ,{" "}
                            {formatDate(
                              dateObj,
                              DATE_FORMATS.SHORT_DAY,
                            ).toUpperCase()}
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
                      <div
                        className={cx(
                          styles.eventTime,
                          classNames?.scheduleTime,
                        )}
                      >
                        {renderEventTime(event)}
                      </div>
                    </div>

                    {/* Column 3: Title */}
                    <div
                      className={cx(
                        styles.eventTitleColumn,
                        classNames?.scheduleTitle,
                      )}
                    >
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
