import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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

  it("returns all events if enableEnrichedEvents is true", () => {
    const { result } = renderHook(() => useEvents(events, false, true));

    expect(result.current).toHaveLength(3);
    expect(result.current.map((e) => e.id)).toEqual(["1", "2", "3"]);
  });
});
