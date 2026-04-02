import React from "react";
import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CurrentTimeLine from "./CurrentTimeLine";
import { dateFn } from "../../../utils";
import { ECalendarViewType } from "../../../types";
import { CalendarProvider } from "../../../context/CalendarContext";

describe("CurrentTimeLine Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders correctly within bounds", () => {
    vi.setSystemTime(new Date(2024, 2, 1, 12, 30)); // 12:30 PM
    const { container } = render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.day}
      >
        <CurrentTimeLine minHour={0} maxHour={24} />
      </CalendarProvider>,
    );

    // Position should be (12 - 0) * 60 + 30 = 750px
    const lineElement = container.firstChild as HTMLElement;
    expect(lineElement).toBeInTheDocument();
    expect(lineElement.style.top).toBe("750px");
  });

  it("does not render when time is outside of bounds", () => {
    vi.setSystemTime(new Date(2024, 2, 1, 23, 30)); // 23:30 PM
    const { container } = render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.day}
      >
        <CurrentTimeLine minHour={0} maxHour={22} />
      </CalendarProvider>,
    );

    // Should return null (container has no children)
    expect(container.firstChild).toBeNull();
  });

  it("updates position over time", () => {
    vi.setSystemTime(new Date(2024, 2, 1, 12, 30));

    const { container } = render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.day}
      >
        <CurrentTimeLine minHour={0} maxHour={24} />
      </CalendarProvider>,
    );

    const lineElement = container.firstChild as HTMLElement;
    expect(lineElement.style.top).toBe("750px");

    // Fast forward React's setInterval
    act(() => {
      vi.advanceTimersByTime(60000); // 1 minute
    });

    expect(lineElement.style.top).toBe("751px");
  });

  it("resets vertical position seamlessly precisely at midnight across days", () => {
    vi.setSystemTime(new Date(2024, 2, 1, 23, 59)); // 11:59 PM
    const { container } = render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.day}
      >
        <CurrentTimeLine minHour={0} maxHour={24} />
      </CalendarProvider>,
    );

    // Position should be (23 - 0) * 60 + 59 = 1439px
    let lineElement = container.firstChild as HTMLElement;
    expect(lineElement.style.top).toBe("1439px");

    // Fast forward 1 minute to exactly midnight (new day start)
    // advancetimersByTime automatically updates the fake system time
    act(() => {
      vi.advanceTimersByTime(60000); // Trigger setInterval
    });

    // Position should cycle back up to (0 - 0) * 60 + 0 = 0px
    lineElement = container.firstChild as HTMLElement;
    expect(lineElement.style.top).toBe("0px");
  });
});
