import React from "react";
import cx from "classnames";
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
> {
  dayEvents: DayEventLayout[];
  isToday?: boolean;
}

function DayColumn({
  dayEvents,
  onEventClick,
  is12Hour,
  classNames,
  isToday,
  showCurrentTime,
  minHour,
  maxHour,
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
          className={cx(styles.eventSlot, classNames?.timeSlot)}
        />
      ))}
      {dayEvents.map((item, index) => (
        <DayWeekEventItem
          key={item.event.id || index}
          item={item}
          onEventClick={onEventClick}
          is12Hour={is12Hour}
          classNames={classNames}
        />
      ))}
      {isToday && showCurrentTime && (
        <CurrentTimeLine minHour={minHour} maxHour={maxHour} />
      )}
    </>
  );
}

export default DayColumn;
