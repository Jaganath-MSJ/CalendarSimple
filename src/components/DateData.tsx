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
        {/* {data && <div className={dataClassName}>{data}</div>} */}
        {data && (
          <div className={cx(styles.dataContainer, dataClassName)}>
            {data.map((item, index) => {
              if (!item) {
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
              const width = `${cellWidth * diffDates - 16}px`;
              tooltipText += ` - ${item.value}`;

              return (
                <div
                  key={`${item.startDate}-${index}`}
                  className={styles.eventItem}
                  style={{ width }}
                  title={tooltipText}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!onClick) return;

                    const clickOffset = e.nativeEvent.offsetX;
                    const dayIndex = Math.floor(clickOffset / cellWidth);
                    const startDate = item.startDateWeek || item.startDate;
                    const targetDate = dateFn(startDate).add(dayIndex, "day");

                    onClick(targetDate);
                  }}
                >
                  {item.value}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </td>
  );
}

export default DateData;
