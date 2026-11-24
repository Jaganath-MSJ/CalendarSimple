import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MonthView from "../components/views/month_view/MonthView";
import { CalendarProvider } from "./CalendarContext";
import { defaultCalendarProps } from "../constants/calendar";
import { dateFn } from "../utils";
import { ECalendarViewType, CalendarEvent } from "../types";

function renderMonth(events: CalendarEvent[]) {
  return render(
    <CalendarProvider
      initialDate={dateFn("2026-11-10")}
      initialView={ECalendarViewType.month}
      testId="calendar"
      config={{ ...defaultCalendarProps, width: 700, height: 600, events }}
    >
      <MonthView />
    </CalendarProvider>,
  );
}

describe("CalendarProvider used directly (no bodySize prop)", () => {
  it("derives the month chip cap from numeric config.height", () => {
    renderMonth(
      [1, 2, 3, 4].map((n) => ({
        id: `e${n}`,
        title: `E${n}`,
        startDate: "2026-11-10",
      })),
    );
    expect(screen.getByTestId("calendar-10-more-events")).toBeInTheDocument();
  });

  it("derives multi-day chip width from numeric config.width", () => {
    renderMonth([
      {
        id: "md",
        title: "Three",
        startDate: "2026-11-10",
        endDate: "2026-11-12",
      },
    ]);
    expect(screen.getByTestId("calendar-md-month-event-item").style.width).toBe(
      "284px",
    );
  });
});
