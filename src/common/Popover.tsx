import React, { useRef, useEffect } from "react";
import cx from "classnames";
import styles from "./Popover.module.css";
import { dateFn, DateType } from "../utils";
import { DataTypeList } from "../types";

interface PopoverProps {
  dateObj: DateType;
  events: DataTypeList[];
  onEventClick?: (data: DataTypeList) => void;
  onClose: () => void;
}

function Popover({ dateObj, events, onEventClick, onClose }: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      className={styles.popover}
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.popoverHeader}>
        {dateFn(dateObj).format("ddd, D MMM")}
      </div>
      {events.map((item, idx) => {
        const dayStart = dateFn(dateObj).startOf("day");
        const eventStart = dateFn(item.startDate).startOf("day");
        const eventEnd = item.endDate
          ? dateFn(item.endDate).startOf("day")
          : eventStart;

        const isStartBefore = eventStart.isBefore(dayStart, "day");
        const isEndAfter = eventEnd.isAfter(dayStart, "day");

        return (
          <div
            key={`pop-${idx}`}
            className={cx(styles.popoverItem, {
              [styles.startBefore]: isStartBefore,
              [styles.endAfter]: isEndAfter,
            })}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick?.(item);
              onClose();
            }}
            title={item.value}
          >
            {item.value}
          </div>
        );
      })}
    </div>
  );
}

export default Popover;
