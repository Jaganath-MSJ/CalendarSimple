import React, { ChangeEvent } from "react";
import cx from "classnames";
import {
  CalendarContentProps,
  ECalendarViewType,
  MonthListType,
} from "../../types";
import {
  CALENDAR_STRINGS,
  getMonthList,
  DATE_FORMATS,
  CALENDAR_ACTIONS,
  VIEW_OPTIONS,
} from "../../constants";
import {
  dateFn,
  getYearList,
  convertToDate,
  setMonth,
  setYear,
  formatDate,
  getMonth,
  getYear,
} from "../../utils";
import styles from "./Header.module.css";
import LeftArrow from "../../assets/LeftArrow";
import RightArrow from "../../assets/RightArrow";
import { useCalendar } from "../../context/CalendarContext";

enum EMonthOption {
  add = "add",
  sub = "sub",
}

enum EYearOption {
  month = "month",
  year = "year",
}

interface HeaderProps extends Pick<
  CalendarContentProps,
  | "pastYearLength"
  | "futureYearLength"
  | "onNavigate"
  | "onViewChange"
  | "events"
  | "customDays"
  | "resetDateOnViewChange"
  | "locale"
  | "localeMessages"
> {
  headerClassName?: string;
}

function Header({
  headerClassName,
  pastYearLength,
  futureYearLength,
  onNavigate,
  onViewChange,
  customDays,
  events,
  resetDateOnViewChange,
  locale,
  localeMessages,
}: HeaderProps) {
  const { state, dispatch, testId } = useCalendar();
  const { selectedDate, view } = state;

  const onMonthArrowClick = (option: EMonthOption) => {
    const isAdd = option === EMonthOption.add;
    dispatch({ type: isAdd ? CALENDAR_ACTIONS.NEXT : CALENDAR_ACTIONS.PREV });

    const unit = (view === ECalendarViewType.schedule ? "day" : view) as
      | "day"
      | "week"
      | "month"
      | "year";

    let predictiveDate;
    if (view === ECalendarViewType.customDays) {
      predictiveDate = isAdd
        ? selectedDate.plus({ day: customDays || 3 })
        : selectedDate.minus({ day: customDays || 3 });
    } else {
      predictiveDate = isAdd
        ? selectedDate.plus({ [unit]: 1 })
        : selectedDate.minus({ [unit]: 1 });
    }

    onNavigate?.(convertToDate(predictiveDate));
  };

  const onDropdownClick = (
    event: ChangeEvent<HTMLSelectElement>,
    option: EYearOption,
  ) => {
    const value = Number(event.target.value);
    let newDate = selectedDate;

    if (option === EYearOption.month) {
      newDate = setMonth(selectedDate, value);
    } else if (option === EYearOption.year) {
      newDate = setYear(selectedDate, value);
    }

    dispatch({ type: CALENDAR_ACTIONS.SET_DATE, payload: newDate });
    onNavigate?.(convertToDate(newDate));
  };

  const onViewDropdownClick = (e: ChangeEvent<HTMLSelectElement>) => {
    const newView = e.target.value as ECalendarViewType;
    dispatch({ type: CALENDAR_ACTIONS.SET_VIEW, payload: newView });
    if (resetDateOnViewChange) {
      dispatch({ type: CALENDAR_ACTIONS.TODAY });
      onNavigate?.(convertToDate(dateFn()));
    }
    onViewChange?.(newView);
  };

  const getHeaderTitle = () => {
    if (view === ECalendarViewType.day) {
      return formatDate(selectedDate, DATE_FORMATS.MONTH_DAY_YEAR, locale);
    }
    if (view === ECalendarViewType.week) {
      const startOfWeek = selectedDate.startOf("week");
      const endOfWeek = selectedDate.endOf("week");
      if (startOfWeek.month !== endOfWeek.month) {
        if (startOfWeek.year !== endOfWeek.year) {
          return `${formatDate(startOfWeek, DATE_FORMATS.SHORT_MONTH_YEAR, locale)} - ${formatDate(endOfWeek, DATE_FORMATS.SHORT_MONTH_YEAR, locale)}`;
        }
        return `${formatDate(startOfWeek, DATE_FORMATS.SHORT_MONTH, locale)} - ${formatDate(endOfWeek, DATE_FORMATS.SHORT_MONTH_YEAR, locale)}`;
      }
    }
    if (view === ECalendarViewType.customDays) {
      const days = customDays || 3;
      const endDate = selectedDate.plus({ day: days - 1 });
      if (selectedDate.month !== endDate.month) {
        if (selectedDate.year !== endDate.year) {
          return `${formatDate(selectedDate, DATE_FORMATS.SHORT_MONTH_YEAR, locale)} - ${formatDate(endDate, DATE_FORMATS.SHORT_MONTH_YEAR, locale)}`;
        }
        return `${formatDate(selectedDate, DATE_FORMATS.SHORT_MONTH, locale)} - ${formatDate(endDate, DATE_FORMATS.SHORT_MONTH_YEAR, locale)}`;
      }
      if (days === 1) {
        return formatDate(selectedDate, DATE_FORMATS.MONTH_DAY_YEAR, locale);
      }
      return `${formatDate(selectedDate, DATE_FORMATS.DAY_DATE_SHORT_MONTH, locale)} - ${formatDate(endDate, DATE_FORMATS.DAY_DATE_SHORT_MONTH, locale)}, ${formatDate(selectedDate, "yyyy")}`;
    }
    if (view === ECalendarViewType.schedule) {
      if (events && events.length > 0) {
        let minDate = dateFn(events[0].startDate);
        let maxDate = minDate;

        events.forEach((event) => {
          const sd = dateFn(event.startDate);
          const ed = event.endDate ? dateFn(event.endDate) : sd;
          if (sd < minDate) minDate = sd;
          if (ed > maxDate) maxDate = ed;
        });

        if (minDate.month !== maxDate.month || minDate.year !== maxDate.year) {
          if (minDate.year !== maxDate.year) {
            return `${formatDate(minDate, DATE_FORMATS.SHORT_MONTH_YEAR, locale)} - ${formatDate(maxDate, DATE_FORMATS.SHORT_MONTH_YEAR, locale)}`;
          }
          return `${formatDate(minDate, DATE_FORMATS.SHORT_MONTH, locale)} - ${formatDate(maxDate, DATE_FORMATS.SHORT_MONTH_YEAR, locale)}`;
        }
        return formatDate(minDate, DATE_FORMATS.SHORT_MONTH_YEAR, locale);
      }
    }
    return formatDate(selectedDate, DATE_FORMATS.MONTH_YEAR, locale);
  };

  return (
    <div
      className={cx(styles.header, headerClassName)}
      data-testid={`${testId}-header`}
    >
      <div className={styles.navigation}>
        <button
          className={styles.todayButton}
          data-testid={`${testId}-header-today-btn`}
          onClick={() => {
            dispatch({ type: CALENDAR_ACTIONS.TODAY });
            onNavigate?.(convertToDate(dateFn()));
          }}
        >
          {localeMessages?.today || "Today"}
        </button>
        <div className={styles.arrows}>
          <button
            className={styles.iconButton}
            data-testid={`${testId}-header-prev-btn`}
            onClick={() => onMonthArrowClick(EMonthOption.sub)}
          >
            <LeftArrow />
          </button>
          <button
            className={styles.iconButton}
            data-testid={`${testId}-header-next-btn`}
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
          data-testid={`${testId}-header-view-select`}
          onChange={onViewDropdownClick}
        >
          {VIEW_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {localeMessages?.[option.value as keyof typeof localeMessages] ||
                option.label}
            </option>
          ))}
          {customDays && customDays > 0 && customDays < 11 && (
            <option key={customDays} value={ECalendarViewType.customDays}>
              {customDays} {localeMessages?.days || "Days"}
            </option>
          )}
        </select>
        <select
          className={styles.select}
          id={CALENDAR_STRINGS.MONTH}
          name={CALENDAR_STRINGS.MONTH}
          value={getMonth(selectedDate)}
          data-testid={`${testId}-header-month-select`}
          onChange={(e) => onDropdownClick(e, EYearOption.month)}
        >
          {getMonthList(locale).map((month: MonthListType) => (
            <option key={month.label} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          id={CALENDAR_STRINGS.YEAR}
          name={CALENDAR_STRINGS.YEAR}
          value={getYear(selectedDate)}
          data-testid={`${testId}-header-year-select`}
          onChange={(e) => onDropdownClick(e, EYearOption.year)}
        >
          {getYearList(
            pastYearLength,
            futureYearLength,
            getYear(selectedDate),
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
