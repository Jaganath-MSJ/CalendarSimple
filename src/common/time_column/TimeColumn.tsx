import React from "react";
import { dateFn, formatDate } from "../../utils";
import { DATE_FORMATS } from "../../constants";
import styles from "./TimeColumn.module.css";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function TimeColumn() {
  return (
    <div className={styles.timeColumn}>
      {HOURS.map((hour) => (
        <div key={hour} className={styles.timeSlot}>
          {formatDate(dateFn().hour(hour).minute(0), DATE_FORMATS.TIME)}
        </div>
      ))}
    </div>
  );
}

export default TimeColumn;
