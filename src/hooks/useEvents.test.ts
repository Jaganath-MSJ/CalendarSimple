import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CalendarEvent } from "../types";
import useEvents from "./useEvents";

describe("useEvents Hook", () => {
  const events = [
    {
      id: "1",
      title: "Valid Event",
      startDate: "2024-01-01",
      endDate: "2024-01-02",
    },
    { id: "2", title: "No End Date", startDate: "2024-01-01" },
    {
      id: "3",
      title: "Invalid Event",
      startDate: "2024-01-05",
      endDate: "2024-01-01",
    }, // Ends before it starts
  ];

  it("filters out events with invalid end dates", () => {
    const { result } = renderHook(() => useEvents(events));

    expect(result.current).toHaveLength(2);
    expect(result.current.map((e) => e.id)).toEqual(["1", "2"]);
  });

  it("returns all events if eventsAreSorted is true", () => {
    const { result } = renderHook(() => useEvents(events, true));

    expect(result.current).toHaveLength(3);
    expect(result.current.map((e) => e.id)).toEqual(["1", "2", "3"]);
  });

  // Known caveat (K-03): eventsAreSorted=true bypasses all sorting/validation.
  // Unsorted input is returned in the original order — the library never re-sorts.
  it("preserves input order when eventsAreSorted=true even if events are not sorted", () => {
    const unsorted: CalendarEvent[] = [
      { id: "b", title: "B", startDate: "2024-03-10" },
      { id: "a", title: "A", startDate: "2024-03-01" },
      { id: "c", title: "C", startDate: "2024-03-05" },
    ];
    const { result } = renderHook(() => useEvents(unsorted, true));
    expect(result.current.map((e) => e.id)).toEqual(["b", "a", "c"]);
  });

  // Known behaviour (C-TC3): events with endDate before startDate are silently
  // filtered — no warning is emitted. Pass valid date ranges to avoid silent drops.
  it("silently filters negative-duration events without warning (C-TC3)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useEvents(events));
    expect(result.current).toHaveLength(2);
    expect(result.current.map((e) => e.id)).toEqual(["1", "2"]);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("returns all events if enableEnrichedEvents is true", () => {
    const { result } = renderHook(() => useEvents(events, false, true));

    expect(result.current).toHaveLength(3);
    expect(result.current.map((e) => e.id)).toEqual(["1", "2", "3"]);
  });

  it("safely processes events missing id and title without crashing (MissingDataFields)", () => {
    // Asserting that event processing doesn't crash when optional fields are omitted
    // Event components down the line handle the "No Title" visual fallback natively
    const rawEvents = [
      {
        startDate: "2024-01-01",
      },
    ];

    const { result } = renderHook(() =>
      useEvents(rawEvents as unknown as CalendarEvent[]),
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].startDate).toBe("2024-01-01");
    expect(result.current[0].id).toBeUndefined();
  });
});
