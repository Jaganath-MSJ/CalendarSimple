import React, { ChangeEvent } from "react";
import cx from "classnames";
import {
  CalendarType,
  EMonthOption,
  EYearOption,
  MonthListType,
} from "../types";
import { CALENDER_STRINGS, MONTH_LIST } from "../constants";
import {
  dateFn,
  getYearList,
  convertToDate,
  addMonths,
  subMonths,
  setMonth,
  setYear,
  formatDate,
  getMonth,
  getYear,
} from "../utils";
import styles from "./Header.module.css";
import LeftArrow from "../assets/LeftArrow";
import RightArrow from "../assets/RightArrow";
import { useCalendar } from "../context/CalendarContext";

interface HeaderProps extends Pick<
  CalendarType,
  "headerClassName" | "pastYearLength" | "futureYearLength" | "onMonthChange"
> {}

function Header({
  headerClassName,
  pastYearLength = 5,
  futureYearLength = 5,
  onMonthChange,
}: HeaderProps) {
  const { state, dispatch } = useCalendar();
  const { currentDate } = state;

  const onMonthArrowClick = (option: EMonthOption) => {
    if (option === EMonthOption.add) {
      dispatch({ type: "NEXT" });
      const nextDate = addMonths(currentDate, 1); // predictive for callback
      onMonthChange?.(convertToDate(nextDate));
    } else if (option === EMonthOption.sub) {
      dispatch({ type: "PREV" });
      const prevDate = subMonths(currentDate, 1); // predictive for callback
      onMonthChange?.(convertToDate(prevDate));
    }
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

    dispatch({ type: "SET_DATE", payload: newDate });
    onMonthChange?.(convertToDate(newDate));
  };

  return (
    <div className={cx(styles.header, headerClassName)}>
      <div className={styles.navigation}>
        <button
          className={styles.todayButton}
          onClick={() => {
            dispatch({ type: "TODAY" });
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
        <h2 className={styles.dateTitle}>
          {formatDate(currentDate, "MMMM YYYY")}
        </h2>
      </div>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={state.view}
          onChange={(e) =>
            dispatch({ type: "SET_VIEW", payload: e.target.value as any })
          }
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="day">Day</option>
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
