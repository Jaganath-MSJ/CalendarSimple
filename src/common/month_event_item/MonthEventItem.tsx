import React, { useState, useRef } from "react";
import cx from "classnames";
import {
  CalendarContentProps,
  EventListType,
  ECalendarViewType,
} from "../../types";
import { getDiffDays, generateTooltipText, DateType } from "../../utils";
import styles from "./MonthEventItem.module.css";
import Popover from "../popover/Popover";
import { CALENDAR_CONSTANTS, defaultTheme } from "../../constants";

interface MonthEventItemProps extends Pick<
  CalendarContentProps,
  "onEventClick" | "theme" | "maxEvents" | "is12Hour"
> {
  dataClassName?: string;
  selectedClassName?: string;
  todayClassName?: string;
  date: number;
  dateObj: DateType;
  data: (EventListType | null)[];
  cellWidth: number;
  className?: string;
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  onClick?: (date: DateType) => void;
  onMoreClick?: (date: DateType) => void;
  totalEvents?: number;
}

function MonthEventItem({
  date,
  dateObj,
  data,
  cellWidth,
  className,
  dataClassName,
  isSelected,
  isToday,
  onClick,
  selectedClassName,
  todayClassName,
  isCurrentMonth,
  theme,
  maxEvents,
  onMoreClick,
  onEventClick,
  totalEvents = 0,
  is12Hour,
}: MonthEventItemProps) {
  const [showPopover, setShowPopover] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const styleSource = isSelected
    ? { ...defaultTheme.selected, ...theme?.selected }
    : isToday
      ? { ...defaultTheme.today, ...theme?.today }
      : { ...defaultTheme.default, ...theme?.default };

  const style = {
    color: styleSource?.color,
    backgroundColor: styleSource?.bgColor,
  };

  // Determine which items to display
  let visibleEvents = data;
  let hiddenEventsCount = 0;

  if (
    (maxEvents || maxEvents === 0) &&
    data &&
    (totalEvents >= maxEvents || data.length > maxEvents)
  ) {
    visibleEvents = data.slice(0, maxEvents);

    const visibleRealEventsCount = visibleEvents.filter(
      (e) => e !== null,
    ).length;
    hiddenEventsCount = totalEvents - visibleRealEventsCount;
  }

  const allDayEvents: EventListType[] =
    data?.filter((e): e is EventListType => e !== null) || [];

  return (
    <td
      style={style}
      onClick={() => onClick?.(dateObj)}
      className={cx(styles.dateData, className, {
        [styles.currentMonth]: !isCurrentMonth,
        [cx(styles.selected, selectedClassName)]: isSelected,
        [cx(styles.today, todayClassName)]: isToday,
      })}
    >
      <div className={styles.cellContent}>
        <p className={styles.dateLabel}>{date}</p>

        {data && (
          <div className={cx(styles.dataContainer, dataClassName)}>
            {visibleEvents.map((item, index) => {
              if (!item || item.isSpacer) {
                return (
                  <div key={`spacer-${index}`} className={styles.spacer} />
                );
              }

              let diffDates = 1;
              if (item.endDateWeek) {
                diffDates =
                  getDiffDays(item.endDateWeek, item.startDateWeek) + 1;
              }
              const tooltipText = generateTooltipText(
                item,
                ECalendarViewType.month,
                is12Hour,
              );
              const width = `${cellWidth * diffDates - CALENDAR_CONSTANTS.EVENT_ITEM_PADDING}px`;

              return (
                <div
                  key={item.id || `${item.startDate}-${index}`}
                  className={styles.eventItem}
                  id={item.id}
                  style={{ width, backgroundColor: item.color }}
                  title={tooltipText}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(item);
                  }}
                >
                  {item.title}
                </div>
              );
            })}
            {hiddenEventsCount > 0 && (
              <div className={styles.moreEventsContainer}>
                <button
                  ref={moreButtonRef}
                  className={styles.moreEvents}
                  onClick={(e) => {
                    e.stopPropagation();
                    !showPopover && setShowPopover(true);
                    onMoreClick?.(dateObj);
                  }}
                >
                  + {hiddenEventsCount} more
                </button>
                {showPopover && (
                  <Popover
                    dateObj={dateObj}
                    events={allDayEvents}
                    onEventClick={onEventClick}
                    onClose={() => setShowPopover(false)}
                    anchorEl={moreButtonRef.current}
                    is12Hour={is12Hour}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </td>
  );
}

export default MonthEventItem;
