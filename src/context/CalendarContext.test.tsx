import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { expect, describe, it, vi } from "vitest";
import { CalendarProvider, useCalendar } from "./CalendarContext";
import { ECalendarViewType } from "../types";
import { dateFn } from "../utils";
import { CALENDAR_ACTIONS } from "../constants";

const TestComponent = () => {
  const { state, dispatch } = useCalendar();
  return (
    <div>
      <span data-testid="view">{state.view}</span>
      <span data-testid="date">
        {state.selectedDate.toFormat("yyyy-MM-dd")}
      </span>
      <button
        onClick={() => dispatch({ type: CALENDAR_ACTIONS.NEXT })}
        data-testid="next"
      >
        Next
      </button>
      <button
        onClick={() => dispatch({ type: CALENDAR_ACTIONS.PREV })}
        data-testid="prev"
      >
        Prev
      </button>
      <button
        onClick={() => dispatch({ type: CALENDAR_ACTIONS.TODAY })}
        data-testid="today"
      >
        Today
      </button>
      <button
        onClick={() =>
          dispatch({
            type: CALENDAR_ACTIONS.SET_VIEW,
            payload: ECalendarViewType.week,
          })
        }
        data-testid="set-week"
      >
        Set Week
      </button>
      <button
        onClick={() =>
          dispatch({
            type: CALENDAR_ACTIONS.SET_DATE,
            payload: dateFn("2024-12-25"),
          })
        }
        data-testid="set-date"
      >
        Set Date
      </button>
    </div>
  );
};

describe("CalendarContext", () => {
  const initialDate = dateFn("2024-01-01");

  it("provides initial state correctly", () => {
    render(
      <CalendarProvider
        initialDate={initialDate}
        initialView={ECalendarViewType.month}
      >
        <TestComponent />
      </CalendarProvider>,
    );

    expect(screen.getByTestId("view").textContent).toBe(
      ECalendarViewType.month,
    );
    expect(screen.getByTestId("date").textContent).toBe("2024-01-01");
  });

  it("handles NEXT and PREV actions for month view", () => {
    render(
      <CalendarProvider
        initialDate={initialDate}
        initialView={ECalendarViewType.month}
      >
        <TestComponent />
      </CalendarProvider>,
    );

    fireEvent.click(screen.getByTestId("next"));
    expect(screen.getByTestId("date").textContent).toBe("2024-02-01");
    fireEvent.click(screen.getByTestId("prev"));
    expect(screen.getByTestId("date").textContent).toBe("2024-01-01");
  });

  it("handles NEXT and PREV actions for schedule view (treats as day)", () => {
    render(
      <CalendarProvider
        initialDate={initialDate}
        initialView={ECalendarViewType.schedule}
      >
        <TestComponent />
      </CalendarProvider>,
    );

    fireEvent.click(screen.getByTestId("next"));
    expect(screen.getByTestId("date").textContent).toBe("2024-01-02");
    fireEvent.click(screen.getByTestId("prev"));
    expect(screen.getByTestId("date").textContent).toBe("2024-01-01");
  });

  it("handles NEXT and PREV actions for customDays view", () => {
    render(
      <CalendarProvider
        initialDate={initialDate}
        initialView={ECalendarViewType.customDays}
        initialCustomDays={5}
      >
        <TestComponent />
      </CalendarProvider>,
    );

    fireEvent.click(screen.getByTestId("next"));
    expect(screen.getByTestId("date").textContent).toBe("2024-01-06");
    fireEvent.click(screen.getByTestId("prev"));
    expect(screen.getByTestId("date").textContent).toBe("2024-01-01");
  });

  it("handles NEXT and PREV actions for customDays view with default fallback (3 days)", () => {
    render(
      <CalendarProvider
        initialDate={initialDate}
        initialView={ECalendarViewType.customDays}
      >
        <TestComponent />
      </CalendarProvider>,
    );

    fireEvent.click(screen.getByTestId("next"));
    expect(screen.getByTestId("date").textContent).toBe("2024-01-04");
  });

  it("handles SET_VIEW and SET_DATE and TODAY actions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-05-15T12:00:00Z"));

    render(
      <CalendarProvider
        initialDate={initialDate}
        initialView={ECalendarViewType.month}
      >
        <TestComponent />
      </CalendarProvider>,
    );

    fireEvent.click(screen.getByTestId("set-week"));
    expect(screen.getByTestId("view").textContent).toBe(ECalendarViewType.week);

    fireEvent.click(screen.getByTestId("set-date"));
    expect(screen.getByTestId("date").textContent).toBe("2024-12-25");

    fireEvent.click(screen.getByTestId("today"));
    // Since TODAY uses dateFn() and we mocked the system time
    expect(screen.getByTestId("date").textContent).toBe("2024-05-15");

    vi.useRealTimers();
  });

  it("throws error when useCalendar is used outside of provider", () => {
    // Suppress console.error in test output
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      "useCalendar must be used within a CalendarProvider",
    );
    consoleSpy.mockRestore();
  });
});
