import dayjs, { Dayjs } from "dayjs";

export type DateType = Dayjs;
export const dateFn = dayjs;

export const getNoOfDays = (date: DateType): number => {
  const noOfDates = dayjs(date).daysInMonth();
  return noOfDates;
};

export const getMonthStartingDay = (date: DateType): number => {
  const monthStartingDay = Number(dayjs(date).startOf("month").format("d"));
  return monthStartingDay;
};

export const convertToDate = (dayjsDate: DateType): Date => {
  const date = dayjs(dayjsDate).toDate();
  return date;
};

export const convertToDayjs = (date: Date): DateType => {
  const dayjsDate = dayjs(date);
  return dayjsDate;
};

export const getYearList = (
  pastLength: number,
  futureLength: number,
  selectedYear: number,
): number[] => {
  const yearLength = pastLength + futureLength;
  const yearStarting = dayjs().year() - pastLength;
  const yearList = Array.from(
    { length: yearLength },
    (_, index) => index + yearStarting,
  );

  if (!yearList.includes(selectedYear)) {
    if (dayjs().year() <= selectedYear) {
      yearList.push(selectedYear);
    } else {
      return [selectedYear, ...yearList];
    }
  }
  return yearList;
};

export const checkIsToday = (
  selectedDate: DateType,
  dates: number,
): boolean => {
  const cloneSelectedDate = dayjs(selectedDate).date(dates);

  const isToday = dayjs().isSame(cloneSelectedDate, "day");
  return isToday;
};
