import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import useMonthGrid from "./useMonthGrid";
import { dateFn } from "../utils/date";
import { CalendarEvent } from "../types";

describe("useMonthGrid Hook", () => {
  const selectedDate = dateFn("2024-02-15"); // Feb 2024 starts on Thursday
  const weekStartsOn = 0; // Sunday
  const weekEndsOn = 6; // Saturday

  it("generates correctly sized month grid", () => {
    const { result } = renderHook(() =>
      useMonthGrid(selectedDate, [], weekStartsOn, weekEndsOn),
    );
    const grid = result.current;
    expect(grid.length).toBeGreaterThanOrEqual(4);
    const firstWeek = grid[0];
    expect(firstWeek).toHaveLength(7);
    expect(firstWeek[0].displayDay).toBe(28); // Jan 28
    expect(firstWeek[4].displayDay).toBe(1); // Feb 1
  });

  it("assigns events to slots in Tetris pattern", () => {
    const events: CalendarEvent[] = [
      { id: "1", title: "A", startDate: "2024-02-01", endDate: "2024-02-03" },
      { id: "2", title: "B", startDate: "2024-02-02", endDate: "2024-02-02" },
      { id: "3", title: "C", startDate: "2024-02-02", endDate: "2024-02-04" },
    ];

    const { result } = renderHook(() =>
      useMonthGrid(selectedDate, events, weekStartsOn, weekEndsOn),
    );

    const firstWeek = result.current[0];

    const thuEvents = firstWeek[4].events; // Feb 1
    expect(thuEvents[0]?.id).toBe("1");

    const friEvents = firstWeek[5].events; // Feb 2
    expect(friEvents[0]?.id).toBe("1"); // Spacer
    expect(friEvents[1]?.id).toBe("3"); // C because it's longer
    expect(friEvents[2]?.id).toBe("2"); // B
  });

  it("bypasses ordering when isEventOrderingEnabled is false", () => {
    const events: CalendarEvent[] = [
      { id: "1", title: "A", startDate: "2024-02-01", endDate: "2024-02-03" },
      { id: "2", title: "B", startDate: "2024-02-02", endDate: "2024-02-02" },
    ];

    const { result } = renderHook(() =>
      useMonthGrid(selectedDate, events, weekStartsOn, weekEndsOn, {
        isEventOrderingEnabled: false,
      }),
    );

    const firstWeek = result.current[0];
    expect(firstWeek[4].events[0]?.id).toBe("1"); // A is index 0
    expect(firstWeek[5].events[1]?.id).toBe("2"); // B is index 1
  });

  it("uses enrichedEventsByDate when enableEnrichedEvents is true", () => {
    const events: CalendarEvent[] = [];
    const enrichedEvents = {
      "2024-02-15": [{ id: "A", title: "Enriched", startDate: "2024-02-15" }],
    };

    const { result } = renderHook(() =>
      useMonthGrid(selectedDate, events, weekStartsOn, weekEndsOn, {
        enableEnrichedEvents: true,
        enrichedEventsByDate: enrichedEvents,
      }),
    );

    const thirdWeek = result.current[2]; // Feb 15 week
    expect(thirdWeek[4].displayDay).toBe(15);
    expect(thirdWeek[4].events[0]?.id).toBe("A");
  });

  it("handles custom sortedMonthView function", () => {
    const events: CalendarEvent[] = [
      { id: "1", title: "A", startDate: "2024-02-01", endDate: "2024-02-02" },
      { id: "2", title: "B", startDate: "2024-02-01", endDate: "2024-02-05" },
    ];

    const { result } = renderHook(() =>
      useMonthGrid(selectedDate, events, weekStartsOn, weekEndsOn, {
        // Reverse standard custom logic: put shorter events first
        sortedMonthView: (a, b) =>
          new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime(),
      }),
    );

    const firstWeek = result.current[0];
    const thuEvents = firstWeek[4].events; // Feb 1
    expect(thuEvents[0]?.id).toBe("1"); // A is shorter, put first
    expect(thuEvents[1]?.id).toBe("2"); // B is longer, put second
  });
});
