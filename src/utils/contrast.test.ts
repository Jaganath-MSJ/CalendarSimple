import { describe, it, expect } from "vitest";
import { getContrastColor, resolveTheme } from "./contrast";

describe("contrast utility", () => {
  describe("getContrastColor", () => {
    it("should return white for black background", () => {
      expect(getContrastColor("#000000")).toBe("#FFFFFF");
    });

    it("should return dark gray for white background", () => {
      expect(getContrastColor("#FFFFFF")).toBe("#212529");
    });

    it("should return white for dark blue background", () => {
      expect(getContrastColor("#0000FF")).toBe("#FFFFFF");
    });

    it("should return dark gray for yellow background", () => {
      expect(getContrastColor("#FFFF00")).toBe("#212529");
    });

    it("should handle rgb strings", () => {
      expect(getContrastColor("rgb(0, 0, 0)")).toBe("#FFFFFF");
      expect(getContrastColor("rgb(255, 255, 255)")).toBe("#212529");
    });

    it("should handle rgba strings", () => {
      expect(getContrastColor("rgba(0, 0, 0, 1)")).toBe("#FFFFFF");
    });

    it("should handle named colors", () => {
      expect(getContrastColor("black")).toBe("#FFFFFF");
      expect(getContrastColor("white")).toBe("#212529");
    });

    it("should fallback to white for unknown/invalid input", () => {
      expect(getContrastColor("invalid")).toBe("#FFFFFF");
      expect(getContrastColor(undefined)).toBe("#FFFFFF");
    });
  });

  describe("resolveTheme", () => {
    it("returns {} for undefined theme", () => {
      expect(resolveTheme(undefined, "light")).toEqual({});
      expect(resolveTheme(undefined, "dark")).toEqual({});
    });

    it("returns empty ThemeScheme for empty theme object", () => {
      expect(resolveTheme({}, "light")).toEqual({
        default: {},
        selected: {},
        today: {},
      });
    });

    it("returns flat values unchanged when no scheme sub-object is present", () => {
      const theme = { today: { bgColor: "red", color: "white" } };
      expect(resolveTheme(theme, "light").today).toEqual({
        bgColor: "red",
        color: "white",
      });
      expect(resolveTheme(theme, "dark").today).toEqual({
        bgColor: "red",
        color: "white",
      });
    });

    it("dark scheme bgColor overrides flat bgColor; absent key preserves flat color", () => {
      const theme = {
        selected: { bgColor: "#007bff", color: "#fff" },
        dark: { selected: { bgColor: "#3b82f6" } },
      };
      const resolved = resolveTheme(theme, "dark");
      expect(resolved.selected?.bgColor).toBe("#3b82f6");
      expect(resolved.selected?.color).toBe("#fff");
    });

    it("dark override does not apply when scheme is light", () => {
      const theme = {
        selected: { bgColor: "#007bff" },
        dark: { selected: { bgColor: "#3b82f6" } },
      };
      expect(resolveTheme(theme, "light").selected?.bgColor).toBe("#007bff");
    });

    it("light sub-object overrides flat when scheme is light", () => {
      const theme = {
        today: { bgColor: "blue" },
        light: { today: { bgColor: "lightblue" } },
      };
      expect(resolveTheme(theme, "light").today?.bgColor).toBe("lightblue");
      expect(resolveTheme(theme, "dark").today?.bgColor).toBe("blue");
    });

    it("scheme-specific key absent in flat level works correctly", () => {
      const theme = { dark: { default: { color: "white" } } };
      expect(resolveTheme(theme, "dark").default?.color).toBe("white");
      expect(resolveTheme(theme, "light").default?.color).toBeUndefined();
    });

    it("all three state keys are resolved independently", () => {
      const theme = {
        default: { bgColor: "a" },
        selected: { bgColor: "b" },
        today: { bgColor: "c" },
        dark: { today: { bgColor: "c-dark" } },
      };
      const resolved = resolveTheme(theme, "dark");
      expect(resolved.default?.bgColor).toBe("a");
      expect(resolved.selected?.bgColor).toBe("b");
      expect(resolved.today?.bgColor).toBe("c-dark");
    });

    it("empty scheme sub-object does not erase flat values", () => {
      const theme = { today: { bgColor: "blue" }, dark: {} };
      expect(resolveTheme(theme, "dark").today?.bgColor).toBe("blue");
    });
  });
});
