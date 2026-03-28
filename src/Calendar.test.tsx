import React from "react";
import { render } from "@testing-library/react";
import { expect, describe, it } from "vitest";
import Calendar from "./Calendar";

// Mock ResizeObserver as it's not available in jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

describe("Calendar Component", () => {
  it("renders the Calendar without crashing", () => {
    // Basic test to ensure jsdom and react testing library are wired up
    const { container } = render(<Calendar />);

    // We check if the container has rendered something.
    expect(container).toBeInTheDocument();

    // Basic assertion that an implicit structural part of the calendar is there
    // If you have a specific test ID or role, we can assert that directly.
    expect(container.firstChild).not.toBeNull();
  });
});
