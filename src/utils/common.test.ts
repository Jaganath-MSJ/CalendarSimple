import { describe, it, expect, vi } from "vitest";
import {
  calculateMaxEvents,
  isAllDayEvent,
  isMultiDay,
  handleKeyboardActivation,
  resolveDirection,
  toCssLength,
} from "./common";
import { LAYOUT_CONSTANTS } from "../constants";
import { CalendarEvent } from "../types";
import { KeyboardEvent } from "react";

describe("common utils", () => {
  describe("calculateMaxEvents", () => {
    it("should calculate correctly based on given height and rows", () => {
      // Let's mock a height where each row has plenty of space
      const height = 1200;
      const rowsInView = 6;
      const cellHeight = 1200 / 6; // 200
      // Math.round((200 - DATE_LABEL_HEIGHT - CELL_PADDING) / EVENT_HEIGHT) - 1
      const availableNodeHeight =
        cellHeight -
        LAYOUT_CONSTANTS.DATE_LABEL_HEIGHT -
        LAYOUT_CONSTANTS.CELL_PADDING;

      const expected =
        Math.round(availableNodeHeight / LAYOUT_CONSTANTS.EVENT_HEIGHT) - 1;

      const result = calculateMaxEvents(height, rowsInView);
      expect(result).toBe(Math.max(0, expected));
    });

    it("should not return a negative number for small heights", () => {
      expect(calculateMaxEvents(10, 6)).toBe(0);
    });
  });

  describe("toCssLength", () => {
    it("appends px to a numeric value", () => {
      expect(toCssLength(800)).toBe("800px");
      expect(toCssLength(0)).toBe("0px");
    });

    it("returns a string value verbatim without appending a unit", () => {
      expect(toCssLength("1280px")).toBe("1280px");
      expect(toCssLength("100%")).toBe("100%");
      expect(toCssLength("calc(600px - 122px)")).toBe("calc(600px - 122px)");
    });
  });

  describe("isAllDayEvent", () => {
    it("returns true when event has only date format", () => {
      expect(
        isAllDayEvent({ id: "1", title: "e", startDate: "2024-01-01" }),
      ).toBe(true);
      expect(
        isAllDayEvent({
          id: "1",
          title: "e",
          startDate: "2024-01-01",
          endDate: "2024-01-02",
        }),
      ).toBe(true);
    });

    it("returns false when event has time formats", () => {
      expect(
        isAllDayEvent({
          id: "1",
          title: "e",
          startDate: "2024-01-01T10:00:00",
        }),
      ).toBe(false);
      expect(
        isAllDayEvent({
          id: "1",
          title: "e",
          startDate: "2024-01-01 10:00:00",
        }),
      ).toBe(false);
      expect(
        isAllDayEvent({
          id: "1",
          title: "e",
          startDate: "2024-01-01",
          endDate: "2024-01-02T10:00:00",
        }),
      ).toBe(false);
    });

    // Regression: a non-string startDate/endDate must not crash isDateOnly
    // (dateStr.includes is not a function). Such values carry a concrete time,
    // so they are treated as timed events, not all-day.
    it("does not throw and returns false for non-string dates", () => {
      const dateObjEvent = {
        id: "1",
        title: "e",
        startDate: new Date("2024-01-01T10:00:00"),
        endDate: new Date("2024-01-01T11:00:00"),
      } as unknown as CalendarEvent;
      expect(() => isAllDayEvent(dateObjEvent)).not.toThrow();
      expect(isAllDayEvent(dateObjEvent)).toBe(false);

      const timestampEvent = {
        id: "2",
        title: "e",
        startDate: 1704103200000,
      } as unknown as CalendarEvent;
      expect(() => isAllDayEvent(timestampEvent)).not.toThrow();
      expect(isAllDayEvent(timestampEvent)).toBe(false);
    });
  });

  describe("handleKeyboardActivation", () => {
    const makeEvent = (key: string) =>
      ({
        key,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      }) as unknown as KeyboardEvent;

    it("calls handler and prevents default on Enter", () => {
      const handler = vi.fn();
      const e = makeEvent("Enter");
      handleKeyboardActivation(handler)(e);
      expect(handler).toHaveBeenCalledWith(e);
      expect(e.preventDefault).toHaveBeenCalled();
      expect(e.stopPropagation).toHaveBeenCalled();
    });

    it("calls handler and prevents default on Space", () => {
      const handler = vi.fn();
      const e = makeEvent(" ");
      handleKeyboardActivation(handler)(e);
      expect(handler).toHaveBeenCalledWith(e);
    });

    it("does not call handler for other keys", () => {
      const handler = vi.fn();
      const e = makeEvent("Tab");
      handleKeyboardActivation(handler)(e);
      expect(handler).not.toHaveBeenCalled();
      expect(e.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("resolveDirection", () => {
    it("returns explicit 'rtl' even when locale is LTR", () => {
      expect(resolveDirection("rtl", "en")).toBe("rtl");
    });

    it("returns explicit 'ltr' even when locale is RTL", () => {
      expect(resolveDirection("ltr", "ar")).toBe("ltr");
    });

    it("infers 'rtl' from Arabic locale", () => {
      expect(resolveDirection(undefined, "ar")).toBe("rtl");
    });

    it("infers 'rtl' from BCP-47 region tag (ar-SA)", () => {
      expect(resolveDirection(undefined, "ar-SA")).toBe("rtl");
    });

    it("infers 'rtl' from underscore variant (he_IL)", () => {
      expect(resolveDirection(undefined, "he_IL")).toBe("rtl");
    });

    it("is case-insensitive on locale", () => {
      expect(resolveDirection(undefined, "AR")).toBe("rtl");
    });

    it("infers 'ltr' from English", () => {
      expect(resolveDirection(undefined, "en")).toBe("ltr");
    });

    it("defaults to 'ltr' when both args are undefined", () => {
      expect(resolveDirection(undefined, undefined)).toBe("ltr");
    });

    it.each(["he", "fa", "ur", "ps", "sd", "ckb", "yi"])(
      "infers 'rtl' from locale '%s'",
      (loc) => {
        expect(resolveDirection(undefined, loc)).toBe("rtl");
      },
    );
  });

  describe("isMultiDay", () => {
    it("returns false if there is no endDate provided", () => {
      expect(
        isMultiDay({ id: "1", title: "e", startDate: "2024-01-01T10:00:00" }),
      ).toBe(false);
    });

    it("returns false for same day events even with different times", () => {
      expect(
        isMultiDay({
          id: "1",
          title: "e",
          startDate: "2024-01-01T10:00:00",
          endDate: "2024-01-01T14:00:00",
        }),
      ).toBe(false);
    });

    it("returns true when events span across midnight", () => {
      expect(
        isMultiDay({
          id: "1",
          title: "e",
          startDate: "2024-01-01T23:00:00",
          endDate: "2024-01-02T01:00:00",
        }),
      ).toBe(true);
      expect(
        isMultiDay({
          id: "1",
          title: "e",
          startDate: "2024-01-01",
          endDate: "2024-01-02",
        }),
      ).toBe(true);
    });
  });
});
