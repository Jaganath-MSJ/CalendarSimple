import React, { useCallback, useMemo, memo, ReactNode, useEffect } from "react";
import cx from "classnames";
import {
  CalendarType,
  CalendarContentType,
  defaultCalenderProps,
  DataTypeList,
} from "./types";
import {
  dateFn,
  convertToDate,
  convertToDayjs,
  checkIsToday,
  DateType,
  DAY_LIST_NAME,
  generateCalendarGrid,
} from "./utils";
import styles from "./Calendar.module.css";
import EventItem from "./common/EventItem";
import Header from "./layout/Header";
import { CalendarProvider, useCalendar } from "./context/CalendarContext";

function CalendarContent(props: CalendarContentType) {
  const { state, dispatch } = useCalendar();
  const { currentDate: selectedDate, events: data } = state;

  const {
    dayType,
    width,
    height,
    onDateClick,
    onEventClick,
    onMoreClick,
    onMonthChange,
    isSelectDate,
    className,
    headerClassName,
    tableClassName,
    tableDateClassName,
    dataClassName,
    selectedClassName,
    todayClassName,
    pastYearLength,
    futureYearLength,
    data: propsData, // Capture props data to sync
  } = props;

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
      className={cx(styles.calendar, className)}
    >
      <Header
        headerClassName={headerClassName}
        onMonthChange={onMonthChange}
        pastYearLength={pastYearLength}
        futureYearLength={futureYearLength}
      />
      <table className={cx(styles.table, tableClassName)}>
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
                  className={cx(styles.tableCell, tableDateClassName)}
                  dataClassName={dataClassName}
                  selectedClassName={selectedClassName}
                  todayClassName={todayClassName}
                  theme={props.theme}
                  maxEvents={props.maxEvents}
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

  return (
    <CalendarProvider initialEvents={data} initialDate={initialDate}>
      <CalendarContent {...allProps} />
    </CalendarProvider>
  );
}

export default memo(Calendar);
