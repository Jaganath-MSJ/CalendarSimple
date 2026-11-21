import { renderHook } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Settings } from "luxon";
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

  describe("single-day timed events lasting 12h or more", () => {
    const longShift: CalendarEvent = {
      id: "L",
      title: "Long shift",
      startDate: "2024-03-01T08:00:00",
      endDate: "2024-03-01T21:00:00",
    };

    it("keeps them in the time grid when showAllDayRow is true", () => {
      // The all-day banner only accepts multi-day or all-day events, so
      // dropping a long single-day event here would hide it entirely.
      const { result } = renderHook(() =>
        useDayEventLayout([longShift], baseDate, 0, 24, true, 0),
      );
      const layout = result.current as DayEventLayout[];
      expect(layout).toHaveLength(1);
      expect(layout[0].top).toBe(480); // 08:00
      expect(layout[0].height).toBe(780); // 13h
    });

    it("plots them at their real times when showAllDayRow is false", () => {
      const { result } = renderHook(() =>
        useDayEventLayout([longShift], baseDate, 0, 24, false, 0),
      );
      const layout = result.current as DayEventLayout[];
      expect(layout).toHaveLength(1);
      expect(layout[0].top).toBe(480);
      expect(layout[0].height).toBe(780);
    });

    it("still moves multi-day events with 12h+ overlap to the banner", () => {
      const multiDay: CalendarEvent = {
        id: "M",
        title: "Overnight conference",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-02T10:00:00",
      };
      const { result } = renderHook(() =>
        useDayEventLayout([multiDay], baseDate, 0, 24, true, 0),
      );
      expect(result.current).toEqual([]);
    });
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

  it("handles ConcurrentStress correctly grouping 5 overlapping events", () => {
    const events: CalendarEvent[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `Event-${i}`,
      title: `Event ${i}`,
      startDate: "2024-03-01T12:00:00",
      endDate: "2024-03-01T13:00:00",
    }));

    const { result } = renderHook(() =>
      useDayEventLayout(events, baseDate, 0, 24, true, 0),
    );
    const layout = result.current as DayEventLayout[];
    expect(layout).toHaveLength(5);

    // Width should be divided evenly (100 / 5 = 20)
    layout.forEach((l, i) => {
      expect(l.width).toBe(20);
      expect(l.left).toBe(i * 20); // 0, 20, 40, 60, 80
    });
  });

  it("handles NestedOverlaps correctly (an event fully engulfed by another)", () => {
    const events: CalendarEvent[] = [
      {
        id: "Outer",
        title: "Outer",
        startDate: "2024-03-01T09:00:00",
        endDate: "2024-03-01T12:00:00",
      },
      {
        id: "Inner",
        title: "Inner",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-01T11:00:00",
      },
    ];

    const { result } = renderHook(() =>
      useDayEventLayout(events, baseDate, 0, 24, true, 0),
    );

    const layout = result.current as DayEventLayout[];
    const outerEvent = layout.find((l) => l.event.id === "Outer");
    const innerEvent = layout.find((l) => l.event.id === "Inner");

    expect(outerEvent!.width).toBe(50);
    expect(innerEvent!.width).toBe(50);
    expect(outerEvent!.left).toBe(0);
    expect(innerEvent!.left).toBe(50);
  });

  it("safely plots Zero Duration events without blowing up the layout bounds", () => {
    const events: CalendarEvent[] = [
      {
        id: "Zero",
        title: "Exact Time Entry",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-01T10:00:00", // Exactly zero duration
      },
    ];

    const { result } = renderHook(() =>
      useDayEventLayout(events, baseDate, 0, 24, true, 0),
    );

    const layout = result.current as DayEventLayout[];
    expect(layout).toHaveLength(1);
    const event = layout[0];

    // Starting at 10:00 means top is (10 - 0) * 60 = 600px
    expect(event.top).toBe(600);
    // Usually zero duration is mapped to a minimum block height of e.g. 30px or clamped to the event duration itself.
    // If it's literally 0, it shouldn't be negative or NaN.
    expect(event.height).toBeGreaterThanOrEqual(0);
    expect(event.width).toBe(100);
  });

  it("showAllDayRow=false: 22:00–00:00 not drawn on next day", () => {
    const events: CalendarEvent[] = [
      {
        id: "L",
        title: "Late",
        startDate: "2026-11-10T22:00:00",
        endDate: "2026-11-11T00:00:00",
      },
    ];
    const days = [dateFn("2026-11-10"), dateFn("2026-11-11")];
    const { result } = renderHook(() =>
      useDayEventLayout(events, days, 0, 24, false, 0),
    );
    const layouts = result.current as DayEventLayout[][];
    expect(layouts[0]).toHaveLength(1);
    expect(layouts[1]).toHaveLength(0);
  });
});

describe("useDayEventLayout DST days", () => {
  afterEach(() => {
    Settings.defaultZone = "system";
  });

  const cases: [string, string][] = [
    ["America/New_York", "2026-03-08"],
    ["America/New_York", "2026-11-01"],
    ["Europe/London", "2026-03-29"],
    ["Europe/London", "2026-10-25"],
  ];

  it.each(cases)("keeps 10:00-11:00 at top 600 in %s on %s", (zone, day) => {
    Settings.defaultZone = zone;
    const events: CalendarEvent[] = [
      {
        id: "1",
        title: "Standup",
        startDate: `${day}T10:00:00`,
        endDate: `${day}T11:00:00`,
      },
    ];
    const { result } = renderHook(() =>
      useDayEventLayout(events, dateFn(day), 0, 24, true, 0),
    );
    const layout = result.current as DayEventLayout[];
    expect(layout[0].top).toBe(600);
    expect(layout[0].height).toBe(60);
  });

  it("measures an event running into the next day on the fall-back day", () => {
    Settings.defaultZone = "America/New_York";
    const events: CalendarEvent[] = [
      {
        id: "1",
        title: "Late",
        startDate: "2026-11-01T23:00:00",
        endDate: "2026-11-02T01:00:00",
      },
    ];
    const { result } = renderHook(() =>
      useDayEventLayout(events, dateFn("2026-11-01"), 0, 24, true, 0),
    );
    const layout = result.current as DayEventLayout[];
    expect(layout[0].top).toBe(1380);
    expect(layout[0].height).toBe(60);
  });
});
