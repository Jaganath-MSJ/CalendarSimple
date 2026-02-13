import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
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
  const [stylePosition, setStylePosition] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (popoverRef.current) {
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;

      const spaceAbove = popoverRect.top;
      const spaceBelow = screenHeight - popoverRect.bottom;

      const PADDING = 10;
      let newStyle: React.CSSProperties = {};

      // Horizontal Check
      // If the popover goes beyond the right edge of the screen
      if (popoverRect.right > screenWidth - PADDING) {
        newStyle.left = "auto";
        newStyle.right = 0;
      }

      // Vertical Check
      // Check if the popover overflows the bottom
      if (popoverRect.bottom > screenHeight - PADDING) {
        const height = popoverRect.height;

        // If (spaceBelow < popoverHeight) AND (spaceAbove > spaceBelow), then flip to top
        if (spaceBelow < height && spaceAbove > spaceBelow) {
          const maxHeight = Math.min(height, spaceAbove - PADDING);
          newStyle.top = "auto";
          newStyle.bottom = "calc(100% + 4px)";
          newStyle.maxHeight = `${maxHeight}px`;
        } else {
          // Stick to bottom but cap the height
          const maxHeight = Math.min(height, spaceBelow - PADDING);
          newStyle.maxHeight = `${maxHeight}px`;
        }
      }

      // Only update state if we have changes to avoid unnecessary re-renders
      if (Object.keys(newStyle).length > 0) {
        setStylePosition(newStyle);
      }
    }
  }, []); // Run once on mount to position

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
      style={stylePosition}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.popoverHeader}>
        {dateFn(dateObj).format("ddd, D MMM")}
      </div>
      <div className={styles.popoverContent}>
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
              style={{ backgroundColor: item.color }}
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
    </div>
  );
}

export default Popover;
