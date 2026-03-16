import React from "react";
import cx from "classnames";
import { dateFn, formatDate } from "../../../utils";
import { DATE_FORMATS } from "../../../constants";
import styles from "./TimeColumn.module.css";
import { CalendarContentProps } from "../../../types";

interface TimeColumnProps extends Pick<
  CalendarContentProps,
  "is12Hour" | "classNames" | "minHour" | "maxHour"
> {}

function TimeColumn({
  is12Hour,
  classNames,
  minHour,
  maxHour,
}: TimeColumnProps) {
  const hours = Array.from(
    { length: maxHour - minHour },
    (_, i) => i + minHour,
  );

  return (
    <div className={cx(styles.timeColumn, classNames?.timeColumn)}>
      {hours.map((hour) => {
        const timeFormat = is12Hour ? DATE_FORMATS.HOUR_12H : DATE_FORMATS.TIME;
        return (
          <div key={hour} className={cx(styles.timeSlot, classNames?.timeSlot)}>
            {formatDate(dateFn().hour(hour).minute(0), timeFormat)}
          </div>
        );
      })}
    </div>
  );
}

export default TimeColumn;
