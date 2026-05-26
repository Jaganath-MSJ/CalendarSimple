import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ScheduleSkeleton from "./ScheduleSkeleton";

describe("ScheduleSkeleton", () => {
  it("renders with data-testid schedule-skeleton", () => {
    render(<ScheduleSkeleton />);
    expect(screen.getByTestId("schedule-skeleton")).toBeInTheDocument();
  });

  it("renders exactly 4 skeleton rows", () => {
    render(<ScheduleSkeleton />);
    expect(screen.getAllByTestId("schedule-skeleton-row")).toHaveLength(4);
  });

  it("each row has a circle and two lines", () => {
    render(<ScheduleSkeleton />);
    expect(screen.getAllByTestId("skeleton-circle")).toHaveLength(4);
    expect(screen.getAllByTestId("skeleton-line")).toHaveLength(8); // 2 per row × 4 rows
  });
});
