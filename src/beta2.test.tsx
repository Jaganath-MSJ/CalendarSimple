// Fixes after testing 2.2.0-beta.1 (2026-11-26).
/// <reference types="node" />
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Calendar from "./Calendar";
import { formatMonth, formatMonthYear } from "./utils/formatting";
import { DTS_EXCLUDE } from "../scripts/build-options.mjs";

const march11 = "2026-03-11";

describe("month and year titles use the locale's own pattern", () => {
  it("formats long month + year", () => {
    expect(formatMonthYear(march11, "es")).toBe("marzo de 2026");
    expect(formatMonthYear(march11, "en")).toBe("March 2026");
    expect(formatMonthYear(march11, "de-DE")).toBe("März 2026");
    expect(formatMonthYear(march11, "ja-JP")).toBe("2026年3月");
    expect(formatMonthYear(march11, "ko")).toBe("2026년 3월");
    expect(formatMonthYear(march11, "zh-CN")).toBe("2026年3月");
  });

  it("formats short month (+ year)", () => {
    expect(formatMonthYear(march11, "en", "short")).toBe("Mar 2026");
    expect(formatMonth(march11, "en")).toBe("Mar");
    expect(formatMonth(march11, "ja-JP")).toBe("3月");
  });

  it("shows 2026年3月 in the Japanese month header", () => {
    render(
      <Calendar
        width={800}
        height={600}
        selectedDate={new Date(2026, 2, 11)}
        locale="ja-JP"
      />,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "2026年3月",
    );
  });

  it("keeps the English header unchanged", () => {
    render(
      <Calendar
        width={800}
        height={600}
        selectedDate={new Date(2026, 2, 11)}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "March 2026",
    );
  });

  it("labels a Japanese week range with month names", () => {
    render(
      <Calendar
        width={800}
        height={600}
        view="week"
        selectedDate={new Date(2026, 2, 31)}
        locale="ja-JP"
      />,
    );
    // Japanese order: the year sits with the second month.
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "3月 - 2026年4月",
    );
  });

  it("keeps the English week range unchanged", () => {
    render(
      <Calendar
        width={800}
        height={600}
        view="week"
        selectedDate={new Date(2026, 2, 31)}
      />,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "Mar - Apr 2026",
    );
  });
});

describe("package contents", () => {
  it("leaves stories and test setup out of the type declarations", () => {
    for (const pattern of [
      "src/stories/**",
      "src/setupTests.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
    ]) {
      expect(DTS_EXCLUDE).toContain(pattern);
    }
  });
});
