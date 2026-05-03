import React, { useCallback, useState } from "react";
import cx from "classnames";
import {
  CalendarContentProps,
  EventListType,
  ECalendarViewType,
} from "../../../types";
import {
  getDiffDays,
  generateTooltipText,
  DateType,
  getContrastColor,
  formatDate,
  handleKeyboardActivation,
} from "../../../utils";
import styles from "./MonthEventItem.module.css";
import Popover from "../../ui/popover/Popover";
import {
  LAYOUT_CONSTANTS,
  defaultTheme,
  DATE_FORMATS,
} from "../../../constants";
import { useCalendar } from "../../../context/CalendarContext";

interface MonthEventItemProps extends Pick<
  CalendarContentProps,
  | "onEventClick"
  | "theme"
  | "maxEvents"
  | "is12Hour"
  | "showAdjacentMonths"
  | "classNames"
  | "renderEvent"
  | "renderDateCell"
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
  showAdjacentMonths,
  classNames,
  renderEvent,
  renderDateCell,
}: MonthEventItemProps) {
  const { testId, config } = useCalendar();
  const locale = config.locale;
  const [showPopover, setShowPopover] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClosePopover = useCallback(() => {
    setShowPopover(false);
    setAnchorEl(null);
  }, []);

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
      data-testid={`${testId}-${date}-month-cell`}
      onClick={() => onClick?.(dateObj)}
      tabIndex={onClick ? 0 : undefined}
      aria-label={
        onClick
          ? formatDate(dateObj, DATE_FORMATS.MONTH_DAY_YEAR, locale)
          : undefined
      }
      onKeyDown={
        onClick ? handleKeyboardActivation(() => onClick(dateObj)) : undefined
      }
      className={cx(styles.dateData, className, {
        [styles.currentMonth]: !isCurrentMonth,
        [cx(styles.selected, selectedClassName)]: isSelected,
        [cx(styles.today, todayClassName)]: isToday,
      })}
    >
      <div className={styles.cellContent}>
        {(isCurrentMonth || showAdjacentMonths) && (
          <>
            {renderDateCell ? (
              renderDateCell({
                date: dateObj.toJSDate(),
                isToday,
                isSelected,
                isCurrentMonth,
              })
            ) : (
              <p className={styles.dateLabel}>{date}</p>
            )}

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

                  const eventBgColor =
                    item.style?.backgroundColor ||
                    LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR;
                  const textColor = getContrastColor(String(eventBgColor));

                  // If cellWidth is 0, we can't calculate a proper spanning width.
                  // Fallback to a percentage or just let it be 0 until measured.
                  const calculatedWidth =
                    cellWidth > 0
                      ? `${cellWidth * diffDates - LAYOUT_CONSTANTS.EVENT_ITEM_PADDING}px`
                      : "100%";

                  const id = item.id || `${item.startDate}-${index}`;

                  return (
                    <div
                      key={id}
                      role="button"
                      tabIndex={0}
                      className={cx(styles.eventItem, classNames?.event)}
                      id={item.id}
                      data-testid={`${testId}-${id}-month-event-item`}
                      style={{
                        width: calculatedWidth,
                        backgroundColor: LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR,
                        color: textColor,
                        ...item.style,
                      }}
                      title={tooltipText}
                      aria-label={`${item.title}, ${tooltipText}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(item);
                      }}
                      onKeyDown={handleKeyboardActivation(() =>
                        onEventClick?.(item),
                      )}
                    >
                      {renderEvent ? renderEvent(item) : item.title}
                    </div>
                  );
                })}
                {hiddenEventsCount > 0 && (
                  <div className={styles.moreEventsContainer}>
                    <button
                      className={styles.moreEvents}
                      data-testid={`${testId}-${date}-more-events`}
                      aria-label={`${hiddenEventsCount} more events on ${formatDate(dateObj, DATE_FORMATS.MONTH_DAY_YEAR, locale)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!showPopover) {
                          setAnchorEl(e.currentTarget);
                          setShowPopover(true);
                        }
                        onMoreClick?.(dateObj);
                      }}
                      onKeyDown={handleKeyboardActivation((e) => {
                        if (!showPopover) {
                          setAnchorEl(e.currentTarget as HTMLButtonElement);
                          setShowPopover(true);
                        }
                        onMoreClick?.(dateObj);
                      })}
                    >
                      + {hiddenEventsCount} more
                    </button>
                    {showPopover && anchorEl && (
                      <Popover
                        dateObj={dateObj}
                        events={allDayEvents}
                        onEventClick={onEventClick}
                        onClose={handleClosePopover}
                        anchorEl={anchorEl}
                        is12Hour={is12Hour}
                        renderEvent={renderEvent}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </td>
  );
}

export default MonthEventItem;
