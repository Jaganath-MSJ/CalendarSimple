import { describe, it, expect } from "vitest";
import { getNavigatedDate } from "./navigation";
import { dateFn } from "./date";
import { ECalendarViewType } from "../types";

const start = dateFn("2026-01-31");
const iso = (d: ReturnType<typeof dateFn>) => d.toFormat("yyyy-MM-dd");

describe("getNavigatedDate", () => {
  it.each([
    [ECalendarViewType.month, "2026-02-28", "2025-12-31"],
    [ECalendarViewType.week, "2026-02-07", "2026-01-24"],
    [ECalendarViewType.day, "2026-02-01", "2026-01-30"],
    [ECalendarViewType.schedule, "2026-01-31", "2026-01-31"],
  ])("moves %s view", (view, next, prev) => {
    const state = { selectedDate: start, view };
    expect(iso(getNavigatedDate(state, 1))).toBe(next);
    expect(iso(getNavigatedDate(state, -1))).toBe(prev);
  });

  it("moves customDays by customDays", () => {
    const state = {
      selectedDate: start,
      view: ECalendarViewType.customDays,
      customDays: 5,
    };
    expect(iso(getNavigatedDate(state, 1))).toBe("2026-02-05");
    expect(iso(getNavigatedDate(state, -1))).toBe("2026-01-26");
  });

  it("defaults customDays to 3", () => {
    const state = { selectedDate: start, view: ECalendarViewType.customDays };
    expect(iso(getNavigatedDate(state, 1))).toBe("2026-02-03");
    expect(iso(getNavigatedDate(state, -1))).toBe("2026-01-28");
  });
});
