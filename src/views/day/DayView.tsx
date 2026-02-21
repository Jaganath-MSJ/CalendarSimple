import React, { useMemo } from "react";
import { formatDate, calculateEventLayout } from "../../utils";
import { DataType } from "../../types";
import styles from "./DayView.module.css";
import { useCalendar } from "../../context/CalendarContext";
import TimeColumn from "../../common/time_column/TimeColumn";
import DayColumn from "../../common/day_column/DayColumn";

interface DayViewProps {
  events: DataType[];
  onEventClick?: (event: DataType) => void;
}

function DayView({ events, onEventClick }: DayViewProps) {
  const { state } = useCalendar();
  const { currentDate } = state;
  const dayEvents = useMemo(
    () => calculateEventLayout(events, currentDate),
    [events, currentDate],
  );

  return (
    <div className={styles.dayView}>
      <div className={styles.dayHeader}>
        {formatDate(currentDate, "dddd, MMMM D, YYYY")}
      </div>
      <div className={styles.timeGrid}>
        <TimeColumn />
        <div className={styles.eventsColumn}>
          <DayColumn dayEvents={dayEvents} onEventClick={onEventClick} />
        </div>
      </div>
    </div>
  );
}

export default DayView;
