import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import MonthView from "./MonthView";
import { dateFn } from "../../../utils";
import * as CalendarContextModule from "../../../context/CalendarContext";
import { CalendarEvent, RenderDateCellProps } from "../../../types";

describe("MonthView Component", () => {
  const mockDate = dateFn("2024-03-01T12:00:00Z");

  beforeEach(() => {
    vi.spyOn(CalendarContextModule, "useCalendar").mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "month",
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
    width: 800,
    height: 600,
    weekStartsOn: 0,
    weekEndsOn: 6,
    is12Hour: false,
    selectable: true,
    theme: {},
    eventProps: {},
    classNames: {},
    showAdjacentMonths: true,
    enableEnrichedEvents: false,
    eventsAreSorted: false,
    isEventOrderingEnabled: false,
    autoScrollToCurrentTime: false,
    sortedMonthView: false,
  };

  it("renders month grid headers correctly", () => {
    render(<MonthView {...defaultProps} />);

    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
  });

  it("renders MonthEventItems and allows clicking a date", () => {
    const mockOnDateClick = vi.fn();
    render(<MonthView {...defaultProps} onDateClick={mockOnDateClick} />);

    // There can be multiple days with "15" rendered adjacent months config, but we just check presence
    const midMonthDays = screen.getAllByText("15");
    expect(midMonthDays.length).toBeGreaterThan(0);

    // Click the actual month's day (second one or first if no prev month)
    fireEvent.click(midMonthDays[0]);
    expect(mockOnDateClick).toHaveBeenCalled();
  });

  it("renders events", () => {
    const events = [
      {
        id: "1",
        title: "Test Event",
        startDate: "2024-03-15",
        endDate: "2024-03-15",
      },
    ];
    render(<MonthView {...defaultProps} events={events as never} />);

    expect(screen.getByText("Test Event")).toBeInTheDocument();
  });

  it("uses custom renderEvent and renderDateCell", () => {
    const customRenderEvent = (event: CalendarEvent) => (
      <div data-testid="custom-event">{event.title}</div>
    );
    const customRenderDateCell = (props: RenderDateCellProps) => (
      <div data-testid="custom-date">{props.date.getDate()}</div>
    );

    const events = [
      {
        id: "1",
        title: "Test Event",
        startDate: "2024-03-15",
        endDate: "2024-03-15",
      },
    ];

    render(
      <MonthView
        {...defaultProps}
        events={events as never}
        renderEvent={customRenderEvent}
        renderDateCell={customRenderDateCell}
      />,
    );

    expect(screen.getAllByTestId("custom-date").length).toBeGreaterThan(28);
    expect(screen.getByTestId("custom-event")).toBeInTheDocument();
  });
});
