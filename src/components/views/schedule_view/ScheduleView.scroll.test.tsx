import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Calendar from "../../../Calendar";
import { CalendarEvent, ECalendarViewType } from "../../../types";

const events: CalendarEvent[] = [
  { id: "a", title: "A", startDate: "2026-11-03" },
  { id: "b", title: "B", startDate: "2026-11-10" },
  { id: "c", title: "C", startDate: "2026-11-20" },
];
const KEYS = ["2026-11-03", "2026-11-10", "2026-11-20"];

describe("ScheduleView scrolling", () => {
  const original = Element.prototype.getBoundingClientRect;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 15, 12));
    Element.prototype.getBoundingClientRect = function (this: Element) {
      const key = this.getAttribute("data-date-key");
      const top = key ? KEYS.indexOf(key) * 100 : 0;
      return {
        top,
        bottom: top,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: top,
        toJSON: () => ({}),
      };
    };
  });

  afterEach(() => {
    Element.prototype.getBoundingClientRect = original;
    vi.useRealTimers();
  });

  const setup = () => {
    render(
      <Calendar
        view={ECalendarViewType.schedule}
        events={events}
        width={700}
        height={600}
      />,
    );
    const container = screen.getByTestId("calendar-schedule-view");
    container.scrollTop = 0;
    return container;
  };

  it("does not scroll on mount under StrictMode", () => {
    render(
      <React.StrictMode>
        <Calendar
          view={ECalendarViewType.schedule}
          selectedDate={new Date(2026, 10, 15, 12)}
          events={events}
          width={700}
          height={600}
        />
      </React.StrictMode>,
    );
    const container = screen.getByTestId("calendar-schedule-view");
    expect(container.scrollTop).toBe(0);
  });

  it("renders every group and tags them with data-date-key", () => {
    const container = setup();
    expect(container.querySelectorAll("[data-date-key]")).toHaveLength(3);
  });

  it("picking December scrolls to the last group", async () => {
    const container = setup();
    await userEvent.selectOptions(
      screen.getByTestId("calendar-header-month-select"),
      "11",
    );
    expect(container.scrollTop).toBe(200);
    expect(within(container).getAllByText(/^[ABC]$/).length).toBe(3);
  });

  it("Today scrolls back to the first group on or after today", async () => {
    const container = setup();
    await userEvent.selectOptions(
      screen.getByTestId("calendar-header-month-select"),
      "0",
    );
    container.scrollTop = 0;
    await userEvent.click(screen.getByTestId("calendar-header-today-btn"));
    expect(container.scrollTop).toBe(200);
  });

  it("Today scrolls back when selectedDate is already today", async () => {
    const container = setup();
    container.scrollTop = 999;
    await userEvent.click(screen.getByTestId("calendar-header-today-btn"));
    expect(container.scrollTop).toBe(999 + 200);
  });

  it("re-picking the current month scrolls to the target", async () => {
    const container = setup();
    container.scrollTop = 999;
    await userEvent.selectOptions(
      screen.getByTestId("calendar-header-month-select"),
      "10",
    );
    expect(container.scrollTop).toBe(999 + 200);
  });
});
