import { describe, it, expect } from "vitest";
import { getVisibleRange } from "./visibleRange";
import { dateFn } from "./date";
import { ECalendarViewType } from "../types";

const iso = (r: {
  start: { toISODate(): string | null };
  end: { toISODate(): string | null };
}) => [r.start.toISODate(), r.end.toISODate()];
const base = { weekStartsOn: 0, weekEndsOn: 6 };

describe("getVisibleRange", () => {
  const nov10 = dateFn("2026-11-10");
  it("month, week starting Sunday", () => {
    expect(iso(getVisibleRange(ECalendarViewType.month, nov10, base))).toEqual([
      "2026-11-01",
      "2026-12-05",
    ]);
  });
  it("month, week starting Monday", () => {
    expect(
      iso(
        getVisibleRange(ECalendarViewType.month, nov10, {
          weekStartsOn: 1,
          weekEndsOn: 0,
        }),
      ),
    ).toEqual(["2026-10-26", "2026-12-06"]);
  });
  it("week", () => {
    expect(
      iso(getVisibleRange(ECalendarViewType.week, dateFn("2026-11-01"), base)),
    ).toEqual(["2026-11-01", "2026-11-07"]);
  });
  it("day", () => {
    expect(iso(getVisibleRange(ECalendarViewType.day, nov10, base))).toEqual([
      "2026-11-10",
      "2026-11-10",
    ]);
  });
  it("customDays", () => {
    expect(
      iso(
        getVisibleRange(ECalendarViewType.customDays, nov10, {
          ...base,
          customDays: 3,
        }),
      ),
    ).toEqual(["2026-11-10", "2026-11-12"]);
  });
  it("customDays is limited to 7", () => {
    expect(
      iso(
        getVisibleRange(ECalendarViewType.customDays, nov10, {
          ...base,
          customDays: 12,
        }),
      ),
    ).toEqual(["2026-11-10", "2026-11-16"]);
  });
  it("schedule spans all events", () => {
    const events = [
      { startDate: "2026-10-03", title: "a" },
      { startDate: "2026-12-20", endDate: "2026-12-22", title: "b" },
    ];
    expect(
      iso(
        getVisibleRange(ECalendarViewType.schedule, nov10, { ...base, events }),
      ),
    ).toEqual(["2026-10-03", "2026-12-22"]);
  });
  it("schedule without events is the selected day", () => {
    expect(
      iso(getVisibleRange(ECalendarViewType.schedule, nov10, base)),
    ).toEqual(["2026-11-10", "2026-11-10"]);
  });
});
