import { describe, it, expect } from "vitest";
import { getContrastColor } from "./contrast";

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
});
