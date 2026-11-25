import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import Calendar from "../Calendar";

const ymd = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

function setup(log: string[] = []) {
  const spy = vi.fn((s: Date, e: Date, v: string) => {
    log.push("range");
    return [s, e, v];
  });
  render(
    <Calendar
      width={700}
      height={600}
      selectedDate={new Date(2026, 10, 10)}
      onDateRangeChange={spy}
      onNavigate={() => log.push("navigate")}
    />,
  );
  return spy;
}
const flush = () => act(() => void vi.advanceTimersByTime(16));

describe("onDateRangeChange", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("fires on mount with the month range", () => {
    const spy = setup();
    expect(spy).not.toHaveBeenCalled();
    flush();
    expect(spy).toHaveBeenCalledTimes(1);
    const [s, e, v] = spy.mock.calls[0];
    expect([ymd(s), ymd(e), v]).toEqual(["2026-11-1", "2026-12-5", "month"]);
  });

  it("debounces rapid navigation into one call", () => {
    const spy = setup();
    flush();
    spy.mockClear();
    const next = screen.getByLabelText("Next period");
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);
    flush();
    expect(spy).toHaveBeenCalledTimes(1);
    const [s, e] = spy.mock.calls[0];
    expect([ymd(s), ymd(e)]).toEqual(["2027-1-31", "2027-3-6"]);
  });

  it("fires on view change", () => {
    const spy = setup();
    flush();
    spy.mockClear();
    fireEvent.change(screen.getByLabelText("Select calendar view"), {
      target: { value: "week" },
    });
    flush();
    expect(spy).toHaveBeenCalledTimes(1);
    const [s, e, v] = spy.mock.calls[0];
    expect([ymd(s), ymd(e), v]).toEqual(["2026-11-8", "2026-11-14", "week"]);
  });

  it("calls onNavigate before onDateRangeChange", () => {
    const log: string[] = [];
    setup(log);
    flush();
    log.length = 0;
    fireEvent.click(screen.getByLabelText("Next period"));
    flush();
    expect(log).toEqual(["navigate", "range"]);
  });
});
