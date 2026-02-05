import React, { ChangeEvent } from "react";
import cx from "classnames";
import {
  EMonthOption,
  EYearOption,
  MonthListType,
  DateType,
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

interface HeaderProps {
  selectedDate: DateType;
  onMonthChange?: (date: Date) => void;
  setSelectedDate: (date: DateType) => void;
  headerClassName?: string;
  pastYearLength?: number;
  futureYearLength?: number;
}

function Header({
  selectedDate,
  onMonthChange,
  setSelectedDate,
  headerClassName,
  pastYearLength = 5,
  futureYearLength = 5,
}: HeaderProps) {
  const onMonthArrowClick = (option: EMonthOption) => {
    let clonedSelectedDate = selectedDate;

    if (option === EMonthOption.add) {
      clonedSelectedDate = dateFn(clonedSelectedDate).month(
        clonedSelectedDate.month() + 1,
      );
    } else if (option === EMonthOption.sub) {
      clonedSelectedDate = dateFn(clonedSelectedDate).month(
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
      clonedSelectedDate = dateFn(clonedSelectedDate).month(value);
    } else if (option === EYearOption.year) {
      clonedSelectedDate = dateFn(clonedSelectedDate).year(value);
    }

    setSelectedDate(clonedSelectedDate);
    onMonthChange?.(convertToDate(clonedSelectedDate));
  };

  return (
    <div className={cx(styles.header, headerClassName)}>
      <div className={styles.navigation}>
        <button
          className={styles.todayButton}
          onClick={() => {
            setSelectedDate(dateFn());
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
        <h2 className={styles.dateTitle}>{selectedDate.format("MMMM YYYY")}</h2>
      </div>

      <div className={styles.controls}>
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
    </div>
  );
}

export default Header;
