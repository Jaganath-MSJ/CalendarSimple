import React from "react";
import cx from "classnames";
import { DateTime } from "luxon";
import { CalendarContentProps } from "../../../types";
import { DayEventLayout } from "../../../hooks/useDayEventLayout";
import { DayWeekEventItem } from "../day_event_item/DayWeekEventItem";
import CurrentTimeLine from "../current_time_line/CurrentTimeLine";
import styles from "./DayColumn.module.css";

interface DayColumnProps extends Pick<
  CalendarContentProps,
  | "onEventClick"
  | "is12Hour"
  | "classNames"
  | "showCurrentTime"
  | "minHour"
  | "maxHour"
  | "renderEvent"
  | "renderHourCell"
  | "creatable"
  | "onSlotClick"
> {
  dayEvents: DayEventLayout[];
  date: DateTime;
  isToday?: boolean;
}

function DayColumn({
  dayEvents,
  date,
  onEventClick,
  is12Hour,
  classNames,
  isToday,
  showCurrentTime,
  minHour,
  maxHour,
  renderEvent,
  renderHourCell,
  creatable,
  onSlotClick,
}: DayColumnProps) {
  const hours = Array.from(
    { length: maxHour - minHour },
    (_, i) => i + minHour,
  );

  return (
    <>
      {hours.map((hour) => (
        <div
          key={hour}
          className={cx(styles.eventSlot, classNames?.timeSlot, {
            [styles.creatable]: creatable,
          })}
          onClick={
            creatable && onSlotClick
              ? () => {
                  const start = date.set({
                    hour,
                    minute: 0,
                    second: 0,
                    millisecond: 0,
                  });
                  onSlotClick(
                    start.toJSDate(),
                    start.plus({ hours: 1 }).toJSDate(),
                  );
                }
              : undefined
          }
        >
          {renderHourCell?.(new Date(new Date().setHours(hour, 0, 0, 0)))}
        </div>
      ))}
      {dayEvents.map((item, index) => (
        <DayWeekEventItem
          key={item.event.id || index}
          item={item}
          onEventClick={onEventClick}
          is12Hour={is12Hour}
          classNames={classNames}
          renderEvent={renderEvent}
        />
      ))}
      {isToday && showCurrentTime && (
        <CurrentTimeLine minHour={minHour} maxHour={maxHour} />
      )}
    </>
  );
}

export default DayColumn;
