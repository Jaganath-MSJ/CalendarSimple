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
    totalEvents = 0,
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

  if (
    maxEvents &&
    data &&
    (totalEvents >= maxEvents || data.length > maxEvents)
  ) {
    visibleEvents = data.slice(0, maxEvents);

    // Calculate how many events are actually shown (excluding empty spacers being used for alignment)
    // Wait, spacers occupy a slot. So 1 slot = 1 event (rendered or invisible).
    // The previous logic counted remaining non-nulls.
    // New logic: totalEvents - (events consumed by visible slots).
    // But visible slots might contain nulls (alignment holes).
    // We only care about events *represented* in visible slots.
    // If visibleEvents[0] is E. That's 1 event.
    // If visibleEvents[0] is null. That's 0 events.

    const visibleRealEventsCount = visibleEvents.filter(
      (e) => e !== null,
    ).length;
    hiddenEventsCount = totalEvents - visibleRealEventsCount;
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
              if (!item || item.isSpacer) {
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
