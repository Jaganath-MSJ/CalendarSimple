import React from "react";
import cx from "classnames";
import { DateDataType } from "../types";
import { dateFn } from "../utils";
import styles from "./EventItem.module.css";
import Popover from "./Popover";

function EventItem({
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
  maxEvents = 3, // Default limit
  onMoreClick,
  onEventClick,
  totalEvents = 0,
}: DateDataType) {
  const [showPopover, setShowPopover] = React.useState(false);

  const styleSource = isSelected
    ? theme?.selected
    : isToday
      ? theme?.today
      : theme?.default;

  const style = {
    color: styleSource?.color,
    backgroundColor: styleSource?.bgColor,
  };

  // Determine which items to display
  let visibleEvents = data;
  let hiddenEventsCount = 0;

  if (
    maxEvents &&
    data &&
    (totalEvents >= maxEvents || data.length > maxEvents)
  ) {
    visibleEvents = data.slice(0, maxEvents);

    const visibleRealEventsCount = visibleEvents.filter(
      (e) => e !== null,
    ).length;
    hiddenEventsCount = totalEvents - visibleRealEventsCount;
  }

  const allDayEvents = data?.filter((e) => e !== null) || [];

  return (
    <td
      style={style}
      onClick={() => onClick?.(dateObj)}
      className={cx(styles.dateData, className, {
        [styles.currentMonth]: isCurrentMonth,
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
              let tooltipText = dateFn(item.startDate).format("YYYY-MM-DD");
              if (item.endDateWeek) {
                diffDates =
                  dateFn(item.endDateWeek).diff(item.startDateWeek, "days") + 1;
                tooltipText += ` to ${dateFn(item.endDate).format("YYYY-MM-DD")}`;
              }
              tooltipText += ` - ${item.value}`;
              const width = `${cellWidth * diffDates - 16}px`;

              return (
                <div
                  key={`${item.startDate}-${index}`}
                  className={styles.eventItem}
                  style={{ width }}
                  title={tooltipText}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(item);
                  }}
                >
                  {item.value}
                </div>
              );
            })}
            {hiddenEventsCount > 0 && (
              <div className={styles.moreEventsContainer}>
                <button
                  className={styles.moreEvents}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPopover(true);
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

export default EventItem;
