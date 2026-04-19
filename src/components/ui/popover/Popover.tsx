import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  CSSProperties,
} from "react";
import cx from "classnames";
import { createPortal } from "react-dom";
import styles from "./Popover.module.css";
import {
  DateType,
  formatDate,
  getStartOfDay,
  isBeforeDate,
  isAfterDate,
  generateTooltipText,
  getContrastColor,
} from "../../../utils";
import {
  CalendarContentProps,
  ECalendarViewType,
  EventListType,
} from "../../../types";
import { DATE_FORMATS, LAYOUT_CONSTANTS } from "../../../constants";
import { useCalendar } from "../../../context/CalendarContext";
import { handleKeyboardActivation } from "../../../utils/keyboard";

interface PopoverProps extends Pick<
  CalendarContentProps,
  "onEventClick" | "is12Hour" | "renderEvent"
> {
  dateObj: DateType;
  events: EventListType[];
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

function Popover({
  dateObj,
  events,
  onEventClick,
  onClose,
  anchorEl,
  is12Hour,
  renderEvent,
}: PopoverProps) {
  const { testId } = useCalendar();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [stylePosition, setStylePosition] = useState<CSSProperties>({
    visibility: "hidden",
  });

  const handleClose = useCallback(() => {
    onClose();
    requestAnimationFrame(() => {
      (anchorEl as HTMLElement | null)?.focus();
    });
  }, [onClose, anchorEl]);

  useLayoutEffect(() => {
    if (popoverRef.current && anchorEl) {
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const anchorRect = anchorEl.getBoundingClientRect();
      const PADDING = 10;

      // Base position: bottom-left of the anchor
      const top = anchorRect.bottom + 4; // 4px gap
      let left = anchorRect.left;

      // Available space in viewport
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const spaceBelow = viewportHeight - top;
      const spaceAbove = anchorRect.top - PADDING;

      const newStyle: CSSProperties = {
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
        handleClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClose]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const firstItem = popoverRef.current?.querySelector<HTMLElement>(
        '[role="button"], button, [tabindex="0"]',
      );
      firstItem?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handlePopoverKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      handleClose();
      return;
    }
    if (e.key === "Tab") {
      const focusable = Array.from(
        popoverRef.current?.querySelectorAll<HTMLElement>(
          '[role="button"], button, [tabindex="0"]',
        ) ?? [],
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Events on ${formatDate(dateObj, DATE_FORMATS.DAY_DATE_SHORT_MONTH)}`}
      className={styles.popover}
      ref={popoverRef}
      style={stylePosition}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handlePopoverKeyDown}
      data-testid={`${testId}-popover-content`}
    >
      <div className={styles.popoverHeader}>
        {formatDate(dateObj, DATE_FORMATS.DAY_DATE_SHORT_MONTH)}
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
          const tooltipText = generateTooltipText(
            item,
            ECalendarViewType.month,
            is12Hour,
          );

          const eventBgColor =
            item.style?.backgroundColor || LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR;
          const textColor = getContrastColor(String(eventBgColor));

          return (
            <div
              key={item.id || `pop-${idx}`}
              role="button"
              tabIndex={0}
              className={cx(styles.popoverItem, {
                [styles.startBefore]: isStartBefore,
                [styles.endAfter]: isEndAfter,
              })}
              id={item.id}
              data-testid={`${testId}-${item.id}-popover-item`}
              style={{
                backgroundColor: LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR,
                color: textColor,
                ...item.style,
              }}
              aria-label={tooltipText}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick?.(item);
                handleClose();
              }}
              onKeyDown={handleKeyboardActivation(() => {
                onEventClick?.(item);
                handleClose();
              })}
              title={tooltipText}
            >
              {renderEvent ? renderEvent(item) : item.title}
            </div>
          );
        })}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default Popover;
