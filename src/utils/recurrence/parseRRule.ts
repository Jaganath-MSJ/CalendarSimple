/**
 * @file Parses the supported subset of an RFC 5545 recurrence rule.
 *
 * Supported: FREQ (DAILY, WEEKLY, MONTHLY, YEARLY), INTERVAL, COUNT, UNTIL,
 * WKST, BYDAY (with an ordinal such as `1MO` or `-1FR` in MONTHLY and in
 * YEARLY with BYMONTH), BYMONTHDAY (1–31 or -1–-31) and BYMONTH.
 */
import { DateTime } from "luxon";

export type RRuleFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

/** One BYDAY entry: Luxon weekday (1 = Monday … 7 = Sunday), optional ordinal. */
export interface RRuleWeekday {
  weekday: number;
  /** `1` first, `-1` last, … ; `undefined` means every such weekday. */
  nth?: number;
}

export interface RRule {
  freq: RRuleFrequency;
  interval: number;
  count?: number;
  /** Inclusive end, in the event's zone (a date-only UNTIL ends that day). */
  until?: DateTime;
  /** Luxon weekday the week starts on (default Monday, as in RFC 5545). */
  wkst: number;
  byDay?: RRuleWeekday[];
  byMonthDay?: number[];
  /** 1 = January … 12. */
  byMonth?: number[];
}

/** The rule, or why it cannot be used (the event then shows once). */
export type ParsedRRule =
  { ok: true; rule: RRule } | { ok: false; reason: string };

const DAYS: Record<string, number> = {
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
  SU: 7,
};
const FREQS = new Set(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);
const UNSUPPORTED = new Set([
  "BYSETPOS",
  "BYWEEKNO",
  "BYYEARDAY",
  "BYHOUR",
  "BYMINUTE",
  "BYSECOND",
  "RSCALE",
  "SKIP",
]);

const intList = (value: string, min: number, max: number) => {
  const out = value.split(",").map((v) => Number(v));
  return out.every(
    (n) =>
      Number.isInteger(n) &&
      n !== 0 &&
      Math.abs(n) >= min &&
      Math.abs(n) <= max,
  )
    ? out
    : undefined;
};

/** UNTIL as `YYYYMMDD`, `YYYYMMDDTHHMMSS` (floating) or `…Z` (UTC). */
function parseUntil(value: string): DateTime | undefined {
  const m = /^(\d{8})(?:T(\d{6})(Z)?)?$/.exec(value);
  if (!m) return undefined;
  const [, date, time, utc] = m;
  if (!time) {
    const d = DateTime.fromFormat(date, "yyyyLLdd");
    return d.isValid ? d.endOf("day") : undefined;
  }
  const d = DateTime.fromFormat(`${date}${time}`, "yyyyLLddHHmmss", {
    zone: utc ? "utc" : undefined,
  });
  return d.isValid ? (utc ? d.toLocal() : d) : undefined;
}

/**
 * Parses `rule` (an optional `RRULE:` prefix is allowed). Unknown or
 * unsupported parts make the whole rule unusable, so the calendar never
 * shows occurrences the rule did not mean.
 */
export function parseRRule(rule: string): ParsedRRule {
  const text = rule.trim().replace(/^RRULE:/i, "");
  const parts = new Map<string, string>();
  for (const part of text.split(";")) {
    if (!part) continue;
    const [name, value] = part.split("=");
    if (!name || value === undefined || value === "")
      return { ok: false, reason: `malformed part "${part}"` };
    parts.set(name.toUpperCase(), value.toUpperCase());
  }

  for (const name of parts.keys())
    if (UNSUPPORTED.has(name))
      return { ok: false, reason: `${name} is not supported` };

  const freq = parts.get("FREQ");
  if (!freq) return { ok: false, reason: "FREQ is missing" };
  if (!FREQS.has(freq))
    return { ok: false, reason: `FREQ=${freq} is not supported` };

  const out: RRule = { freq: freq as RRuleFrequency, interval: 1, wkst: 1 };

  for (const [name, value] of parts) {
    switch (name) {
      case "FREQ":
        break;
      case "INTERVAL": {
        const n = Number(value);
        if (!Number.isInteger(n) || n < 1)
          return { ok: false, reason: `INTERVAL=${value} is invalid` };
        out.interval = n;
        break;
      }
      case "COUNT": {
        const n = Number(value);
        if (!Number.isInteger(n) || n < 1)
          return { ok: false, reason: `COUNT=${value} is invalid` };
        out.count = n;
        break;
      }
      case "UNTIL": {
        const until = parseUntil(value);
        if (!until) return { ok: false, reason: `UNTIL=${value} is invalid` };
        out.until = until;
        break;
      }
      case "WKST": {
        const d = DAYS[value];
        if (!d) return { ok: false, reason: `WKST=${value} is invalid` };
        out.wkst = d;
        break;
      }
      case "BYDAY": {
        const list: RRuleWeekday[] = [];
        for (const item of value.split(",")) {
          const m = /^([+-]?\d{1,2})?(MO|TU|WE|TH|FR|SA|SU)$/.exec(item);
          if (!m) return { ok: false, reason: `BYDAY=${value} is invalid` };
          const nth = m[1] === undefined ? undefined : Number(m[1]);
          if (nth !== undefined && (nth === 0 || Math.abs(nth) > 5))
            return { ok: false, reason: `BYDAY=${value} is invalid` };
          list.push({ weekday: DAYS[m[2]], nth });
        }
        out.byDay = list;
        break;
      }
      case "BYMONTHDAY": {
        const list = intList(value, 1, 31);
        if (!list)
          return { ok: false, reason: `BYMONTHDAY=${value} is invalid` };
        out.byMonthDay = list;
        break;
      }
      case "BYMONTH": {
        const list = intList(value, 1, 12);
        if (!list || list.some((n) => n < 0))
          return { ok: false, reason: `BYMONTH=${value} is invalid` };
        out.byMonth = list;
        break;
      }
      default:
        return { ok: false, reason: `${name} is not supported` };
    }
  }

  if (out.count !== undefined && out.until !== undefined)
    return { ok: false, reason: "COUNT and UNTIL cannot both be set" };
  // RFC 5545: BYMONTHDAY must not be used with FREQ=WEEKLY.
  if (out.freq === "WEEKLY" && out.byMonthDay) {
    return { ok: false, reason: "BYMONTHDAY cannot be used with FREQ=WEEKLY" };
  }
  const ordinal = out.byDay?.some((d) => d.nth !== undefined);
  if (
    ordinal &&
    (out.freq === "DAILY" ||
      out.freq === "WEEKLY" ||
      (out.freq === "YEARLY" && !out.byMonth))
  )
    return {
      ok: false,
      reason: "BYDAY ordinals need FREQ=MONTHLY, or YEARLY with BYMONTH",
    };
  return { ok: true, rule: out };
}
