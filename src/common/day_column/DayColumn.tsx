import React from "react";
import cx from "classnames";
import { CalendarContentProps } from "../../types";
import { DayEventLayout } from "../../utils/eventLayout";
import { DayWeekEventItem } from "../day_event_item/DayWeekEventItem";
import CurrentTimeLine from "../current_time_line/CurrentTimeLine";
import styles from "./DayColumn.module.css";

interface DayColumnProps extends Pick<
  CalendarContentProps,
  "onEventClick" | "is12Hour" | "classNames" | "showCurrentTime"
> {
  dayEvents: DayEventLayout[];
  isToday?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function DayColumn({
  dayEvents,
  onEventClick,
  is12Hour,
  classNames,
  isToday,
  showCurrentTime,
}: DayColumnProps) {
  return (
    <>
      {HOURS.map((hour) => (
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
      {isToday && showCurrentTime && <CurrentTimeLine />}
    </>
  );
}

export default DayColumn;
