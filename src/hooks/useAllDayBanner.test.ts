import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import useAllDayBanner from "./useAllDayBanner";
import { dateFn } from "../utils/date";
import { CalendarEvent } from "../types";

describe("useAllDayBanner Hook", () => {
  const days = [
    dateFn("2024-03-01"),
    dateFn("2024-03-02"),
    dateFn("2024-03-03"),
  ];

  const events: CalendarEvent[] = [
    { id: "1", title: "All Day 1", startDate: "2024-03-01" },
    { id: "2", title: "All Day 2", startDate: "2024-03-01" },
    {
      id: "3",
      title: "Multi Day 1",
      startDate: "2024-03-01T10:00:00",
      endDate: "2024-03-02T10:00:00",
    },
    { id: "4", title: "Not All Day", startDate: "2024-03-01T10:00:00" }, // Should be ignored
  ];

  it("filters and stacks events correctly", () => {
    // 3 events should be picked up (1, 2, 3), #4 is ignored because it's single day with time
    const { result } = renderHook(() =>
      useAllDayBanner(days, events, false, 1),
    );

    expect(result.current.layoutEvents).toHaveLength(3);

    // With maxVisibleRows = 1, and 3 rows total:
    // effectiveMaxRows will be 1 (because 3 != 1+1)
    expect(result.current.rowCount).toBe(3);
    expect(result.current.hasHiddenEvents).toBe(true);

    // Expanding should show all
    const expanded = renderHook(() => useAllDayBanner(days, events, true, 1));
    expect(expanded.result.current.visibleLayoutEvents).toHaveLength(3);
  });
});
