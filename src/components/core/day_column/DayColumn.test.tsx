import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DayColumn from "./DayColumn";
import { dateFn } from "../../../utils";
import { ECalendarViewType } from "../../../types";
import { CalendarProvider } from "../../../context/CalendarContext";

describe("DayColumn Component", () => {
  const dayEvents = [
    {
      top: 100,
      height: 60,
      left: 0,
      width: 100,
      zIndex: 1,
      event: {
        id: "1",
        title: "Test Event",
        startDate: "2024-03-01T10:00:00",
        endDate: "2024-03-01T11:00:00",
      },
    },
  ];

  const defaultProps = {
    dayEvents,
    date: dateFn("2024-03-01T00:00:00"),
    is12Hour: false,
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
    showCurrentTime: false,
    minHour: 0,
    maxHour: 24,
    creatable: false,
  };

  it("renders correctly with given events and hours", () => {
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayColumn {...defaultProps} minHour={8} maxHour={12} />
      </CalendarProvider>,
    );
    expect(screen.getByText("Test Event")).toBeInTheDocument();
  });

  it("uses custom renderHourCell if provided", () => {
    const customRenderHour = (date: Date) => (
      <span data-testid="custom-hour">{date.getHours()}</span>
    );
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayColumn
          {...defaultProps}
          dayEvents={[]}
          minHour={8}
          maxHour={10}
          renderHourCell={customRenderHour}
        />
      </CalendarProvider>,
    );

    // Should render two hours: 8 and 9
    expect(screen.getAllByTestId("custom-hour")).toHaveLength(2);
  });

  it("fires onSlotClick with correct start and end dates when creatable=true and a slot is clicked", () => {
    const onSlotClick = vi.fn();
    const date = dateFn("2024-03-01T00:00:00");
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayColumn
          {...defaultProps}
          dayEvents={[]}
          date={date}
          minHour={8}
          maxHour={10}
          creatable
          onSlotClick={onSlotClick}
        />
      </CalendarProvider>,
    );

    // Two slots rendered (hours 8 and 9). Click the first one (hour 8).
    const slots = document.querySelectorAll("[class*='eventSlot']");
    fireEvent.click(slots[0]);

    expect(onSlotClick).toHaveBeenCalledTimes(1);
    const [startDate, endDate] = onSlotClick.mock.calls[0] as [Date, Date];
    expect(startDate.getHours()).toBe(8);
    expect(startDate.getMinutes()).toBe(0);
    expect(endDate.getHours()).toBe(9);
    expect(endDate.getMinutes()).toBe(0);
  });

  it("does not fire onSlotClick when creatable is false (default)", () => {
    const onSlotClick = vi.fn();
    const date = dateFn("2024-03-01T00:00:00");
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayColumn
          {...defaultProps}
          dayEvents={[]}
          date={date}
          minHour={8}
          maxHour={10}
          creatable={false}
          onSlotClick={onSlotClick}
        />
      </CalendarProvider>,
    );

    const slots = document.querySelectorAll("[class*='eventSlot']");
    fireEvent.click(slots[0]);

    expect(onSlotClick).not.toHaveBeenCalled();
  });
});
