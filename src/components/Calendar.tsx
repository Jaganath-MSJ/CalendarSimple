import React, {
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
  defaultCalenderProps,
  DataTypeList,
} from "./Calendar.type";
import { DAY_LIST_NAME } from "./Calendar.constant";
import {
  date,
  convertToDate,
  convertToDayjs,
  checkIsToday,
} from "./Calendar.utils";
import styles from "./Calendar.module.css";
import EventItem from "../common/EventItem";
import calendarize from "calendarize";
import Header from "../layout/Header";

function Calender(props: CalendarType = defaultCalenderProps) {
  const {
    dayType = defaultCalenderProps.dayType,
    data = defaultCalenderProps.data,
    width = defaultCalenderProps.width,
    height = defaultCalenderProps.height,
    selectedDate: selected_date,
    onDateClick,
    onEventClick,
    onMoreClick,
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
        return date(a.startDate)
          .startOf("day")
          .diff(date(b.startDate).startOf("day"), "days");
      }),
    [data],
  );

  const getDates = useCallback<() => ReactNode[]>((): ReactNode[] => {
    const onClickDateHandler = (dateInput: DateType) => {
      const newDate = date(dateInput);
      if (!newDate.isSame(selectedDate, "day")) {
        setSelectedDate(newDate);
        onDateClick?.(convertToDate(newDate));
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
      const weekStart = processedWeek[0].currentDate.startOf("day");
      const weekEnd = processedWeek[6].currentDate.startOf("day");

      const weekEvents = dataEvents.filter((item) => {
        const start = date(item.startDate).startOf("day");
        const end = item.endDate ? date(item.endDate).startOf("day") : start;
        // Check overlap
        return (
          start.isBefore(weekEnd.add(1, "day"), "day") &&
          end.isAfter(weekStart.subtract(1, "day"), "day")
        );
      });

      // 3. Sort events: Start Date asc, then Duration desc
      weekEvents.sort((a, b) => {
        const startA = date(a.startDate).startOf("day");
        const startB = date(b.startDate).startOf("day");
        if (!startA.isSame(startB, "day")) return startA.diff(startB);

        const endA = a.endDate ? date(a.endDate).startOf("day") : startA;
        const endB = b.endDate ? date(b.endDate).startOf("day") : startB;
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
        const start = date(event.startDate).startOf("day");
        const end = event.endDate ? date(event.endDate).startOf("day") : start;

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
              const start = date(event.startDate).startOf("day");
              const end = event.endDate
                ? date(event.endDate).startOf("day")
                : start;
              return (
                !currentDate.isBefore(start, "day") &&
                !currentDate.isAfter(end, "day")
              );
            });

            const displayData: (DataTypeList | null)[] = [];

            let maxDaySlot = -1;
            activeEvents.forEach((e) => {
              const s = eventSlots.get((e as any)._tempId);
              if (s !== undefined && s > maxDaySlot) maxDaySlot = s;
            });

            for (let s = 0; s <= maxDaySlot; s++) {
              const event = activeEvents.find(
                (e) => eventSlots.get((e as any)._tempId) === s,
              );
              if (event) {
                const itemStartDate = date(event.startDate).startOf("day");
                const isStart = itemStartDate.isSame(currentDate, "day");
                const isWeekStart = dayIndex === 0;

                if (isStart || isWeekStart) {
                  // Render Event
                  const itemEndDate = event.endDate
                    ? date(event.endDate).startOf("day")
                    : date(event.startDate).startOf("day");
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
                  displayData.push({ ...event, isSpacer: true });
                }
              } else {
                // Empty slot
                displayData.push(null);
              }
            }

            return (
              <EventItem
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
                onClick={isSelectDate ? onClickDateHandler : undefined}
                date={displayDay}
                dateObj={currentDate}
                data={displayData}
                cellWidth={width / 7}
                className={cx(styles.tableCell, tableDateClassName)}
                dataClassName={dataClassName}
                selectedClassName={selectedClassName}
                todayClassName={todayClassName}
                theme={props.theme}
                maxEvents={props.maxEvents}
                totalEvents={activeEvents.length}
                onEventClick={onEventClick}
                onMoreClick={(d) => onMoreClick?.(convertToDate(d))}
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
        selectedDate={selectedDate}
        onMonthChange={onMonthChange}
        setSelectedDate={setSelectedDate}
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
        <tbody>{getDates()}</tbody>
      </table>
    </section>
  );
}

export default memo(Calender);
