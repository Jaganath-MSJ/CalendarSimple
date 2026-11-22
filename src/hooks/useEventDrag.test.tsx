import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DateTime, Settings } from "luxon";
import Calendar from "../Calendar";
import type { CalendarEvent, EventDropInfo, EventResizeInfo } from "../types";

const COLUMN = 100;
const EVENT: CalendarEvent = {
  id: "a",
  title: "Stand-up",
  startDate: "2026-11-10T09:00:00",
  endDate: "2026-11-10T10:00:00",
};

const hm = (d: Date) => DateTime.fromJSDate(d).toFormat("yyyy-MM-dd HH:mm");

function renderWeek(
  props: Partial<React.ComponentProps<typeof Calendar>> = {},
) {
  return render(
    <Calendar
      view="week"
      width={800}
      height={600}
      selectedDate={new Date(2026, 10, 10)}
      events={[EVENT]}
      {...props}
    />,
  );
}

const item = (id = "a") => screen.getByTestId(`calendar-${id}-day-event-item`);

function pointer(
  type: "down" | "move" | "up",
  el: Element,
  x: number,
  y: number,
) {
  const init = {
    pointerId: 1,
    pointerType: "mouse",
    button: 0,
    clientX: x,
    clientY: y,
  };
  if (type === "down") fireEvent.pointerDown(el, init);
  if (type === "move") fireEvent.pointerMove(el, init);
  if (type === "up") fireEvent.pointerUp(el, init);
}

/** A full mouse drag: down at 0,0, move in two steps, release, then the click a browser sends. */
function drag(el: Element, dx: number, dy: number) {
  pointer("down", el, 0, 0);
  pointer("move", el, dx / 2, dy / 2);
  pointer("move", el, dx, dy);
  pointer("up", el, dx, dy);
  fireEvent.click(el);
}

beforeEach(() => {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      const id = this.getAttribute("data-testid") ?? "";
      let width = 0;
      let height = 0;
      if (id.endsWith("-day-column")) width = COLUMN;
      if (id.endsWith("-month-cell")) [width, height] = [COLUMN, 80];
      if (String(this.className).includes("bannerContainer"))
        width = 7 * COLUMN;
      return {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        width,
        height,
        toJSON: () => ({}),
      };
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  Settings.defaultZone = "system";
});

describe("drag to move in time grids", () => {
  it("moves a timed event down by snapped minutes", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({ draggable: true, onEventDrop });
    drag(item(), 0, 30);
    expect(onEventDrop).toHaveBeenCalledTimes(1);
    const info = onEventDrop.mock.calls[0][0];
    expect(hm(info.start)).toBe("2026-11-10 09:30");
    expect(hm(info.end)).toBe("2026-11-10 10:30");
    expect(info.allDay).toBe(false);
    expect(info.view).toBe("week");
    expect(info.event.id).toBe("a");
  });

  it("moves to the next day when dragged one column right", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({ draggable: true, onEventDrop });
    drag(item(), COLUMN, 0);
    const info = onEventDrop.mock.calls[0][0];
    expect(hm(info.start)).toBe("2026-11-11 09:00");
    expect(hm(info.end)).toBe("2026-11-11 10:00");
  });

  it("moves to the previous day when dragged right in RTL", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({ draggable: true, onEventDrop, direction: "rtl" });
    drag(item(), COLUMN, 0);
    expect(hm(onEventDrop.mock.calls[0][0].start)).toBe("2026-11-09 09:00");
  });

  it("treats a tiny move as a click, not a drag", () => {
    const onEventDrop = vi.fn();
    const onEventClick = vi.fn();
    renderWeek({ draggable: true, onEventDrop, onEventClick });
    drag(item(), 0, 2);
    expect(onEventDrop).not.toHaveBeenCalled();
    expect(onEventClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onEventClick after a real drag", () => {
    const onEventDrop = vi.fn();
    const onEventClick = vi.fn();
    renderWeek({ draggable: true, onEventDrop, onEventClick });
    drag(item(), 0, 30);
    expect(onEventDrop).toHaveBeenCalledTimes(1);
    expect(onEventClick).not.toHaveBeenCalled();
    fireEvent.click(item());
    expect(onEventClick).toHaveBeenCalledTimes(1);
  });

  it("keeps wall-clock time across a DST change", () => {
    Settings.defaultZone = "America/New_York";
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({
      draggable: true,
      onEventDrop,
      selectedDate: new Date(Date.UTC(2026, 2, 8, 17)),
      events: [
        {
          id: "a",
          title: "DST",
          startDate: "2026-03-08T10:00:00",
          endDate: "2026-03-08T11:00:00",
        },
      ],
    });
    drag(item(), 0, 60);
    const info = onEventDrop.mock.calls[0][0];
    expect(hm(info.start)).toBe("2026-03-08 11:00");
    expect(hm(info.end)).toBe("2026-03-08 12:00");
  });

  it("keeps the end within maxHour", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({
      draggable: true,
      onEventDrop,
      minHour: 8,
      maxHour: 18,
      events: [
        {
          id: "a",
          title: "Late",
          startDate: "2026-11-10T16:00:00",
          endDate: "2026-11-10T17:00:00",
        },
      ],
    });
    drag(item(), 0, 120);
    const info = onEventDrop.mock.calls[0][0];
    expect(hm(info.start)).toBe("2026-11-10 17:00");
    expect(hm(info.end)).toBe("2026-11-10 18:00");
  });

  it("cancels on Escape: no drop and no preview", () => {
    const onEventDrop = vi.fn();
    renderWeek({ draggable: true, onEventDrop });
    const el = item();
    pointer("down", el, 0, 0);
    pointer("move", el, 0, 30);
    expect(el.style.transform).not.toBe("");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(el.style.transform).toBe("");
    pointer("up", el, 0, 30);
    expect(onEventDrop).not.toHaveBeenCalled();
  });

  it("cancels on pointercancel", () => {
    const onEventDrop = vi.fn();
    renderWeek({ draggable: true, onEventDrop });
    const el = item();
    pointer("down", el, 0, 0);
    pointer("move", el, 0, 30);
    fireEvent.pointerCancel(el, { pointerId: 1 });
    pointer("up", el, 0, 30);
    expect(onEventDrop).not.toHaveBeenCalled();
  });

  it("survives unmount mid-drag", () => {
    const onEventDrop = vi.fn();
    const { unmount } = renderWeek({ draggable: true, onEventDrop });
    const el = item();
    pointer("down", el, 0, 0);
    pointer("move", el, 0, 30);
    unmount();
    expect(() => {
      fireEvent.pointerMove(window, { pointerId: 1, clientX: 0, clientY: 60 });
      fireEvent.pointerUp(window, { pointerId: 1, clientX: 0, clientY: 60 });
    }).not.toThrow();
    expect(onEventDrop).not.toHaveBeenCalled();
  });

  it("does nothing without onEventDrop", () => {
    renderWeek({ draggable: true });
    const el = item();
    pointer("down", el, 0, 0);
    pointer("move", el, 0, 30);
    expect(el.style.transform).toBe("");
  });

  it("respects a draggable predicate", () => {
    const onEventDrop = vi.fn();
    renderWeek({ draggable: (e) => e.id !== "a", onEventDrop });
    drag(item(), 0, 30);
    expect(onEventDrop).not.toHaveBeenCalled();
  });

  it("reports the occurrence of a recurring event", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({
      draggable: true,
      onEventDrop,
      events: [
        {
          id: "r",
          title: "Daily",
          startDate: "2026-11-10T09:00:00",
          endDate: "2026-11-10T09:30:00",
          rrule: "FREQ=DAILY;COUNT=3",
        },
      ],
    });
    const items = screen.getAllByTestId(/-day-event-item$/);
    drag(items[1], 0, 30);
    const info = onEventDrop.mock.calls[0][0];
    expect(info.event.recurringEventId).toBe("r");
    expect(hm(info.start)).toBe("2026-11-11 09:30");
  });
});

describe("keyboard move in time grids", () => {
  it("moves by the snap with Alt+ArrowDown and a day with Alt+ArrowRight", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({ draggable: true, onEventDrop });
    expect(item().getAttribute("aria-keyshortcuts")).toContain("Alt+ArrowUp");
    fireEvent.keyDown(item(), { key: "ArrowDown", altKey: true });
    expect(hm(onEventDrop.mock.calls[0][0].start)).toBe("2026-11-10 09:15");
    fireEvent.keyDown(item(), { key: "ArrowRight", altKey: true });
    expect(hm(onEventDrop.mock.calls[1][0].start)).toBe("2026-11-11 09:00");
  });

  it("mirrors Alt+ArrowRight in RTL", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({ draggable: true, onEventDrop, direction: "rtl" });
    fireEvent.keyDown(item(), { key: "ArrowRight", altKey: true });
    expect(hm(onEventDrop.mock.calls[0][0].start)).toBe("2026-11-09 09:00");
  });

  it("has no shortcuts when not draggable", () => {
    renderWeek();
    expect(item().hasAttribute("aria-keyshortcuts")).toBe(false);
  });
});

describe("resize in time grids", () => {
  const handle = (edge: "top" | "bottom", id = "a") =>
    screen.getByTestId(`calendar-${id}-resize-${edge}`);

  it("resizes the bottom edge by snapped minutes", () => {
    const onEventResize = vi.fn<(i: EventResizeInfo) => void>();
    renderWeek({ resizable: true, onEventResize });
    drag(handle("bottom"), 0, 30);
    const info = onEventResize.mock.calls[0][0];
    expect(info.edge).toBe("bottom");
    expect(hm(info.start)).toBe("2026-11-10 09:00");
    expect(hm(info.end)).toBe("2026-11-10 10:30");
    expect(info.view).toBe("week");
  });

  it("resizes the top edge up", () => {
    const onEventResize = vi.fn<(i: EventResizeInfo) => void>();
    renderWeek({ resizable: true, onEventResize });
    drag(handle("top"), 0, -60);
    const info = onEventResize.mock.calls[0][0];
    expect(info.edge).toBe("top");
    expect(hm(info.start)).toBe("2026-11-10 08:00");
    expect(hm(info.end)).toBe("2026-11-10 10:00");
  });

  it("keeps the minimum length when the bottom passes the start", () => {
    const onEventResize = vi.fn<(i: EventResizeInfo) => void>();
    renderWeek({ resizable: true, onEventResize, minEventDurationMinutes: 30 });
    drag(handle("bottom"), 0, -120);
    expect(hm(onEventResize.mock.calls[0][0].end)).toBe("2026-11-10 09:30");
  });

  it("keeps the end within maxHour", () => {
    const onEventResize = vi.fn<(i: EventResizeInfo) => void>();
    renderWeek({
      resizable: true,
      onEventResize,
      maxHour: 18,
      events: [
        {
          id: "a",
          title: "Late",
          startDate: "2026-11-10T16:00:00",
          endDate: "2026-11-10T17:00:00",
        },
      ],
    });
    drag(handle("bottom"), 0, 180);
    expect(hm(onEventResize.mock.calls[0][0].end)).toBe("2026-11-10 18:00");
  });

  it("does not move or open the event from a handle", () => {
    const onEventDrop = vi.fn();
    const onEventClick = vi.fn();
    const onEventResize = vi.fn();
    renderWeek({
      draggable: true,
      onEventDrop,
      resizable: true,
      onEventResize,
      onEventClick,
    });
    drag(handle("bottom"), 0, 30);
    expect(onEventDrop).not.toHaveBeenCalled();
    expect(onEventClick).not.toHaveBeenCalled();
    expect(onEventResize).toHaveBeenCalledTimes(1);
  });

  it("grows the item while the bottom is dragged", () => {
    renderWeek({ resizable: true, onEventResize: vi.fn() });
    const before = parseFloat(item().style.height);
    pointer("down", handle("bottom"), 0, 0);
    pointer("move", handle("bottom"), 0, 30);
    expect(parseFloat(item().style.height)).toBe(before + 30);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(parseFloat(item().style.height)).toBe(before);
  });

  it("resizes the bottom with Alt+Shift+ArrowDown", () => {
    const onEventResize = vi.fn<(i: EventResizeInfo) => void>();
    renderWeek({ resizable: true, onEventResize });
    expect(item().getAttribute("aria-keyshortcuts")).toContain(
      "Alt+Shift+ArrowDown",
    );
    fireEvent.keyDown(item(), {
      key: "ArrowDown",
      altKey: true,
      shiftKey: true,
    });
    expect(hm(onEventResize.mock.calls[0][0].end)).toBe("2026-11-10 10:15");
  });

  it("renders no handles without onEventResize or in Month", () => {
    const { unmount } = renderWeek({ resizable: true });
    expect(screen.queryByTestId("calendar-a-resize-top")).toBeNull();
    unmount();
    renderWeek({ resizable: true, onEventResize: vi.fn(), view: "month" });
    expect(screen.queryByTestId(/-resize-(top|bottom)$/)).toBeNull();
  });
});

describe("drag to move in Month and the all-day row", () => {
  const chip = (id: string) =>
    screen.getByTestId(`calendar-${id}-month-event-item`);
  const ALL_DAY: CalendarEvent = {
    id: "m",
    title: "Offsite",
    startDate: "2026-11-10",
    endDate: "2026-11-11",
  };

  it("moves a month chip one cell right by a day", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({
      view: "month",
      draggable: true,
      onEventDrop,
      events: [ALL_DAY],
    });
    drag(chip("m"), COLUMN, 0);
    const info = onEventDrop.mock.calls[0][0];
    expect(hm(info.start)).toBe("2026-11-11 00:00");
    expect(hm(info.end)).toBe("2026-11-12 00:00");
    expect(info.allDay).toBe(true);
    expect(info.view).toBe("month");
  });

  it("moves a month chip one row down by a week", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({
      view: "month",
      draggable: true,
      onEventDrop,
      events: [ALL_DAY],
    });
    drag(chip("m"), 0, 80);
    expect(hm(onEventDrop.mock.calls[0][0].start)).toBe("2026-11-17 00:00");
  });

  it("keeps the time of a timed month event", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({
      view: "month",
      draggable: true,
      onEventDrop,
      events: [
        {
          id: "t",
          title: "Call",
          startDate: "2026-11-10T14:00:00",
          endDate: "2026-11-10T15:00:00",
        },
      ],
    });
    drag(chip("t"), COLUMN, 0);
    const info = onEventDrop.mock.calls[0][0];
    expect(hm(info.start)).toBe("2026-11-11 14:00");
    expect(hm(info.end)).toBe("2026-11-11 15:00");
    expect(info.allDay).toBe(false);
  });

  it("does not open the event after a month drag", () => {
    const onEventDrop = vi.fn();
    const onEventClick = vi.fn();
    const onDateClick = vi.fn();
    renderWeek({
      view: "month",
      draggable: true,
      onEventDrop,
      onEventClick,
      onDateClick,
      events: [ALL_DAY],
    });
    drag(chip("m"), COLUMN, 0);
    expect(onEventClick).not.toHaveBeenCalled();
    expect(onDateClick).not.toHaveBeenCalled();
  });

  it("moves +7 days with Alt+ArrowDown in Month", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({
      view: "month",
      draggable: true,
      onEventDrop,
      events: [ALL_DAY],
    });
    fireEvent.keyDown(chip("m"), { key: "ArrowDown", altKey: true });
    expect(hm(onEventDrop.mock.calls[0][0].start)).toBe("2026-11-17 00:00");
  });

  it("moves an all-day banner chip one column right by a day", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({ draggable: true, onEventDrop, events: [ALL_DAY] });
    drag(screen.getByTestId("calendar-m-all-day-event"), COLUMN, 0);
    const info = onEventDrop.mock.calls[0][0];
    expect(hm(info.start)).toBe("2026-11-11 00:00");
    expect(info.allDay).toBe(true);
    expect(info.view).toBe("week");
  });

  it("ignores y movement on the banner", () => {
    const onEventDrop = vi.fn();
    renderWeek({ draggable: true, onEventDrop, events: [ALL_DAY] });
    drag(screen.getByTestId("calendar-m-all-day-event"), 0, 200);
    expect(onEventDrop).not.toHaveBeenCalled();
  });
});

describe("review fixes", () => {
  const OVERNIGHT: CalendarEvent = {
    id: "o",
    title: "Night shift",
    startDate: "2026-11-10T22:00:00",
    endDate: "2026-11-11T01:00:00",
  };

  it("moves an overnight event without pulling it back to midnight", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({ draggable: true, onEventDrop, events: [OVERNIGHT] });
    drag(screen.getAllByTestId("calendar-o-day-event-item")[0], 0, 15);
    const info = onEventDrop.mock.calls[0][0];
    expect(hm(info.start)).toBe("2026-11-10 22:15");
    expect(hm(info.end)).toBe("2026-11-11 01:15");
  });

  it("moves an overnight event with Alt+ArrowDown", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({ draggable: true, onEventDrop, events: [OVERNIGHT] });
    fireEvent.keyDown(screen.getAllByTestId("calendar-o-day-event-item")[0], {
      key: "ArrowDown",
      altKey: true,
    });
    expect(hm(onEventDrop.mock.calls[0][0].start)).toBe("2026-11-10 22:15");
  });

  it("stops at the top of the grid on the same day", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({
      draggable: true,
      onEventDrop,
      events: [
        {
          id: "a",
          title: "x",
          startDate: "2026-11-10T09:10:00",
          endDate: "2026-11-10T09:40:00",
        },
      ],
    });
    drag(item(), 0, -600);
    const info = onEventDrop.mock.calls[0][0];
    expect(hm(info.start)).toBe("2026-11-10 00:10");
  });

  it("blocks touch scrolling once a touch drag is active", () => {
    vi.useFakeTimers();
    try {
      renderWeek({ draggable: true, onEventDrop: vi.fn() });
      const el = item();
      fireEvent.pointerDown(el, {
        pointerId: 2,
        pointerType: "touch",
        button: 0,
        clientX: 0,
        clientY: 0,
      });
      expect(fireEvent.touchMove(el)).toBe(true);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(fireEvent.touchMove(el)).toBe(false);
      fireEvent.pointerCancel(el, { pointerId: 2 });
      expect(fireEvent.touchMove(el)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("still opens the event on a plain click on a resize edge", () => {
    const onEventClick = vi.fn();
    renderWeek({ resizable: true, onEventResize: vi.fn(), onEventClick });
    fireEvent.click(screen.getByTestId("calendar-a-resize-bottom"));
    expect(onEventClick).toHaveBeenCalledTimes(1);
  });

  it("shows no resize edges on a very short event", () => {
    renderWeek({
      resizable: true,
      onEventResize: vi.fn(),
      events: [
        {
          id: "a",
          title: "x",
          startDate: "2026-11-10T09:00:00",
          endDate: "2026-11-10T09:15:00",
        },
      ],
    });
    expect(screen.queryByTestId(/-resize-(top|bottom)$/)).toBeNull();
  });

  it("shows the top edge only where the event starts and the bottom only where it ends", () => {
    renderWeek({
      resizable: true,
      onEventResize: vi.fn(),
      events: [OVERNIGHT],
    });
    const [first, second] = screen.getAllByTestId("calendar-o-day-event-item");
    expect(first.querySelector('[data-testid$="-resize-top"]')).not.toBeNull();
    expect(first.querySelector('[data-testid$="-resize-bottom"]')).toBeNull();
    expect(second.querySelector('[data-testid$="-resize-top"]')).toBeNull();
    expect(
      second.querySelector('[data-testid$="-resize-bottom"]'),
    ).not.toBeNull();
  });

  it("moves an all-day chip right to the previous day in RTL", () => {
    const onEventDrop = vi.fn<(i: EventDropInfo) => void>();
    renderWeek({
      draggable: true,
      onEventDrop,
      direction: "rtl",
      events: [
        {
          id: "m",
          title: "Offsite",
          startDate: "2026-11-10",
          endDate: "2026-11-10",
        },
      ],
    });
    const chip = screen.getByTestId("calendar-m-all-day-event");
    expect(chip.style.insetInlineStart).not.toBe("");
    drag(chip, COLUMN, 0);
    expect(hm(onEventDrop.mock.calls[0][0].start)).toBe("2026-11-09 00:00");
  });
});
