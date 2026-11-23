/**
 * @file The Custom Days view shows 1–7 days. `clampCustomDays` keeps any
 * value (JavaScript callers, stored settings) inside that range.
 */
import type { CustomDaysCount } from "../types";

export const CUSTOM_DAYS_MIN = 1;
export const CUSTOM_DAYS_MAX = 7;
export const CUSTOM_DAYS_DEFAULT: CustomDaysCount = 3;

/**
 * Rounds `value` and clamps it to 1–7; a missing or non-finite value gives
 * the default (3).
 */
export function clampCustomDays(value: number | undefined): CustomDaysCount {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return CUSTOM_DAYS_DEFAULT;
  }
  const n = Math.round(value);
  return Math.min(
    CUSTOM_DAYS_MAX,
    Math.max(CUSTOM_DAYS_MIN, n),
  ) as CustomDaysCount;
}
