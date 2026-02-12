import React from "react";
import cx from "classnames";
import { DataTypeList, DateDataType } from "../types";
import { dateFn } from "../utils";
import styles from "./EventItem.module.css";
import Popover from "./Popover";
import { CALENDAR_CONSTANTS, defaultTheme } from "../constants";

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
  maxEvents,
  onMoreClick,
  onEventClick,
  totalEvents = 0,
}: DateDataType) {
  const [showPopover, setShowPopover] = React.useState(false);

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

  const allDayEvents: DataTypeList[] =
    data?.filter((e): e is DataTypeList => e !== null) || [];

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
              let tooltipText = dateFn(item.startDate).format("YYYY-MM-DD");
              if (item.endDateWeek) {
                diffDates =
                  dateFn(item.endDateWeek).diff(item.startDateWeek, "days") + 1;
              }
              if (item.endDate) {
                tooltipText += ` to ${dateFn(item.endDate).format("YYYY-MM-DD")}`;
              }
              tooltipText += ` - ${item.value}`;
              const width = `${cellWidth * diffDates - CALENDAR_CONSTANTS.EVENT_ITEM_PADDING}px`;

              return (
                <div
                  key={`${item.startDate}-${index}`}
                  className={styles.eventItem}
                  style={{ width, backgroundColor: item.color }}
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
