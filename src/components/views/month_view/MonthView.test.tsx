import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import MonthView from "./MonthView";
import { dateFn } from "../../../utils";
import * as CalendarContextModule from "../../../context/CalendarContext";
import { CalendarEvent, RenderDateCellProps } from "../../../types";

describe("MonthView Component", () => {
  const mockDate = dateFn("2024-03-01T12:00:00Z");

  const defaultConfig = {
    events: [],
    width: 800,
    height: 600,
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
        view: "month",
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
    showWeekNumbers: false,
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
    vi.mocked(CalendarContextModule.useCalendar).mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "month",
      },
      config: { ...defaultConfig, events },
      dispatch: vi.fn(),
    } as never);
    render(<MonthView {...defaultProps} />);

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

    vi.mocked(CalendarContextModule.useCalendar).mockReturnValue({
      state: {
        selectedDate: mockDate,
        view: "month",
      },
      config: { ...defaultConfig, events },
      dispatch: vi.fn(),
    } as never);

    render(
      <MonthView
        {...defaultProps}
        renderEvent={customRenderEvent}
        renderDateCell={customRenderDateCell}
      />,
    );

    expect(screen.getAllByTestId("custom-date").length).toBeGreaterThan(28);
    expect(screen.getByTestId("custom-event")).toBeInTheDocument();
  });

  it("renders week number column when showWeekNumbers is true", () => {
    const { container } = render(
      <MonthView {...defaultProps} showWeekNumbers={true} />,
    );
    // With showWeekNumbers, thead has 8 <th> cells: 1 week-number + 7 day headers
    const headerCells = container.querySelectorAll("thead th");
    expect(headerCells.length).toBe(8);
    // Each tbody row also gets an extra <td> with the ISO week number
    const firstBodyRow = container.querySelector("tbody tr");
    const bodyCells = firstBodyRow?.querySelectorAll("td");
    expect(bodyCells?.length).toBe(8); // 1 week-number + 7 day cells
  });

  it("does not render week number column when showWeekNumbers is false", () => {
    const { container } = render(
      <MonthView {...defaultProps} showWeekNumbers={false} />,
    );
    const headerCells = container.querySelectorAll("thead th");
    expect(headerCells.length).toBe(7); // just 7 day headers
    const firstBodyRow = container.querySelector("tbody tr");
    const bodyCells = firstBodyRow?.querySelectorAll("td");
    expect(bodyCells?.length).toBe(7);
  });

  it("applies classNames.weekNumber to week number header and body cells", () => {
    const { container } = render(
      <MonthView
        {...defaultProps}
        showWeekNumbers={true}
        classNames={{ weekNumber: "custom-wk" }}
      />,
    );
    const customCells = container.querySelectorAll(".custom-wk");
    // At least 1 <th> + at least 1 <td> body cell should carry the class
    expect(customCells.length).toBeGreaterThanOrEqual(2);
  });

  it("fires onSlotClick with start/end of day when creatable=true and a date cell is clicked", () => {
    const onSlotClick = vi.fn();
    render(<MonthView {...defaultProps} creatable onSlotClick={onSlotClick} />);

    const midMonthDays = screen.getAllByText("15");
    fireEvent.click(midMonthDays[0]);

    expect(onSlotClick).toHaveBeenCalledTimes(1);
    const [startDate, endDate] = onSlotClick.mock.calls[0] as [Date, Date];
    expect(startDate.getHours()).toBe(0);
    expect(startDate.getMinutes()).toBe(0);
    expect(endDate.getHours()).toBe(23);
    expect(endDate.getMinutes()).toBe(59);
  });

  it("fires onDateClick independently when selectable=true even when creatable=true", () => {
    const onDateClick = vi.fn();
    const onSlotClick = vi.fn();
    render(
      <MonthView
        {...defaultProps}
        selectable
        onDateClick={onDateClick}
        creatable
        onSlotClick={onSlotClick}
      />,
    );

    const midMonthDays = screen.getAllByText("15");
    fireEvent.click(midMonthDays[0]);

    expect(onSlotClick).toHaveBeenCalledTimes(1);
    expect(onDateClick).toHaveBeenCalledTimes(1);
  });
});
