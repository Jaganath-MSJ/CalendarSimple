import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CustomDaysView from "./CustomDaysView";
import { dateFn } from "../../../utils";
import * as CalendarContextModule from "../../../context/CalendarContext";

// Provide a mock ResizeObserver since child components might need it
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe("CustomDaysView Component", () => {
  const mockDate = dateFn("2024-03-01T12:00:00Z"); // March 1, 2024 (Friday)

  beforeEach(() => {
    vi.spyOn(CalendarContextModule, "useCalendar").mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "customDays",
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
    showCurrentTime: true,
    maxEvents: 3,
    autoScrollToCurrentTime: false,
    minHour: 0,
    maxHour: 24,
    showAllDayRow: true,
    eventOverlapOffset: 0,
    customDays: 3,
    enableEnrichedEvents: false,
    eventsAreSorted: false,
    isEventOrderingEnabled: false,
  };

  it("renders the custom days headers correctly", () => {
    render(<CustomDaysView {...defaultProps} />);

    // Should render 3 days starting from March 1 (Friday, Saturday, Sunday)
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    expect(screen.getByText("Sat")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("uses custom renderDateCell if provided", () => {
    const customRender = () => <div data-testid="custom-date">Custom Date</div>;
    render(<CustomDaysView {...defaultProps} renderDateCell={customRender} />);

    expect(screen.getAllByTestId("custom-date")).toHaveLength(3);
  });

  it("passes events and renders them in the layout", () => {
    const events = [
      {
        id: "1",
        title: "Test Custom Day Event",
        startDate: "2024-03-02T10:00:00",
        endDate: "2024-03-02T11:00:00",
      },
    ];
    render(<CustomDaysView {...defaultProps} events={events as never} />);

    expect(screen.getByText("Test Custom Day Event")).toBeInTheDocument();
  });
});
