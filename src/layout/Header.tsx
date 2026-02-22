import React, { ChangeEvent } from "react";
import cx from "classnames";
import {
  CalendarContentType,
  ECalendarViewType,
  EMonthOption,
  EYearOption,
  MonthListType,
} from "../types";
import {
  CALENDER_STRINGS,
  MONTH_LIST,
  DATE_FORMATS,
  CALENDAR_ACTIONS,
  VIEW_OPTIONS,
} from "../constants";
import {
  dateFn,
  getYearList,
  convertToDate,
  setMonth,
  setYear,
  formatDate,
  getMonth,
  getYear,
  ManipulateType,
} from "../utils";
import styles from "./Header.module.css";
import LeftArrow from "../assets/LeftArrow";
import RightArrow from "../assets/RightArrow";
import { useCalendar } from "../context/CalendarContext";

interface HeaderProps extends Pick<
  CalendarContentType,
  | "headerClassName"
  | "pastYearLength"
  | "futureYearLength"
  | "onMonthChange"
  | "onViewChange"
  | "events"
> {}

function Header({
  headerClassName,
  pastYearLength,
  futureYearLength,
  onMonthChange,
  onViewChange,
  events,
}: HeaderProps) {
  const { state, dispatch } = useCalendar();
  const { currentDate, view } = state;

  const onMonthArrowClick = (option: EMonthOption) => {
    const isAdd = option === EMonthOption.add;
    dispatch({ type: isAdd ? CALENDAR_ACTIONS.NEXT : CALENDAR_ACTIONS.PREV });

    const unit = (
      view === ECalendarViewType.schedule ? "month" : view
    ) as ManipulateType;
    const predictiveDate = isAdd
      ? currentDate.add(1, unit)
      : currentDate.subtract(1, unit);

    onMonthChange?.(convertToDate(predictiveDate));
  };

  const onDropdownClick = (
    event: ChangeEvent<HTMLSelectElement>,
    option: EYearOption,
  ) => {
    const value = Number(event.target.value);
    let newDate = currentDate;

    if (option === EYearOption.month) {
      newDate = setMonth(currentDate, value);
    } else if (option === EYearOption.year) {
      newDate = setYear(currentDate, value);
    }

    dispatch({ type: CALENDAR_ACTIONS.SET_DATE, payload: newDate });
    onMonthChange?.(convertToDate(newDate));
  };

  const onViewDropdownClick = (e: ChangeEvent<HTMLSelectElement>) => {
    const newView = e.target.value as ECalendarViewType;
    dispatch({ type: CALENDAR_ACTIONS.SET_VIEW, payload: newView });
    onViewChange?.(newView);
  };

  const getHeaderTitle = () => {
    if (view === ECalendarViewType.day) {
      return formatDate(currentDate, DATE_FORMATS.MONTH_DAY_YEAR);
    }
    if (view === ECalendarViewType.week) {
      const startOfWeek = currentDate.startOf("week");
      const endOfWeek = currentDate.endOf("week");
      if (startOfWeek.month() !== endOfWeek.month()) {
        if (startOfWeek.year() !== endOfWeek.year()) {
          return `${formatDate(startOfWeek, DATE_FORMATS.SHORT_MONTH_YEAR)} - ${formatDate(endOfWeek, DATE_FORMATS.SHORT_MONTH_YEAR)}`;
        }
        return `${formatDate(startOfWeek, DATE_FORMATS.SHORT_MONTH)} - ${formatDate(endOfWeek, DATE_FORMATS.SHORT_MONTH_YEAR)}`;
      }
    }
    if (view === ECalendarViewType.schedule) {
      if (events && events.length > 0) {
        let minDate = dateFn(events[0].startDate);
        let maxDate = minDate;

        events.forEach((event) => {
          const sd = dateFn(event.startDate);
          const ed = event.endDate ? dateFn(event.endDate) : sd;
          if (sd.isBefore(minDate)) minDate = sd;
          if (ed.isAfter(maxDate)) maxDate = ed;
        });

        if (
          minDate.month() !== maxDate.month() ||
          minDate.year() !== maxDate.year()
        ) {
          if (minDate.year() !== maxDate.year()) {
            return `${formatDate(minDate, DATE_FORMATS.SHORT_MONTH_YEAR)} - ${formatDate(maxDate, DATE_FORMATS.SHORT_MONTH_YEAR)}`;
          }
          return `${formatDate(minDate, DATE_FORMATS.SHORT_MONTH)} - ${formatDate(maxDate, DATE_FORMATS.SHORT_MONTH_YEAR)}`;
        }
        return formatDate(minDate, DATE_FORMATS.SHORT_MONTH_YEAR);
      }
    }
    return formatDate(currentDate, DATE_FORMATS.MONTH_YEAR);
  };

  return (
    <div className={cx(styles.header, headerClassName)}>
      <div className={styles.navigation}>
        <button
          className={styles.todayButton}
          onClick={() => {
            dispatch({ type: CALENDAR_ACTIONS.TODAY });
            onMonthChange?.(convertToDate(dateFn()));
          }}
        >
          Today
        </button>
        <div className={styles.arrows}>
          <button
            className={styles.iconButton}
            onClick={() => onMonthArrowClick(EMonthOption.sub)}
          >
            <LeftArrow />
          </button>
          <button
            className={styles.iconButton}
            onClick={() => onMonthArrowClick(EMonthOption.add)}
          >
            <RightArrow />
          </button>
        </div>
        <h2 className={styles.dateTitle}>{getHeaderTitle()}</h2>
      </div>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={view}
          onChange={onViewDropdownClick}
        >
          {VIEW_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          id={CALENDER_STRINGS.MONTH}
          name={CALENDER_STRINGS.MONTH}
          value={getMonth(currentDate)}
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
          value={getYear(currentDate)}
          onChange={(e) => onDropdownClick(e, EYearOption.year)}
        >
          {getYearList(
            pastYearLength,
            futureYearLength,
            getYear(currentDate),
          ).map((year: number) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Header;
