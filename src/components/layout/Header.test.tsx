import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Header from "./Header";
import { ECalendarViewType } from "../../types";
import { dateFn, DateType } from "../../utils";
import * as CalendarContextModule from "../../context/CalendarContext";

// Simple wrapper for testing to provide mock context if needed, but here we'll just spy on the hook.
describe("Header Component", () => {
  let mockDispatch: ReturnType<typeof vi.fn>;
  let mockState: {
    selectedDate: DateType;
    view: ECalendarViewType;
  };

  beforeEach(() => {
    mockDispatch = vi.fn();
    mockState = {
      selectedDate: dateFn("2024-03-01"),
      view: ECalendarViewType.month,
    };

    const defaultConfig = {
      events: [],
      locale: "en",
    };

    vi.spyOn(CalendarContextModule, "useCalendar").mockReturnValue({
      state: mockState,
      dispatch: mockDispatch as never,
      testId: undefined,
      config: defaultConfig,
      colorScheme: "light",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultProps = {
    pastYearLength: 10,
    futureYearLength: 10,
    resetDateOnViewChange: false,
    onNavigate: vi.fn(),
    onViewChange: vi.fn(),
    localeMessages: {},
  };

  it("renders correctly with current date and view", () => {
    render(<Header {...defaultProps} />);
    // Check Today button
    expect(screen.getByText("Today")).toBeInTheDocument();

    // Check Title
    expect(screen.getByText("March 2024")).toBeInTheDocument();

    // Check selects
    expect(screen.getByDisplayValue("Month")).toBeInTheDocument(); // The view dropdown
  });

  it("dispatches actions on arrow clicks", () => {
    render(<Header {...defaultProps} />);

    // There are two buttons with icons. The previous is index 1 (since Today is an actual button text).
    const buttons = screen.getAllByRole("button");
    const prevButton = buttons[1];
    const nextButton = buttons[2];

    fireEvent.click(prevButton);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "PREV" });

    fireEvent.click(nextButton);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "NEXT" });
  });

  it("dispatches TODAY action when Today button is clicked", () => {
    render(<Header {...defaultProps} />);

    const todayButton = screen.getByText("Today");
    fireEvent.click(todayButton);

    expect(mockDispatch).toHaveBeenCalledWith({ type: "TODAY" });
  });

  it("changes view when view dropdown is changed", () => {
    render(<Header {...defaultProps} />);

    const viewSelect = screen.getByDisplayValue("Month");
    fireEvent.change(viewSelect, { target: { value: ECalendarViewType.week } });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_VIEW",
      payload: ECalendarViewType.week,
    });
  });

  it("limits the year dropdown options based on pastYearLength and futureYearLength", () => {
    // Current state mock is 2024. With past 2 and future 2, expect 2022, 2023, 2024, 2025, 2026.
    render(
      <Header {...defaultProps} pastYearLength={2} futureYearLength={2} />,
    );

    // There are three selects in Header: 1. View, 2. Month, 3. Year
    const dropdowns = screen.getAllByRole("combobox");
    const yearDropdown = dropdowns[2]; // Index 2 is Year

    const options = Array.from(yearDropdown.querySelectorAll("option")).map(
      (opt) => opt.value,
    );

    const currentYear = new Date().getFullYear();
    const expected = [
      String(currentYear - 2),
      String(currentYear - 1),
      String(currentYear),
      String(currentYear + 1),
      String(currentYear + 2),
    ];

    expect(options).toEqual(expected);
    expect(options.length).toBe(5);
  });
});

describe("Header accessibility", () => {
  beforeEach(() => {
    vi.spyOn(CalendarContextModule, "useCalendar").mockReturnValue({
      state: {
        selectedDate: dateFn("2024-03-01"),
        view: ECalendarViewType.month,
      },
      dispatch: vi.fn() as never,
      testId: undefined,
      colorScheme: "light",
      config: {
        events: [],
        locale: "en",
        localeMessages: {
          today: "Today",
          day: "Day",
          week: "Week",
          month: "Month",
          schedule: "Schedule",
          days: "Days",
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultProps = {
    pastYearLength: 10,
    futureYearLength: 10,
    resetDateOnViewChange: false,
    localeMessages: {
      today: "Today",
      day: "Day",
      week: "Week",
      month: "Month",
      schedule: "Schedule",
      days: "Days",
    },
  };

  it("renders a navigation landmark with label 'Calendar navigation'", () => {
    render(<Header {...defaultProps} />);
    expect(
      screen.getByRole("navigation", { name: /calendar navigation/i }),
    ).toBeInTheDocument();
  });

  it("Today button has accessible label", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole("button", { name: /today/i })).toBeInTheDocument();
  });

  it("Previous button has aria-label 'Previous period'", () => {
    render(<Header {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /previous period/i }),
    ).toBeInTheDocument();
  });

  it("Next button has aria-label 'Next period'", () => {
    render(<Header {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /next period/i }),
    ).toBeInTheDocument();
  });

  it("View select has aria-label 'Select calendar view'", () => {
    render(<Header {...defaultProps} />);
    expect(
      screen.getByRole("combobox", { name: /select calendar view/i }),
    ).toBeInTheDocument();
  });

  it("Month select has aria-label 'Select month'", () => {
    render(<Header {...defaultProps} />);
    expect(
      screen.getByRole("combobox", { name: /select month/i }),
    ).toBeInTheDocument();
  });

  it("Year select has aria-label 'Select year'", () => {
    render(<Header {...defaultProps} />);
    expect(
      screen.getByRole("combobox", { name: /select year/i }),
    ).toBeInTheDocument();
  });
});
