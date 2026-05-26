import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ScheduleView from "./ScheduleView";
import { dateFn } from "../../../utils";
import * as CalendarContextModule from "../../../context/CalendarContext";
import { CalendarEvent } from "../../../types";

describe("ScheduleView Component", () => {
  const mockDate = dateFn("2024-03-01T12:00:00Z");

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
    // Mock getBoundingClientRect for any potential coordinate lookups
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 500,
      height: 500,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    vi.spyOn(CalendarContextModule, "useCalendar").mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "schedule",
      },
      config: defaultConfig,
      dispatch: vi.fn(),
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultProps = {
    is12Hour: false,
    theme: {},
    eventProps: {},
    classNames: {},
    autoScrollToCurrentTime: false,
    dayType: "half" as const,
  };

  it("renders empty state when no events exist", () => {
    render(<ScheduleView {...defaultProps} />);
    expect(screen.getByText("No events to display")).toBeInTheDocument();
  });

  it("renders grouped events and dates correctly", () => {
    const events = [
      {
        id: "1",
        title: "Morning Event",
        startDate: "2024-03-01T09:00:00",
        endDate: "2024-03-01T10:00:00",
      },
      {
        id: "2",
        title: "Afternoon Event",
        startDate: "2024-03-01T14:00:00",
        endDate: "2024-03-01T15:00:00",
      },
      {
        id: "3",
        title: "Next Day Event",
        startDate: "2024-03-02T10:00:00",
        endDate: "2024-03-02T11:00:00",
      },
    ];

    vi.mocked(CalendarContextModule.useCalendar).mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "schedule",
      },
      config: { ...defaultConfig, events },
      dispatch: vi.fn(),
    } as never);
    render(<ScheduleView {...defaultProps} />);

    // Check if the date groupings are rendered (1st date)
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText(/MAR, FRI/)).toBeInTheDocument(); // Expecting "MAR, FRI" styling

    // Check if titles are rendered
    expect(screen.getByText("Morning Event")).toBeInTheDocument();
    expect(screen.getByText("Afternoon Event")).toBeInTheDocument();
    expect(screen.getByText("Next Day Event")).toBeInTheDocument();
  });

  it("fires onEventClick when clicking an event track", () => {
    const events = [
      {
        id: "1",
        title: "Clickable Event",
        startDate: "2024-03-01T09:00:00",
        endDate: "2024-03-01T10:00:00",
      },
    ];
    const mockOnEventClick = vi.fn();

    vi.mocked(CalendarContextModule.useCalendar).mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "schedule",
      },
      config: { ...defaultConfig, events },
      dispatch: vi.fn(),
    } as never);

    render(<ScheduleView {...defaultProps} onEventClick={mockOnEventClick} />);

    const eventItem = screen.getByText("Clickable Event");
    fireEvent.click(eventItem);

    expect(mockOnEventClick).toHaveBeenCalledWith(events[0]);
  });

  it("supports custom renderEvent", () => {
    const events = [
      {
        id: "1",
        title: "Test Event",
        startDate: "2024-03-01T09:00:00",
        endDate: "2024-03-01T10:00:00",
      },
    ];
    const customRenderEvent = (event: CalendarEvent) => (
      <div data-testid="custom-schedule-event">{event.title}</div>
    );

    vi.mocked(CalendarContextModule.useCalendar).mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "schedule",
      },
      config: { ...defaultConfig, events },
      dispatch: vi.fn(),
    } as never);

    render(<ScheduleView {...defaultProps} renderEvent={customRenderEvent} />);

    expect(screen.getByTestId("custom-schedule-event")).toBeInTheDocument();
    expect(screen.getByText("Test Event")).toBeInTheDocument();
  });

  it("supports custom schedule separator", () => {
    const events = [
      {
        id: "1",
        title: "Today",
        startDate: "2024-03-01T09:00:00",
        endDate: "2024-03-01T10:00:00",
      },
      {
        id: "2",
        title: "Tomorrow",
        startDate: "2024-03-02T09:00:00",
        endDate: "2024-03-02T10:00:00",
      },
    ];

    const renderScheduleSeparator = (date: Date) => (
      <hr data-testid={`sep-${date.getDate()}`} />
    );

    vi.mocked(CalendarContextModule.useCalendar).mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "schedule",
      },
      config: { ...defaultConfig, events },
      dispatch: vi.fn(),
    } as never);

    render(
      <ScheduleView
        {...defaultProps}
        renderScheduleSeparator={renderScheduleSeparator}
      />,
    );

    // Should render separator after the first date group, but not after the last
    expect(screen.getByTestId("sep-1")).toBeInTheDocument();
    expect(screen.queryByTestId("sep-2")).not.toBeInTheDocument();
  });
});
