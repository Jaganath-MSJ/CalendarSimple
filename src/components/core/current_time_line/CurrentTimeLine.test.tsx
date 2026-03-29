import React from "react";
import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CurrentTimeLine from "./CurrentTimeLine";

describe("CurrentTimeLine Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders correctly within bounds", () => {
    vi.setSystemTime(new Date(2024, 2, 1, 12, 30)); // 12:30 PM
    const { container } = render(<CurrentTimeLine minHour={0} maxHour={24} />);

    // Position should be (12 - 0) * 60 + 30 = 750px
    const lineElement = container.firstChild as HTMLElement;
    expect(lineElement).toBeInTheDocument();
    expect(lineElement.style.top).toBe("750px");
  });

  it("does not render when time is outside of bounds", () => {
    vi.setSystemTime(new Date(2024, 2, 1, 23, 30)); // 23:30 PM
    const { container } = render(<CurrentTimeLine minHour={0} maxHour={22} />);

    // Should return null (container has no children)
    expect(container.firstChild).toBeNull();
  });

  it("updates position over time", () => {
    vi.setSystemTime(new Date(2024, 2, 1, 12, 30));

    const { container } = render(<CurrentTimeLine minHour={0} maxHour={24} />);

    const lineElement = container.firstChild as HTMLElement;
    expect(lineElement.style.top).toBe("750px");

    // Fast forward React's setInterval
    act(() => {
      vi.advanceTimersByTime(60000); // 1 minute
    });

    expect(lineElement.style.top).toBe("751px");
  });
});
