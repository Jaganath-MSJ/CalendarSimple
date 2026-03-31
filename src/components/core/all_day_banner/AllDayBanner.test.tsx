import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AllDayBanner from "./AllDayBanner";
import * as hooks from "../../../hooks/useAllDayBanner";
import { dateFn } from "../../../utils";

vi.mock("../../../hooks/useAllDayBanner", () => ({
  default: vi.fn(),
}));

describe("AllDayBanner Component", () => {
  const mockUseAllDayBanner = hooks.default as ReturnType<typeof vi.fn>;
  const days = [dateFn("2024-03-01"), dateFn("2024-03-02")];

  beforeEach(() => {
    mockUseAllDayBanner.mockReturnValue({
      layoutEvents: [],
      effectiveMaxRows: 0,
      hiddenCounts: [],
      visibleLayoutEvents: [],
      containerHeight: "30px",
      showExpandCollapse: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultProps = {
    days,
    events: [],
    eventProps: {},
    is12Hour: false,
    classNames: {},
  };

  it("renders empty state without failing", () => {
    render(<AllDayBanner {...defaultProps} />);
    // Just the container background should render
    expect(screen.getByText(/GMT|UTC/)).toBeInTheDocument();
  });

  it("renders banner events directly", () => {
    mockUseAllDayBanner.mockReturnValue({
      layoutEvents: [{ event: { id: "1", title: "All Day" } }],
      effectiveMaxRows: 1,
      hiddenCounts: [0, 0],
      visibleLayoutEvents: [
        {
          event: { id: "1", title: "All Day", startDate: "2024-03-01" },
          row: 0,
          startIndex: 0,
          endIndex: 1,
        },
      ],
      containerHeight: "30px",
      showExpandCollapse: true,
    });

    render(<AllDayBanner {...defaultProps} />);
    expect(screen.getByText("All Day")).toBeInTheDocument();
  });

  it("triggers expand/collapse icon click and displays +X more when maxEvents is reached", () => {
    mockUseAllDayBanner.mockReturnValue({
      layoutEvents: [
        { event: { id: "1", title: "All Day 1" } },
        { event: { id: "2", title: "All Day 2" } },
      ],
      effectiveMaxRows: 1,
      hiddenCounts: [1, 0], // Simulates 1 hidden event in the first day column
      visibleLayoutEvents: [
        {
          event: { id: "1", title: "All Day 1", startDate: "2024-03-01" },
          row: 0,
          startIndex: 0,
          endIndex: 1,
        },
      ],
      containerHeight: "30px",
      showExpandCollapse: true,
    });

    render(<AllDayBanner {...defaultProps} />);

    // Renders the visible event
    expect(screen.getByText("All Day 1")).toBeInTheDocument();

    // Renders the overflow '+1 more' indicator instead of 'All Day 2'
    const moreChip = screen.getByText("+ 1 more");
    expect(moreChip).toBeInTheDocument();

    fireEvent.click(moreChip);
  });
});
