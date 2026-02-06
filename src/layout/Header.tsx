import React, { ChangeEvent } from "react";
import cx from "classnames";
import {
  EMonthOption,
  EYearOption,
  MonthListType,
} from "../components/Calendar.type";
import { CALENDER_STRINGS, MONTH_LIST } from "../components/Calendar.constant";
import {
  date as dateFn,
  getYearList,
  convertToDate,
} from "../components/Calendar.utils";
import styles from "./Header.module.css";
import LeftArrow from "../assets/LeftArrow";
import RightArrow from "../assets/RightArrow";
import { useCalendar } from "../components/Calendar/context/CalendarContext";

interface HeaderProps {
  headerClassName?: string;
  pastYearLength?: number;
  futureYearLength?: number;
  // Optional callback for external listeners if needed
  onMonthChange?: (date: Date) => void;
}

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
      const nextDate = currentDate.add(1, "month"); // predictive for callback
      onMonthChange?.(convertToDate(nextDate));
    } else if (option === EMonthOption.sub) {
      dispatch({ type: "PREV" });
      const prevDate = currentDate.subtract(1, "month"); // predictive for callback
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
      newDate = dateFn(currentDate).month(value);
    } else if (option === EYearOption.year) {
      newDate = dateFn(currentDate).year(value);
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
        <h2 className={styles.dateTitle}>{currentDate.format("MMMM YYYY")}</h2>
      </div>

      <div className={styles.controls}>
        <select
          className={styles.select}
          id={CALENDER_STRINGS.MONTH}
          name={CALENDER_STRINGS.MONTH}
          value={currentDate.month()}
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
          value={currentDate.year()}
          onChange={(e) => onDropdownClick(e, EYearOption.year)}
        >
          {getYearList(
            pastYearLength,
            futureYearLength,
            currentDate.year(),
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
