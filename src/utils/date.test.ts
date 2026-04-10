import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import {
  addDays,
  subDays,
  dateFn,
  checkIsToday,
  convertToDate,
  getDayOfWeek,
} from "./date";

describe("date utils", () => {
  describe("dateFn parsing (Issue 4)", () => {
    it("should parse JS Date objects without Invalid DateTime errors", () => {
      const jsDate = new Date("2024-01-01T12:00:00Z");
      const result = dateFn(jsDate);
      expect(result.isValid).toBe(true);
      expect(result.toFormat("yyyy-MM-dd")).toBe("2024-01-01");
    });

    it("should parse ISO strings without Invalid DateTime errors", () => {
      const result = dateFn("2024-01-01T15:30:00Z");
      expect(result.isValid).toBe(true);
    });

    it("should return the same object when passed a Luxon DateTime", () => {
      const dt = DateTime.now();
      const result = dateFn(dt);
      expect(result).toBe(dt);
    });
  });

  describe("Duration Utilities (Issues 1 & 9)", () => {
    it("should add days correctly using plural units", () => {
      const start = dateFn("2024-01-01");
      const result = addDays(start, 5);
      expect(result.toFormat("yyyy-MM-dd")).toBe("2024-01-06");
    });

    it("should subtract days correctly using plural units", () => {
      const start = dateFn("2024-01-10");
      const result = subDays(start, 5);
      expect(result.toFormat("yyyy-MM-dd")).toBe("2024-01-05");
    });
  });

  describe("Native Conversion (Issue 8)", () => {
    it("should convert to a native JS Date correctly via convertToDate/toJSDate", () => {
      const dt = dateFn("2024-05-10T10:00:00Z");
      const jsDate = convertToDate(dt);
      expect(jsDate).toBeInstanceOf(Date);
      expect(jsDate.getTime()).toBe(dt.toMillis());
    });
  });

  describe("Index Mapping (Issue 13)", () => {
    it("should map getDayOfWeek from Luxon (1-7) to Day.js (0-6) standards", () => {
      // 2024-01-01 is a Monday
      expect(getDayOfWeek(dateFn("2024-01-01"))).toBe(1); // Monday
      // 2024-01-06 is a Saturday
      expect(getDayOfWeek(dateFn("2024-01-06"))).toBe(6); // Saturday
      // 2024-01-07 is a Sunday
      expect(getDayOfWeek(dateFn("2024-01-07"))).toBe(0); // Sunday (mapped from 7 to 0)
    });
  });

  describe("Today Utility", () => {
    it("should check if date is today correctly", () => {
      const today = dateFn();
      const result = checkIsToday(today, today.day);
      expect(result).toBe(true);

      const pastDate = dateFn().minus({ months: 1 });
      const resultFalse = checkIsToday(pastDate, pastDate.day);
      expect(resultFalse).toBe(false);
    });
  });
});
