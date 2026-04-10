import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Popover from "./Popover";
import { dateFn } from "../../../utils";
import { CalendarEvent, ECalendarViewType } from "../../../types";
import { CalendarProvider } from "../../../context/CalendarContext";

describe("Popover Component", () => {
  const mockAnchorEl = document.createElement("div");
  // Set dimensions for anchorEl to aid layout effect testing
  Object.defineProperty(mockAnchorEl, "getBoundingClientRect", {
    value: () => ({
      top: 100,
      bottom: 120,
      left: 100,
      right: 150,
      width: 50,
      height: 20,
    }),
  });

  const mockOnClose = vi.fn();
  const mockOnEventClick = vi.fn();
  const dateObj = dateFn("2024-03-01");

  const events = [
    { id: "1", title: "Event 1", startDate: "2024-03-01" },
    { id: "2", title: "Event 2", startDate: "2024-03-01" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders correctly with given events", () => {
    render(
      <CalendarProvider
        initialDate={dateObj}
        initialView={ECalendarViewType.month}
      >
        <Popover
          dateObj={dateObj}
          events={events as never}
          onClose={mockOnClose}
          anchorEl={mockAnchorEl}
          onEventClick={mockOnEventClick}
          is12Hour={false}
        />
      </CalendarProvider>,
    );

    // Check if event titles are rendered
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 2")).toBeInTheDocument();
  });

  it("renders content into document.body via createPortal (Issue 5)", () => {
    const { baseElement } = render(
      <CalendarProvider
        initialDate={dateObj}
        initialView={ECalendarViewType.month}
      >
        <Popover
          dateObj={dateObj}
          events={events as never}
          onClose={mockOnClose}
          anchorEl={mockAnchorEl}
          onEventClick={mockOnEventClick}
          is12Hour={false}
        />
      </CalendarProvider>,
    );

    // The component wrapper (the parent div of Popover rendered by Testing Library)
    // shouldn't contain the rendered text directly. It should be appended to document.body

    // Test baseElement which typically maps to document.body in React Testing Library
    expect(baseElement).toHaveTextContent("Event 1");
    // Explicitly check that a Popover div is a direct descendant somewhere under body
    const popoverContent = screen.getByTestId(/popover-content/);
    expect(popoverContent.parentElement).toBe(document.body);
  });

  it("calls onEventClick and onClose when an event is clicked", () => {
    render(
      <CalendarProvider
        initialDate={dateObj}
        initialView={ECalendarViewType.month}
      >
        <Popover
          dateObj={dateObj}
          events={events as never}
          onClose={mockOnClose}
          anchorEl={mockAnchorEl}
          onEventClick={mockOnEventClick}
          is12Hour={false}
        />
      </CalendarProvider>,
    );

    const event1 = screen.getByText("Event 1");
    // Popover content requires stopping propagation usually handled by root wrapper
    fireEvent.click(event1);

    expect(mockOnEventClick).toHaveBeenCalledWith(events[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking outside", () => {
    render(
      <CalendarProvider
        initialDate={dateObj}
        initialView={ECalendarViewType.month}
      >
        <Popover
          dateObj={dateObj}
          events={events as never}
          onClose={mockOnClose}
          anchorEl={mockAnchorEl}
          onEventClick={mockOnEventClick}
          is12Hour={false}
        />
      </CalendarProvider>,
    );

    // Trigger mousedown on document body to simulate clicking outside
    fireEvent.mouseDown(document.body);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("supports custom renderEvent", () => {
    const customRender = (event: CalendarEvent) => (
      <span data-testid="custom-render">Custom: {event.title}</span>
    );
    render(
      <CalendarProvider
        initialDate={dateObj}
        initialView={ECalendarViewType.month}
      >
        <Popover
          dateObj={dateObj}
          events={events as never}
          onClose={mockOnClose}
          anchorEl={mockAnchorEl}
          onEventClick={mockOnEventClick}
          renderEvent={customRender}
          is12Hour={false}
        />
      </CalendarProvider>,
    );

    expect(screen.getAllByTestId("custom-render")).toHaveLength(2);
    expect(screen.getByText("Custom: Event 1")).toBeInTheDocument();
  });
});
