import React, {
  ChangeEvent,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  memo,
  ReactNode,
} from "react";
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
import CalenderStyles, { ButtonStyles, SelectStyles } from "./Calendar.styles";
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
    [selected_date]
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
    [data]
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
      return (
        <tr key={weekIndex + 1}>
          {week.map((day, dayIndex) => {
            if (day === 0) return <td key={`empty_idx${day}_${dayIndex}`} />;
            const data = dataEvents.filter(
              (event) => date(event.startDate).day() === day,
            );
            return (
            <DateData
                key={`date_${weekIndex}_${dayIndex}`}
              isSelected={isSelectDate && day === selectedDate.date()}
              isToday={checkIsToday(selectedDate, day)}
              onClick={isSelectDate ? onClickDateHandler : undefined}
              date={day}
                data={data}
                cellWidth={width / 7}
              className={tableDateClassName}
              dataClassName={dataClassName}
              selectedClassName={selectedClassName}
              todayClassName={todayClassName}
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
        clonedSelectedDate.month() + 1
      );
    } else if (option === EMonthOption.sub) {
      clonedSelectedDate = date(clonedSelectedDate).month(
        clonedSelectedDate.month() - 1
      );
    }

    setSelectedDate(clonedSelectedDate);
    onMonthChange?.(convertToDate(clonedSelectedDate));
  };

  const onDropdownClick = (
    event: ChangeEvent<HTMLSelectElement>,
    option: EYearOption
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
    <CalenderStyles
      $width={`${width}px`}
      $height={`${height}px`}
      className={className}
    >
      <div className={headerClassName}>
        <ButtonStyles onClick={() => onMonthArrowClick(EMonthOption.sub)}>
          <LeftArrow />
        </ButtonStyles>
        <div>
          <SelectStyles
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
          </SelectStyles>
          <SelectStyles
            id={CALENDER_STRINGS.YEAR}
            name={CALENDER_STRINGS.YEAR}
            value={selectedDate.year()}
            onChange={(e) => onDropdownClick(e, EYearOption.year)}
          >
            {getYearList(
              pastYearLength,
              futureYearLength,
              selectedDate.year()
            ).map((year: number) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </SelectStyles>
        </div>
        <ButtonStyles onClick={() => onMonthArrowClick(EMonthOption.add)}>
          <RightArrow />
        </ButtonStyles>
      </div>
      <table className={tableClassName}>
        <thead>
          <tr>
            {DAY_LIST_NAME[dayType].map((day: string) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>{getDates()}</tbody>
      </table>
    </CalenderStyles>
  );
};

export default memo(Calender);
