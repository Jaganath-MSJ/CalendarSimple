import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Calendar from "../Calendar";
import { CalendarEvent, ECalendarViewType } from "../types";

const hostile = {
  top: "0px",
  left: "0px",
  position: "static",
  width: "1px",
  height: "5px",
  zIndex: 999,
  backgroundColor: "red",
} as const;

function renderView(view: ECalendarViewType, event: CalendarEvent) {
  return render(
    <Calendar
      width={700}
      height={600}
      selectedDate={new Date(2026, 10, 10)}
      view={view}
      events={[event]}
    />,
  );
}

describe("event.style cannot override layout", () => {
  it("day item keeps computed layout but applies colour", () => {
    renderView(ECalendarViewType.day, {
      id: "d",
      title: "T",
      startDate: "2026-11-10T09:00:00",
      endDate: "2026-11-10T10:00:00",
      style: { ...hostile },
    });
    const el = screen.getByTestId("calendar-d-day-event-item");
    expect(el.style.top).toBe("540px");
    expect(el.style.position).toBe("absolute");
    expect(el.style.height).not.toBe("5px");
    expect(el.style.backgroundColor).toBe("red");
  });

  it("month chip keeps computed width", () => {
    renderView(ECalendarViewType.month, {
      id: "m",
      title: "T",
      startDate: "2026-11-10",
      style: { ...hostile },
    });
    const el = screen.getByTestId("calendar-m-month-event-item");
    expect(el.style.width).not.toBe("1px");
    expect(el.style.position).not.toBe("static");
    expect(el.style.backgroundColor).toBe("red");
  });

  it("banner chip keeps percentage left", () => {
    renderView(ECalendarViewType.week, {
      id: "b",
      title: "T",
      startDate: "2026-11-10",
      style: { ...hostile },
    });
    const el = screen.getByTestId("calendar-b-all-day-event");
    expect(el.style.left).toContain("%");
    expect(el.style.backgroundColor).toBe("red");
  });

  it("schedule title ignores layout keys, stays transparent", () => {
    renderView(ECalendarViewType.schedule, {
      id: "s",
      title: "T",
      startDate: "2026-11-10",
      style: { ...hostile, color: "blue" },
    });
    const title = screen
      .getByTestId("calendar-s-schedule-event")
      .querySelector("[class*=eventTitleColumn]") as HTMLElement;
    expect(title.style.position).toBe("");
    expect(title.style.height).toBe("");
    expect(title.style.backgroundColor).toBe("transparent");
    expect(title.style.color).toBe("blue");
  });
});
