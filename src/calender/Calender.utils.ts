import moment from "moment";
import { DateType } from "./Calender.type";

export const getNoOfDays = (date: DateType): number => {
  const noOfDates = date.daysInMonth();
  return noOfDates;
};

export const getMonthStartingDay = (date: DateType): number => {
  const monthStartingDay = Number(date.startOf("month").format("d"));
  return monthStartingDay;
};

export const convertToDate = (momentDate: DateType): Date => {
  const date = momentDate.toDate();
  return date;
};

export const convertToMoment = (date: Date): DateType => {
  const momentDate = moment(date);
  return momentDate;
};

export const getYearList = (
  pastLength: number,
  futureLength: number,
  selectedYear: number
): number[] => {
  const yearLength = pastLength + futureLength;
  const yearStarting = moment().year() - pastLength + 1;
  const yearList = Array.from(
    { length: yearLength },
    (_, index) => index + yearStarting
  );

  if (!yearList.includes(selectedYear)) {
    if (moment().year() <= selectedYear) {
      yearList.push(selectedYear);
    } else {
      return [selectedYear, ...yearList];
    }
  }
  return yearList;
};

export const checkIsToday = (selectedDate: DateType, dates: number): boolean => {
  const cloneSelectedDate = selectedDate.clone();
  cloneSelectedDate.date(dates);

  const isToday = moment().isSame(cloneSelectedDate, "D");
  return isToday;
};

export { moment as date };
