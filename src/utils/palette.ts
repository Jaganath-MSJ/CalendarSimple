/**
 * @file `palette` prop → CSS custom properties (same keys as
 * calendar-simple-native's `CalendarPalette`).
 */
import type { CSSProperties } from "react";
import type { CalendarPalette, CalendarPaletteOverrides } from "../types";

/** The CSS custom property each palette key sets. */
export const PALETTE_CSS_VARS: Record<keyof CalendarPalette, string> = {
  primary: "--primary-color",
  primaryStrong: "--primary-hover",
  onPrimary: "--cal-on-primary",
  textPrimary: "--text-primary",
  textSecondary: "--text-secondary",
  bg: "--bg-color",
  bgMuted: "--bg-hover",
  border: "--border-color",
  surfaceRaised: "--cal-surface-raised",
  focus: "--cal-focus-color",
  eventDefault: "--cal-event-default",
  nowLine: "--cal-now-line",
  scrim: "--cal-scrim",
};

/**
 * Inline style with the custom properties for `scheme`'s palette entry;
 * empty when there is none. Inline values win over `variables.css`.
 */
export function paletteStyle(
  palette: CalendarPaletteOverrides | undefined,
  scheme: "light" | "dark",
): CSSProperties {
  const entry = palette?.[scheme];
  if (!entry) return {};
  const style: Record<string, string> = {};
  for (const key of Object.keys(
    PALETTE_CSS_VARS,
  ) as (keyof CalendarPalette)[]) {
    const value = entry[key];
    if (typeof value === "string" && value)
      style[PALETTE_CSS_VARS[key]] = value;
  }
  return style;
}
