// Fixes from the whole-branch code review of feat/v2.2 (2026-11-23).
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DateTime } from "luxon";
import Calendar from "./Calendar";
import type { CalendarEvent, EventDropInfo, EventResizeInfo } from "./types";
import { expandRecurringEvents, isSeries } from "./utils/recurrence/expand";
import { parseRRule } from "./utils/recurrence/parseRRule";

const props = { width: 800, height: 600, selectedDate: new Date(2026, 10, 10) };
const hm = (d: Date) => DateTime.fromJSDate(d).toFormat("yyyy-MM-dd HH:mm");

describe("1. onEventDrop passes the app's own event object", () => {
  it("in Month", () => {
    const ev: CalendarEvent = { id: "m", title: "M", startDate: "2026-11-10" };
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    render(
      <Calendar {...props} events={[ev]} draggable onEventDrop={onEventDrop} />,
    );
    fireEvent.keyDown(screen.getByTestId("calendar-m-month-event-item"), {
      key: "ArrowRight",
      altKey: true,
    });
    expect(onEventDrop.mock.calls[0][0].event).toBe(ev);
    // Month layout no longer writes onto the app's objects.
    expect(Object.keys(ev).sort()).toEqual(["id", "startDate", "title"]);
  });

  it("in the all-day row and the time grid", () => {
    const allDay: CalendarEvent = {
      id: "a",
      title: "A",
      startDate: "2026-11-10",
    };
    const timed: CalendarEvent = {
      id: "t",
      title: "T",
      startDate: "2026-11-10T09:00:00",
      endDate: "2026-11-10T10:00:00",
    };
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    render(
      <Calendar
        {...props}
        view="week"
        events={[allDay, timed]}
        draggable
        onEventDrop={onEventDrop}
      />,
    );
    fireEvent.keyDown(screen.getByTestId("calendar-a-all-day-event"), {
      key: "ArrowRight",
      altKey: true,
    });
    fireEvent.keyDown(screen.getByTestId("calendar-t-day-event-item"), {
      key: "ArrowDown",
      altKey: true,
    });
    expect(onEventDrop.mock.calls[0][0].event).toBe(allDay);
    expect(onEventDrop.mock.calls[1][0].event).toBe(timed);
  });
});

describe("2. all-day events in the time grid (showAllDayRow={false})", () => {
  const ev: CalendarEvent = {
    id: "d",
    title: "D",
    startDate: "2026-11-10",
    endDate: "2026-11-11",
  };
  const setup = () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    const onEventResize = vi.fn();
    render(
      <Calendar
        {...props}
        view="week"
        showAllDayRow={false}
        events={[ev]}
        draggable
        resizable
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
      />,
    );
    return {
      onEventDrop,
      onEventResize,
      item: screen.getAllByTestId("calendar-d-day-event-item")[0],
    };
  };

  it("moves by days only and reports allDay", () => {
    const { onEventDrop, item } = setup();
    fireEvent.keyDown(item, { key: "ArrowDown", altKey: true });
    expect(onEventDrop).not.toHaveBeenCalled();
    fireEvent.keyDown(item, { key: "ArrowRight", altKey: true });
    const info = onEventDrop.mock.calls[0][0];
    expect(info.allDay).toBe(true);
    expect(hm(info.start)).toBe("2026-11-11 00:00");
    expect(hm(info.end)).toBe("2026-11-12 00:00");
    expect(item.getAttribute("aria-keyshortcuts")).toBe(
      "Alt+ArrowLeft Alt+ArrowRight",
    );
  });

  it("cannot be resized", () => {
    const { onEventResize, item } = setup();
    expect(screen.queryByTestId(/calendar-d-resize-/)).toBeNull();
    fireEvent.keyDown(item, { key: "ArrowDown", altKey: true, shiftKey: true });
    expect(onEventResize).not.toHaveBeenCalled();
  });
});

describe("3. a slow pinch still zooms", () => {
  it("accumulates small wheel steps", () => {
    vi.useFakeTimers();
    try {
      render(
        <Calendar
          {...props}
          view="day"
          pinchToZoom
          events={[
            {
              id: "h",
              title: "H",
              startDate: "2026-11-10T09:00:00",
              endDate: "2026-11-10T10:00:00",
            },
          ]}
        />,
      );
      const scroller = screen
        .getByTestId("calendar-day-column")
        .closest("[data-calendar-scroll]") as HTMLElement;
      for (let i = 0; i < 20; i++)
        fireEvent.wheel(scroller, { deltaY: -3, ctrlKey: true });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(
        parseFloat(
          screen.getByTestId("calendar-h-day-event-item").style.height,
        ),
      ).toBeGreaterThan(60);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("5. occurrences of a series without an id", () => {
  it("carry a recurringEventId, so they are never expanded again", () => {
    const series: CalendarEvent = {
      title: "Standup",
      startDate: "2026-11-02T09:00:00",
      rrule: "FREQ=DAILY;COUNT=5",
    };
    const window = {
      start: DateTime.fromISO("2026-11-01"),
      end: DateTime.fromISO("2026-11-30"),
    };
    const { events } = expandRecurringEvents([series], window);
    expect(events).toHaveLength(5);
    for (const occ of events) {
      expect(occ.recurringEventId).toBe("2026-11-02T09:00:00");
      expect(isSeries(occ)).toBe(false);
    }
    const moved = { ...events[3], startDate: "2026-11-05T10:00:00" };
    expect(expandRecurringEvents([moved], window).events).toHaveLength(1);
  });
});

describe("6. WEEKLY with BYMONTHDAY", () => {
  it("is rejected", () => {
    expect(parseRRule("FREQ=WEEKLY;BYMONTHDAY=1").ok).toBe(false);
    expect(parseRRule("FREQ=MONTHLY;BYMONTHDAY=1").ok).toBe(true);
  });
});

describe("7. resize when the minimum is longer than the event", () => {
  it("a small jiggle on a handle does not resize", () => {
    const onEventResize = vi.fn<(i: EventResizeInfo) => void>();
    render(
      <Calendar
        {...props}
        view="day"
        resizable
        minEventDurationMinutes={60}
        onEventResize={onEventResize}
        events={[
          {
            id: "s",
            title: "S",
            startDate: "2026-11-10T09:00:00",
            endDate: "2026-11-10T09:30:00",
          },
        ]}
      />,
    );
    for (const edge of ["top", "bottom"]) {
      const handle = screen.getByTestId(`calendar-s-resize-${edge}`);
      const base = {
        pointerId: 1,
        pointerType: "mouse",
        button: 0,
        clientX: 0,
      };
      fireEvent.pointerDown(handle, { ...base, clientY: 0 });
      fireEvent.pointerMove(handle, { ...base, clientX: 5, clientY: 0 });
      fireEvent.pointerUp(handle, { ...base, clientX: 5, clientY: 0 });
    }
    expect(onEventResize).not.toHaveBeenCalled();
  });
});

describe("8. month keys from an adjacent-month cell", () => {
  it("start from the focused cell", () => {
    render(<Calendar {...props} />);
    const dec1 = document.querySelector(
      '[data-date="2026-12-01"]',
    ) as HTMLElement;
    dec1.focus();
    fireEvent.keyDown(dec1, { key: "ArrowRight" });
    expect((document.activeElement as HTMLElement).dataset.date).toBe(
      "2026-12-02",
    );
  });
});

describe("9. header custom days label", () => {
  it("shows the clamped count", () => {
    render(<Calendar {...props} view="customDays" customDays={10 as never} />);
    expect(screen.getByRole("option", { name: "7 Days" })).toBeInTheDocument();
  });
});

describe("10. project rules", () => {
  const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
  it("localeDefaults uses no raw Date", () => {
    expect(read("src/utils/localeDefaults.ts")).not.toMatch(/new Date\(/);
  });
  it("resize handles are not absolutely positioned", () => {
    const css = read(
      "src/components/core/day_event_item/DayWeekEventItem.module.css",
    );
    const block = css.slice(
      css.indexOf(".resizeHandle {"),
      css.indexOf("}", css.indexOf(".resizeHandle {")),
    );
    expect(block).not.toMatch(/position:\s*absolute/);
  });
});
