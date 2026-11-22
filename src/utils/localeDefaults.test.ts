import { describe, it, expect } from "vitest";
import {
  resolveWeekStart,
  resolveIs12Hour,
  type IntlLike,
} from "./localeDefaults";

const withWeek = (firstDay: number): IntlLike => ({
  Locale: class {
    weekInfo = { firstDay };
    constructor(_: string) {}
  } as unknown as typeof Intl.Locale,
});
const noWeek: IntlLike = {
  Locale: class {
    region?: string;
    constructor(tag: string) {
      this.region = tag.split("-")[1];
    }
  } as unknown as typeof Intl.Locale,
};
const withCycle = (
  hourCycle?: string,
  parts = [{ type: "hour", value: "13" }],
): IntlLike => ({
  DateTimeFormat: class {
    resolvedOptions() {
      return { hourCycle };
    }
    formatToParts() {
      return parts;
    }
  } as unknown as typeof Intl.DateTimeFormat,
});

describe("resolveWeekStart", () => {
  it("passes numbers through", () =>
    expect(resolveWeekStart(3, "en-GB")).toBe(3));
  it("uses Intl week info (ISO 7 = Sunday)", () => {
    expect(resolveWeekStart("locale", "en-GB", withWeek(1))).toBe(1);
    expect(resolveWeekStart("locale", "en-US", withWeek(7))).toBe(0);
  });
  it("falls back to the CLDR table by region", () => {
    expect(resolveWeekStart("locale", "en-US", noWeek)).toBe(0);
    expect(resolveWeekStart("locale", "ar-EG", noWeek)).toBe(6);
    expect(resolveWeekStart("locale", "de-DE", noWeek)).toBe(1);
  });
  it("defaults to Sunday without a region", () =>
    expect(resolveWeekStart("locale", "en", noWeek)).toBe(0));
});

describe("resolveIs12Hour", () => {
  it("passes booleans through", () =>
    expect(resolveIs12Hour(true, "en-GB")).toBe(true));
  it("reads hourCycle", () => {
    expect(resolveIs12Hour("locale", "en-US", withCycle("h12"))).toBe(true);
    expect(resolveIs12Hour("locale", "en-GB", withCycle("h23"))).toBe(false);
  });
  it("probes 13:00 for a day period when hourCycle is missing", () => {
    expect(
      resolveIs12Hour(
        "locale",
        "en-US",
        withCycle(undefined, [
          { type: "hour", value: "1" },
          { type: "dayPeriod", value: "PM" },
        ]),
      ),
    ).toBe(true);
    expect(
      resolveIs12Hour(
        "locale",
        "de-DE",
        withCycle(undefined, [
          { type: "hour", value: "13" },
          { type: "literal", value: " Uhr" },
        ]),
      ),
    ).toBe(false);
  });
  it("returns false when Intl throws", () =>
    expect(
      resolveIs12Hour("locale", "en-US", {
        DateTimeFormat: class {
          constructor() {
            throw new Error("x");
          }
        } as unknown as typeof Intl.DateTimeFormat,
      }),
    ).toBe(false));
});
