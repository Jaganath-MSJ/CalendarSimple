import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import useDayEventLayout, { DayEventLayout } from "./useDayEventLayout";
import { dateFn } from "../utils/date";
import { CalendarEvent } from "../types";

describe("useDayEventLayout Hook", () => {
  const baseDate = dateFn("2024-03-01"); // March 1, 2024

  it("handles empty events without throwing", () => {
    const { result } = renderHook(() =>
      useDayEventLayout([], baseDate, 0, 24, false, 0),
    );
    expect(result.current).toEqual([]);
  });

  it("filters events outside minHour and maxHour bounds", () => {
    const events: CalendarEvent[] = [
      {
        id: "1",
        title: "Early",
        startDate: "2024-03-01T06:00:00",
        endDate: "2024-03-01T07:00:00",
      },
      {
        id: "2",
        title: "Valid",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-01T11:00:00",
      },
      {
        id: "3",
        title: "Late",
        startDate: "2024-03-01T20:00:00",
        endDate: "2024-03-01T21:00:00",
      },
    ];
    const { result } = renderHook(() =>
      useDayEventLayout(events, baseDate, 8, 18, true, 0),
    );
    expect(result.current).toHaveLength(1);
    expect((result.current as DayEventLayout[])[0].event.title).toBe("Valid");
  });

  it("correctly handles overlapping events and expands widths (tiled mode)", () => {
    const events: CalendarEvent[] = [
      {
        id: "A",
        title: "A",
        startDate: "2024-03-01T09:00:00",
        endDate: "2024-03-01T11:00:00",
      },
      {
        id: "B",
        title: "B",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-01T12:00:00",
      },
      {
        id: "C",
        title: "C",
        startDate: "2024-03-01T11:30:00",
        endDate: "2024-03-01T13:00:00",
      },
    ];
    // A and B overlap. B and C overlap. (A and C do not).
    const { result } = renderHook(() =>
      useDayEventLayout(events, baseDate, 0, 24, true, 0),
    );
    const layout = result.current;
    expect(layout).toHaveLength(3);

    const eventA = (layout as DayEventLayout[]).find((l) => l.event.id === "A");
    const eventB = (layout as DayEventLayout[]).find((l) => l.event.id === "B");

    expect(eventA!.width).toBe(50); // 1/2 of container
    expect(eventB!.left).toBe(50);
    expect(eventA!.left).toBe(0);
    expect(eventB!.left).toBe(50);
  });

  it("correctly handles stacked overlap offset mode", () => {
    const events: CalendarEvent[] = [
      {
        id: "A",
        title: "A",
        startDate: "2024-03-01T09:00:00",
        endDate: "2024-03-01T11:00:00",
      },
      {
        id: "B",
        title: "B",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-01T12:00:00",
      },
    ];
    const { result } = renderHook(
      () => useDayEventLayout(events, baseDate, 0, 24, true, 10), // 10% offset
    );
    const layout = result.current as DayEventLayout[];

    const eventA = layout.find((l) => l.event.id === "A");
    const eventB = layout.find((l) => l.event.id === "B");

    expect(eventA!.left).toBe(0);
    expect(eventB!.left).toBe(10);
    expect(eventB!.width).toBe(90); // 1 - 0.1 = 0.9 = 90%
  });

  it("bypasses ordering when isEventOrderingEnabled is false", () => {
    const events: CalendarEvent[] = [
      {
        id: "A",
        title: "A",
        startDate: "2024-03-01T09:00:00",
        endDate: "2024-03-01T11:00:00",
      },
      {
        id: "B",
        title: "B",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-01T12:00:00",
      },
    ];
    const { result } = renderHook(() =>
      useDayEventLayout(events, baseDate, 0, 24, true, 0, {
        isEventOrderingEnabled: false,
      }),
    );
    const layout = result.current as DayEventLayout[];

    // They both should have left 0, width 100, zIndex 1
    layout.forEach((l: DayEventLayout) => {
      expect(l.left).toBe(0);
      expect(l.width).toBe(100);
      expect(l.zIndex).toBe(1);
    });
  });

  it("uses enrichedEventsByDate if enableEnrichedEvents is true", () => {
    const events: CalendarEvent[] = [];
    const enrichedEvents = {
      "2024-03-01": [
        {
          id: "A",
          title: "Enriched",
          startDate: "2024-03-01T09:00:00",
          endDate: "2024-03-01T10:00:00",
        },
      ],
    };
    const { result } = renderHook(() =>
      useDayEventLayout(events, baseDate, 0, 24, true, 0, {
        enableEnrichedEvents: true,
        enrichedEventsByDate: enrichedEvents,
      }),
    );

    const layout = result.current as DayEventLayout[];
    expect(layout).toHaveLength(1);
    expect(layout[0].event.title).toBe("Enriched");
  });

  it("respects showAllDayRow behavior", () => {
    const events: CalendarEvent[] = [
      {
        id: "A",
        title: "All Day",
        startDate: "2024-03-01",
        endDate: "2024-03-02",
      },
      {
        id: "B",
        title: "Timed",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-01T12:00:00",
      },
    ];
    const { result: r1 } = renderHook(() =>
      useDayEventLayout(events, baseDate, 0, 24, true, 0),
    );
    expect(r1.current as DayEventLayout[]).toHaveLength(1);
    expect((r1.current as DayEventLayout[])[0].event.id).toBe("B"); // 'A' filtered out

    const { result: r2 } = renderHook(() =>
      useDayEventLayout(events, baseDate, 0, 24, false, 0),
    );
    expect(r2.current as DayEventLayout[]).toHaveLength(2); // 'A' kept
    const allDayEvent = (r2.current as DayEventLayout[]).find(
      (l) => l.event.id === "A",
    );
    expect(allDayEvent!.top).toBe(0);
    expect(allDayEvent!.height).toBe(1440); // 24 * 60
  });

  it("handles array of dates", () => {
    const dates = [dateFn("2024-03-01"), dateFn("2024-03-02")];
    const events: CalendarEvent[] = [
      {
        id: "A",
        title: "1",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-01T12:00:00",
      },
      {
        id: "B",
        title: "2",
        startDate: "2024-03-02T10:00:00",
        endDate: "2024-03-02T12:00:00",
      },
    ];
    const { result } = renderHook(() =>
      useDayEventLayout(events, dates, 0, 24, true, 0),
    );
    const layout = result.current as DayEventLayout[][];
    expect(layout).toHaveLength(2);
    expect(layout[0]).toHaveLength(1);
    expect(layout[0][0].event.id).toBe("A");
    expect(layout[1]).toHaveLength(1);
    expect(layout[1][0].event.id).toBe("B");
  });
});
