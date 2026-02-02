import React from "react";
import cx from "classnames";
import { DateDataType } from "./Calendar.type";
import { date as dateFn } from "./Calendar.utils";
import styles from "./DateData.module.css";

function DateData(props: DateDataType) {
  const {
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
  } = props;

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

  if (maxEvents && data && data.length > maxEvents) {
    visibleEvents = data.slice(0, maxEvents - 1);
    // Count real events (not null spacers) in the hidden portion
    const remainingEvents = data.slice(maxEvents - 1);
    // For the remaining items, we only care about real events for the count
    // But since the data array includes spacers (nulls) for positioning,
    // simply checking length might be misleading if they are just spacers.
    // However, in month view logic, spacers are only inserted if there's an event *somewhere* in that slot.
    // A simplified approach is just:
    hiddenEventsCount = data.length - (maxEvents - 1);
  }

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
              if (!item) {
                return (
                  <div key={`spacer-${index}`} className={styles.spacer} />
                );
              }

              const diffDates = item.endDateWeek
                ? dateFn(item.endDateWeek).diff(item.startDateWeek, "days") + 1
                : 1;
              const tooltipText = `${dateFn(item.startDate).format("YYYY-MM-DD")} - ${item.value}`;
              const width = `${cellWidth * diffDates - 16}px`;

              return (
                <div
                  key={`${item.startDate}-${index}`}
                  className={styles.eventItem}
                  style={{ width }}
                  title={tooltipText}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle range selection or event click
                  }}
                >
                  {item.value}
                </div>
              );
            })}
            {hiddenEventsCount > 0 && (
              <div
                className={styles.moreEvents}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoreClick?.(dateObj); // Or expand logic
                }}
              >
                + {hiddenEventsCount} more
              </div>
            )}
          </div>
        )}
      </div>
    </td>
  );
}

export default DateData;
