import React, { useRef, useEffect } from "react";
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
      {events.map((item, idx) => (
        <div
          key={`pop-${idx}`}
          className={styles.popoverItem}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick?.(item);
            onClose();
          }}
          title={item.value}
        >
          {item.value}
        </div>
      ))}
    </div>
  );
}

export default Popover;
