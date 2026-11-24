import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import Calendar from "../Calendar";
import { CalendarProvider, useCalendar } from "../context/CalendarContext";
import { CalendarEvent, ECalendarViewType } from "../types";
import { dateFn } from "../utils";

const weekly: CalendarEvent = {
  id: "w",
  title: "Weekly sync",
  startDate: "2026-10-06T09:00:00",
  endDate: "2026-10-06T10:00:00",
  rrule: "FREQ=WEEKLY;BYDAY=TU",
};

const chip = (start: string) =>
  screen.queryByTestId(`calendar-w::${start}-month-event-item`);

function renderMonth(events: CalendarEvent[], extra = {}) {
  return render(
    <Calendar
      width={700}
      height={600}
      maxEvents={10}
      selectedDate={new Date(2026, 10, 10)}
      events={events}
      {...extra}
    />,
  );
}

describe("recurring events", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("shows a weekly rule on every Tuesday of the month", () => {
    renderMonth([weekly]);
    for (const day of ["03", "10", "17", "24"]) {
      expect(chip(`2026-11-${day}T09:00:00`)).toBeInTheDocument();
    }
  });

  it("skips exdates", () => {
    renderMonth([{ ...weekly, exdates: ["2026-11-10T09:00:00"] }]);
    expect(chip("2026-11-03T09:00:00")).toBeInTheDocument();
    expect(chip("2026-11-10T09:00:00")).not.toBeInTheDocument();
    expect(chip("2026-11-17T09:00:00")).toBeInTheDocument();
    expect(chip("2026-11-24T09:00:00")).toBeInTheDocument();
  });

  it("recomputes occurrences when navigation leaves the window", () => {
    renderMonth([weekly]);
    // Nov 2026's window ends 2027-03-31; May 2027 needs a new one.
    const next = screen.getByLabelText("Next period");
    for (let i = 0; i < 6; i++) fireEvent.click(next);
    for (const day of ["04", "11", "18", "25"]) {
      expect(chip(`2027-05-${day}T09:00:00`)).toBeInTheDocument();
    }
  });

  it("passes the occurrence to onEventClick", () => {
    const onEventClick = vi.fn();
    renderMonth([weekly], { onEventClick });
    fireEvent.click(chip("2026-11-10T09:00:00")!);
    expect(onEventClick).toHaveBeenCalledTimes(1);
    expect(onEventClick.mock.calls[0][0]).toMatchObject({
      id: "w::2026-11-10T09:00:00",
      recurringEventId: "w",
      occurrenceDate: "2026-11-10T09:00:00",
      startDate: "2026-11-10T09:00:00",
      endDate: "2026-11-10T10:00:00",
    });
  });

  it("shows an unsupported rule once and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const bad = {
      ...weekly,
      startDate: "2026-11-10T09:00:00",
      endDate: "2026-11-10T10:00:00",
      rrule: "FREQ=SECONDLY",
    };
    const { rerender } = renderMonth([bad]);
    rerender(
      <Calendar
        width={700}
        height={600}
        maxEvents={10}
        selectedDate={new Date(2026, 10, 10)}
        events={[{ ...bad }]}
      />,
    );
    expect(
      screen
        .getAllByTestId(/-month-event-item$/)
        .map((el) => el.dataset.testid),
    ).toEqual(["calendar-w-month-event-item"]);
    // React may log its one-off JSX-transform notice; count only ours.
    const ours = warn.mock.calls.filter((c) =>
      String(c[0]).startsWith("[calendar]"),
    );
    expect(ours).toHaveLength(1);
    expect(ours[0][0]).toContain("FREQ=SECONDLY is not supported");
  });

  it("does not expand with enableEnrichedEvents", () => {
    let seen: CalendarEvent[] | undefined;
    function Probe() {
      seen = useCalendar().config.events;
      return null;
    }
    const events = [weekly];
    render(
      <CalendarProvider
        initialDate={dateFn("2026-11-10")}
        initialView={ECalendarViewType.month}
        config={{
          events,
          enableEnrichedEvents: true,
          enrichedEventsByDate: {},
        }}
      >
        <Probe />
      </CalendarProvider>,
    );
    expect(seen).toBe(events);
  });

  it("keeps config.events by identity when nothing recurs", () => {
    let seen: CalendarEvent[] | undefined;
    function Probe() {
      seen = useCalendar().config.events;
      return null;
    }
    const events = [
      { id: "a", title: "A", startDate: "2026-11-03T09:00:00" },
      { id: "b", title: "B", startDate: "2026-11-04" },
    ];
    render(
      <CalendarProvider
        initialDate={dateFn("2026-11-10")}
        initialView={ECalendarViewType.month}
        config={{ events }}
      >
        <Probe />
      </CalendarProvider>,
    );
    expect(seen).toBe(events);
  });

  it("keeps config.events by identity when only a callback changes", () => {
    const seen: (CalendarEvent[] | undefined)[] = [];
    function Probe() {
      seen.push(useCalendar().config.events);
      return null;
    }
    const events = [weekly];
    const props = {
      width: 700,
      height: 600,
      selectedDate: new Date(2026, 10, 10),
      events,
    };
    const { rerender } = render(
      <Calendar {...props} onEventClick={() => {}}>
        <Probe />
      </Calendar>,
    );
    rerender(
      <Calendar {...props} onEventClick={() => {}}>
        <Probe />
      </Calendar>,
    );
    expect(seen.length).toBeGreaterThan(1);
    expect(seen[0]).not.toBe(events); // expanded
    expect(seen[seen.length - 1]).toBe(seen[0]);
  });

  describe("schedule", () => {
    const daily: CalendarEvent = {
      id: "d",
      title: "Daily",
      startDate: "2026-10-06T08:00:00",
      rrule: "FREQ=DAILY",
    };

    it("caps an endless rule at selectedDate + 12 months (quarter end)", () => {
      const { container } = renderMonth([daily], {
        view: ECalendarViewType.schedule,
      });
      const keys = Array.from(
        container.querySelectorAll<HTMLElement>("[data-date-key]"),
      ).map((el) => el.dataset.dateKey!);
      expect(keys.length).toBeGreaterThan(0);
      expect(keys[0]).toBe("2026-10-06");
      // 2026-11-10 + 12 months = 2027-11-10, widened to the quarter end.
      expect(keys[keys.length - 1]).toBe("2027-12-31");
    });

    const scheduleOccurrences = (container: HTMLElement, id: string) =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          `[data-testid^="calendar-${id}::"][data-testid$="-schedule-event"]`,
        ),
      ).map((el) =>
        el.dataset.testid!.slice(
          `calendar-${id}::`.length,
          -1 * "-schedule-event".length,
        ),
      );

    it("shows a long-running series around selectedDate, not its first 1000", () => {
      const old = { ...daily, startDate: "2024-01-01T08:00:00" };
      const { container } = renderMonth([old], {
        view: ECalendarViewType.schedule,
        selectedDate: new Date(2026, 10, 22),
      });
      const starts = scheduleOccurrences(container, "d");
      expect(starts).toContain("2026-11-22T08:00:00");
      expect(starts[starts.length - 1] <= "2027-12-31T23:59:59").toBe(true);
    });

    it("does not let a far-future one-off extend endless rules", () => {
      const { container } = renderMonth(
        [daily, { id: "far", title: "Far", startDate: "2035-06-01" }],
        { view: ECalendarViewType.schedule },
      );
      const starts = scheduleOccurrences(container, "d");
      expect(starts[starts.length - 1]).toBe("2027-12-31T08:00:00");
      expect(
        container.querySelector('[data-date-key="2035-06-01"]'),
      ).toBeInTheDocument();
    });

    it("reports the expanded span to onDateRangeChange", () => {
      vi.useFakeTimers();
      const spy = vi.fn<(s: Date, e: Date, v: string) => void>();
      renderMonth([daily], {
        view: ECalendarViewType.schedule,
        onDateRangeChange: spy,
      });
      act(() => void vi.advanceTimersByTime(16));
      // Series start (inside the Jul 2026 window start) to the window end:
      // 2026-11-10 + 12 months, widened to the quarter end.
      expect(spy).toHaveBeenCalledTimes(1);
      const [s, e, v] = spy.mock.calls[0];
      expect([dateFn(s).toISODate(), dateFn(e).toISODate(), v]).toEqual([
        "2026-10-06",
        "2027-12-31",
        "schedule",
      ]);
    });
  });
});
