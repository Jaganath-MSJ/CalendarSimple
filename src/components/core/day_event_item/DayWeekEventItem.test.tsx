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

  it("renders with role=button", () => {
    const mockItem = {
      event: {
        id: "evt1",
        title: "Daily Standup",
        startDate: "2024-03-15T10:00:00",
        endDate: "2024-03-15T10:30:00",
      },
      top: 100,
      height: 50,
      left: 0,
      width: 100,
      zIndex: 1,
    };
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayWeekEventItem {...defaultProps} item={mockItem} />
      </CalendarProvider>,
    );
    expect(
      screen.getByRole("button", { name: /Daily Standup/i }),
    ).toBeInTheDocument();
  });

  it("has tabIndex=0", () => {
    const mockItem = {
      event: {
        id: "evt1",
        title: "Daily Standup",
        startDate: "2024-03-15T10:00:00",
        endDate: "2024-03-15T10:30:00",
      },
      top: 100,
      height: 50,
      left: 0,
      width: 100,
      zIndex: 1,
    };
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayWeekEventItem {...defaultProps} item={mockItem} />
      </CalendarProvider>,
    );
    const btn = screen.getByRole("button", { name: /Daily Standup/i });
    expect(btn).toHaveAttribute("tabindex", "0");
  });

  it("calls onEventClick on Enter key", () => {
    const onEventClick = vi.fn();
    const mockItem = {
      event: {
        id: "evt1",
        title: "Daily Standup",
        startDate: "2024-03-15T10:00:00",
        endDate: "2024-03-15T10:30:00",
      },
      top: 100,
      height: 50,
      left: 0,
      width: 100,
      zIndex: 1,
    };
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayWeekEventItem
          {...defaultProps}
          item={mockItem}
          onEventClick={onEventClick}
        />
      </CalendarProvider>,
    );
    const btn = screen.getByRole("button", { name: /Daily Standup/i });
    fireEvent.keyDown(btn, { key: "Enter" });
    expect(onEventClick).toHaveBeenCalledTimes(1);
    expect(onEventClick).toHaveBeenCalledWith(mockItem.event);
  });

  it("calls onEventClick on Space key", () => {
    const onEventClick = vi.fn();
    const mockItem = {
      event: {
        id: "evt1",
        title: "Daily Standup",
        startDate: "2024-03-15T10:00:00",
        endDate: "2024-03-15T10:30:00",
      },
      top: 100,
      height: 50,
      left: 0,
      width: 100,
      zIndex: 1,
    };
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayWeekEventItem
          {...defaultProps}
          item={mockItem}
          onEventClick={onEventClick}
        />
      </CalendarProvider>,
    );
    const btn = screen.getByRole("button", { name: /Daily Standup/i });
    fireEvent.keyDown(btn, { key: " " });
    expect(onEventClick).toHaveBeenCalledTimes(1);
    expect(onEventClick).toHaveBeenCalledWith(mockItem.event);
  });

  it("does not call onEventClick on other keys (ArrowDown)", () => {
    const onEventClick = vi.fn();
    const mockItem = {
      event: {
        id: "evt1",
        title: "Daily Standup",
        startDate: "2024-03-15T10:00:00",
        endDate: "2024-03-15T10:30:00",
      },
      top: 100,
      height: 50,
      left: 0,
      width: 100,
      zIndex: 1,
    };
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <DayWeekEventItem
          {...defaultProps}
          item={mockItem}
          onEventClick={onEventClick}
        />
      </CalendarProvider>,
    );
    const btn = screen.getByRole("button", { name: /Daily Standup/i });
    fireEvent.keyDown(btn, { key: "ArrowDown" });
    expect(onEventClick).not.toHaveBeenCalled();
  });
});
