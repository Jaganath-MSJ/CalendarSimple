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
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unsorted: CalendarEvent[] = [
      { id: "b", title: "B", startDate: "2024-03-10" },
      { id: "a", title: "A", startDate: "2024-03-01" },
      { id: "c", title: "C", startDate: "2024-03-05" },
    ];
    const { result } = renderHook(() => useEvents(unsorted, true));
    expect(result.current.map((e) => e.id)).toEqual(["b", "a", "c"]);
    warnSpy.mockRestore();
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
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useEvents(events, false, true));

    expect(result.current).toHaveLength(3);
    expect(result.current.map((e) => e.id)).toEqual(["1", "2", "3"]);
    warnSpy.mockRestore();
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

  // K-03 warning tests
  it("emits console.warn (K-03) when eventsAreSorted=true but events are unsorted", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unsorted: CalendarEvent[] = [
      { id: "b", title: "B", startDate: "2024-03-10" },
      { id: "a", title: "A", startDate: "2024-03-01" },
      { id: "c", title: "C", startDate: "2024-03-05" },
    ];
    renderHook(() => useEvents(unsorted, true));
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("eventsAreSorted"),
    );
    warnSpy.mockRestore();
  });

  it("does NOT emit K-03 warn when eventsAreSorted=true and events are sorted", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const sorted: CalendarEvent[] = [
      { id: "a", title: "A", startDate: "2024-03-01" },
      { id: "b", title: "B", startDate: "2024-03-05" },
      { id: "c", title: "C", startDate: "2024-03-10" },
    ];
    renderHook(() => useEvents(sorted, true));
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("does NOT emit K-03 warn when eventsAreSorted is false or undefined", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unsorted: CalendarEvent[] = [
      { id: "b", title: "B", startDate: "2024-03-10" },
      { id: "a", title: "A", startDate: "2024-03-01" },
    ];
    renderHook(() => useEvents(unsorted, false));
    renderHook(() => useEvents(unsorted));
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  // K-05 warning tests
  it("emits console.warn (K-05) when enableEnrichedEvents=true but enrichedEventsByDate is not provided", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderHook(() => useEvents(events, false, true, undefined));
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("enrichedEventsByDate"),
    );
    warnSpy.mockRestore();
  });

  it("does NOT emit K-05 warn when enableEnrichedEvents=true and enrichedEventsByDate is provided", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const map: Record<string, CalendarEvent[]> = {
      "2024-01-01": [events[0]],
    };
    renderHook(() => useEvents(events, false, true, map));
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("does NOT emit K-05 warn when enableEnrichedEvents is false or undefined", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderHook(() => useEvents(events, false, false, undefined));
    renderHook(() => useEvents(events));
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  describe("invalid dates", () => {
    const MSG =
      "[calendar] dropped 2 event(s) with an invalid startDate or endDate.";
    const valid = {
      id: "ok",
      title: "Ok",
      startDate: "2026-11-10T09:00:00",
      endDate: "2026-11-10T10:00:00",
    };
    const mixed: CalendarEvent[] = [
      { id: "a", title: "Bad start", startDate: "not-a-date" },
      {
        id: "b",
        title: "Bad end",
        startDate: "2026-11-10T09:00:00",
        endDate: "garbage",
      },
      valid,
    ];
    const dropWarnings = (spy: { mock: { calls: unknown[][] } }) =>
      spy.mock.calls.filter((c: unknown[]) => c[0] === MSG);

    it("drops them and warns once", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { result } = renderHook(() => useEvents(mixed));
      expect(result.current).toEqual([valid]);
      expect(dropWarnings(spy)).toHaveLength(1);
      spy.mockRestore();
    });

    it("drops them with eventsAreSorted", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { result } = renderHook(() => useEvents(mixed, true));
      expect(result.current).toEqual([valid]);
      spy.mockRestore();
    });

    it("drops them with enableEnrichedEvents", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { result } = renderHook(() => useEvents(mixed, false, true, {}));
      expect(result.current).toEqual([valid]);
      spy.mockRestore();
    });

    it("does not warn again on rerender with the same array", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { rerender } = renderHook(() => useEvents(mixed));
      rerender();
      expect(dropWarnings(spy)).toHaveLength(1);
      spy.mockRestore();
    });
  });

  describe("invalid-date warning stability", () => {
    const bad = { id: "bad", title: "Bad", startDate: "not-a-date" };
    const good = { id: "g", title: "Good", startDate: "2024-01-01" };

    it("warns once when the same invalid set arrives in a new array", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { rerender } = renderHook(({ ev }) => useEvents(ev), {
        initialProps: { ev: [bad, good] as CalendarEvent[] },
      });
      rerender({ ev: [bad, good] });
      rerender({ ev: [{ ...bad }, { ...good }] });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      rerender({ ev: [{ ...bad, id: "bad2" }, good] });
      expect(warnSpy).toHaveBeenCalledTimes(2);
      warnSpy.mockRestore();
    });

    it("returns the caller's array by identity when sorted and valid", () => {
      const input: CalendarEvent[] = [good];
      const { result } = renderHook(() => useEvents(input, true));
      expect(result.current).toBe(input);
    });
  });
});
