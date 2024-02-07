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
  CalenderType,
  DateType,
  EMonthOption,
  EYearOption,
  MonthListType,
  defaultCalenderProps,
} from "./Calender.type";
import {
  CALENDER_STRINGS,
  DAY_LIST_NAME,
  MONTH_LIST,
} from "./Calender.constant";
import {
  date,
  convertToDate,
  getMonthStartingDay,
  getNoOfDays,
  getYearList,
  convertToMoment,
  checkIsToday,
} from "./Calender.utils";
import CalenderStyles, { ButtonStyles, SelectStyles } from "./Calender.styles";
import DateData from "./DateData";
import LeftArrow from "../assets/LeftArrow";
import RightArrow from "../assets/RightArrow";

function Calender(props: CalenderType = defaultCalenderProps) {
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

  const selectedDateMoment: DateType = useMemo(
    () => (selected_date ? convertToMoment(selected_date) : date()),
    [selected_date]
  );
  const [selectedDate, setSelectedDate] = useState<DateType>(selectedDateMoment);

  useLayoutEffect(() => {
    setSelectedDate(selectedDateMoment);
  }, [selectedDateMoment]);

  const getDates = useCallback((): ReactNode[] => {
    const dateComponent: ReactNode[] = [];
    const noOfDays: number = getNoOfDays(selectedDate.clone());
    const monthStartDay: number = getMonthStartingDay(selectedDate.clone());
    const noOfRows: number = Math.round((noOfDays + monthStartDay) / 7 + 0.4);
    let dates: number = 1;

    const onClickDateHandler = (date: number) => {
      const cloneSelectedDate = selectedDate.clone();
      if (date !== cloneSelectedDate.date()) {
        cloneSelectedDate.date(date);
        setSelectedDate(cloneSelectedDate.clone());
        onDateClick?.(convertToDate(cloneSelectedDate.clone()));
      }
    };

    for (let row = 1; row <= noOfRows; row++) {
      const tableRow: ReactNode[] = [];
      let days: number = 7;

      for (let day = 1; day <= days; day++) {
        if ((row === 1 && day <= monthStartDay) || dates > noOfDays) {
          const emptyData: ReactNode = <td key={`empty_${day}`} />;
          tableRow.push(emptyData);
        } else {
          const dateData: ReactNode = (
            <DateData
              key={`date_${dates}`}
              isSelected={isSelectDate && dates === selectedDate.date()}
              isToday={checkIsToday(selectedDate, dates)}
              onClick={isSelectDate ? onClickDateHandler : undefined}
              date={dates}
              data={data[dates - 1]}
              className={tableDateClassName}
              dataClassName={dataClassName}
              selectedClassName={selectedClassName}
              todayClassName={todayClassName}
            />
          );
          dates++;
          tableRow.push(dateData);
        }
      }
      const rowData: ReactNode = <tr key={row}>{tableRow}</tr>;
      dateComponent.push(rowData);
    }
    return dateComponent;
  }, [
    data,
    selectedDate,
    dataClassName,
    selectedClassName,
    todayClassName,
    tableDateClassName,
    onDateClick,
    isSelectDate,
  ]);

  const onMonthArrowClick = (option: EMonthOption) => {
    const clonedSelectedDate = selectedDate.clone();

    if (option === EMonthOption.add) {
      clonedSelectedDate.month(clonedSelectedDate.month() + 1);
    } else if (option === EMonthOption.sub) {
      clonedSelectedDate.month(clonedSelectedDate.month() - 1);
    }

    setSelectedDate(clonedSelectedDate);
    onMonthChange?.(convertToDate(clonedSelectedDate));
  };

  const onDropdownClick = (
    event: ChangeEvent<HTMLSelectElement>,
    option: EYearOption
  ) => {
    const value = Number(event.target.value);
    const clonedSelectedDate = selectedDate.clone();

    if (option === EYearOption.month) {
      clonedSelectedDate.month(value);
    } else if (option === EYearOption.year) {
      clonedSelectedDate.year(value);
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
}

export default memo(Calender);
