import { describe, it, expect } from "vitest";
import { addDays, dateFn, checkIsToday } from "./date";

describe("date utils", () => {
  it("should add days correctly", () => {
    const start = dateFn("2024-01-01");
    const result = addDays(start, 5);
    expect(result.format("YYYY-MM-DD")).toBe("2024-01-06");
  });

  it("should check if date is today correctly", () => {
    const today = dateFn();
    const result = checkIsToday(today, today.date());
    expect(result).toBe(true);

    const pastDate = dateFn().subtract(1, "month");
    const resultFalse = checkIsToday(pastDate, pastDate.date());
    expect(resultFalse).toBe(false);
  });
});
