import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  getRowWeekNumber,
  getMonthKeyTarget,
  isVisibleWeekday,
  resolveDirection,
} from "../../../utils";
import {
  isTypingTarget,
  useNavigate,
} from "../../../hooks/usePeriodNavigation";
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
    | "showMorePopover"
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
    onDateClick,
    onEventClick,
    onMoreClick,
    showMorePopover,
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
  const { state, dispatch, testId, bodySize } = useCalendar();
  const { selectedDate } = state;

  // Roving focus (keyboardNavigation): one tab stop, arrows move it.
  const { keyboardNavigation, direction } = useCalendarProps({});
  const navigate = useNavigate();
  const [roving, setRoving] = useState<DateType | null>(null);
  // As calendar-simple-native: the focused day, else the selected day, else
  // today, else the 1st, moved past weekdays the grid hides (work weeks).
  const rovingDay = useMemo(() => {
    const inMonth = (d: DateType | null): d is DateType =>
      d !== null && d.hasSame(selectedDate, "month");
    const today = dateFn();
    const firstOfMonth = selectedDate.startOf("month");
    let day = inMonth(roving)
      ? roving
      : inMonth(selectedDate)
        ? selectedDate
        : inMonth(today)
          ? today
          : firstOfMonth;
    for (
      let i = 0;
      i < 7 && !isVisibleWeekday(day, weekStartsOn, weekEndsOn);
      i++
    ) {
      day = day.plus({ days: 1 });
    }
    return day.startOf("day");
  }, [roving, selectedDate, weekStartsOn, weekEndsOn]);
  const tableRef = useRef<HTMLTableElement>(null);
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    const iso = pendingFocus.current;
    if (!iso) return;
    pendingFocus.current = null;
    tableRef.current
      ?.querySelector<HTMLElement>(`[data-date="${iso}"]`)
      ?.focus();
  });
  const onGridKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.defaultPrevented || isTypingTarget(e.target)) return;
    // Grid keys belong to the day cells; chips and "+N more" keep theirs.
    const target0 = e.target as HTMLElement;
    if (!target0.matches?.("td[data-date]")) return;
    const target = getMonthKeyTarget(e, rovingDay, {
      weekStartsOn,
      weekEndsOn,
      flip: resolveDirection(direction, locale) === "rtl",
      today: dateFn(),
    });
    if (!target) return;
    e.preventDefault();
    setRoving(target);
    pendingFocus.current = target.toISODate();
    if (!target.hasSame(selectedDate, "month")) navigate(target);
    else {
      tableRef.current
        ?.querySelector<HTMLElement>(`[data-date="${pendingFocus.current}"]`)
        ?.focus();
      pendingFocus.current = null;
    }
  };

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
        bodySize.height,
        calendarGrid.length || LAYOUT_CONSTANTS.MIN_ROWS,
      ),
    [propsMaxEvents, bodySize.height, calendarGrid.length],
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
        ref={tableRef}
        className={cx(styles.table, classNames?.table)}
        aria-label={tableAriaLabel}
        style={
          {
            "--calendar-rows": calendarGrid.length,
            "--week-number-width": showWeekNumbers
              ? `${LAYOUT_CONSTANTS.WEEK_NUMBER_WIDTH}px`
              : "0px",
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
        <tbody
          className={styles.tableBody}
          onKeyDown={keyboardNavigation ? onGridKeyDown : undefined}
        >
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
                      : getRowWeekNumber(week[0].currentDate)}
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
                    isTodayAdjacent={dayInfo.isTodayAdjacent}
                    isCurrentMonth={dayInfo.isCurrentMonth}
                    onClick={onClickDateHandler}
                    date={dayInfo.displayDay}
                    dateObj={dayInfo.currentDate}
                    data={dayInfo.events}
                    cellWidth={
                      (bodySize.width -
                        (showWeekNumbers
                          ? LAYOUT_CONSTANTS.WEEK_NUMBER_WIDTH
                          : 0)) /
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
                    onMoreClick={(d, hiddenEvs) =>
                      onMoreClick?.(convertToDate(d), hiddenEvs)
                    }
                    showAdjacentMonths={showAdjacentMonths}
                    classNames={classNames}
                    renderEvent={renderEvent}
                    renderDateCell={renderDateCell}
                    showMorePopover={showMorePopover}
                    tabStop={
                      keyboardNavigation
                        ? dayInfo.currentDate.hasSame(rovingDay, "day")
                        : undefined
                    }
                    onCellFocus={keyboardNavigation ? setRoving : undefined}
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
