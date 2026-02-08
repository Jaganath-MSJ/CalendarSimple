import React, { useCallback, useMemo, memo, useEffect } from "react";
import cx from "classnames";
import { CalendarType, CalendarContentType } from "./types";
import { DAY_LIST_NAME, defaultCalenderProps } from "./constants";
import {
  dateFn,
  convertToDate,
  convertToDayjs,
  DateType,
  generateCalendarGrid,
  calculateMaxEvents,
} from "./utils";
import styles from "./Calendar.module.css";
import EventItem from "./common/EventItem";
import Header from "./layout/Header";
import { CalendarProvider, useCalendar } from "./context/CalendarContext";

function CalendarContent({
  dayType,
  width,
  height,
  onDateClick,
  onEventClick,
  onMoreClick,
  onMonthChange,
  isSelectDate,
  data: propsData, // Capture props data to sync
  ...restProps
}: CalendarContentType) {
  const { state, dispatch } = useCalendar();
  const { currentDate: selectedDate, events: data } = state;

  // Sync data from props to context
  useEffect(() => {
    if (propsData) {
      dispatch({ type: "SET_EVENTS", payload: propsData });
    }
  }, [propsData, dispatch]);

  const calendarGrid = useMemo(
    () => generateCalendarGrid(selectedDate, data),
    [selectedDate, data],
  );

  const onClickDateHandler = useCallback(
    (dateInput: DateType) => {
      const newDate = dateFn(dateInput);
      if (!newDate.isSame(selectedDate, "day")) {
        dispatch({ type: "SET_DATE", payload: newDate });
        onDateClick?.(convertToDate(newDate));
      }
    },
    [selectedDate, dispatch, onDateClick],
  );

  return (
    <section
      style={
        {
          "--calendar-width": `${width}px`,
          "--calendar-height": `${height}px`,
        } as React.CSSProperties
      }
      className={cx(styles.calendar, restProps.className)}
    >
      <Header
        headerClassName={restProps.headerClassName}
        onMonthChange={onMonthChange}
        pastYearLength={restProps.pastYearLength}
        futureYearLength={restProps.futureYearLength}
      />
      <table className={cx(styles.table, restProps.tableClassName)}>
        <thead>
          <tr>
            {DAY_LIST_NAME[dayType].map((day: string) => (
              <th key={day} className={styles.tableHeader}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarGrid.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((dayInfo, dayIndex) => (
                <EventItem
                  key={`date_${weekIndex}_${dayIndex}`}
                  isSelected={
                    isSelectDate &&
                    dayInfo.isCurrentMonth &&
                    dayInfo.displayDay === selectedDate.date()
                  }
                  isToday={dayInfo.isToday}
                  isCurrentMonth={dayInfo.isCurrentMonth}
                  onClick={isSelectDate ? onClickDateHandler : undefined}
                  date={dayInfo.displayDay}
                  dateObj={dayInfo.currentDate}
                  data={dayInfo.events}
                  cellWidth={width / 7}
                  className={cx(styles.tableCell, restProps.tableDateClassName)}
                  dataClassName={restProps.dataClassName}
                  selectedClassName={restProps.selectedClassName}
                  todayClassName={restProps.todayClassName}
                  theme={restProps.theme}
                  maxEvents={restProps.maxEvents}
                  totalEvents={dayInfo.totalEvents}
                  onEventClick={onEventClick}
                  onMoreClick={(d) => onMoreClick?.(convertToDate(d))}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Calendar(props: CalendarType = defaultCalenderProps) {
  const allProps = { ...defaultCalenderProps, ...props };
  const { data, selectedDate } = allProps;

  const initialDate = useMemo(
    () => (selectedDate ? convertToDayjs(selectedDate) : undefined),
    [selectedDate],
  );

  const maxEvents = allProps.maxEvents ?? calculateMaxEvents(allProps.height);

  return (
    <CalendarProvider initialEvents={data} initialDate={initialDate}>
      <CalendarContent {...allProps} maxEvents={maxEvents} />
    </CalendarProvider>
  );
}

export default memo(Calendar);
