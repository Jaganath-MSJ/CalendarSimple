import React from "react";
import cx from "classnames";
import { CalendarContentProps, ECalendarViewType } from "../../../types";
import {
  formatDate,
  dateFn,
  checkIsToday,
  generateTooltipText,
} from "../../../utils";
import styles from "./ScheduleView.module.css";
import { DATE_FORMATS, CALENDAR_CONSTANTS } from "../../../constants";
import useScheduleView from "../../../hooks/useScheduleView";

interface ScheduleViewProps extends Pick<
  CalendarContentProps,
  | "events"
  | "is12Hour"
  | "dayType"
  | "onEventClick"
  | "theme"
  | "classNames"
  | "autoScrollToCurrentTime"
> {}

export default function ScheduleView({
  events,
  onEventClick,
  is12Hour,
  theme,
  classNames,
  autoScrollToCurrentTime,
}: ScheduleViewProps) {
  const { todayRef, groupedEvents, renderEventTime, renderEventTitle } =
    useScheduleView({
      events,
      autoScrollToCurrentTime,
      is12Hour,
    });

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
                ref={isToday ? todayRef : undefined}
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
