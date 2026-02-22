import React from "react";
import { dateFn, formatDate } from "../../utils";
import { DATE_FORMATS } from "../../constants";
import styles from "./TimeColumn.module.css";
import { CalendarContentType } from "../../types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface TimeColumnProps extends Pick<CalendarContentType, "is12Hour"> {}

function TimeColumn({ is12Hour }: TimeColumnProps) {
  return (
    <div className={styles.timeColumn}>
      {HOURS.map((hour) => {
        const timeFormat = is12Hour ? DATE_FORMATS.TIME_12H : DATE_FORMATS.TIME;
        return (
          <div key={hour} className={styles.timeSlot}>
            {formatDate(dateFn().hour(hour).minute(0), timeFormat)}
          </div>
        );
      })}
    </div>
  );
}

export default TimeColumn;
