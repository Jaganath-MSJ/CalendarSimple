// Ported from calendar-simple-native (src/core/state/keyboard.test.ts).
import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import {
  getMonthKeyTarget,
  getPeriodKeyAction,
  isVisibleWeekday,
  type MonthKeyOptions,
} from "./keyboard";

// Thursday 22 Oct 2026.
const day = DateTime.fromISO("2026-10-22");
const today = DateTime.fromISO("2026-11-16T09:30:00");
const opts: MonthKeyOptions = {
  weekStartsOn: 0,
  weekEndsOn: 6,
  flip: false,
  today,
};
const go = (key: string, o: Partial<MonthKeyOptions> = {}, shiftKey = false) =>
  getMonthKeyTarget({ key, shiftKey }, day, { ...opts, ...o })?.toISODate();

describe("getMonthKeyTarget", () => {
  it.each([
    ["ArrowLeft", "2026-10-21"],
    ["ArrowRight", "2026-10-23"],
    ["ArrowUp", "2026-10-15"],
    ["ArrowDown", "2026-10-29"],
    ["Home", "2026-10-18"],
    ["End", "2026-10-24"],
    ["PageUp", "2026-09-22"],
    ["PageDown", "2026-11-22"],
    ["t", "2026-11-16"],
    ["T", "2026-11-16"],
  ])("%s moves to %s", (key, expected) => expect(go(key)).toBe(expected));

  it("Shift+PageUp / PageDown move a year", () => {
    expect(go("PageUp", {}, true)).toBe("2025-10-22");
    expect(go("PageDown", {}, true)).toBe("2027-10-22");
  });

  it("swaps ← and → when mirrored", () => {
    expect(go("ArrowLeft", { flip: true })).toBe("2026-10-23");
    expect(go("ArrowRight", { flip: true })).toBe("2026-10-21");
  });

  it("follows weekStartsOn for Home and End", () => {
    expect(go("Home", { weekStartsOn: 1, weekEndsOn: 0 })).toBe("2026-10-19");
    expect(go("End", { weekStartsOn: 1, weekEndsOn: 0 })).toBe("2026-10-25");
    expect(go("Home", { weekStartsOn: 6, weekEndsOn: 5 })).toBe("2026-10-17");
  });

  it("skips hidden weekdays in a work week", () => {
    const fri = DateTime.fromISO("2026-10-23");
    const mon = DateTime.fromISO("2026-10-26");
    const work = { ...opts, weekStartsOn: 1, weekEndsOn: 5 } as const;
    expect(
      getMonthKeyTarget({ key: "ArrowRight" }, fri, work)?.toISODate(),
    ).toBe("2026-10-26");
    expect(
      getMonthKeyTarget({ key: "ArrowLeft" }, mon, work)?.toISODate(),
    ).toBe("2026-10-23");
    expect(go("End", { weekStartsOn: 1, weekEndsOn: 5 })).toBe("2026-10-23");
  });

  it("clamps PageDown to the end of a shorter month", () => {
    const jan31 = DateTime.fromISO("2026-01-31");
    expect(
      getMonthKeyTarget({ key: "PageDown" }, jan31, opts)?.toISODate(),
    ).toBe("2026-02-28");
  });

  it("ignores other keys and browser shortcuts", () => {
    expect(go("a")).toBeUndefined();
    expect(go("Enter")).toBeUndefined();
    expect(
      getMonthKeyTarget({ key: "ArrowLeft", metaKey: true }, day, opts),
    ).toBeNull();
    expect(
      getMonthKeyTarget({ key: "t", ctrlKey: true }, day, opts),
    ).toBeNull();
  });
});

describe("isVisibleWeekday", () => {
  it("covers the wrapped range", () => {
    const sat = DateTime.fromISO("2026-10-24");
    expect(isVisibleWeekday(sat, 1, 5)).toBe(false);
    expect(isVisibleWeekday(sat, 6, 1)).toBe(true);
  });
});

describe("getPeriodKeyAction", () => {
  const grid = { flip: false, arrows: true };
  it("maps period keys", () => {
    expect(getPeriodKeyAction({ key: "PageUp" }, grid)).toBe(-1);
    expect(getPeriodKeyAction({ key: "PageDown" }, grid)).toBe(1);
    expect(getPeriodKeyAction({ key: "ArrowLeft" }, grid)).toBe(-1);
    expect(getPeriodKeyAction({ key: "ArrowRight" }, grid)).toBe(1);
    expect(getPeriodKeyAction({ key: "T" }, grid)).toBe("today");
  });

  it("swaps arrows when mirrored and skips them in Schedule", () => {
    expect(
      getPeriodKeyAction({ key: "ArrowLeft" }, { flip: true, arrows: true }),
    ).toBe(1);
    expect(
      getPeriodKeyAction({ key: "ArrowLeft" }, { flip: false, arrows: false }),
    ).toBeNull();
  });

  it("ignores modifiers and other keys", () => {
    expect(
      getPeriodKeyAction({ key: "PageUp", shiftKey: true }, grid),
    ).toBeNull();
    expect(
      getPeriodKeyAction({ key: "ArrowLeft", altKey: true }, grid),
    ).toBeNull();
    expect(getPeriodKeyAction({ key: "ArrowUp" }, grid)).toBeNull();
  });
});
