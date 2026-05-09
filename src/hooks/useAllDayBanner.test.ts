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

  describe("Clipped arrow logic (step-back/forward boundary bugs)", () => {
    // Week view: Apr21 (Mon) — Apr27 (Sun) 2026
    const weekDays = [
      dateFn("2026-04-21"),
      dateFn("2026-04-22"),
      dateFn("2026-04-23"),
      dateFn("2026-04-24"),
      dateFn("2026-04-25"),
      dateFn("2026-04-26"),
      dateFn("2026-04-27"),
    ];

    it("shows right arrow when event ends just past viewEnd with step-back (Case 3: ends Apr28T00:00)", () => {
      // Event ends on day after viewEnd with 0h overlap → step-back to viewEnd boundary
      const event: CalendarEvent = {
        id: "test1",
        title: "Ends just past midnight on Apr28",
        startDate: "2026-04-21T11:00:00",
        endDate: "2026-04-28T00:00:00",
      };
      const { result } = renderHook(() =>
        useAllDayBanner(weekDays, [event], false),
      );
      expect(result.current.layoutEvents).toHaveLength(1);
      expect(result.current.layoutEvents[0].isClippedRight).toBe(true);
    });

    it("shows right arrow when event ends within 12h past viewEnd with step-back (Case 4: ends Apr28T05:00)", () => {
      // Event ends day after viewEnd with 5h overlap → step-back to viewEnd boundary
      const event: CalendarEvent = {
        id: "test2",
        title: "Ends 5h into Apr28",
        startDate: "2026-04-21T11:00:00",
        endDate: "2026-04-28T05:00:00",
      };
      const { result } = renderHook(() =>
        useAllDayBanner(weekDays, [event], false),
      );
      expect(result.current.layoutEvents).toHaveLength(1);
      expect(result.current.layoutEvents[0].isClippedRight).toBe(true);
    });

    it("hides right arrow when event ends well before viewEnd (no step-back, Case 1)", () => {
      const event: CalendarEvent = {
        id: "test3",
        title: "Ends Apr25T14:00",
        startDate: "2026-04-21T11:00:00",
        endDate: "2026-04-25T14:00:00",
      };
      const { result } = renderHook(() =>
        useAllDayBanner(weekDays, [event], false),
      );
      expect(result.current.layoutEvents).toHaveLength(1);
      expect(result.current.layoutEvents[0].isClippedRight).toBe(false);
    });

    it("shows left arrow when event starts just before viewStart with step-forward (Case 8: starts Apr20T23:45)", () => {
      // Event starts day before viewStart with ~0.25h overlap → step-forward to viewStart boundary
      const event: CalendarEvent = {
        id: "test4",
        title: "Starts Apr20T23:45",
        startDate: "2026-04-20T23:45:00",
        endDate: "2026-04-24T10:00:00",
      };
      const { result } = renderHook(() =>
        useAllDayBanner(weekDays, [event], false),
      );
      expect(result.current.layoutEvents).toHaveLength(1);
      expect(result.current.layoutEvents[0].isClippedLeft).toBe(true);
    });

    it("shows left arrow when event starts within 12h before viewStart with step-forward (Case 9: starts Apr20T13:00)", () => {
      // Event starts day before viewStart with 11h overlap → step-forward to viewStart boundary
      const event: CalendarEvent = {
        id: "test5",
        title: "Starts Apr20T13:00",
        startDate: "2026-04-20T13:00:00",
        endDate: "2026-04-24T10:00:00",
      };
      const { result } = renderHook(() =>
        useAllDayBanner(weekDays, [event], false),
      );
      expect(result.current.layoutEvents).toHaveLength(1);
      expect(result.current.layoutEvents[0].isClippedLeft).toBe(true);
    });

    it("hides left arrow when event starts well after viewStart (no step-forward, Case 6)", () => {
      const event: CalendarEvent = {
        id: "test6",
        title: "Starts Apr18T10:00",
        startDate: "2026-04-18T10:00:00",
        endDate: "2026-04-25T14:00:00",
      };
      const { result } = renderHook(() =>
        useAllDayBanner(weekDays, [event], false),
      );
      expect(result.current.layoutEvents).toHaveLength(1);
      expect(result.current.layoutEvents[0].isClippedLeft).toBe(true);
    });

    it("shows left arrow when event starts within view but chip is stepped forward (Case 7: starts Apr21T23:45)", () => {
      // Event starts Apr21 with ~0.25h overlap → bannerStartDay stepped to Apr22
      // exactStart.startOf("day")=Apr21 < bannerStartDay=Apr22 → arrow should show
      const event: CalendarEvent = {
        id: "test7",
        title: "Starts Apr21T23:45",
        startDate: "2026-04-21T23:45:00",
        endDate: "2026-04-24T10:00:00",
      };
      const { result } = renderHook(() =>
        useAllDayBanner(weekDays, [event], false),
      );
      expect(result.current.layoutEvents).toHaveLength(1);
      expect(result.current.layoutEvents[0].isClippedLeft).toBe(true);
    });

    it("shows right arrow when event ends within view but chip is stepped back (ends Apr24T11:00, chip ends Apr23)", () => {
      // Event ends Apr24 with 11h overlap → bannerEndDay stepped to Apr23
      // exactEnd.startOf("day")=Apr24 > bannerEndDay=Apr23 → arrow should show
      const event: CalendarEvent = {
        id: "test8",
        title: "Ends Apr24T11:00",
        startDate: "2026-04-19T10:00:00",
        endDate: "2026-04-24T11:00:00",
      };
      const { result } = renderHook(() =>
        useAllDayBanner(weekDays, [event], false),
      );
      expect(result.current.layoutEvents).toHaveLength(1);
      expect(result.current.layoutEvents[0].isClippedRight).toBe(true);
    });

    it("shows right arrow for user-reported case: Apr21T11:00 to Apr23T00:01", () => {
      // User's exact case: event ends at midnight+1min on Apr23
      // bannerEndDay stepped back to Apr22 (0.017h overlap on Apr23)
      // exactEnd.startOf("day")=Apr23 > bannerEndDay=Apr22 → arrow should show
      const event: CalendarEvent = {
        id: "user-case",
        title: "Reported case",
        startDate: "2026-04-21T11:00:00",
        endDate: "2026-04-23T00:01:00",
      };
      const { result } = renderHook(() =>
        useAllDayBanner(weekDays, [event], false),
      );
      expect(result.current.layoutEvents).toHaveLength(1);
      expect(result.current.layoutEvents[0].isClippedRight).toBe(true);
      expect(result.current.layoutEvents[0].endIndex).toBe(1); // chip ends Apr22 (index 1)
    });
  });
});
