import React, {
  ChangeEvent,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  memo,
  ReactNode,
} from "react";
import cx from "classnames";
import {
  CalendarType,
  DateType,
  EMonthOption,
  EYearOption,
  MonthListType,
  defaultCalenderProps,
} from "./Calendar.type";
import {
  CALENDER_STRINGS,
  DAY_LIST_NAME,
  MONTH_LIST,
} from "./Calendar.constant";
import {
  date,
  convertToDate,
  getYearList,
  convertToDayjs,
  checkIsToday,
} from "./Calendar.utils";
import styles from "./Calendar.module.css";
import DateData from "./DateData";
import LeftArrow from "../assets/LeftArrow";
import RightArrow from "../assets/RightArrow";
import calendarize from "calendarize";

function Calender(props: CalendarType = defaultCalenderProps) {
  const {
    dayType = defaultCalenderProps.dayType,
    data = defaultCalenderProps.data,
    width = defaultCalenderProps.width,
    height = defaultCalenderProps.height,
    selectedDate: selected_date,
    onDateClick,
    onMonthChange,
    isSelectDate = defaultCalenderProps.isSelectDate,
    className,
    headerClassName,
    tableClassName,
    tableDateClassName,
    dataClassName,
    selectedClassName,
    todayClassName,
    pastYearLength = defaultCalenderProps.pastYearLength,
    futureYearLength = defaultCalenderProps.futureYearLength,
  } = props;

  const selectedDateDayjs: DateType = useMemo(
    () => (selected_date ? convertToDayjs(selected_date) : date()),
    [selected_date],
  );
  const [selectedDate, setSelectedDate] = useState<DateType>(selectedDateDayjs);

  useLayoutEffect(() => {
    setSelectedDate(selectedDateDayjs);
  }, [selectedDateDayjs]);

  const dataEvents = useMemo(
    () =>
      data.sort((a, b) => {
        return date(a.startDate).diff(date(b.startDate), "days");
      }),
    [data],
  );

  const getDates = useCallback<() => ReactNode[]>((): ReactNode[] => {
    const onClickDateHandler = (dateInput: number) => {
      if (dateInput !== date(selectedDate).date()) {
        const cloneSelectedDate = date(selectedDate).date(dateInput);
        setSelectedDate(date(cloneSelectedDate));
        onDateClick?.(convertToDate(cloneSelectedDate));
      }
    };

    const calendarArray = calendarize(convertToDate(selectedDate));
    const dateComponent = calendarArray.map((week, weekIndex) => {
      // 1. Calculate dates for the entire week first
      const processedWeek = week.map((day, dayIndex) => {
        let currentDate = date(selectedDate);
        let isCurrentMonth = true;
        let displayDay = day;

        if (day === 0) {
          isCurrentMonth = false;
          if (weekIndex === 0) {
            const startOfMonth = date(selectedDate).startOf("month");
            const startDayOfWeek = startOfMonth.day();
            currentDate = startOfMonth.subtract(
              startDayOfWeek - dayIndex,
              "day",
            );
            displayDay = currentDate.date();
          } else {
            const startOfMonth = date(selectedDate).startOf("month");
            const startDayOfWeek = startOfMonth.day();
            const daysInMonth = selectedDate.daysInMonth();

            const globalIndex = weekIndex * 7 + dayIndex;
            const daysFromStart = globalIndex - startDayOfWeek;

            if (daysFromStart < 0) {
              currentDate = startOfMonth.add(daysFromStart, "day");
              displayDay = currentDate.date();
            } else if (daysFromStart >= daysInMonth) {
              currentDate = startOfMonth.add(daysFromStart, "day");
              displayDay = currentDate.date();
            } else {
              currentDate = startOfMonth.add(daysFromStart, "day");
              displayDay = currentDate.date();
            }
          }
        } else {
          currentDate = date(selectedDate).date(day);
        }
        return { currentDate, isCurrentMonth, displayDay };
      });

      // 2. Identify all events overlapping with this week
      const weekStart = processedWeek[0].currentDate;
      const weekEnd = processedWeek[6].currentDate;

      const weekEvents = dataEvents.filter((item) => {
        const start = date(item.startDate);
        const end = item.endDate ? date(item.endDate) : start;
        // Check overlap
        return (
          start.isBefore(weekEnd.add(1, "day"), "day") &&
          end.isAfter(weekStart.subtract(1, "day"), "day")
        );
      });

      // 3. Sort events: Start Date asc, then Duration desc
      weekEvents.sort((a, b) => {
        const startA = date(a.startDate);
        const startB = date(b.startDate);
        if (!startA.isSame(startB, "day")) return startA.diff(startB);

        const endA = a.endDate ? date(a.endDate) : startA;
        const endB = b.endDate ? date(b.endDate) : startB;
        const durA = endA.diff(startA, "day");
        const durB = endB.diff(startB, "day");
        return durB - durA;
      });

      // 4. Assign slots
      const slots: string[][] = Array(7)
        .fill(null)
        .map(() => []); // slots[dayIndex][slotIndex] = eventId
      const eventSlots = new Map<string, number>(); // eventId -> slotIndex (for this week)

      weekEvents.forEach((event, index) => {
        // Determine start/end indices in this week (0..6)
        const start = date(event.startDate);
        const end = event.endDate ? date(event.endDate) : start;

        let startIndex = start.diff(weekStart, "day");
        let endIndex = end.diff(weekStart, "day");

        if (startIndex < 0) startIndex = 0;
        if (endIndex > 6) endIndex = 6;

        // Find first available slot
        let slotIndex = 0;
        while (true) {
          let isAvailable = true;
          for (let i = startIndex; i <= endIndex; i++) {
            if (slots[i][slotIndex]) {
              isAvailable = false;
              break;
            }
          }
          if (isAvailable) break;
          slotIndex++;
        }

        // Assign slot
        const eventId = event.startDate + event.value + index; // specific ID for this instance
        eventSlots.set(eventId, slotIndex);
        for (let i = startIndex; i <= endIndex; i++) {
          slots[i][slotIndex] = eventId;
        }
        // We need to attach this ID to the event object for retrieval or use map
        (event as any)._tempId = eventId;
      });

      return (
        <tr key={weekIndex + 1}>
          {processedWeek.map((dayObj, dayIndex) => {
            const { currentDate, isCurrentMonth, displayDay } = dayObj;

            // Find events active on this day
            const activeEvents = weekEvents.filter((event) => {
              const start = date(event.startDate);
              const end = event.endDate ? date(event.endDate) : start;
              return (
                !currentDate.isBefore(start, "day") &&
                !currentDate.isAfter(end, "day")
              );
            });

            // Construct display array with spacers
            const maxSlot = Math.max(
              ...slots[dayIndex].map((_, i) => i),
              activeEvents.length > 0 ? 0 : -1,
            );
            const displayData = [];

            let maxDaySlot = -1;
            activeEvents.forEach((e) => {
              const s = eventSlots.get((e as any)._tempId);
              if (s !== undefined && s > maxDaySlot) maxDaySlot = s;
            });

            for (let s = 0; s <= maxDaySlot; s++) {
              const event = activeEvents.find(
                (e) => eventSlots.get((e as any)._tempId) === s,
              );
              if (displayDay === 5) {
                console.log("check all", {
                  s,
                  event,
                  activeEvents,
                  eventSlots,
                  weekIndex,
                  displayDay,
                });
              }
              if (event) {
                const itemStartDate = date(event.startDate);
                const isStart = itemStartDate.isSame(currentDate, "day");
                const isWeekStart = dayIndex === 0;

                if (isStart || isWeekStart) {
                  // Render Event
                  const itemEndDate = event.endDate
                    ? date(event.endDate)
                    : date(event.startDate);
                  const endOfWeekDate = date(currentDate).add(
                    6 - dayIndex,
                    "day",
                  );

                  let effectiveEndDate = itemEndDate;
                  if (itemEndDate.isAfter(endOfWeekDate, "date")) {
                    effectiveEndDate = endOfWeekDate;
                  }

                  displayData.push({
                    ...event,
                    startDateWeek: currentDate.format("YYYY-MM-DD"),
                    endDateWeek: effectiveEndDate.format("YYYY-MM-DD"),
                  });
                } else {
                  // Spacer (Event exists but rendered in previous cell)
                  displayData.push(null);
                }
              } else {
                // Empty slot
                // displayData.push(null);
              }
            }

            return (
              <DateData
                key={`date_${weekIndex}_${dayIndex}`}
                isSelected={
                  isSelectDate &&
                  isCurrentMonth &&
                  displayDay === selectedDate.date()
                }
                isToday={
                  checkIsToday(selectedDate, displayDay) && isCurrentMonth
                }
                isCurrentMonth={isCurrentMonth}
                onClick={
                  isSelectDate && isCurrentMonth
                    ? onClickDateHandler
                    : undefined
                }
                date={displayDay}
                data={displayData}
                cellWidth={width / 7}
                className={cx(styles.tableCell, tableDateClassName)}
                dataClassName={dataClassName}
                selectedClassName={selectedClassName}
                todayClassName={todayClassName}
                theme={props.theme}
              />
            );
          })}
        </tr>
      );
    });

    return dateComponent;
  }, [
    dataEvents,
    selectedDate,
    dataClassName,
    selectedClassName,
    todayClassName,
    tableDateClassName,
    onDateClick,
    isSelectDate,
  ]);

  const onMonthArrowClick = (option: EMonthOption) => {
    let clonedSelectedDate = selectedDate;

    if (option === EMonthOption.add) {
      clonedSelectedDate = date(clonedSelectedDate).month(
        clonedSelectedDate.month() + 1,
      );
    } else if (option === EMonthOption.sub) {
      clonedSelectedDate = date(clonedSelectedDate).month(
        clonedSelectedDate.month() - 1,
      );
    }

    setSelectedDate(clonedSelectedDate);
    onMonthChange?.(convertToDate(clonedSelectedDate));
  };

  const onDropdownClick = (
    event: ChangeEvent<HTMLSelectElement>,
    option: EYearOption,
  ) => {
    const value = Number(event.target.value);
    let clonedSelectedDate = selectedDate;

    if (option === EYearOption.month) {
      clonedSelectedDate = date(clonedSelectedDate).month(value);
    } else if (option === EYearOption.year) {
      clonedSelectedDate = date(clonedSelectedDate).year(value);
    }

    setSelectedDate(clonedSelectedDate);
    onMonthChange?.(convertToDate(clonedSelectedDate));
  };

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
      <div className={cx(styles.header, headerClassName)}>
        <button
          className={styles.button}
          onClick={() => onMonthArrowClick(EMonthOption.sub)}
        >
          <LeftArrow />
        </button>
        <div className={styles.selectGroup}>
          <select
            className={styles.select}
            id={CALENDER_STRINGS.MONTH}
            name={CALENDER_STRINGS.MONTH}
            value={selectedDate.month()}
            onChange={(e) => onDropdownClick(e, EYearOption.month)}
          >
            {MONTH_LIST.map((month: MonthListType) => (
              <option key={month.label} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            id={CALENDER_STRINGS.YEAR}
            name={CALENDER_STRINGS.YEAR}
            value={selectedDate.year()}
            onChange={(e) => onDropdownClick(e, EYearOption.year)}
          >
            {getYearList(
              pastYearLength,
              futureYearLength,
              selectedDate.year(),
            ).map((year: number) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button
          className={styles.button}
          onClick={() => onMonthArrowClick(EMonthOption.add)}
        >
          <RightArrow />
        </button>
      </div>
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
        <tbody>{getDates()}</tbody>
      </table>
    </section>
  );
}

export default memo(Calender);
