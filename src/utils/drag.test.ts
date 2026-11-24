import { afterEach, describe, expect, it } from "vitest";
import { DateTime, Settings } from "luxon";
import {
  canDrag,
  clampWallClock,
  cellsMoved,
  getAxisBounds,
  moveWallClock,
  resizeWallClock,
  stepsMoved,
} from "./drag";

afterEach(() => {
  Settings.defaultZone = "system";
});

describe("getAxisBounds", () => {
  it("lets a cell move to every other cell of the row", () => {
    expect(getAxisBounds(0, 7, 50)).toEqual({ min: -0, max: 300 });
    expect(getAxisBounds(3, 7, 50)).toEqual({ min: -150, max: 150 });
    expect(getAxisBounds(6, 7, 50)).toEqual({ min: -300, max: 0 });
  });

  it("mirrors when the row is reversed on screen", () => {
    expect(getAxisBounds(0, 7, 50, true)).toEqual({ min: -300, max: 0 });
    expect(getAxisBounds(6, 7, 50, true)).toEqual({ min: -0, max: 300 });
  });
});

describe("cellsMoved / stepsMoved", () => {
  it("rounds to whole cells, in logical order", () => {
    expect(cellsMoved(74, 50)).toBe(1);
    expect(cellsMoved(76, 50)).toBe(2);
    expect(cellsMoved(-50, 50)).toBe(-1);
    expect(cellsMoved(100, 50, true)).toBe(-2);
    expect(cellsMoved(10, 0)).toBe(0);
    expect(cellsMoved(-10, 50)).toBe(0);
  });

  it("rounds to whole steps", () => {
    expect(stepsMoved(15, 15)).toBe(1);
    expect(stepsMoved(-44, 15)).toBe(-3);
    expect(stepsMoved(30, 0)).toBe(0);
  });
});

describe("moveWallClock", () => {
  const start = DateTime.fromISO("2026-10-22T09:00:00");
  const end = DateTime.fromISO("2026-10-22T10:30:00");

  it("moves both ends by days and minutes", () => {
    const r = moveWallClock(start, end, 1, 45);
    expect(r.start.toISO()).toContain("2026-10-23T09:45");
    expect(r.end.toISO()).toContain("2026-10-23T11:15");
  });

  it("ends at the start when there is no end", () => {
    const r = moveWallClock(start, undefined, -2, 0);
    expect(r.end.toMillis()).toBe(r.start.toMillis());
    expect(r.start.toISODate()).toBe("2026-10-20");
  });

  it("keeps wall-clock times on a DST day", () => {
    Settings.defaultZone = "America/New_York";
    const s = DateTime.fromISO("2026-03-08T00:30:00");
    const e = DateTime.fromISO("2026-03-08T01:30:00");
    const r = moveWallClock(s, e, 0, 600);
    expect(r.start.toFormat("yyyy-MM-dd HH:mm")).toBe("2026-03-08 10:30");
    expect(r.end.toFormat("HH:mm")).toBe("11:30");
  });
});

describe("resizeWallClock", () => {
  const start = DateTime.fromISO("2026-10-22T09:00:00");
  const end = DateTime.fromISO("2026-10-22T10:00:00");
  const hm = (d: DateTime) => d.toFormat("HH:mm");

  it("moves the bottom edge", () => {
    const r = resizeWallClock(start, end, "bottom", 30, 15);
    expect([hm(r.start), hm(r.end)]).toEqual(["09:00", "10:30"]);
  });

  it("moves the top edge", () => {
    const r = resizeWallClock(start, end, "top", -45, 15);
    expect([hm(r.start), hm(r.end)]).toEqual(["08:15", "10:00"]);
  });

  it("keeps the minimum length", () => {
    expect(hm(resizeWallClock(start, end, "bottom", -120, 15).end)).toBe(
      "09:15",
    );
    expect(hm(resizeWallClock(start, end, "top", 120, 30).start)).toBe("09:30");
  });

  it("grows an event without an end from its start", () => {
    // Drawn as start + minimum (15 min), so +45 ends at 10:00.
    const r = resizeWallClock(start, undefined, "bottom", 45, 15);
    expect([hm(r.start), hm(r.end)]).toEqual(["09:00", "10:00"]);
  });
});

describe("canDrag", () => {
  const ev = { id: "a", editable: false };
  const cb = () => {};

  it("needs both the flag and the callback", () => {
    expect(canDrag(true, ev, cb)).toBe(true);
    expect(canDrag(true, ev, undefined)).toBe(false);
    expect(canDrag(false, ev, cb)).toBe(false);
    expect(canDrag(undefined, ev, cb)).toBe(false);
  });

  it("asks a predicate per event", () => {
    expect(canDrag((e: typeof ev) => e.editable, ev, cb)).toBe(false);
    expect(canDrag((e: typeof ev) => !e.editable, ev, cb)).toBe(true);
  });
});

describe("clampWallClock", () => {
  const dt = (iso: string) => DateTime.fromISO(iso);
  const fmt = (r: { start: DateTime; end: DateTime }) => [
    r.start.toFormat("yyyy-MM-dd HH:mm"),
    r.end.toFormat("yyyy-MM-dd HH:mm"),
  ];

  it("keeps an event inside the hours unchanged", () => {
    expect(
      fmt(
        clampWallClock(dt("2026-11-10T09:00"), dt("2026-11-10T10:00"), 0, 24),
      ),
    ).toEqual(["2026-11-10 09:00", "2026-11-10 10:00"]);
  });

  it("pushes an end past maxHour back, keeping the length", () => {
    expect(
      fmt(
        clampWallClock(dt("2026-11-10T17:30"), dt("2026-11-10T18:30"), 8, 18),
      ),
    ).toEqual(["2026-11-10 17:00", "2026-11-10 18:00"]);
  });

  it("pushes a start before minHour forward, keeping the length", () => {
    expect(
      fmt(
        clampWallClock(dt("2026-11-10T07:30"), dt("2026-11-10T08:30"), 8, 18),
      ),
    ).toEqual(["2026-11-10 08:00", "2026-11-10 09:00"]);
  });

  it("allows an end at midnight when maxHour is 24", () => {
    expect(
      fmt(
        clampWallClock(dt("2026-11-10T23:00"), dt("2026-11-11T00:00"), 0, 24),
      ),
    ).toEqual(["2026-11-10 23:00", "2026-11-11 00:00"]);
  });
});

describe("resizeWallClock without a real length", () => {
  const dt = (iso: string) => DateTime.fromISO(iso);
  const hmOf = (r: { start: DateTime; end: DateTime }) => [
    r.start.toFormat("HH:mm"),
    r.end.toFormat("HH:mm"),
  ];

  it("treats a missing end as start + minimum before moving the top", () => {
    expect(
      hmOf(resizeWallClock(dt("2026-11-10T10:00"), undefined, "top", 30, 15)),
    ).toEqual(["10:00", "10:15"]);
  });

  it("does not move the top the wrong way on a short event", () => {
    expect(
      hmOf(
        resizeWallClock(
          dt("2026-11-10T10:00"),
          dt("2026-11-10T10:05"),
          "top",
          30,
          15,
        ),
      ),
    ).toEqual(["10:00", "10:05"]);
  });
});
