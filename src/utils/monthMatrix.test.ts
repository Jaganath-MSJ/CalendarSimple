import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import { buildMonthMatrix } from "./monthMatrix";

const matrix = (year: number, month: number, ws: number) =>
  buildMonthMatrix(DateTime.fromObject({ year, month, day: 15 }), ws);

describe("buildMonthMatrix", () => {
  it("Feb 2026 (starts Sunday), week starts Sunday: exactly 4 rows", () => {
    expect(matrix(2026, 2, 0)).toEqual([
      [1, 2, 3, 4, 5, 6, 7],
      [8, 9, 10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19, 20, 21],
      [22, 23, 24, 25, 26, 27, 28],
    ]);
  });

  it("Nov 2026, week starts Monday: pads outside days with 0", () => {
    expect(matrix(2026, 11, 1)).toEqual([
      [0, 0, 0, 0, 0, 0, 1],
      [2, 3, 4, 5, 6, 7, 8],
      [9, 10, 11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20, 21, 22],
      [23, 24, 25, 26, 27, 28, 29],
      [30, 0, 0, 0, 0, 0, 0],
    ]);
  });

  it("Feb 2021 (starts Monday), week starts Sunday: 5 rows", () => {
    expect(matrix(2021, 2, 0)).toEqual([
      [0, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 0, 0, 0, 0, 0, 0],
    ]);
  });

  it("Aug 2026, week starts Saturday", () => {
    expect(matrix(2026, 8, 6)).toEqual([
      [1, 2, 3, 4, 5, 6, 7],
      [8, 9, 10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19, 20, 21],
      [22, 23, 24, 25, 26, 27, 28],
      [29, 30, 31, 0, 0, 0, 0],
    ]);
  });
});
