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
  stripLayoutStyle,
  resolveTheme,
} from "../../../utils";
import styles from "./MonthEventItem.module.css";
import Popover from "../../ui/popover/Popover";
import { LAYOUT_CONSTANTS, DATE_FORMATS } from "../../../constants";
import { useCalendar } from "../../../context/CalendarContext";
import useMessages from "../../../hooks/useMessages";
import useDayMove, { measureMonthCell } from "../../../hooks/useDayMove";

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
  | "showMorePopover"
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
  isTodayAdjacent?: boolean;
  isCurrentMonth: boolean;
  onClick?: (date: DateType) => void;
  onMoreClick?: (date: DateType, hiddenEvents: EventListType[]) => void;
  totalEvents?: number;
  /**
   * Roving focus (`keyboardNavigation`): `true` = the grid's one tab stop,
   * `false` = focusable by the arrow keys only, `undefined` = every
   * clickable cell is a tab stop.
   */
  tabStop?: boolean;
  /** Called when the cell takes focus (roving focus follows it). */
  onCellFocus?: (date: DateType) => void;
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
  isTodayAdjacent = false,
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
  showMorePopover = true,
  tabStop,
  onCellFocus,
}: MonthEventItemProps) {
  const { testId, config, colorScheme } = useCalendar();
  const messages = useMessages();
  const locale = config.locale;
  const [showPopover, setShowPopover] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClosePopover = useCallback(() => {
    setShowPopover(false);
    setAnchorEl(null);
  }, []);

  const resolved = resolveTheme(theme, colorScheme);
  const themeSource = isSelected
    ? resolved.selected
    : isToday
      ? resolved.today
      : resolved.default;

  const style = {
    color: themeSource?.color,
    backgroundColor: themeSource?.bgColor,
  };

  const allDayEvents: EventListType[] =
    data?.filter((e): e is EventListType => e !== null) || [];

  // Determine which items to display
  let visibleEvents = data;
  let hiddenEventsCount = 0;
  let hiddenEventsList: EventListType[] = [];

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
    hiddenEventsList = allDayEvents
      .slice(visibleRealEventsCount)
      .filter((e) => !e.isSpacer);
  }

  return (
    <td
      style={style}
      data-testid={`${testId}-${date}-month-cell`}
      data-date={dateObj.toISODate() ?? undefined}
      onClick={() => onClick?.(dateObj)}
      onFocus={
        onCellFocus
          ? (e) => {
              if (e.target === e.currentTarget) onCellFocus(dateObj);
            }
          : undefined
      }
      tabIndex={
        tabStop === undefined ? (onClick ? 0 : undefined) : tabStop ? 0 : -1
      }
      aria-label={
        onClick
          ? `${formatDate(dateObj, DATE_FORMATS.MONTH_DAY_YEAR, locale)}, ${messages.eventCount(totalEvents)}`
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
                isTodayAdjacent,
              })
            ) : (
              <p
                className={cx(styles.dateLabel, {
                  [styles.todayAdjacent]: isTodayAdjacent,
                })}
              >
                {date}
              </p>
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
                    locale,
                  );

                  const eventBgColor =
                    item.style?.backgroundColor ||
                    LAYOUT_CONSTANTS.DEFAULT_EVENT_COLOR;
                  // Text contrast is computed from the hex fallback; overriding
                  // --cal-event-default does not recompute it.
                  const textColor = getContrastColor(String(eventBgColor));

                  // If cellWidth is 0, we can't calculate a proper spanning width.
                  // Fallback to a percentage or just let it be 0 until measured.
                  const calculatedWidth =
                    cellWidth > 0
                      ? `${cellWidth * diffDates - LAYOUT_CONSTANTS.EVENT_ITEM_PADDING}px`
                      : "100%";

                  const id = item.id || `${item.startDate}-${index}`;

                  return (
                    <MonthChip
                      key={id}
                      item={item}
                      testIdValue={`${testId}-${id}-month-event-item`}
                      className={cx(styles.eventItem, classNames?.event)}
                      style={{
                        backgroundColor: "var(--cal-event-default)",
                        color: textColor,
                        ...stripLayoutStyle(item.style),
                        width: calculatedWidth,
                      }}
                      title={tooltipText}
                      ariaLabel={`${item.title || messages.noTitle}, ${tooltipText}`}
                      onEventClick={onEventClick}
                    >
                      {renderEvent ? renderEvent(item) : item.title}
                    </MonthChip>
                  );
                })}
                {hiddenEventsCount > 0 && (
                  <div className={styles.moreEventsContainer}>
                    <button
                      className={styles.moreEvents}
                      data-testid={`${testId}-${date}-more-events`}
                      aria-label={messages.moreEventsOn(
                        hiddenEventsCount,
                        formatDate(
                          dateObj,
                          DATE_FORMATS.MONTH_DAY_YEAR,
                          locale,
                        ),
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (showMorePopover && !showPopover) {
                          setAnchorEl(e.currentTarget);
                          setShowPopover(true);
                        }
                        onMoreClick?.(dateObj, hiddenEventsList);
                      }}
                      onKeyDown={handleKeyboardActivation((e) => {
                        if (showMorePopover && !showPopover) {
                          setAnchorEl(e.currentTarget as HTMLButtonElement);
                          setShowPopover(true);
                        }
                        onMoreClick?.(dateObj, hiddenEventsList);
                      })}
                    >
                      {messages.more(hiddenEventsCount)}
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

interface MonthChipProps extends Pick<CalendarContentProps, "onEventClick"> {
  item: EventListType;
  testIdValue: string;
  className: string;
  style: React.CSSProperties;
  title: string;
  ariaLabel: string;
  children: React.ReactNode;
}

/** One event chip in a month cell; draggable to another day or week. */
function MonthChip({
  item,
  testIdValue,
  className,
  style,
  title,
  ariaLabel,
  onEventClick,
  children,
}: MonthChipProps) {
  const { ref: chipRef, ...move } = useDayMove(item, {
    axis: "both",
    measure: measureMonthCell,
  });
  return (
    <div
      ref={chipRef}
      role="button"
      tabIndex={0}
      className={cx(className, {
        [styles.draggable]: move.canMove,
        [styles.dragging]: move.dragging,
      })}
      id={item.id}
      data-testid={testIdValue}
      style={{ ...style, ...move.style }}
      title={title}
      aria-label={ariaLabel}
      aria-keyshortcuts={move.keyShortcuts}
      aria-description={move.description}
      {...move.handlers}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick?.(item);
      }}
      onKeyDown={(e) => {
        if (move.handleKey(e)) return;
        handleKeyboardActivation(() => onEventClick?.(item))(e);
      }}
    >
      {children}
    </div>
  );
}

export default MonthEventItem;
