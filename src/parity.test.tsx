import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import Calendar from "./Calendar";
import { DEFAULT_MESSAGES } from "./index";

const props = { width: 800, height: 600, selectedDate: new Date(2026, 10, 10) };

describe("native parity: testID alias", () => {
  it("uses testID as the test id prefix", () => {
    render(<Calendar {...props} testID="cal" />);
    expect(screen.getByTestId("cal-container")).toBeInTheDocument();
  });

  it("prefers testId when both are given", () => {
    render(<Calendar {...props} testId="web" testID="native" />);
    expect(screen.getByTestId("web-container")).toBeInTheDocument();
  });
});

describe("native parity: customDays 1–7", () => {
  const columns = () => screen.getAllByTestId("calendar-day-column").length;

  it("draws 7 days when given more", () => {
    render(<Calendar {...props} view="customDays" customDays={9 as never} />);
    expect(columns()).toBe(7);
  });

  it("draws 1 day when given less", () => {
    render(<Calendar {...props} view="customDays" customDays={0 as never} />);
    expect(columns()).toBe(1);
  });

  it("draws the given count inside the range", () => {
    render(<Calendar {...props} view="customDays" customDays={5} />);
    expect(columns()).toBe(5);
  });
});

describe("native parity: messages", () => {
  it("exports DEFAULT_MESSAGES with native's extra keys and wording", () => {
    expect(DEFAULT_MESSAGES.close).toBe("Close");
    expect(DEFAULT_MESSAGES.loading).toBe("Loading events");
    expect(DEFAULT_MESSAGES.newEvent).toBe("New event");
    expect(DEFAULT_MESSAGES.eventCount(0)).toBe("no events");
    expect(DEFAULT_MESSAGES.eventCount(1)).toBe("1 event");
    expect(DEFAULT_MESSAGES.eventCount(3)).toBe("3 events");
    expect(DEFAULT_MESSAGES.moveEarlier(15)).toBe("Move 15 minutes earlier");
    expect(DEFAULT_MESSAGES.moveLater(15)).toBe("Move 15 minutes later");
    expect(DEFAULT_MESSAGES.movePreviousDay).toBe("Move to the previous day");
    expect(DEFAULT_MESSAGES.moveNextDay).toBe("Move to the next day");
    expect(DEFAULT_MESSAGES.makeLonger(15)).toBe("Make 15 minutes longer");
    expect(DEFAULT_MESSAGES.makeShorter(15)).toBe("Make 15 minutes shorter");
    // Web's own keys stay.
    expect(DEFAULT_MESSAGES.moreEventsOn(3, "Nov 10")).toBe(
      "3 more events on Nov 10",
    );
    expect(DEFAULT_MESSAGES.weekNumber(45)).toBe("W45");
  });

  const three = ["a", "b", "c"].map((id) => ({
    id,
    title: id,
    startDate: "2026-11-10",
  }));

  it("labels a clickable month cell with its event count", () => {
    render(<Calendar {...props} events={three} onDateClick={() => {}} />);
    expect(
      screen.getByTestId("calendar-10-month-cell").getAttribute("aria-label"),
    ).toMatch(/, 3 events$/);
  });

  it("uses localeMessages.eventCount", () => {
    render(
      <Calendar
        {...props}
        events={three}
        onDateClick={() => {}}
        localeMessages={{ eventCount: (n) => `${n} Termine` }}
      />,
    );
    expect(
      screen.getByTestId("calendar-10-month-cell").getAttribute("aria-label"),
    ).toMatch(/, 3 Termine$/);
  });

  it("closes the more popover with its close button", () => {
    render(<Calendar {...props} events={three} maxEvents={1} />);
    fireEvent.click(screen.getByTestId("calendar-10-more-events"));
    const close = screen.getByRole("button", { name: "Close" });
    fireEvent.click(close);
    expect(screen.queryByTestId("calendar-popover-content")).toBeNull();
  });

  it("offers + New event in the more popover when creatable", () => {
    const onSlotClick = vi.fn();
    render(
      <Calendar
        {...props}
        events={three}
        maxEvents={1}
        creatable
        onSlotClick={onSlotClick}
      />,
    );
    fireEvent.click(screen.getByTestId("calendar-10-more-events"));
    fireEvent.click(screen.getByRole("button", { name: "New event" }));
    const [start, end] = onSlotClick.mock.calls[0] as [Date, Date];
    expect(start.getHours()).toBe(0);
    expect(start.getDate()).toBe(10);
    expect(end.getDate()).toBe(10);
    expect(end.getHours()).toBe(23);
    expect(screen.queryByTestId("calendar-popover-content")).toBeNull();
  });

  it("has no + New event without creatable", () => {
    render(<Calendar {...props} events={three} maxEvents={1} />);
    fireEvent.click(screen.getByTestId("calendar-10-more-events"));
    expect(screen.queryByRole("button", { name: "New event" })).toBeNull();
  });

  it("labels the loading skeleton", () => {
    render(<Calendar {...props} isLoading events={[]} />);
    expect(
      screen.getByRole("status", { name: "Loading events" }),
    ).toBeInTheDocument();
  });

  it("describes the drag actions on a draggable event", () => {
    render(
      <Calendar
        {...props}
        view="week"
        draggable
        resizable
        onEventDrop={() => {}}
        onEventResize={() => {}}
        events={[
          {
            id: "t",
            title: "T",
            startDate: "2026-11-10T09:00:00",
            endDate: "2026-11-10T10:00:00",
          },
        ]}
      />,
    );
    const d =
      screen
        .getByTestId("calendar-t-day-event-item")
        .getAttribute("aria-description") ?? "";
    expect(d).toContain("Move 15 minutes earlier");
    expect(d).toContain("Move to the next day");
    expect(d).toContain("Make 15 minutes longer");
  });
});

describe("native parity: palette", () => {
  const events = ["a", "b", "c"].map((id) => ({
    id,
    title: id,
    startDate: "2026-11-10",
  }));
  const root = () => screen.getByTestId("calendar-container");

  it("writes the scheme's palette as CSS custom properties on the root", () => {
    render(
      <Calendar
        {...props}
        colorScheme="light"
        palette={{
          light: { primary: "#ff0000", nowLine: "#00aa00", bgMuted: "#eeeeee" },
          dark: { primary: "#0000ff" },
        }}
      />,
    );
    expect(root().style.getPropertyValue("--primary-color")).toBe("#ff0000");
    expect(root().style.getPropertyValue("--cal-now-line")).toBe("#00aa00");
    expect(root().style.getPropertyValue("--bg-hover")).toBe("#eeeeee");
  });

  it("uses the dark entry in dark mode and nothing else", () => {
    render(
      <Calendar
        {...props}
        colorScheme="dark"
        palette={{
          light: { primary: "#ff0000" },
          dark: { primary: "#0000ff" },
        }}
      />,
    );
    expect(root().style.getPropertyValue("--primary-color")).toBe("#0000ff");
    expect(root().style.getPropertyValue("--text-primary")).toBe("");
  });

  it("maps every native palette key", () => {
    render(
      <Calendar
        {...props}
        colorScheme="light"
        palette={{
          light: {
            primary: "#000001",
            primaryStrong: "#000002",
            onPrimary: "#000003",
            textPrimary: "#000004",
            textSecondary: "#000005",
            bg: "#000006",
            bgMuted: "#000007",
            border: "#000008",
            surfaceRaised: "#000009",
            focus: "#00000a",
            eventDefault: "#00000b",
            nowLine: "#00000c",
            scrim: "#00000d",
          },
        }}
      />,
    );
    const v = (name: string) => root().style.getPropertyValue(name);
    expect([
      v("--primary-color"),
      v("--primary-hover"),
      v("--cal-on-primary"),
      v("--text-primary"),
      v("--text-secondary"),
      v("--bg-color"),
      v("--bg-hover"),
      v("--border-color"),
      v("--cal-surface-raised"),
      v("--cal-focus-color"),
      v("--cal-event-default"),
      v("--cal-now-line"),
      v("--cal-scrim"),
    ]).toEqual([
      "#000001",
      "#000002",
      "#000003",
      "#000004",
      "#000005",
      "#000006",
      "#000007",
      "#000008",
      "#000009",
      "#00000a",
      "#00000b",
      "#00000c",
      "#00000d",
    ]);
  });

  it("applies the palette inside the more popover too", () => {
    render(
      <Calendar
        {...props}
        colorScheme="light"
        events={events}
        maxEvents={1}
        palette={{ light: { surfaceRaised: "#123456" } }}
      />,
    );
    fireEvent.click(screen.getByTestId("calendar-10-more-events"));
    expect(
      screen
        .getByTestId("calendar-popover-content")
        .style.getPropertyValue("--cal-surface-raised"),
    ).toBe("#123456");
  });
});

describe("native parity: keyboard navigation", () => {
  const cell = (d: number) => screen.getByTestId(`calendar-${d}-month-cell`);
  const cellOf = (iso: string) =>
    document.querySelector(`[data-date="${iso}"]`) as HTMLElement;
  const views = () =>
    document.querySelector("[data-calendar-views]") as HTMLElement;

  it("month: one tab stop on the selected day; arrows move focus", () => {
    render(<Calendar {...props} />);
    const stops = document.querySelectorAll('[data-date][tabindex="0"]');
    expect(stops).toHaveLength(1);
    expect((stops[0] as HTMLElement).dataset.date).toBe("2026-11-10");
    cellOf("2026-11-10").focus();
    fireEvent.keyDown(cellOf("2026-11-10"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(cellOf("2026-11-11"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(cellOf("2026-11-18"));
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(document.activeElement).toBe(cellOf("2026-11-15"));
  });

  it("month: moving past the month navigates and keeps focus on the target day", () => {
    const onNavigate = vi.fn();
    render(<Calendar {...props} onNavigate={onNavigate} />);
    cellOf("2026-11-10").focus();
    fireEvent.keyDown(cellOf("2026-11-10"), { key: "PageDown" });
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect((onNavigate.mock.calls[0][0] as Date).getMonth()).toBe(11);
    expect(document.activeElement).toBe(cellOf("2026-12-10"));
  });

  it("month: ArrowLeft moves right-to-left in RTL", () => {
    render(<Calendar {...props} direction="rtl" />);
    cellOf("2026-11-10").focus();
    fireEvent.keyDown(cellOf("2026-11-10"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(cellOf("2026-11-11"));
  });

  it("month: labels every cell with its event count", () => {
    render(<Calendar {...props} />);
    expect(cell(10).getAttribute("aria-label")).toMatch(/, no events$/);
  });

  it("time grids: PageDown, ArrowRight and T turn the period", () => {
    const onNavigate = vi.fn();
    render(<Calendar {...props} view="week" onNavigate={onNavigate} />);
    fireEvent.keyDown(views(), { key: "PageDown" });
    fireEvent.keyDown(views(), { key: "ArrowRight" });
    fireEvent.keyDown(views(), { key: "ArrowLeft" });
    fireEvent.keyDown(views(), { key: "t" });
    const days = onNavigate.mock.calls.map((c) => (c[0] as Date).getDate());
    expect(days.slice(0, 3)).toEqual([17, 24, 17]);
    expect((onNavigate.mock.calls[3][0] as Date).toDateString()).toBe(
      new Date().toDateString(),
    );
  });

  it("time grids: mirrored arrows in RTL; modifiers and inputs are ignored", () => {
    const onNavigate = vi.fn();
    render(
      <Calendar
        {...props}
        view="day"
        direction="rtl"
        onNavigate={onNavigate}
        renderHourCell={(d) =>
          d.getHours() === 9 ? <input data-testid="field" /> : null
        }
      />,
    );
    fireEvent.keyDown(views(), { key: "ArrowRight" });
    expect((onNavigate.mock.calls[0][0] as Date).getDate()).toBe(9);
    fireEvent.keyDown(views(), { key: "PageDown", ctrlKey: true });
    fireEvent.keyDown(views(), { key: "PageDown", shiftKey: true });
    fireEvent.keyDown(screen.getByTestId("field"), { key: "PageDown" });
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("schedule: no period keys; T goes to today; ↑/↓ move between rows", () => {
    const onNavigate = vi.fn();
    render(
      <Calendar
        {...props}
        view="schedule"
        onNavigate={onNavigate}
        events={[
          { id: "s1", title: "A", startDate: "2026-11-10T09:00:00" },
          { id: "s2", title: "B", startDate: "2026-11-11T09:00:00" },
        ]}
      />,
    );
    fireEvent.keyDown(views(), { key: "PageDown" });
    expect(onNavigate).not.toHaveBeenCalled();
    const first = screen.getByTestId("calendar-s1-schedule-event");
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(
      screen.getByTestId("calendar-s2-schedule-event"),
    );
    fireEvent.keyDown(document.activeElement!, { key: "t" });
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("keyboardNavigation={false} keeps every month cell a tab stop and ignores keys", () => {
    const onNavigate = vi.fn();
    render(
      <Calendar
        {...props}
        view="week"
        keyboardNavigation={false}
        onNavigate={onNavigate}
      />,
    );
    fireEvent.keyDown(views(), { key: "PageDown" });
    expect(onNavigate).not.toHaveBeenCalled();
  });
});

describe("native parity: hour height and pinch zoom", () => {
  const timed = [
    {
      id: "h",
      title: "Nine",
      startDate: "2026-11-10T09:00:00",
      endDate: "2026-11-10T10:00:00",
    },
  ];
  const item = () => screen.getByTestId("calendar-h-day-event-item");
  const scroller = () =>
    screen
      .getByTestId("calendar-day-column")
      .closest("[data-calendar-scroll]") as HTMLElement;

  it("defaults to 60 px per hour", () => {
    render(<Calendar {...props} view="day" events={timed} />);
    expect(item().style.top).toBe("540px");
    expect(item().style.height).toBe("60px");
    expect(
      screen
        .getByTestId("calendar-container")
        .style.getPropertyValue("--cal-hour-height"),
    ).toBe("60px");
  });

  it("scales events and slots with hourHeight", () => {
    render(<Calendar {...props} view="day" events={timed} hourHeight={120} />);
    expect(item().style.top).toBe("1080px");
    expect(item().style.height).toBe("120px");
    expect(
      screen
        .getByTestId("calendar-container")
        .style.getPropertyValue("--cal-hour-height"),
    ).toBe("120px");
  });

  it("drags in minutes of the scaled grid", () => {
    const onEventDrop = vi.fn();
    render(
      <Calendar
        {...props}
        view="day"
        events={timed}
        hourHeight={120}
        draggable
        onEventDrop={onEventDrop}
      />,
    );
    const el = item();
    const init = { pointerId: 1, pointerType: "mouse", button: 0, clientX: 0 };
    fireEvent.pointerDown(el, { ...init, clientY: 0 });
    fireEvent.pointerMove(el, { ...init, clientY: 30 });
    fireEvent.pointerMove(el, { ...init, clientY: 60 });
    fireEvent.pointerUp(el, { ...init, clientY: 60 });
    const start = (onEventDrop.mock.calls[0][0] as { start: Date }).start;
    expect([start.getHours(), start.getMinutes()]).toEqual([9, 30]);
  });

  it("zooms with Ctrl + wheel when pinchToZoom, within the limits", () => {
    vi.useFakeTimers();
    try {
      const onHourHeightChange = vi.fn();
      render(
        <Calendar
          {...props}
          view="day"
          events={timed}
          pinchToZoom
          maxHourHeight={100}
          onHourHeightChange={onHourHeightChange}
        />,
      );
      fireEvent.wheel(scroller(), { deltaY: -400, ctrlKey: true });
      expect(parseFloat(item().style.height)).toBe(100);
      expect(onHourHeightChange).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(onHourHeightChange).toHaveBeenCalledWith(100);
      fireEvent.wheel(scroller(), { deltaY: 2000, ctrlKey: true });
      expect(parseFloat(item().style.height)).toBe(30);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not zoom without pinchToZoom or without Ctrl", () => {
    render(<Calendar {...props} view="day" events={timed} pinchToZoom />);
    fireEvent.wheel(scroller(), { deltaY: -400 });
    expect(item().style.height).toBe("60px");
    const { unmount } = render(
      <Calendar {...props} view="week" events={timed} testId="b" />,
    );
    fireEvent.wheel(
      screen
        .getAllByTestId("b-day-column")[0]
        .closest("[data-calendar-scroll]")!,
      { deltaY: -400, ctrlKey: true },
    );
    expect(screen.getByTestId("b-h-day-event-item").style.height).toBe("60px");
    unmount();
  });

  it("keeps a controlled hourHeight until the parent updates it", () => {
    vi.useFakeTimers();
    try {
      const onHourHeightChange = vi.fn();
      render(
        <Calendar
          {...props}
          view="day"
          events={timed}
          pinchToZoom
          hourHeight={60}
          onHourHeightChange={onHourHeightChange}
        />,
      );
      fireEvent.wheel(scroller(), { deltaY: -100, ctrlKey: true });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(onHourHeightChange).toHaveBeenCalledTimes(1);
      expect(item().style.height).toBe("60px");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("native parity: swipeNavigation", () => {
  const views = () =>
    document.querySelector("[data-calendar-views]") as HTMLElement;
  const swipe = (dx: number, dy = 0, pointerType = "touch") => {
    const base = { pointerId: 7, pointerType, button: 0 };
    fireEvent.pointerDown(views(), { ...base, clientX: 200, clientY: 200 });
    fireEvent.pointerUp(views(), {
      ...base,
      clientX: 200 + dx,
      clientY: 200 + dy,
    });
  };
  const month = (calls: unknown[][], i: number) =>
    (calls[i][0] as Date).getMonth();

  it("is off by default", () => {
    const onNavigate = vi.fn();
    render(<Calendar {...props} onNavigate={onNavigate} />);
    swipe(-120);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("swipes to the next and previous period", () => {
    const onNavigate = vi.fn();
    render(<Calendar {...props} swipeNavigation onNavigate={onNavigate} />);
    swipe(-120);
    swipe(120);
    expect([
      month(onNavigate.mock.calls, 0),
      month(onNavigate.mock.calls, 1),
    ]).toEqual([11, 10]);
  });

  it("mirrors the direction in RTL", () => {
    const onNavigate = vi.fn();
    render(
      <Calendar
        {...props}
        swipeNavigation
        direction="rtl"
        onNavigate={onNavigate}
      />,
    );
    swipe(-120);
    expect(month(onNavigate.mock.calls, 0)).toBe(9);
  });

  it("ignores mouse, short, vertical swipes and Schedule", () => {
    const onNavigate = vi.fn();
    const { unmount } = render(
      <Calendar
        {...props}
        view="week"
        swipeNavigation
        onNavigate={onNavigate}
      />,
    );
    swipe(-120, 0, "mouse");
    swipe(-20);
    swipe(-70, 140);
    unmount();
    render(
      <Calendar
        {...props}
        view="schedule"
        swipeNavigation
        onNavigate={onNavigate}
      />,
    );
    swipe(-120);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("works in the time grids", () => {
    const onNavigate = vi.fn();
    render(
      <Calendar
        {...props}
        view="week"
        swipeNavigation
        onNavigate={onNavigate}
      />,
    );
    swipe(-120);
    expect((onNavigate.mock.calls[0][0] as Date).getDate()).toBe(17);
  });
});

describe("review fixes (native parity)", () => {
  const three = ["a", "b", "c"].map((id) => ({
    id,
    title: id,
    startDate: "2026-11-10",
  }));
  const cellOf = (iso: string) =>
    document.querySelector(`[data-date="${iso}"]`) as HTMLElement;

  it("Enter on the popover close button does not click the day (C1)", () => {
    const onDateClick = vi.fn();
    const onSlotClick = vi.fn();
    render(
      <Calendar
        {...props}
        events={three}
        maxEvents={1}
        selectable
        creatable
        onSlotClick={onSlotClick}
        onDateClick={onDateClick}
      />,
    );
    fireEvent.click(screen.getByTestId("calendar-10-more-events"));
    onDateClick.mockClear();
    onSlotClick.mockClear();
    fireEvent.keyDown(screen.getByTestId("calendar-popover-close"), {
      key: "Enter",
    });
    fireEvent.keyDown(screen.getByTestId("calendar-popover-new-event"), {
      key: " ",
    });
    expect(onDateClick).not.toHaveBeenCalled();
    expect(onSlotClick).not.toHaveBeenCalled();
  });

  it("grid keys inside the popover do not move the grid (I1)", () => {
    const onNavigate = vi.fn();
    render(
      <Calendar
        {...props}
        events={three}
        maxEvents={1}
        onNavigate={onNavigate}
      />,
    );
    fireEvent.click(screen.getByTestId("calendar-10-more-events"));
    const close = screen.getByTestId("calendar-popover-close");
    close.focus();
    fireEvent.keyDown(close, { key: "ArrowDown" });
    fireEvent.keyDown(close, { key: "PageDown" });
    expect(document.activeElement).toBe(close);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("arrow keys on an event chip do not jump the grid (I2)", () => {
    render(
      <Calendar
        {...props}
        events={[{ id: "z", title: "Z", startDate: "2026-11-25" }]}
      />,
    );
    const chip = screen.getByTestId("calendar-z-month-event-item");
    chip.focus();
    fireEvent.keyDown(chip, { key: "ArrowRight" });
    expect(document.activeElement).toBe(chip);
  });

  it("a work week always keeps one tab stop (I3)", () => {
    render(
      <Calendar
        {...props}
        selectedDate={new Date(2026, 10, 14)}
        weekStartsOn={1}
        weekEndsOn={5}
      />,
    );
    const stops = document.querySelectorAll('[data-date][tabindex="0"]');
    expect(stops).toHaveLength(1);
    expect((stops[0] as HTMLElement).dataset.date).toBe("2026-11-16");
    expect(cellOf("2026-11-16")).toBe(stops[0]);
  });

  it("compound mode sets --cal-hour-height on the outer container (I4)", () => {
    render(
      <Calendar {...props} hourHeight={120}>
        <Calendar.WeekView />
      </Calendar>,
    );
    expect(
      screen
        .getByTestId("calendar-container")
        .style.getPropertyValue("--cal-hour-height"),
    ).toBe("120px");
  });

  it("pinch keeps the time at the top of the view after the grid grows (I5)", () => {
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
      // Browser-like: scrollTop is clamped to the content height, which
      // follows the hour height currently drawn.
      const drawn = () =>
        parseFloat(
          screen.getByTestId("calendar-h-day-event-item").style.height,
        );
      let top = 0;
      Object.defineProperty(scroller, "clientHeight", {
        configurable: true,
        get: () => 500,
      });
      Object.defineProperty(scroller, "scrollHeight", {
        configurable: true,
        get: () => 24 * drawn(),
      });
      Object.defineProperty(scroller, "scrollTop", {
        configurable: true,
        get: () => top,
        set: (v: number) => {
          top = Math.max(0, Math.min(v, 24 * drawn() - 500));
        },
      });
      scroller.scrollTop = 600; // 10:00 at 60 px/h
      fireEvent.wheel(scroller, {
        deltaY: -Math.log(2) / 0.002,
        ctrlKey: true,
      });
      expect(drawn()).toBe(120);
      expect(scroller.scrollTop).toBe(1200); // still 10:00
    } finally {
      vi.useRealTimers();
    }
  });

  it("an invalid hourHeight falls back to 60 (M1)", () => {
    render(
      <Calendar
        {...props}
        view="day"
        hourHeight={0}
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
    expect(screen.getByTestId("calendar-h-day-event-item").style.height).toBe(
      "60px",
    );
  });
});
