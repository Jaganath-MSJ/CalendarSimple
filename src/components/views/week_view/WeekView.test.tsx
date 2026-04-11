import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import WeekView from "./WeekView";
import { dateFn } from "../../../utils";
import * as CalendarContextModule from "../../../context/CalendarContext";

// Provide a mock ResizeObserver since child components might need it
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe("WeekView Component", () => {
  const mockDate = dateFn("2024-03-01T12:00:00Z"); // March 1, 2024 (Friday)

  beforeEach(() => {
    vi.spyOn(CalendarContextModule, "useCalendar").mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "week",
      },
      dispatch: vi.fn(),
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultProps = {
    events: [],
    dayType: "half" as const,
    is12Hour: false,
    theme: {},
    eventProps: {},
    showCurrentTime: true,
    maxEvents: 3,
    autoScrollToCurrentTime: false,
    minHour: 0,
    maxHour: 24,
    showAllDayRow: true,
    eventOverlapOffset: 0,
    weekStartsOn: 0, // Sunday
    weekEndsOn: 6, // Saturday
    enableEnrichedEvents: false,
    eventsAreSorted: false,
    isEventOrderingEnabled: false,
    classNames: {},
    locale: "en",
    localeMessages: {
      today: "Today",
      day: "Day",
      week: "Week",
      month: "Month",
      schedule: "Schedule",
      days: "Days",
    },
  };

  it("renders the week headers correctly", () => {
    render(<WeekView {...defaultProps} />);

    // Feb 25, 2024 is the Sunday of that week
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();

    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("uses custom renderDateCell if provided", () => {
    const customRender = () => (
      <div data-testid="custom-date">Custom Date Result</div>
    );
    render(<WeekView {...defaultProps} renderDateCell={customRender} />);

    expect(screen.getAllByTestId("custom-date")).toHaveLength(7); // 7 days in a week
    expect(screen.getAllByText("Custom Date Result")).toHaveLength(7);
  });

  it("passes events and renders them in the layout", () => {
    const events = [
      {
        id: "1",
        title: "Test Week Event",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-01T11:00:00",
      },
    ];
    render(<WeekView {...defaultProps} events={events as never} />);

    expect(screen.getByText("Test Week Event")).toBeInTheDocument();
  });
});
