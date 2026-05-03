import React, { CSSProperties, useCallback, useMemo } from "react";
import cx from "classnames";
import { CalendarContentProps } from "../../../types";
import {
  LAYOUT_CONSTANTS,
  DATE_FORMATS,
  TIME_CONSTANTS,
} from "../../../constants";
import {
  dateFn,
  convertToDate,
  DateType,
  calculateMaxEvents,
  formatDate,
  getDayListNames,
} from "../../../utils";
import useMonthGrid from "../../../hooks/useMonthGrid";
import MonthEventItem from "../../core/month_event_item/MonthEventItem";
import styles from "./MonthView.module.css";
import { useCalendar } from "../../../context/CalendarContext";
import useCalendarProps from "../../../hooks/useCalendarProps";

export type MonthViewProps = Partial<
  Pick<
    CalendarContentProps,
    | "is12Hour"
    | "selectable"
    | "maxEvents"
    | "dayType"
    | "onDateClick"
    | "onEventClick"
    | "onMoreClick"
    | "theme"
    | "classNames"
    | "weekStartsOn"
    | "weekEndsOn"
    | "showAdjacentMonths"
    | "renderEvent"
    | "renderDateCell"
    | "enableEnrichedEvents"
    | "enrichedEventsByDate"
    | "eventsAreSorted"
    | "isEventOrderingEnabled"
    | "sortedMonthView"
    | "showWeekNumbers"
    | "creatable"
    | "onSlotClick"
  >
>;

function MonthView(props: MonthViewProps) {
  const {
    dayType,
    width,
    height,
    onDateClick,
    onEventClick,
    onMoreClick,
    selectable,
    events,
    is12Hour,
    classNames,
    weekStartsOn,
    weekEndsOn,
    showAdjacentMonths,
    renderEvent,
    renderDateCell,
    enableEnrichedEvents,
    enrichedEventsByDate,
    eventsAreSorted,
    isEventOrderingEnabled,
    sortedMonthView,
    locale,
    theme,
    showWeekNumbers,
    creatable,
    onSlotClick,
    maxEvents: propsMaxEvents,
  } = useCalendarProps(props);
  const { state, dispatch, testId } = useCalendar();
  const { selectedDate } = state;

  const calendarGrid = useMonthGrid(
    selectedDate,
    events,
    weekStartsOn,
    weekEndsOn,
    {
      enableEnrichedEvents,
      enrichedEventsByDate,
      eventsAreSorted,
      isEventOrderingEnabled,
      sortedMonthView,
    },
  );

  const maxEvents = useMemo(
    () =>
      propsMaxEvents ??
      calculateMaxEvents(
        typeof height === "number" ? height : 0,
        calendarGrid.length || LAYOUT_CONSTANTS.MIN_ROWS,
      ),
    [propsMaxEvents, height, calendarGrid.length],
  );

  const onClickDateHandler = useCallback(
    (dateInput: DateType) => {
      const newDate = dateFn(dateInput);
      if (selectable && !newDate.hasSame(selectedDate, "day")) {
        onDateClick?.(convertToDate(newDate));
        dispatch({ type: "SET_DATE", payload: newDate });
      }
      if (creatable) {
        onSlotClick?.(
          newDate.startOf("day").toJSDate(),
          newDate.endOf("day").toJSDate(),
        );
      }
    },
    [selectedDate, onDateClick, selectable, dispatch, creatable, onSlotClick],
  );

  const headerDays = useMemo(() => {
    const list = getDayListNames(dayType, locale);
    const length =
      ((weekEndsOn - weekStartsOn + TIME_CONSTANTS.DAYS_IN_WEEK) %
        TIME_CONSTANTS.DAYS_IN_WEEK) +
      1;
    return Array.from(
      { length },
      (_, i) => list[(weekStartsOn + i) % TIME_CONSTANTS.DAYS_IN_WEEK],
    );
  }, [dayType, weekStartsOn, weekEndsOn, locale]);

  const tableAriaLabel = formatDate(
    selectedDate,
    DATE_FORMATS.MONTH_YEAR,
    locale,
  );

  return (
    <div className={styles.monthView} data-testid={`${testId}-month-view`}>
      <table
        className={cx(styles.table, classNames?.table)}
        aria-label={tableAriaLabel}
        style={
          {
            "--calendar-rows": calendarGrid.length,
            "--week-number-width": showWeekNumbers ? "36px" : "0px",
          } as CSSProperties
        }
      >
        <thead>
          <tr>
            {showWeekNumbers && (
              <th
                scope="col"
                className={cx(styles.weekNumberHeader, classNames?.weekNumber)}
              />
            )}
            {headerDays.map((day: string) => (
              <th
                key={day}
                scope="col"
                className={cx(styles.tableHeader, classNames?.tableHeader)}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {calendarGrid.map((week, weekIndex) => {
            const isRowEntirelyAdjacent = week.every((d) => !d.isCurrentMonth);

            return (
              <tr key={weekIndex}>
                {showWeekNumbers && (
                  <td
                    className={cx(
                      styles.weekNumberCell,
                      classNames?.weekNumber,
                    )}
                  >
                    {!showAdjacentMonths && isRowEntirelyAdjacent
                      ? null
                      : week[0]?.currentDate.weekNumber}
                  </td>
                )}
                {week.map((dayInfo, dayIndex) => (
                  <MonthEventItem
                    key={`date_${weekIndex}_${dayIndex}`}
                    isSelected={
                      selectable &&
                      dayInfo.isCurrentMonth &&
                      dayInfo.displayDay === selectedDate.day
                    }
                    isToday={dayInfo.isToday}
                    isCurrentMonth={dayInfo.isCurrentMonth}
                    onClick={onClickDateHandler}
                    date={dayInfo.displayDay}
                    dateObj={dayInfo.currentDate}
                    data={dayInfo.events}
                    cellWidth={
                      (typeof width === "number" ? width : 0) /
                      headerDays.length
                    }
                    className={cx(styles.tableCell, classNames?.tableDate)}
                    dataClassName={classNames?.event}
                    selectedClassName={classNames?.selected}
                    todayClassName={classNames?.today}
                    theme={theme}
                    maxEvents={maxEvents}
                    totalEvents={dayInfo.totalEvents}
                    is12Hour={is12Hour}
                    onEventClick={onEventClick}
                    onMoreClick={(d) => onMoreClick?.(convertToDate(d))}
                    showAdjacentMonths={showAdjacentMonths}
                    classNames={classNames}
                    renderEvent={renderEvent}
                    renderDateCell={renderDateCell}
                  />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MonthView;
