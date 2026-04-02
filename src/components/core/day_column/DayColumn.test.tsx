import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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
    is12Hour: false,
    classNames: {},
    showCurrentTime: false,
    minHour: 0,
    maxHour: 24,
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
});
