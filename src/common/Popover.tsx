import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  CSSProperties,
} from "react";
import cx from "classnames";
import styles from "./Popover.module.css";
import {
  DateType,
  formatDate,
  getStartOfDay,
  isBeforeDate,
  isAfterDate,
} from "../utils";
import { CalendarType, DataTypeList, DateDataType } from "../types";

interface PopoverProps {
  dateObj: DateType;
  events: DataTypeList[];
  onEventClick?: CalendarType["onEventClick"];
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

function Popover({
  dateObj,
  events,
  onEventClick,
  onClose,
  anchorEl,
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [stylePosition, setStylePosition] = useState<CSSProperties>({
    visibility: "hidden",
  });

  useLayoutEffect(() => {
    if (popoverRef.current && anchorEl) {
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const anchorRect = anchorEl.getBoundingClientRect();
      const PADDING = 10;

      // Base position: bottom-left of the anchor
      let top = anchorRect.bottom + 4; // 4px gap
      let left = anchorRect.left;

      // Available space in viewport
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const spaceBelow = viewportHeight - top;
      const spaceAbove = anchorRect.top - PADDING;

      let newStyle: CSSProperties = {
        visibility: "visible",
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: "220px", // Fixed width to prevent resizing
      };

      // Horizontal Check (Viewport)
      if (left + popoverRect.width > viewportWidth - PADDING) {
        // Align to right edge of viewport if it overflows
        left = viewportWidth - popoverRect.width - PADDING;
        newStyle.left = `${left}px`;
      }

      // Vertical Check (Viewport)
      if (top + popoverRect.height > viewportHeight - PADDING) {
        const height = popoverRect.height;

        // Flip to top if not enough space below but enough above
        if (spaceBelow < height && spaceAbove > spaceBelow) {
          const maxHeight = Math.min(height, spaceAbove);
          newStyle.top = "auto";
          newStyle.bottom = `${viewportHeight - anchorRect.top + 4}px`;
          newStyle.maxHeight = `${maxHeight}px`;
        } else {
          // Cap height at bottom
          const maxHeight = Math.min(height, spaceBelow - PADDING);
          newStyle.maxHeight = `${maxHeight}px`;
        }
      }

      setStylePosition(newStyle);
    }
  }, [anchorEl]);

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
        {formatDate(dateObj, "ddd, D MMM")}
      </div>
      <div className={styles.popoverContent}>
        {events.map((item, idx) => {
          const dayStart = getStartOfDay(dateObj);
          const eventStart = getStartOfDay(item.startDate);
          const eventEnd = item.endDate
            ? getStartOfDay(item.endDate)
            : eventStart;

          const isStartBefore = isBeforeDate(eventStart, dayStart);
          const isEndAfter = isAfterDate(eventEnd, dayStart);

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
