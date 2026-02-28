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
  isAllDayEvent,
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
      // Group by every date the event spans
      let current = dateFn(event.startDate).startOf("day");
      const end = event.endDate
        ? dateFn(event.endDate).startOf("day")
        : current;

      while (current.isBefore(end) || current.isSame(end)) {
        const dateKey = formatDate(current, DATE_FORMATS.DATE);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(event);
        current = current.add(1, "day");
      }
    });

    return groups;
  }, [events]);

  const renderEventTime = (event: CalendarEvent, dateKey: string) => {
    if (isAllDayEvent(event)) {
      return "All day";
    }

    const currentDay = dateFn(dateKey).startOf("day");
    const startDay = dateFn(event.startDate).startOf("day");
    const endDay = event.endDate
      ? dateFn(event.endDate).startOf("day")
      : startDay;
    const isMultiDay = !startDay.isSame(endDay);

    const timeFormat = is12Hour ? DATE_FORMATS.TIME_12H : DATE_FORMATS.TIME;
    const formatTime = (t: string) => t.replace(/^0/, "").replace(":00", " ");

    const isMidnight = (d: string) =>
      dateFn(d).hour() === 0 && dateFn(d).minute() === 0;
    const isEndOfDay = (d: string) =>
      dateFn(d).hour() === 23 && dateFn(d).minute() === 59;

    if (isMultiDay) {
      if (currentDay.isSame(startDay)) {
        return isMidnight(event.startDate)
          ? "All day"
          : `${formatTime(formatDate(event.startDate, timeFormat))}`;
      } else if (currentDay.isSame(endDay)) {
        return isEndOfDay(event.endDate!)
          ? "All day"
          : `Until ${formatTime(formatDate(event.endDate!, timeFormat))}`;
      } else {
        return "All day";
      }
    }

    // Normal single day time range
    const startStr = formatDate(event.startDate, timeFormat);
    if (event.endDate) {
      if (isMidnight(event.startDate) && isEndOfDay(event.endDate)) {
        return "All day";
      }
      const endStr = formatDate(event.endDate, timeFormat);
      return `${formatTime(startStr)} – ${formatTime(endStr)}`;
    }
    return formatTime(startStr);
  };

  const renderEventTitle = (event: CalendarEvent, dateKey: string) => {
    if (
      event.endDate &&
      !isSameDate(dateFn(event.startDate), dateFn(event.endDate))
    ) {
      const currentDay = dateFn(dateKey).startOf("day");
      const startDay = dateFn(event.startDate).startOf("day");
      const dayIndex = getDiffDays(currentDay, startDay) + 1;
      const totalDays = getDiffDays(event.endDate, event.startDate) + 1;
      return `${event.title} (Day ${dayIndex}/${totalDays})`;
    }
    return event.title;
  };

  return (
    <div className={styles.scheduleView}>
      {Object.keys(groupedEvents).length === 0 ? (
        <div className={styles.emptyState}>No events to display</div>
      ) : (
        Object.keys(groupedEvents)
          .sort()
          .map((dateKey) => {
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
                      className={cx(
                        styles.eventItemContainer,
                        classNames?.event,
                      )}
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
                          {renderEventTime(event, dateKey)}
                        </div>
                      </div>

                      {/* Column 3: Title */}
                      <div
                        className={cx(
                          styles.eventTitleColumn,
                          classNames?.scheduleTitle,
                        )}
                      >
                        {renderEventTitle(event, dateKey)}
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
