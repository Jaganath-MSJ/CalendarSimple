import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { expect, describe, it, vi } from "vitest";
import { dateFn } from "./utils";
import { ECalendarViewType } from "./types";
import Calendar from "./Calendar";

// Mock ResizeObserver as it's not available in jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

describe("Calendar Component Integration", () => {
  it("renders the Calendar without crashing", () => {
    const { container } = render(<Calendar />);
    expect(container).toBeInTheDocument();
    expect(container.firstChild).not.toBeNull();
  });

  it("handles DisabledSelectable interactions correctly", () => {
    const onDateClick = vi.fn();
    const onEventClick = vi.fn();

    // Day view has a large clickable grid
    const { container } = render(
      <Calendar
        view={ECalendarViewType.day}
        selectable={false}
        onDateClick={onDateClick}
        onEventClick={onEventClick}
        events={[
          { id: "1", title: "Test Event", startDate: new Date().toISOString() },
        ]}
      />,
    );

    // We expect the click events to be swallowed or not attached
    const gridCells = container.querySelectorAll(".hourCell");
    if (gridCells.length > 0) {
      fireEvent.click(gridCells[0]);
    }

    const eventItem = container.querySelector(".eventBlock");
    if (eventItem) {
      fireEvent.click(eventItem);
    }

    expect(onDateClick).not.toHaveBeenCalled();
    expect(onEventClick).not.toHaveBeenCalled();
  });

  it("responds to ControlledState updates", () => {
    const start = dateFn("2024-03-01");
    const { rerender } = render(
      <Calendar selectedDate={start.toDate()} view={ECalendarViewType.month} />,
    );

    expect(screen.getByText("March 2024")).toBeInTheDocument();

    const newDate = dateFn("2025-06-15");
    rerender(
      <Calendar
        selectedDate={newDate.toDate()}
        view={ECalendarViewType.month}
      />,
    );

    expect(screen.getByText("June 2025")).toBeInTheDocument();
  });

  it("applies classNames and theme styling correctly", () => {
    const { container } = render(
      <Calendar
        classNames={{
          root: "custom-root-class",
          header: "custom-header-class",
        }}
        theme={{ default: { bgColor: "red", color: "white" } }}
      />,
    );

    // The calendar root is rendered as a section element inside the wrapper div
    const calendarSection = container.querySelector(".custom-root-class");
    expect(calendarSection).toBeInTheDocument();

    const header = container.querySelector(".custom-header-class");
    expect(header).toBeInTheDocument();
  });

  it("handles onViewChange callbacks", () => {
    const onViewChange = vi.fn();
    render(
      <Calendar
        view={ECalendarViewType.month}
        onViewChange={onViewChange}
        resetDateOnViewChange={true}
      />,
    );

    const viewSelect = screen.getByDisplayValue("Month");
    fireEvent.change(viewSelect, { target: { value: ECalendarViewType.week } });

    expect(onViewChange).toHaveBeenCalledWith(ECalendarViewType.week);
  });
});
