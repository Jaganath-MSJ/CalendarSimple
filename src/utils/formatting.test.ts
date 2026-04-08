import { describe, it, expect, vi, afterEach } from "vitest";
import { generateTooltipText, getGmtOffset } from "./formatting";
import { ECalendarViewType } from "../types";

describe("formatting utils", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateTooltipText", () => {
    const event = {
      id: "1",
      title: "Meeting",
      startDate: "2024-01-01T10:00:00",
      endDate: "2024-01-01T11:00:00",
    };

    it("should generate tooltip for month view using date format only", () => {
      const result = generateTooltipText(event, ECalendarViewType.month);
      expect(result).toBe("Meeting (2024-01-01 - 2024-01-01)");
    });

    it("should generate tooltip for week view including time", () => {
      const result = generateTooltipText(event, ECalendarViewType.week);
      expect(result).toBe("Meeting (10:00 - 11:00)");
    });

    it("should include time with 12h format if requested", () => {
      const result = generateTooltipText(event, ECalendarViewType.week, true);
      expect(result).toBe("Meeting (10:00 AM - 11:00 AM)");
    });
  });

  describe("getGmtOffset", () => {
    it("should correctly format positive exact hour GMT offset", () => {
      vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-300); // 5 hours ahead -> GMT+05
      expect(getGmtOffset()).toBe("GMT+05");
    });

    it("should correctly format negative offset with minutes", () => {
      vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(210); // 3.5 hours behind -> GMT-03:30
      expect(getGmtOffset()).toBe("GMT-03:30");
    });
  });
});
