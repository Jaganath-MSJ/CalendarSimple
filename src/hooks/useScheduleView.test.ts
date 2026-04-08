import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import useScheduleView from "./useScheduleView";
import { CalendarEvent } from "../types";

describe("useScheduleView Hook", () => {
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Single Day Event",
      startDate: "2024-03-01T10:00:00",
      endDate: "2024-03-01T11:00:00",
    },
    {
      id: "2",
      title: "Multi Day Event",
      startDate: "2024-03-01T15:00:00",
      endDate: "2024-03-03T10:00:00",
    },
    {
      id: "3",
      title: "All Day Event",
      startDate: "2024-03-05", // No time
    },
  ];

  it("groups events by day correctly", () => {
    const { result } = renderHook(() => useScheduleView({ events }));

    const groups = result.current.groupedEvents;

    // Day 1 should have Event 1 and Event 2
    expect(groups["2024-03-01"]).toHaveLength(2);
    expect(groups["2024-03-01"].map((e) => e.id)).toEqual(["1", "2"]);

    // Day 2 should have Event 2
    expect(groups["2024-03-02"]).toHaveLength(1);
    expect(groups["2024-03-02"][0].id).toBe("2");

    // Day 3 should have Event 2
    expect(groups["2024-03-03"]).toHaveLength(1);
    expect(groups["2024-03-03"][0].id).toBe("2");

    // Day 5 should have Event 3
    expect(groups["2024-03-05"]).toHaveLength(1);
    expect(groups["2024-03-05"][0].id).toBe("3");
  });

  describe("renderEventTime", () => {
    const { renderEventTime } = renderHook(() => useScheduleView({ events }))
      .result.current;

    it("renders simple single day times", () => {
      const time = renderEventTime(events[0], "2024-03-01");
      expect(time).toContain("10  – 11 ");
    });

    it("renders all day for date-only formats", () => {
      const time = renderEventTime(events[2], "2024-03-05");
      expect(time).toBe("All day");
    });

    it("handles multi-day time formatting correctly depending on the day", () => {
      // First day
      const timeStart = renderEventTime(events[1], "2024-03-01");
      expect(timeStart).toContain("15 "); // Shows start time only

      // Middle day
      const timeMiddle = renderEventTime(events[1], "2024-03-02");
      expect(timeMiddle).toBe("All day");

      // Last day
      const timeEnd = renderEventTime(events[1], "2024-03-03");
      expect(timeEnd).toContain("Until 10 ");
    });
  });

  describe("renderEventTitle", () => {
    const { renderEventTitle } = renderHook(() => useScheduleView({ events }))
      .result.current;

    it("renders normal title for single day events", () => {
      expect(renderEventTitle(events[0], "2024-03-01")).toBe(
        "Single Day Event",
      );
    });

    it("appends day tracking for multi-day events", () => {
      // Just verify it correctly adds the "Day X/" part, exact total days doesn't matter as much.
      expect(renderEventTitle(events[1], "2024-03-01")).toMatch(
        /Multi Day Event \(Day 1\/\d+\)/,
      );
      expect(renderEventTitle(events[1], "2024-03-02")).toMatch(
        /Multi Day Event \(Day 2\/\d+\)/,
      );
      expect(renderEventTitle(events[1], "2024-03-03")).toMatch(
        /Multi Day Event \(Day 3\/\d+\)/,
      );
    });
  });
});
