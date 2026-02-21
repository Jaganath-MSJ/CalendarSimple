import React, { useCallback, useMemo } from "react";
import cx from "classnames";
import { CalendarContentType, DataType } from "../../types";
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

interface MonthViewProps extends Omit<CalendarContentType, "selectedDate"> {}

function MonthView({
  dayType,
  width,
  height,
  onDateClick,
  onEventClick,
  onMoreClick,
  isSelectDate,
  events,
  is12Hour,
  ...restProps
}: MonthViewProps) {
  const { state, dispatch } = useCalendar();
  const { currentDate } = state;

  const calendarGrid = useMemo(
    () => generateCalendarGrid(currentDate, events),
    [currentDate, events],
  );

  const maxEvents = useMemo(
    () =>
      restProps.maxEvents ??
      calculateMaxEvents(
        height,
        calendarGrid.length || CALENDAR_CONSTANTS.MIN_ROWS,
      ),
    [restProps.maxEvents, height, calendarGrid.length],
  );

  const onClickDateHandler = useCallback(
    (dateInput: DateType) => {
      const newDate = dateFn(dateInput);
      onDateClick?.(convertToDate(newDate));
      if (isSelectDate && !newDate.isSame(currentDate, "day")) {
        dispatch({ type: "SET_DATE", payload: newDate });
      }
    },
    [currentDate, onDateClick, isSelectDate, dispatch],
  );

  return (
    <table
      className={cx(styles.table, restProps.tableClassName)}
      style={
        {
          "--calendar-rows": calendarGrid.length,
        } as React.CSSProperties
      }
    >
      <thead>
        <tr>
          {DAY_LIST_NAME[dayType].map((day: string) => (
            <th key={day} className={styles.tableHeader}>
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
                  isSelectDate &&
                  dayInfo.isCurrentMonth &&
                  dayInfo.displayDay === currentDate.date()
                }
                isToday={dayInfo.isToday}
                isCurrentMonth={dayInfo.isCurrentMonth}
                onClick={onClickDateHandler}
                date={dayInfo.displayDay}
                dateObj={dayInfo.currentDate}
                data={dayInfo.events}
                cellWidth={width / CALENDAR_CONSTANTS.DAYS_IN_WEEK}
                className={cx(styles.tableCell, restProps.tableDateClassName)}
                dataClassName={restProps.dataClassName}
                selectedClassName={restProps.selectedClassName}
                todayClassName={restProps.todayClassName}
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
