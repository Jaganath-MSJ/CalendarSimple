import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import DayView from "./DayView";
import { dateFn } from "../../../utils";
import * as CalendarContextModule from "../../../context/CalendarContext";

// Provide a mock ResizeObserver since child components might need it
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe("DayView Component", () => {
  const mockDate = dateFn("2024-03-01T12:00:00Z"); // March 1, 2024 is a Friday

  const defaultConfig = {
    events: [],
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

  beforeEach(() => {
    vi.spyOn(CalendarContextModule, "useCalendar").mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "day",
      },
      config: defaultConfig,
      dispatch: vi.fn(),
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultProps = {
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
    enableEnrichedEvents: false,
    eventsAreSorted: false,
    isEventOrderingEnabled: false,
    classNames: {},
  };

  it("renders the day header correctly", () => {
    render(<DayView {...defaultProps} />);

    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("uses custom renderDateCell if provided", () => {
    const customRender = () => (
      <div data-testid="custom-date">Custom Date Result</div>
    );
    render(<DayView {...defaultProps} renderDateCell={customRender} />);

    expect(screen.getByTestId("custom-date")).toBeInTheDocument();
    expect(screen.getByText("Custom Date Result")).toBeInTheDocument();
  });

  it("passes events and renders them in the layout", () => {
    const events = [
      {
        id: "1",
        title: "Test Event",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-01T11:00:00",
      },
    ];
    vi.mocked(CalendarContextModule.useCalendar).mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "day",
      },
      config: { ...defaultConfig, events },
      dispatch: vi.fn(),
    } as never);
    render(<DayView {...defaultProps} />);

    expect(screen.getByText("Test Event")).toBeInTheDocument();
  });
});
