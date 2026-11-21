import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { DateTime } from "luxon";
import useAutoScrollToNow, { getScrollTarget } from "./useAutoScrollToNow";

const at = (h: number, m = 0) =>
  DateTime.fromObject({ year: 2026, month: 11, day: 10, hour: h, minute: m });

describe("getScrollTarget", () => {
  it("subtracts minHour", () => {
    expect(getScrollTarget(at(9), 8, 24, 0)).toBe(60);
  });
  it("clamps before minHour to 0", () => {
    expect(getScrollTarget(at(7), 8, 24, 0)).toBe(0);
  });
  it("clamps after maxHour", () => {
    expect(getScrollTarget(at(23, 30), 0, 12, 0)).toBe(720);
  });
  it("centres in the viewport", () => {
    expect(getScrollTarget(at(12), 0, 24, 400)).toBe(520);
  });
});

describe("useAutoScrollToNow", () => {
  const original = Element.prototype.scrollTo;
  const scrollTo = vi.fn();
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 10, 9, 0, 0));
    scrollTo.mockClear();
    Element.prototype.scrollTo = scrollTo;
  });
  afterEach(() => {
    vi.useRealTimers();
    Element.prototype.scrollTo = original;
  });

  it("scrolls with minHour and re-runs when visible days change", () => {
    const ref = { current: document.createElement("div") };
    const nov10 = [DateTime.fromISO("2026-11-10")];
    const nov9 = [DateTime.fromISO("2026-11-09")];
    const { rerender } = renderHook(
      ({ days }) =>
        useAutoScrollToNow(ref, {
          enabled: true,
          days,
          minHour: 8,
          maxHour: 24,
        }),
      { initialProps: { days: nov10 } },
    );
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 60, behavior: "smooth" });
    rerender({ days: nov9 });
    expect(scrollTo).toHaveBeenCalledTimes(1);
    rerender({ days: [DateTime.fromISO("2026-11-10")] });
    expect(scrollTo).toHaveBeenCalledTimes(2);
  });
});
