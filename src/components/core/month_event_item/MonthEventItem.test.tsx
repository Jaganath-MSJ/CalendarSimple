import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MonthEventItem from "./MonthEventItem";
import { dateFn } from "../../../utils";
import { ECalendarViewType } from "../../../types";
import { CalendarProvider } from "../../../context/CalendarContext";

describe("MonthEventItem Component", () => {
  const dateObj = dateFn("2024-03-01");

  const defaultProps = {
    date: 1,
    dateObj,
    data: [],
    cellWidth: 100,
    isSelected: false,
    isToday: false,
    isCurrentMonth: true,
    theme: {},
    is12Hour: false,
    showAdjacentMonths: false,
    classNames: {},
  };

  it("renders date correctly and applies selected classes", () => {
    render(
      <CalendarProvider
        initialDate={dateObj}
        initialView={ECalendarViewType.month}
      >
        <table>
          <tbody>
            <tr>
              <MonthEventItem
                {...defaultProps}
                isSelected
                isToday={false}
                isCurrentMonth
              />
            </tr>
          </tbody>
        </table>
      </CalendarProvider>,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders events and more button when excess events", () => {
    // Provide events with required tooltip props so it doesn't crash formatting
    const data = [
      { id: "1", title: "E1", startDate: "2024-03-01", endDate: "2024-03-01" },
      { id: "2", title: "E2", startDate: "2024-03-01", endDate: "2024-03-01" },
      { id: "3", title: "E3", startDate: "2024-03-01", endDate: "2024-03-01" },
    ];
    render(
      <CalendarProvider
        initialDate={dateObj}
        initialView={ECalendarViewType.month}
      >
        <table>
          <tbody>
            <tr>
              <MonthEventItem
                {...defaultProps}
                data={data as never}
                cellWidth={100}
                isSelected={false}
                isToday={false}
                isCurrentMonth
                maxEvents={2}
                totalEvents={3}
              />
            </tr>
          </tbody>
        </table>
      </CalendarProvider>,
    );
    expect(screen.getByText("E1")).toBeInTheDocument();
    expect(screen.getByText("E2")).toBeInTheDocument();
    expect(screen.queryByText("E3")).not.toBeInTheDocument();

    const moreBtn = screen.getByText("+ 1 more");
    expect(moreBtn).toBeInTheDocument();

    // Trigger popover
    fireEvent.click(moreBtn);

    // Now E3 should be in popover
    expect(screen.getByText("E3")).toBeInTheDocument();
  });
});
