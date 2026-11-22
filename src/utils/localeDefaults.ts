/**
 * @file Resolves `"locale"` values for `weekStartsOn` and `is12Hour`.
 */
import { WEEK_START_FALLBACK } from "./weekStartTable";

/** The subset of `Intl` these resolvers use; injectable for tests. */
export type IntlLike = {
  Locale?: typeof Intl.Locale;
  DateTimeFormat?: typeof Intl.DateTimeFormat;
};

/** `Intl.Locale` with the week-info APIs that not every engine ships. */
type LocaleWithWeekInfo = {
  getWeekInfo?: () => { firstDay?: number } | undefined;
  weekInfo?: { firstDay?: number };
  maximize?: () => { region?: string };
  region?: string;
};

/** Region subtag from a BCP 47 tag (skips script subtags). */
function regionFromTag(locale: string): string | undefined {
  return locale
    .split(/[-_]/)
    .slice(1)
    .find((part) => /^[A-Za-z]{2}$|^\d{3}$/.test(part))
    ?.toUpperCase();
}

/**
 * Resolves the first day of the week.
 *
 * Numbers pass through. For `"locale"`: Intl week info first (ISO 1–7, 7 =
 * Sunday), then the CLDR region table; a region missing from the table means
 * Monday and no region at all means Sunday.
 */
export function resolveWeekStart(
  value: number | "locale",
  locale: string,
  intl: IntlLike = Intl,
): number {
  if (typeof value === "number") return value;

  let region: string | undefined;
  try {
    if (intl.Locale) {
      const loc = new intl.Locale(locale) as unknown as LocaleWithWeekInfo;
      const firstDay = (loc.getWeekInfo?.() ?? loc.weekInfo)?.firstDay;
      if (typeof firstDay === "number") return firstDay % 7;
      region = loc.maximize?.().region ?? loc.region;
    }
  } catch {
    // Invalid tag or missing Intl data: fall through to the tag itself.
  }
  region ??= regionFromTag(locale);

  if (!region) return 0;
  return WEEK_START_FALLBACK[region.toUpperCase()] ?? 1;
}

/**
 * Resolves whether times use a 12-hour clock.
 *
 * Booleans pass through. For `"locale"`: Intl `hourCycle` (`h11`/`h12` → true,
 * `h23`/`h24` → false); without it, formats 13:00 and looks for a day period;
 * any Intl error → false.
 */
export function resolveIs12Hour(
  value: boolean | "locale",
  locale: string,
  intl: IntlLike = Intl,
): boolean {
  if (typeof value === "boolean") return value;
  try {
    if (!intl.DateTimeFormat) return false;
    const format = new intl.DateTimeFormat(locale, { hour: "numeric" });
    const { hourCycle } = format.resolvedOptions();
    if (hourCycle === "h11" || hourCycle === "h12") return true;
    if (hourCycle === "h23" || hourCycle === "h24") return false;
    return format
      .formatToParts(new Date(2000, 0, 1, 13, 0, 0))
      .some((part) => part.type === "dayPeriod");
  } catch {
    return false;
  }
}
