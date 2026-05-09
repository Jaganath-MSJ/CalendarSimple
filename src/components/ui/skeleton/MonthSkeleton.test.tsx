import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MonthSkeleton from "./MonthSkeleton";

describe("MonthSkeleton", () => {
  it("renders with data-testid month-skeleton", () => {
    render(<MonthSkeleton />);
    expect(screen.getByTestId("month-skeleton")).toBeInTheDocument();
  });

  it("renders a table with 7 header columns", () => {
    const { container } = render(<MonthSkeleton />);
    const headerCols = container.querySelectorAll("thead th");
    expect(headerCols).toHaveLength(7);
  });

  it("renders 5 body rows", () => {
    const { container } = render(<MonthSkeleton />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(5);
  });

  it("renders 7 cells per body row", () => {
    const { container } = render(<MonthSkeleton />);
    const rows = container.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      expect(row.querySelectorAll("td")).toHaveLength(7);
    });
  });
});
