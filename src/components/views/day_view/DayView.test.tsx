import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import DayView from "./DayView";
import { dateFn } from "../../../utils";
import * as CalendarContextModule from "../../../context/CalendarContext";
import { CalendarProvider } from "../../../context/CalendarContext";
import { ECalendarViewType } from "../../../types";

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

describe("DayView all-day row (real CalendarProvider)", () => {
  const events = [
    { id: "holiday", title: "Holiday", startDate: "2024-03-01" },
    {
      id: "standup",
      title: "Standup",
      startDate: "2024-03-01T09:00:00",
      endDate: "2024-03-01T09:30:00",
    },
  ];

  const renderDayView = (showAllDayRow: boolean) =>
    render(
      <CalendarProvider
        initialDate={dateFn("2024-03-01")}
        initialView={ECalendarViewType.day}
        testId="cal"
        config={{ events }}
      >
        <DayView
          minHour={0}
          maxHour={24}
          maxEvents={3}
          eventOverlapOffset={0}
          showAllDayRow={showAllDayRow}
        />
      </CalendarProvider>,
    );

  it("puts all-day events in the banner and keeps timed events in the grid", () => {
    renderDayView(true);
    expect(screen.getByTestId("cal-all-day-banner")).toBeInTheDocument();
    expect(screen.getByTestId("cal-holiday-all-day-event")).toBeInTheDocument();
    expect(
      screen.queryByTestId("cal-holiday-day-event-item"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("cal-standup-day-event-item"),
    ).toBeInTheDocument();
  });

  it("stretches all-day events over the full grid when showAllDayRow is false", () => {
    renderDayView(false);
    expect(screen.queryByTestId("cal-all-day-banner")).not.toBeInTheDocument();
    expect(screen.getByTestId("cal-holiday-day-event-item")).toHaveStyle({
      top: "0px",
      height: "1440px", // 24h × 60px
    });
  });
});
