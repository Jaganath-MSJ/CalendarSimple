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
import { DATE_FORMATS, LAYOUT_CONSTANTS } from "../../../constants";
import useScheduleView from "../../../hooks/useScheduleView";
import { useCalendar } from "../../../context/CalendarContext";

interface ScheduleViewProps extends Pick<
  CalendarContentProps,
  | "events"
  | "is12Hour"
  | "dayType"
  | "onEventClick"
  | "theme"
  | "classNames"
  | "autoScrollToCurrentTime"
  | "renderEvent"
  | "renderScheduleSeparator"
  | "locale"
> {}

export default function ScheduleView({
  events,
  onEventClick,
  is12Hour,
  theme,
  classNames,
  autoScrollToCurrentTime,
  renderEvent,
  renderScheduleSeparator,
  locale,
}: ScheduleViewProps) {
  const { testId } = useCalendar();
  const { todayRef, groupedEvents, renderEventTime, renderEventTitle } =
    useScheduleView({
      events,
      autoScrollToCurrentTime,
      is12Hour,
      locale,
    });

  return (
    <div
      className={styles.scheduleView}
      data-testid={`${testId}-schedule-view`}
    >
      {Object.keys(groupedEvents).length === 0 ? (
        <div className={styles.emptyState}>No events to display</div>
      ) : (
        Object.keys(groupedEvents)
          .sort()
          .map((dateKey, groupIndex, allKeys) => {
            const dayEvents = groupedEvents[dateKey];
            const dateObj = dateFn(dateKey);
            const isLastGroup = groupIndex === allKeys.length - 1;

            const isToday = checkIsToday(dateObj, dateObj.day);
            const todayStyle = isToday
              ? {
                  color: theme?.today?.color,
                  backgroundColor: theme?.today?.bgColor,
                }
              : undefined;

            return (
              <React.Fragment key={dateKey}>
                <div
                  ref={isToday ? todayRef : undefined}
                  className={cx(
                    styles.dateGroup,
                    classNames?.scheduleDateGroup,
                    {
                      [styles.noBorder]: !!renderScheduleSeparator,
                    },
                  )}
                >
                  {dayEvents.map((event, index) => {
                    const isFirstEventOfDay = index === 0;

                    return (
                      <div
                        key={event.id || index}
                        className={cx(
                          styles.eventItemContainer,
                          classNames?.event,
                        )}
                        data-testid={`${testId}-${event.id}-schedule-event`}
                        onClick={() => onEventClick?.(event)}
                        title={generateTooltipText(
                          event,
                          ECalendarViewType.schedule,
                          is12Hour,
                          locale,
                        )}
                      >
                        {/* Column 1: Date Info (only shown on the first event of the day) */}
                        <div
                          className={styles.dateInfoColumn}
                          data-testid={`${testId}-date-info`}
                        >
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
                                {formatDate(
                                  dateObj,
                                  DATE_FORMATS.DAY_NUMBER,
                                  locale,
                                )}
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
                                  locale,
                                ).toUpperCase()}
                                ,{" "}
                                {formatDate(
                                  dateObj,
                                  DATE_FORMATS.SHORT_DAY,
                                  locale,
                                ).toUpperCase()}
                              </div>
                            </>
                          )}
                        </div>

                        {renderEvent ? (
                          renderEvent(event)
                        ) : (
                          <>
                            {/* Column 2: Dot + Time */}
                            <div className={styles.dotTimeColumn}>
                              <div
                                className={styles.eventDot}
                                style={{
                                  backgroundColor:
                                    event.style?.backgroundColor ||
                                    LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR,
                                }}
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
                              style={{
                                ...event.style,
                                backgroundColor: "transparent",
                              }}
                            >
                              {renderEventTitle(event, dateKey)}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!isLastGroup &&
                  renderScheduleSeparator &&
                  renderScheduleSeparator(dateObj.toJSDate())}
              </React.Fragment>
            );
          })
      )}
    </div>
  );
}
