import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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

  it("selected cell carries the selected class and no inline background by default", () => {
    render(
      <CalendarProvider
        initialDate={dateObj}
        initialView={ECalendarViewType.month}
        testId="calendar"
      >
        <table>
          <tbody>
            <tr>
              <MonthEventItem {...defaultProps} isSelected />
            </tr>
          </tbody>
        </table>
      </CalendarProvider>,
    );
    const cell = screen.getByTestId("calendar-1-month-cell");
    expect(cell.className).toMatch(/selected/);
    expect(cell.style.backgroundColor).toBe("");
  });

  it("theme.selected.bgColor still wins over the outlined default", () => {
    render(
      <CalendarProvider
        initialDate={dateObj}
        initialView={ECalendarViewType.month}
        testId="calendar"
      >
        <table>
          <tbody>
            <tr>
              <MonthEventItem
                {...defaultProps}
                isSelected
                theme={{ selected: { bgColor: "#ff0000" } }}
              />
            </tr>
          </tbody>
        </table>
      </CalendarProvider>,
    );
    expect(
      screen.getByTestId("calendar-1-month-cell").style.backgroundColor,
    ).toBe("rgb(255, 0, 0)");
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

  it("formats event tooltips in the calendar locale", () => {
    const data = [
      { id: "1", title: "E1", startDate: "2024-03-01", endDate: "2024-03-01" },
    ];
    render(
      <CalendarProvider
        initialDate={dateObj}
        initialView={ECalendarViewType.month}
        config={{ locale: "ar-EG" }}
      >
        <table>
          <tbody>
            <tr>
              <MonthEventItem
                {...defaultProps}
                data={data as never}
                maxEvents={2}
                totalEvents={1}
              />
            </tr>
          </tbody>
        </table>
      </CalendarProvider>,
    );
    // ar-EG formats digits as Arabic-Indic numerals
    expect(
      screen.getByTitle("E1 (٢٠٢٤-٠٣-٠١ - ٢٠٢٤-٠٣-٠١)"),
    ).toBeInTheDocument();
  });

  describe("isTodayAdjacent", () => {
    const renderCell = (showAdjacentMonths: boolean) =>
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
                  isCurrentMonth={false}
                  isTodayAdjacent
                  showAdjacentMonths={showAdjacentMonths}
                />
              </tr>
            </tbody>
          </table>
        </CalendarProvider>,
      );

    it("marks the date label when adjacent months are shown", () => {
      renderCell(true);
      expect(screen.getByText("1").className).toMatch(/todayAdjacent/);
    });

    it("renders no mark when adjacent months are hidden", () => {
      renderCell(false);
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });

    it("passes isTodayAdjacent to renderDateCell", () => {
      const renderDateCell = vi.fn(() => <span>x</span>);
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
                  isCurrentMonth={false}
                  isTodayAdjacent
                  showAdjacentMonths
                  renderDateCell={renderDateCell}
                />
              </tr>
            </tbody>
          </table>
        </CalendarProvider>,
      );
      expect(renderDateCell).toHaveBeenCalledWith(
        expect.objectContaining({ isTodayAdjacent: true }),
      );
    });
  });
});
