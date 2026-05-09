import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TimeGridSkeleton from "./TimeGridSkeleton";

describe("TimeGridSkeleton", () => {
  it("renders with data-testid time-grid-skeleton", () => {
    render(<TimeGridSkeleton />);
    expect(screen.getByTestId("time-grid-skeleton")).toBeInTheDocument();
  });

  it("renders 8 time slots in the time column", () => {
    render(<TimeGridSkeleton />);
    expect(screen.getAllByTestId("time-slot")).toHaveLength(8);
  });

  it("renders 3 shimmer event bars in the events area", () => {
    render(<TimeGridSkeleton />);
    expect(screen.getAllByTestId("event-bar")).toHaveLength(3);
  });
});
