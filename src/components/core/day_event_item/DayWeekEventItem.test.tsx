import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DayWeekEventItem } from "./DayWeekEventItem";
import { CalendarEvent, ECalendarViewType } from "../../../types";
import { dateFn } from "../../../utils";
import { CalendarProvider } from "../../../context/CalendarContext";

describe("DayWeekEventItem Component", () => {
  const mockItem = {
    top: 50,
    height: 100,
    left: 10,
    width: 80,
    zIndex: 2,
    event: {
      id: "evt-1",
      title: "Meeting",
      startDate: "2024-03-01T10:00:00",
      endDate: "2024-03-01T11:00:00",
      style: { backgroundColor: "blue" },
    },
  };

  const defaultProps = {
    item: mockItem,
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
  };

  it("renders the event item with correct styles and title", () => {
    const { container } = render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayWeekEventItem {...defaultProps} is12Hour />
      </CalendarProvider>,
    );
    const eventEl = container.firstChild as HTMLElement;

    expect(eventEl).toHaveStyle("top: 50px");
    expect(eventEl).toHaveStyle("height: 100px");
    expect(eventEl).toHaveStyle("background-color: rgb(0, 0, 255)");
    expect(screen.getByText("Meeting")).toBeInTheDocument();
  });

  it("fires onEventClick", () => {
    const mockClick = vi.fn();
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayWeekEventItem {...defaultProps} is12Hour onEventClick={mockClick} />
      </CalendarProvider>,
    );

    fireEvent.click(screen.getByText("Meeting"));
    expect(mockClick).toHaveBeenCalledWith(mockItem.event);
  });

  it("supports custom renderEvent", () => {
    const customRender = (evt: CalendarEvent) => (
      <div data-testid="custom-event">{evt.title} Custom</div>
    );
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayWeekEventItem {...defaultProps} renderEvent={customRender} />
      </CalendarProvider>,
    );

    expect(screen.getByTestId("custom-event")).toBeInTheDocument();
    expect(screen.getByText("Meeting Custom")).toBeInTheDocument();
  });
});
