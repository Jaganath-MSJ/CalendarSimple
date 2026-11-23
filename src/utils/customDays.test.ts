import { describe, expect, it } from "vitest";
import {
  clampCustomDays,
  CUSTOM_DAYS_MAX,
  CUSTOM_DAYS_MIN,
} from "./customDays";

describe("clampCustomDays", () => {
  it("keeps 1–7", () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7]) expect(clampCustomDays(n)).toBe(n);
    expect([CUSTOM_DAYS_MIN, CUSTOM_DAYS_MAX]).toEqual([1, 7]);
  });
  it("clamps below 1 to 1 and above 7 to 7", () => {
    expect(clampCustomDays(0)).toBe(1);
    expect(clampCustomDays(-4)).toBe(1);
    expect(clampCustomDays(8)).toBe(7);
    expect(clampCustomDays(30)).toBe(7);
  });
  it("rounds fractions", () => {
    expect(clampCustomDays(2.6)).toBe(3);
    expect(clampCustomDays(2.4)).toBe(2);
  });
  it("falls back to 3 for missing or non-numbers", () => {
    expect(clampCustomDays(undefined)).toBe(3);
    expect(clampCustomDays(Number.NaN)).toBe(3);
    expect(clampCustomDays(Infinity)).toBe(3);
    expect(clampCustomDays("5" as unknown as number)).toBe(3);
  });
});
