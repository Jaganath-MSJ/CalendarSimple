import React from "react";
import { DataType } from "../../types";
import { DayEventLayout } from "../../utils/eventLayout";
import { DayWeekEventItem } from "../day_event_item/DayWeekEventItem";
import styles from "./DayColumn.module.css";

interface DayColumnProps {
  dayEvents: DayEventLayout[];
  onEventClick?: (event: DataType) => void;
  is12Hour?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function DayColumn({ dayEvents, onEventClick, is12Hour }: DayColumnProps) {
  return (
    <>
      {HOURS.map((hour) => (
        <div key={hour} className={styles.eventSlot} />
      ))}
      {dayEvents.map((item, index) => (
        <DayWeekEventItem
          key={index}
          item={item}
          onEventClick={onEventClick}
          is12Hour={is12Hour}
        />
      ))}
    </>
  );
}

export default DayColumn;
