import React, { CSSProperties, useCallback, useMemo } from "react";
import cx from "classnames";
import { CalendarContentProps } from "../../types";
import { DAY_LIST_NAME, CALENDAR_CONSTANTS } from "../../constants";
import {
  dateFn,
  convertToDate,
  DateType,
  generateCalendarGrid,
  calculateMaxEvents,
} from "../../utils";
import styles from "./MonthView.module.css";
import MonthEventItem from "../../common/month_event_item/MonthEventItem";
import { useCalendar } from "../../context/CalendarContext";

interface MonthViewProps extends Pick<
  CalendarContentProps,
  | "events"
  | "is12Hour"
  | "selectable"
  | "maxEvents"
  | "dayType"
  | "width"
  | "height"
  | "onDateClick"
  | "onEventClick"
  | "onMoreClick"
  | "theme"
  | "classNames"
> {}

function MonthView({
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
  ...restProps
}: MonthViewProps) {
  const { state, dispatch } = useCalendar();
  const { selectedDate } = state;

  const calendarGrid = useMemo(
    () => generateCalendarGrid(selectedDate, events),
    [selectedDate, events],
  );

  const maxEvents = useMemo(
    () =>
      restProps.maxEvents ??
      calculateMaxEvents(
        typeof height === "number" ? height : 0,
        calendarGrid.length || CALENDAR_CONSTANTS.MIN_ROWS,
      ),
    [restProps.maxEvents, height, calendarGrid.length],
  );

  const onClickDateHandler = useCallback(
    (dateInput: DateType) => {
      const newDate = dateFn(dateInput);
      onDateClick?.(convertToDate(newDate));
      if (selectable && !newDate.isSame(selectedDate, "day")) {
        dispatch({ type: "SET_DATE", payload: newDate });
      }
    },
    [selectedDate, onDateClick, selectable, dispatch],
  );

  return (
    <table
      className={cx(styles.table, classNames?.table)}
      style={
        {
          "--calendar-rows": calendarGrid.length,
        } as CSSProperties
      }
    >
      <thead>
        <tr>
          {DAY_LIST_NAME[dayType].map((day: string) => (
            <th
              key={day}
              className={cx(styles.tableHeader, classNames?.tableHeader)}
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={styles.tableBody}>
        {calendarGrid.map((week, weekIndex) => (
          <tr key={weekIndex}>
            {week.map((dayInfo, dayIndex) => (
              <MonthEventItem
                key={`date_${weekIndex}_${dayIndex}`}
                isSelected={
                  selectable &&
                  dayInfo.isCurrentMonth &&
                  dayInfo.displayDay === selectedDate.date()
                }
                isToday={dayInfo.isToday}
                isCurrentMonth={dayInfo.isCurrentMonth}
                onClick={onClickDateHandler}
                date={dayInfo.displayDay}
                dateObj={dayInfo.currentDate}
                data={dayInfo.events}
                cellWidth={
                  (typeof width === "number" ? width : 0) /
                  CALENDAR_CONSTANTS.DAYS_IN_WEEK
                }
                className={cx(styles.tableCell, classNames?.tableDate)}
                dataClassName={classNames?.event}
                selectedClassName={classNames?.selected}
                todayClassName={classNames?.today}
                theme={restProps.theme}
                maxEvents={maxEvents}
                totalEvents={dayInfo.totalEvents}
                is12Hour={is12Hour}
                onEventClick={onEventClick}
                onMoreClick={(d) => onMoreClick?.(convertToDate(d))}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MonthView;
