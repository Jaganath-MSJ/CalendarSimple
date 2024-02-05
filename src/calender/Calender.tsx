import React, {
  ChangeEvent,
  useCallback,
  useLayoutEffect,
  useState,
} from "react";
import {
  CalenderType,
  DateType,
  EDayType,
  EMonthOption,
  EYearOption,
} from "./Calender.type";
import {
  CALENDER_STRINGS,
  DAY_LIST_FULL_NAME,
  DAY_LIST_HALF_NAME,
  MONTH_LIST,
  YEAR_LIST_FUTURE_LENGTH,
  YEAR_LIST_PAST_LENGTH,
} from "./Calender.constant";
import {
  date,
  convertToDate,
  getMonthStartingDay,
  getNoOfDays,
  getYearList,
} from "./Calender.utils";
import CalenderStyles, { ButtonStyles, SelectStyles } from "./Calender.styles";
import DateData from "./DateData";
import LeftArrow from "../assets/LeftArrow";
import RightArrow from "../assets/RightArrow";

function Calender(props: CalenderType) {
  const {
    dayType = EDayType.halfName,
    data = [],
    width = 400,
    height = 400,
    onDateClick,
    onMonthChange,
    isSelectDate = false,
    className,
    headerClassName,
    tableClassName,
    tableDateClassName,
    dataClassName,
    selectedClassName,
    todayClassName,
    pastYearLength = YEAR_LIST_PAST_LENGTH,
    fututeYearLength = YEAR_LIST_FUTURE_LENGTH,
  } = props;

  const [selectedDate, setSelectedDate] = useState<DateType>(date());
  const [noOfDays, setNoOfDays] = useState<number>(getNoOfDays(date()));
  const [monthStartDay, setMonthStartDay] = useState<number>(
    getMonthStartingDay(date())
  );

  let dayList: string[] = [];
  if (dayType === EDayType.fullName) {
    dayList = DAY_LIST_FULL_NAME;
  } else if (dayType === EDayType.halfName) {
    dayList = DAY_LIST_HALF_NAME;
  }

  useLayoutEffect(() => {
    setNoOfDays(getNoOfDays(selectedDate));
    setMonthStartDay(getMonthStartingDay(selectedDate));
  }, [selectedDate]);

  const getDates = useCallback((): React.ReactNode[] => {
    const dateComponent: React.ReactNode[] = [];
    let noOfRows = Math.round((noOfDays + monthStartDay) / 7 + 0.4);
    let dates = 1;

    const onClickDateHandler = (date: number) => {
      const cloneSelectedDate = selectedDate.clone();
      cloneSelectedDate.date(date);
      setSelectedDate(cloneSelectedDate);
      onDateClick?.(convertToDate(cloneSelectedDate));
    };

    for (let row = 1; row <= noOfRows; row++) {
      const tableRow: React.ReactNode[] = [];
      let days = 7;

      for (let day = 1; day <= days; day++) {
        if ((row === 1 && day <= monthStartDay) || dates > noOfDays) {
          const emptyData = <td key={`empty_${day}`} />;
          tableRow.push(emptyData);
        } else {
          const dateData = (
            <DateData
              key={`date_${dates}`}
              isSelected={isSelectDate && dates === selectedDate.date()}
              isToday={
                date().date() === dates &&
                date().isSame(selectedDate, "month") &&
                date().isSame(selectedDate, "year")
              }
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
      dateComponent.push(<tr key={row}>{tableRow}</tr>);
    }
    return dateComponent;
  }, [
    noOfDays,
    data,
    selectedDate,
    monthStartDay,
    dataClassName,
    selectedClassName,
    todayClassName,
    tableDateClassName,
    onDateClick,
    isSelectDate,
  ]);

  const onMonthArrowClick = (option: EMonthOption) => {
    const clonedSelectedDate: DateType = selectedDate.clone();

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
    const clonedSelectedDate: DateType = selectedDate.clone();

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
            {MONTH_LIST.map((month) => (
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
              fututeYearLength,
              selectedDate.year()
            ).map((year) => (
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
            {dayList.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>{getDates()}</tbody>
      </table>
    </CalenderStyles>
  );
}

export default React.memo(Calender);
