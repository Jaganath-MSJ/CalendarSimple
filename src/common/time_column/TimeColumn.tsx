import React from "react";
import cx from "classnames";
import { dateFn, formatDate } from "../../utils";
import { DATE_FORMATS } from "../../constants";
import styles from "./TimeColumn.module.css";
import { CalendarContentProps } from "../../types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface TimeColumnProps extends Pick<
  CalendarContentProps,
  "is12Hour" | "classNames"
> {}

function TimeColumn({ is12Hour, classNames }: TimeColumnProps) {
  return (
    <div className={cx(styles.timeColumn, classNames?.timeColumn)}>
      {HOURS.map((hour) => {
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
