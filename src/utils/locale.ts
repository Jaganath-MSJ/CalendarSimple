import { Info } from "luxon";
import { EDayType, MonthListType } from "../types";

export function getDayListNames(dayType: EDayType, locale?: string): string[] {
  const format = dayType === EDayType.full ? "long" : "short";
  const days = Info.weekdays(format, { locale: locale || "en" });
  // Luxon returns Mon-Sun. We need Sun-Sat to match expected 0-6 index.
  return [days[6], ...days.slice(0, 6)];
}

export function getMonthList(locale?: string): MonthListType[] {
  return Info.months("long", { locale: locale || "en" }).map((label, i) => ({
    label,
    value: i,
  }));
}
