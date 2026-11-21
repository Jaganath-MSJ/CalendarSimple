import { describe, it, expect } from "vitest";
import { dateFn } from "./date";
import { getVisibleWeekDays, getRowWeekNumber } from "./weeks";

const fmt = (days: ReturnType<typeof getVisibleWeekDays>) =>
  days.map((d) => d.toFormat("yyyy-MM-dd"));

describe("getVisibleWeekDays", () => {
  it("returns Sun-Sat days for a Sunday start", () => {
    expect(fmt(getVisibleWeekDays(dateFn("2026-11-01"), 0, 6))).toEqual([
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
    ]);
  });

  it("returns only Mon-Fri for a work week", () => {
    expect(fmt(getVisibleWeekDays(dateFn("2026-11-04"), 1, 5))).toEqual([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
    ]);
  });
});

describe("getRowWeekNumber", () => {
  it("uses the Thursday on or after the row start", () => {
    expect(getRowWeekNumber(dateFn("2026-11-01"))).toBe(45);
    expect(getRowWeekNumber(dateFn("2026-11-02"))).toBe(45);
    expect(getRowWeekNumber(dateFn("2026-12-27"))).toBe(53);
  });
});
