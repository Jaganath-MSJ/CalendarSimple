import { describe, it, expect } from "vitest";
import { DEFAULT_MESSAGES, resolveMessages } from "./messages";

describe("resolveMessages", () => {
  it("returns the English defaults when nothing is passed", () => {
    expect(resolveMessages()).toBe(DEFAULT_MESSAGES);
    expect(DEFAULT_MESSAGES.more(3)).toBe("+ 3 more");
    expect(DEFAULT_MESSAGES.moreAllDay(2)).toBe(
      "2 more all-day events, click to expand",
    );
    expect(DEFAULT_MESSAGES.createEventAt("14:00", "March 4")).toBe(
      "Create event at 14:00, March 4",
    );
  });

  it("overrides only the provided keys", () => {
    const m = resolveMessages({ today: "Aujourd'hui", more: (n) => `+${n}` });
    expect(m.today).toBe("Aujourd'hui");
    expect(m.more(2)).toBe("+2");
    expect(m.next).toBe("Next period");
  });

  it("falls back to the default for undefined values", () => {
    expect(resolveMessages({ today: undefined }).today).toBe("Today");
  });
});
