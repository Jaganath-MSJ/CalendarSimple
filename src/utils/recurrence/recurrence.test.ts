import { describe, expect, it } from "vitest";
import { DateTime, Settings } from "luxon";
import type { CalendarEvent } from "../../types";
import {
  expandRecurringEvents,
  getExpansionWindow,
  MAX_OCCURRENCES,
} from "./expand";
import { parseRRule } from "./parseRRule";

/** Runs `fn` with Luxon's default zone set to `zone`, then restores it. */
function withZone<T>(zone: string, fn: () => T): T {
  const previous = Settings.defaultZone;
  Settings.defaultZone = zone;
  try {
    return fn();
  } finally {
    Settings.defaultZone = previous;
  }
}

const range = (start: string, end: string) => ({
  start: DateTime.fromISO(start),
  end: DateTime.fromISO(end),
});

/** Start dates of the occurrences of one event inside the window. */
function starts(
  event: Partial<CalendarEvent> & { rrule: string },
  window = range("2026-01-01", "2027-12-31"),
): string[] {
  const full: CalendarEvent = {
    id: "e",
    title: "E",
    startDate: "2026-10-05T09:00:00", // Monday
    endDate: "2026-10-05T10:00:00",
    ...event,
  };
  return expandRecurringEvents([full], window).events.map((e) => e.startDate);
}
const days = (list: string[]) => list.map((s) => s.slice(0, 10));

describe("parseRRule", () => {
  it("reads every supported part", () => {
    const r = parseRRule(
      "RRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=5;WKST=SU;BYDAY=1MO,-1FR;BYMONTHDAY=1,-1;BYMONTH=1,6",
    );
    expect(r).toEqual({
      ok: true,
      rule: {
        freq: "MONTHLY",
        interval: 2,
        count: 5,
        wkst: 7,
        byDay: [
          { weekday: 1, nth: 1 },
          { weekday: 5, nth: -1 },
        ],
        byMonthDay: [1, -1],
        byMonth: [1, 6],
      },
    });
  });

  it("reads UNTIL in its three forms", () => {
    const date = parseRRule("FREQ=DAILY;UNTIL=20261231");
    const floating = parseRRule("FREQ=DAILY;UNTIL=20261231T083000");
    const utc = parseRRule("FREQ=DAILY;UNTIL=20261231T083000Z");
    expect(date.ok && date.rule.until?.toISO()).toContain(
      "2026-12-31T23:59:59",
    );
    expect(floating.ok && floating.rule.until?.toFormat("HH:mm")).toBe("08:30");
    expect(utc.ok && utc.rule.until?.toUTC().toFormat("HH:mm")).toBe("08:30");
  });

  it.each([
    ["", "FREQ is missing"],
    ["INTERVAL=2", "FREQ is missing"],
    ["FREQ=HOURLY", "FREQ=HOURLY is not supported"],
    ["FREQ=MONTHLY;BYSETPOS=-1", "BYSETPOS is not supported"],
    ["FREQ=DAILY;X-FOO=1", "X-FOO is not supported"],
    ["FREQ=DAILY;INTERVAL=0", "INTERVAL=0 is invalid"],
    ["FREQ=DAILY;COUNT=2;UNTIL=20261231", "COUNT and UNTIL cannot both be set"],
    ["FREQ=WEEKLY;BYDAY=1MO", "BYDAY ordinals need"],
    ["FREQ=YEARLY;BYDAY=20MO", "BYDAY=20MO is invalid"],
    ["FREQ=MONTHLY;BYMONTHDAY=32", "BYMONTHDAY=32 is invalid"],
    ["FREQ=DAILY;UNTIL=tomorrow", "UNTIL=TOMORROW is invalid"],
    ["FREQ=DAILY;COUNT", 'malformed part "COUNT"'],
  ])("rejects %j", (rule, reason) => {
    const r = parseRRule(rule);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain(reason);
  });
});

describe("expandRecurringEvents", () => {
  it("DAILY with COUNT and INTERVAL", () => {
    expect(days(starts({ rrule: "FREQ=DAILY;INTERVAL=2;COUNT=3" }))).toEqual([
      "2026-10-05",
      "2026-10-07",
      "2026-10-09",
    ]);
  });

  it("WEEKLY on several days until a date", () => {
    expect(
      days(starts({ rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20261014" })),
    ).toEqual([
      "2026-10-05",
      "2026-10-07",
      "2026-10-09",
      "2026-10-12",
      "2026-10-14",
    ]);
  });

  it("WEEKLY every other week keeps WKST weeks", () => {
    expect(
      days(starts({ rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,SU;COUNT=4" })),
    ).toEqual(["2026-10-05", "2026-10-11", "2026-10-19", "2026-10-25"]);
    expect(
      days(
        starts({ rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,SU;WKST=SU;COUNT=4" }),
      ),
    ).toEqual(["2026-10-05", "2026-10-18", "2026-10-19", "2026-11-01"]);
  });

  it("MONTHLY on the first Monday and the last Friday", () => {
    expect(
      days(starts({ rrule: "FREQ=MONTHLY;BYDAY=1MO,-1FR;COUNT=4" })),
    ).toEqual(["2026-10-05", "2026-10-30", "2026-11-02", "2026-11-27"]);
  });

  it("MONTHLY on the 31st skips short months (RFC 5545)", () => {
    expect(
      days(
        starts({
          startDate: "2026-01-31T09:00:00",
          endDate: undefined,
          rrule: "FREQ=MONTHLY;COUNT=4",
        }),
      ),
    ).toEqual(["2026-01-31", "2026-03-31", "2026-05-31", "2026-07-31"]);
  });

  it("MONTHLY on the last day with BYMONTHDAY=-1", () => {
    expect(
      days(
        starts({
          startDate: "2026-01-31T09:00:00",
          rrule: "FREQ=MONTHLY;BYMONTHDAY=-1;COUNT=3",
        }),
      ),
    ).toEqual(["2026-01-31", "2026-02-28", "2026-03-31"]);
  });

  it("MONTHLY Friday the 13th (BYDAY and BYMONTHDAY intersect)", () => {
    expect(
      days(
        starts({
          startDate: "2026-01-01T09:00:00",
          rrule: "FREQ=MONTHLY;BYDAY=FR;BYMONTHDAY=13;COUNT=3",
        }),
      ),
    ).toEqual(["2026-02-13", "2026-03-13", "2026-11-13"]);
  });

  it("YEARLY on 29 February only in leap years", () => {
    expect(
      days(
        starts(
          {
            startDate: "2024-02-29",
            endDate: undefined,
            rrule: "FREQ=YEARLY;COUNT=3",
          },
          range("2024-01-01", "2033-12-31"),
        ),
      ),
    ).toEqual(["2024-02-29", "2028-02-29", "2032-02-29"]);
  });

  it("YEARLY with BYMONTH and an ordinal BYDAY (US Thanksgiving)", () => {
    expect(
      days(
        starts({
          startDate: "2026-11-26",
          endDate: undefined,
          rrule: "FREQ=YEARLY;BYMONTH=11;BYDAY=4TH",
        }),
      ),
    ).toEqual(["2026-11-26", "2027-11-25"]);
  });

  it("returns only occurrences that overlap the window", () => {
    expect(
      days(starts({ rrule: "FREQ=WEEKLY" }, range("2026-11-01", "2026-11-30"))),
    ).toEqual([
      "2026-11-02",
      "2026-11-09",
      "2026-11-16",
      "2026-11-23",
      "2026-11-30",
    ]);
  });

  it("COUNT counts from the first occurrence, not from the window", () => {
    expect(
      days(
        starts(
          { rrule: "FREQ=WEEKLY;COUNT=6" },
          range("2026-11-01", "2026-12-31"),
        ),
      ),
    ).toEqual(["2026-11-02", "2026-11-09"]);
  });

  it("keeps multi-day occurrences that start before the window", () => {
    const list = starts(
      {
        startDate: "2026-10-30",
        endDate: "2026-11-02",
        rrule: "FREQ=MONTHLY",
      },
      range("2026-11-01", "2026-11-30"),
    );
    // 30 Oct – 2 Nov reaches into November; 30 Nov starts inside it.
    expect(list).toEqual(["2026-10-30", "2026-11-30"]);
  });

  it("skips exdates given as dates or exact start times", () => {
    expect(
      days(
        starts({
          rrule: "FREQ=DAILY;COUNT=5",
          exdates: ["2026-10-06", "2026-10-08T09:00:00"],
        }),
      ),
    ).toEqual(["2026-10-05", "2026-10-07", "2026-10-09"]);
  });

  it("builds each occurrence from the series", () => {
    const [first, second] = expandRecurringEvents(
      [
        {
          id: "standup",
          title: "Standup",
          startDate: "2026-10-05T09:00:00",
          endDate: "2026-10-05T09:15:00",
          rrule: "FREQ=DAILY;COUNT=2",
          room: "4B",
        },
      ],
      range("2026-10-01", "2026-10-31"),
    ).events;
    expect(first).toEqual({
      id: "standup::2026-10-05T09:00:00",
      recurringEventId: "standup",
      occurrenceDate: "2026-10-05T09:00:00",
      title: "Standup",
      startDate: "2026-10-05T09:00:00",
      endDate: "2026-10-05T09:15:00",
      rrule: "FREQ=DAILY;COUNT=2",
      room: "4B",
    });
    expect(second?.startDate).toBe("2026-10-06T09:00:00");
    expect(second?.endDate).toBe("2026-10-06T09:15:00");
  });

  it("keeps all-day occurrences date-only, with their length", () => {
    const [occ] = expandRecurringEvents(
      [
        {
          id: "trip",
          title: "Trip",
          startDate: "2026-10-05",
          endDate: "2026-10-07",
          rrule: "FREQ=MONTHLY;COUNT=2",
        },
      ],
      range("2026-11-01", "2026-11-30"),
    ).events;
    expect([occ?.startDate, occ?.endDate]).toEqual([
      "2026-11-05",
      "2026-11-07",
    ]);
  });

  it("keeps the wall-clock time across DST", () => {
    withZone("Europe/London", () => {
      const list = starts(
        {
          startDate: "2026-10-19T09:00:00",
          endDate: "2026-10-19T10:00:00",
          rrule: "FREQ=WEEKLY;COUNT=3",
        },
        range("2026-10-01", "2026-11-30"),
      );
      // 25 Oct 2026: clocks go back in London.
      expect(list).toEqual([
        "2026-10-19T09:00:00",
        "2026-10-26T09:00:00",
        "2026-11-02T09:00:00",
      ]);
    });
  });

  it("keeps an offset start in ISO form with the offset", () => {
    withZone("UTC", () => {
      const [, second] = starts({
        startDate: "2026-10-05T09:00:00Z",
        endDate: "2026-10-05T10:00:00Z",
        rrule: "FREQ=DAILY;COUNT=2",
      });
      expect(second).toBe("2026-10-06T09:00:00Z");
    });
  });

  it("caps an event at MAX_OCCURRENCES and warns", () => {
    const result = expandRecurringEvents(
      [
        {
          id: "x",
          title: "Ping",
          startDate: "2020-01-01T00:00:00",
          rrule: "FREQ=DAILY",
        },
      ],
      range("2020-01-01", "2029-12-31"),
    );
    expect(result.events).toHaveLength(MAX_OCCURRENCES);
    expect(result.warnings[0]).toContain('event "x": more than 1000');
  });

  it("shows an event with an unusable rule once, with a warning", () => {
    const event = {
      id: "bad",
      title: "Bad",
      startDate: "2026-10-05",
      rrule: "FREQ=HOURLY",
    };
    const result = expandRecurringEvents(
      [event],
      range("2026-10-01", "2026-10-31"),
    );
    expect(result.events).toEqual([event]);
    expect(result.warnings).toEqual([
      '[calendar] event "bad": rrule ignored (FREQ=HOURLY is not supported); showing it once.',
    ]);
  });

  it("passes a series with an invalid date through once, unexpanded", () => {
    const bad = {
      id: "bad",
      title: "Bad",
      startDate: "nope",
      rrule: "FREQ=WEEKLY",
    };
    const badEnd = {
      id: "badEnd",
      title: "Bad end",
      startDate: "2026-10-05T09:00:00",
      endDate: "nope",
      rrule: "FREQ=WEEKLY",
    };
    expect(
      expandRecurringEvents([bad, badEnd], range("2026-10-01", "2026-10-31"))
        .events,
    ).toEqual([bad, badEnd]);
  });

  it("passes an occurrence (recurringEventId set) through unexpanded", () => {
    const occurrence = {
      id: "s::2026-10-12T09:00:00",
      title: "S",
      startDate: "2026-10-12T09:00:00",
      rrule: "FREQ=DAILY",
      recurringEventId: "s",
      occurrenceDate: "2026-10-12T09:00:00",
    };
    const events = [occurrence];
    expect(
      expandRecurringEvents(events, range("2026-10-01", "2026-10-31")).events,
    ).toBe(events);
  });

  it("returns the same array when nothing recurs", () => {
    const events = [{ id: "1", title: "A", startDate: "2026-10-05" }];
    expect(
      expandRecurringEvents(events, range("2026-10-01", "2026-10-31")).events,
    ).toBe(events);
  });

  it("sorts by start when asked (eventsAreSorted)", () => {
    const result = expandRecurringEvents(
      [
        {
          id: "r",
          title: "R",
          startDate: "2026-10-05",
          rrule: "FREQ=DAILY;COUNT=3",
        },
        { id: "p", title: "P", startDate: "2026-10-06T12:00:00" },
      ],
      range("2026-10-01", "2026-10-31"),
      { sorted: true },
    );
    expect(result.events.map((e) => e.id)).toEqual([
      "r::2026-10-05",
      "r::2026-10-06",
      "p",
      "r::2026-10-07",
    ]);
  });

  it("starts late rules near the window (a daily rule from 2000)", () => {
    const t = Date.now();
    const list = starts(
      {
        startDate: "2000-01-03T09:00:00",
        rrule: "FREQ=DAILY",
        endDate: undefined,
      },
      range("2026-10-01", "2026-10-03"),
    );
    expect(days(list)).toEqual(["2026-10-01", "2026-10-02", "2026-10-03"]);
    expect(Date.now() - t).toBeLessThan(200);
  });
});

describe("getExpansionWindow", () => {
  it("adds two months and widens to whole quarters", () => {
    const w = getExpansionWindow(range("2026-09-27", "2026-11-07"));
    expect([w.start.toISODate(), w.end.toISODate()]).toEqual([
      "2026-07-01",
      "2027-03-31",
    ]);
  });

  it("stays the same while navigation stays inside the quarter margin", () => {
    const a = getExpansionWindow(range("2026-10-18", "2026-10-24"));
    const b = getExpansionWindow(range("2026-10-25", "2026-10-31"));
    expect(a.start.toISODate()).toBe(b.start.toISODate());
    expect(a.end.toISODate()).toBe(b.end.toISODate());
  });
});
