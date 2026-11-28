import React, { ChangeEvent } from "react";
import cx from "classnames";
import {
  CalendarContentProps,
  ECalendarViewType,
  MonthListType,
} from "../../types";
import {
  CALENDAR_STRINGS,
  DATE_FORMATS,
  CALENDAR_ACTIONS,
  VIEW_OPTIONS,
  resolveMessages,
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
  getMonthList,
  getVisibleWeekDays,
  getRowWeekNumber,
  getLastEventDay,
  getNavigatedDate,
  clampCustomDays,
  formatMonth,
  formatMonthYear,
} from "../../utils";
import styles from "./Header.module.css";
import LeftArrow from "../../assets/LeftArrow";
import RightArrow from "../../assets/RightArrow";
import { useCalendar } from "../../context/CalendarContext";
import useCalendarProps from "../../hooks/useCalendarProps";

enum EMonthOption {
  add = "add",
  sub = "sub",
}

enum EYearOption {
  month = "month",
  year = "year",
}

export type HeaderProps = Partial<
  Pick<
    CalendarContentProps,
    | "pastYearLength"
    | "futureYearLength"
    | "onNavigate"
    | "onViewChange"
    | "customDays"
    | "resetDateOnViewChange"
    | "localeMessages"
    | "showWeekNumbers"
  >
> & {
  headerClassName?: string;
};

function Header(props: HeaderProps) {
  const {
    pastYearLength,
    futureYearLength,
    onNavigate,
    onViewChange,
    customDays,
    events,
    resetDateOnViewChange,
    locale,
    localeMessages,
    classNames,
    showWeekNumbers,
    weekStartsOn,
    weekEndsOn,
  } = useCalendarProps(props) as CalendarContentProps & {
    headerClassName?: string;
  };

  const messages = resolveMessages(localeMessages);
  const finalHeaderClassName = props.headerClassName || classNames?.header;
  const { state, dispatch, testId } = useCalendar();
  const { selectedDate, view } = state;

  const onMonthArrowClick = (option: EMonthOption) => {
    const isAdd = option === EMonthOption.add;
    dispatch({ type: isAdd ? CALENDAR_ACTIONS.NEXT : CALENDAR_ACTIONS.PREV });

    const predictiveDate = getNavigatedDate(
      { selectedDate, view, customDays },
      isAdd ? 1 : -1,
    );

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
      const days = getVisibleWeekDays(
        selectedDate,
        weekStartsOn ?? 0,
        weekEndsOn ?? 6,
      );
      const startOfWeek = days[0];
      const endOfWeek = days[days.length - 1];
      const weekSuffix = showWeekNumbers
        ? `  ·  ${messages.weekNumber(getRowWeekNumber(startOfWeek))}`
        : "";
      let baseString;
      if (startOfWeek.month !== endOfWeek.month) {
        if (startOfWeek.year !== endOfWeek.year) {
          baseString = `${formatMonthYear(startOfWeek, locale, "short")} - ${formatMonthYear(endOfWeek, locale, "short")}`;
        } else {
          baseString = `${formatMonth(startOfWeek, locale)} - ${formatMonthYear(endOfWeek, locale, "short")}`;
        }
      } else {
        baseString = formatMonthYear(startOfWeek, locale);
      }
      return `${baseString}${weekSuffix}`;
    }
    if (view === ECalendarViewType.customDays) {
      const days = customDays || 3;
      const endDate = selectedDate.plus({ days: days - 1 });
      if (selectedDate.month !== endDate.month) {
        if (selectedDate.year !== endDate.year) {
          return `${formatMonthYear(selectedDate, locale, "short")} - ${formatMonthYear(endDate, locale, "short")}`;
        }
        return `${formatMonth(selectedDate, locale)} - ${formatMonthYear(endDate, locale, "short")}`;
      }
      if (days === 1) {
        return formatDate(selectedDate, DATE_FORMATS.MONTH_DAY_YEAR, locale);
      }
      return `${formatDate(selectedDate, DATE_FORMATS.DAY_DATE_SHORT_MONTH, locale)} - ${formatDate(endDate, DATE_FORMATS.DAY_DATE_SHORT_MONTH, locale)}, ${formatDate(selectedDate, "yyyy", locale)}`;
    }
    if (view === ECalendarViewType.schedule) {
      if (events && events.length > 0) {
        let minDate = dateFn(events[0].startDate);
        let maxDate = minDate;

        events.forEach((event) => {
          const sd = dateFn(event.startDate);
          const ed = getLastEventDay(event);
          if (sd < minDate) minDate = sd;
          if (ed > maxDate) maxDate = ed;
        });

        if (minDate.month !== maxDate.month || minDate.year !== maxDate.year) {
          if (minDate.year !== maxDate.year) {
            return `${formatMonthYear(minDate, locale, "short")} - ${formatMonthYear(maxDate, locale, "short")}`;
          }
          return `${formatMonth(minDate, locale)} - ${formatMonthYear(maxDate, locale, "short")}`;
        }
        return formatMonthYear(minDate, locale, "short");
      }
    }
    return formatMonthYear(selectedDate, locale);
  };

  return (
    <div
      className={cx(styles.header, finalHeaderClassName)}
      data-testid={`${testId}-header`}
    >
      <nav
        className={styles.navigation}
        aria-label={messages.calendarNavigation}
      >
        <button
          className={styles.todayButton}
          data-testid={`${testId}-header-today-btn`}
          aria-label={messages.today}
          onClick={() => {
            dispatch({ type: CALENDAR_ACTIONS.TODAY });
            onNavigate?.(convertToDate(dateFn()));
          }}
        >
          {messages.today}
        </button>
        {view !== ECalendarViewType.schedule && (
          <div className={styles.arrows}>
            <button
              className={styles.iconButton}
              data-testid={`${testId}-header-prev-btn`}
              aria-label={messages.previous}
              onClick={() => onMonthArrowClick(EMonthOption.sub)}
            >
              <span className={styles.iconButtonIcon}>
                <LeftArrow />
              </span>
            </button>
            <button
              className={styles.iconButton}
              data-testid={`${testId}-header-next-btn`}
              aria-label={messages.next}
              onClick={() => onMonthArrowClick(EMonthOption.add)}
            >
              <span className={styles.iconButtonIcon}>
                <RightArrow />
              </span>
            </button>
          </div>
        )}
        <h2 className={styles.dateTitle}>{getHeaderTitle()}</h2>
      </nav>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={view}
          data-testid={`${testId}-header-view-select`}
          aria-label={messages.selectView}
          onChange={onViewDropdownClick}
        >
          {VIEW_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {messages[option.value]}
            </option>
          ))}
          {customDays !== undefined && (
            <option key="customDays" value={ECalendarViewType.customDays}>
              {clampCustomDays(customDays)} {messages.days}
            </option>
          )}
        </select>
        <select
          className={styles.select}
          id={CALENDAR_STRINGS.MONTH}
          name={CALENDAR_STRINGS.MONTH}
          value={getMonth(selectedDate)}
          data-testid={`${testId}-header-month-select`}
          aria-label={messages.selectMonth}
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
          aria-label={messages.selectYear}
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
