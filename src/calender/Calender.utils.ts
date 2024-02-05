import moment from "moment";
import { SelectedDataType, DateType } from "./Calender.type";

export const getNoOfDays = (date: DateType): number => {
  const noOfDates = date.daysInMonth();
  return noOfDates;
};

export const getMonthStartingDay = (date: DateType): number => {
  const monthStartingDay = Number(date.startOf("month").format("d"));
  return monthStartingDay;
};

export const getDateFromSelectedDate = (
  selectedDate: SelectedDataType
): DateType => {
  const date = moment(selectedDate);
  console.log(date);
  return date;
};

export const convertToDate = (selectedDate: DateType): Date => {
  const date = selectedDate.toDate();
  return date;
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

export { moment as date };
