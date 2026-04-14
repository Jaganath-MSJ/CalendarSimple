import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import View from "./View";
import { ECalendarViewType } from "../../types";
import * as CalendarContextModule from "../../context/CalendarContext";

vi.mock("./day_view/DayView", () => ({
  default: () => <div data-testid="day-view" />,
}));
vi.mock("./week_view/WeekView", () => ({
  default: () => <div data-testid="week-view" />,
}));
vi.mock("./month_view/MonthView", () => ({
  default: () => <div data-testid="month-view" />,
}));
vi.mock("./schedule_view/ScheduleView", () => ({
  default: () => <div data-testid="schedule-view" />,
}));
vi.mock("./custom_days_view/CustomDaysView", () => ({
  default: () => <div data-testid="custom-days-view" />,
}));

describe("View Component", () => {
  const renderView = (view: ECalendarViewType, customDays?: number) => {
    vi.spyOn(CalendarContextModule, "useCalendar").mockReturnValue({
      state: { view, customDays },
      config: {},
    } as never);
    return render(<View />);
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders DayView", () => {
    renderView(ECalendarViewType.day);
    expect(screen.getByTestId("day-view")).toBeInTheDocument();
  });

  it("renders WeekView", () => {
    renderView(ECalendarViewType.week);
    expect(screen.getByTestId("week-view")).toBeInTheDocument();
  });

  it("renders MonthView", () => {
    renderView(ECalendarViewType.month);
    expect(screen.getByTestId("month-view")).toBeInTheDocument();
  });

  it("renders ScheduleView", () => {
    renderView(ECalendarViewType.schedule);
    expect(screen.getByTestId("schedule-view")).toBeInTheDocument();
  });

  it("renders CustomDaysView when customDays is valid", () => {
    renderView(ECalendarViewType.customDays, 3);
    expect(screen.getByTestId("custom-days-view")).toBeInTheDocument();
  });

  it("returns null for CustomDaysView when customDays is invalid", () => {
    const { container } = renderView(ECalendarViewType.customDays, 0);
    expect(container).toBeEmptyDOMElement();
  });
});
