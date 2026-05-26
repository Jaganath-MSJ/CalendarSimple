/**
 * @file contrast.ts
 * @description Utility functions for calculating color luminance and contrast.
 * Follows WCAG 2.1 Web Content Accessibility Guidelines.
 */
import type { CalendarTheme, ThemeScheme } from "../types";

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Map of common CSS color names to their Hex equivalents.
 * Used as a fallback for the parser when a named color is provided.
 * @internal
 */
const colorNameMap: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  transparent: "#ffffff", // Default to white for transparent backgrounds
  pink: "#ffc0cb",
  lime: "#00ff00",
  orange: "#ffa500",
  yellow: "#ffff00",
  cyan: "#00ffff",
  silver: "#c0c0c0",
  gold: "#ffd700",
  lightgray: "#d3d3d3",
  lightblue: "#add8e6",
};

/**
 * Converts a hex color string or RGB/RGBA string to an RGB object.
 *
 * @param color - The color string to parse (e.g., "#FFF", "#FFFFFF", "rgb(255, 255, 255)").
 * @returns An RGB object or null if the color format is invalid.
 */
function parseToRgb(color: string): RGB | null {
  color = color.trim().toLowerCase();

  // Handle Hex (e.g., #FFF or #FFFFFF)
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
      };
    }
  }

  // Handle RGB/RGBA (e.g., rgb(255, 255, 255) or rgba(255, 255, 255, 1))
  const rgbMatch = color.match(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/,
  );
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  if (colorNameMap[color]) {
    return parseToRgb(colorNameMap[color]);
  }

  return null;
}

/**
 * Calculates the relative luminance of a color.
 * Formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
 *
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * @param r - Red component (0-255).
 * @param g - Green component (0-255).
 * @param b - Blue component (0-255).
 * @returns The relative luminance (0 to 1).
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [lr, lg, lb] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/**
 * Calculates the contrast ratio between two relative luminances.
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 *
 * @see https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 * @param l1 - Luminance 1.
 * @param l2 - Luminance 2.
 * @returns The contrast ratio (1 to 21).
 */
function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determines the best contrast color (black or white) for a given background color.
 * Follows WCAG 2.1 standards for readability.
 *
 * @param bgColor - The CSS background color (Hex, RGB, or named color).
 * @returns "#FFFFFF" or "#212529" (a very dark gray, softer than pure black).
 */
export function getContrastColor(bgColor?: string): string {
  if (!bgColor) return "#FFFFFF";

  const rgb = parseToRgb(bgColor);
  if (!rgb) return "#FFFFFF";

  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);

  // Contrast against white (#FFFFFF) has luminance 1
  // Contrast against dark gray (#212529) has luminance ~0.012
  const whiteLuminance = 1;
  const darkLuminance = getRelativeLuminance(33, 37, 41); // #212529

  const contrastWithWhite = getContrastRatio(luminance, whiteLuminance);
  const contrastWithDark = getContrastRatio(luminance, darkLuminance);

  return contrastWithWhite >= contrastWithDark ? "#FFFFFF" : "#212529";
}

/**
 * Merges flat CalendarTheme values with the scheme-specific sub-object.
 * Scheme-specific values win on a per-field basis.
 *
 * @param theme  - Raw theme from CalendarProps (may be undefined or {}).
 * @param scheme - Resolved color scheme ("light" | "dark") from context.
 * @returns A flat ThemeScheme with no nested keys.
 */
export function resolveTheme(
  theme: CalendarTheme | undefined,
  scheme: "light" | "dark",
): ThemeScheme {
  if (!theme) return {};
  const override = theme[scheme];
  return {
    default: { ...theme.default, ...override?.default },
    selected: { ...theme.selected, ...override?.selected },
    today: { ...theme.today, ...override?.today },
  };
}
