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
vi.mock("../ui/skeleton/MonthSkeleton", () => ({
  default: () => <div data-testid="month-skeleton" />,
}));
vi.mock("../ui/skeleton/TimeGridSkeleton", () => ({
  default: () => <div data-testid="time-grid-skeleton" />,
}));
vi.mock("../ui/skeleton/ScheduleSkeleton", () => ({
  default: () => <div data-testid="schedule-skeleton" />,
}));

const mockCalendar = (
  view: ECalendarViewType,
  config: Record<string, unknown> = {},
  customDays?: number,
) => {
  vi.spyOn(CalendarContextModule, "useCalendar").mockReturnValue({
    state: { view, customDays },
    config,
  } as never);
};

describe("View Component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── existing view routing ─────────────────────────────
  it("renders DayView", () => {
    mockCalendar(ECalendarViewType.day);
    render(<View />);
    expect(screen.getByTestId("day-view")).toBeInTheDocument();
  });

  it("renders WeekView", () => {
    mockCalendar(ECalendarViewType.week);
    render(<View />);
    expect(screen.getByTestId("week-view")).toBeInTheDocument();
  });

  it("renders MonthView", () => {
    mockCalendar(ECalendarViewType.month);
    render(<View />);
    expect(screen.getByTestId("month-view")).toBeInTheDocument();
  });

  it("renders ScheduleView", () => {
    mockCalendar(ECalendarViewType.schedule);
    render(<View />);
    expect(screen.getByTestId("schedule-view")).toBeInTheDocument();
  });

  it("renders CustomDaysView when customDays is valid", () => {
    mockCalendar(ECalendarViewType.customDays, {}, 3);
    render(<View />);
    expect(screen.getByTestId("custom-days-view")).toBeInTheDocument();
  });

  it("returns null for CustomDaysView when customDays is invalid", () => {
    mockCalendar(ECalendarViewType.customDays, {}, 0);
    const { container } = render(<View />);
    expect(container).toBeEmptyDOMElement();
  });

  // ── loading: empty events → show skeleton ─────────────
  it("shows MonthSkeleton when isLoading and no events in month view", () => {
    mockCalendar(ECalendarViewType.month, { isLoading: true, events: [] });
    render(<View />);
    expect(screen.getByTestId("month-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("month-view")).not.toBeInTheDocument();
  });

  it("shows TimeGridSkeleton when isLoading and no events in week view", () => {
    mockCalendar(ECalendarViewType.week, { isLoading: true, events: [] });
    render(<View />);
    expect(screen.getByTestId("time-grid-skeleton")).toBeInTheDocument();
  });

  it("shows TimeGridSkeleton when isLoading and no events in day view", () => {
    mockCalendar(ECalendarViewType.day, { isLoading: true, events: [] });
    render(<View />);
    expect(screen.getByTestId("time-grid-skeleton")).toBeInTheDocument();
  });

  it("shows TimeGridSkeleton when isLoading and no events in customDays view", () => {
    mockCalendar(
      ECalendarViewType.customDays,
      { isLoading: true, events: [] },
      3,
    );
    render(<View />);
    expect(screen.getByTestId("time-grid-skeleton")).toBeInTheDocument();
  });

  it("shows ScheduleSkeleton when isLoading and no events in schedule view", () => {
    mockCalendar(ECalendarViewType.schedule, { isLoading: true, events: [] });
    render(<View />);
    expect(screen.getByTestId("schedule-skeleton")).toBeInTheDocument();
  });

  // ── loading: non-empty events → show view ─────────────
  it("shows MonthView (not skeleton) when isLoading but events exist", () => {
    mockCalendar(ECalendarViewType.month, {
      isLoading: true,
      events: [{ id: "1", title: "E", start: new Date(), end: new Date() }],
    });
    render(<View />);
    expect(screen.getByTestId("month-view")).toBeInTheDocument();
    expect(screen.queryByTestId("month-skeleton")).not.toBeInTheDocument();
  });

  // ── renderLoading custom UI ──────────────────────────
  it("renders renderLoading() output when isLoading and no events", () => {
    mockCalendar(ECalendarViewType.month, {
      isLoading: true,
      events: [],
      renderLoading: () => <div data-testid="custom-loading">Loading…</div>,
    });
    render(<View />);
    expect(screen.getByTestId("custom-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("month-skeleton")).not.toBeInTheDocument();
  });

  // ── not loading → no skeleton ────────────────────────
  it("does not show skeleton when isLoading is false", () => {
    mockCalendar(ECalendarViewType.month, { isLoading: false, events: [] });
    render(<View />);
    expect(screen.getByTestId("month-view")).toBeInTheDocument();
    expect(screen.queryByTestId("month-skeleton")).not.toBeInTheDocument();
  });
});
