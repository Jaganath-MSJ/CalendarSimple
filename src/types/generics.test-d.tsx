// Compile-time checks for generic event typing, enforced by `tsc --noEmit`
// (`npm run lint`). Vitest does not collect `*.test-d.tsx` files, and nothing
// here runs: the JSX lives in an uncalled function.
import React from "react";
import { expectTypeOf } from "vitest";
import Calendar, {
  useCalendar,
  type CalendarEvent,
  type CalendarProps,
  type CalendarContentProps,
  CalendarProvider,
} from "../index";
import { dateFn } from "../utils";

type MyEvent = {
  id: string;
  title: string;
  startDate: string;
  room: number;
};

type P = CalendarProps<MyEvent>;

// Props carry the event type through every event-bearing member.
expectTypeOf<NonNullable<P["events"]>>().toEqualTypeOf<MyEvent[]>();
expectTypeOf<
  Parameters<NonNullable<P["onEventClick"]>>[0]
>().toEqualTypeOf<MyEvent>();
expectTypeOf<
  Parameters<NonNullable<P["renderEvent"]>>[0]
>().toEqualTypeOf<MyEvent>();
expectTypeOf<Parameters<NonNullable<P["onMoreClick"]>>[1]>().toEqualTypeOf<
  MyEvent[] | undefined
>();
expectTypeOf<NonNullable<P["enrichedEventsByDate"]>>().toEqualTypeOf<
  Record<string, MyEvent[]>
>();
expectTypeOf<NonNullable<P["sortedMonthView"]>>().toEqualTypeOf<
  boolean | ((a: MyEvent, b: MyEvent) => number)
>();
expectTypeOf<CalendarContentProps<MyEvent>["events"]>().toEqualTypeOf<
  MyEvent[]
>();

// The default stays `CalendarEvent`.
expectTypeOf<
  Parameters<NonNullable<CalendarProps["onEventClick"]>>[0]
>().toEqualTypeOf<CalendarEvent>();

// useCalendar<TEvent>() narrows `config.events`.
expectTypeOf<
  ReturnType<typeof useCalendar<MyEvent>>["config"]["events"]
>().toEqualTypeOf<MyEvent[] | undefined>();
expectTypeOf<
  ReturnType<typeof useCalendar>["config"]["events"]
>().toEqualTypeOf<CalendarEvent[] | undefined>();

// Compound statics survive the typed export.
expectTypeOf(Calendar.Header).not.toBeAny();
expectTypeOf(Calendar.MonthView).not.toBeAny();

export function JsxCases(myEvents: MyEvent[], plain: CalendarEvent[]) {
  return (
    <>
      <Calendar<MyEvent>
        events={myEvents}
        onEventClick={(e) => {
          expectTypeOf(e.room).toEqualTypeOf<number>();
          // @ts-expect-error `missing` is not a field of MyEvent
          void e.missing;
        }}
        renderEvent={(e) => e.room}
        onMoreClick={(_date, hidden) => {
          expectTypeOf(hidden).toEqualTypeOf<MyEvent[] | undefined>();
        }}
        sortedMonthView={(a, b) => a.room - b.room}
      />
      {/* Without a type argument, TEvent is NOT inferred from `events`. */}
      <Calendar
        events={myEvents}
        onEventClick={(e) => expectTypeOf(e).toEqualTypeOf<CalendarEvent>()}
      />
      {/* Default: plain CalendarEvent, extra fields stay `unknown`. */}
      <Calendar
        events={plain}
        onEventClick={(e) => {
          expectTypeOf(e).toEqualTypeOf<CalendarEvent>();
          expectTypeOf(e.room).toEqualTypeOf<unknown>();
        }}
      />
      {/* Regression: an inline literal keeps the pre-generic typing, so
          undeclared fields read as `unknown` instead of erroring. */}
      <Calendar
        events={[{ id: "1", title: "Standup", startDate: "2026-11-21" }]}
        onEventClick={(e) => {
          expectTypeOf(e).toEqualTypeOf<CalendarEvent>();
          expectTypeOf(e.color).toEqualTypeOf<unknown>();
        }}
        renderEvent={(e) => String(e.color)}
        onMoreClick={(_date, hidden) =>
          expectTypeOf(hidden).toEqualTypeOf<CalendarEvent[] | undefined>()
        }
        sortedMonthView={(a, b) => {
          expectTypeOf(a).toEqualTypeOf<CalendarEvent>();
          return String(a.color).localeCompare(String(b.color));
        }}
      />
      <Calendar />
      {/* @ts-expect-error events must match the explicit type argument */}
      <Calendar<MyEvent> events={[{ title: "x", startDate: "2026-11-21" }]} />
    </>
  );
}

// A consumer-typed wide config (with "locale" unions) is accepted by the
// public CalendarProvider.
export function providerConfigTypes() {
  const config: Omit<CalendarProps, "children" | "selectedDate" | "view"> = {
    weekStartsOn: "locale",
    is12Hour: "locale",
  };
  return (
    <CalendarProvider
      initialDate={dateFn("2026-11-21")}
      initialView="month"
      config={config}
    >
      {null}
    </CalendarProvider>
  );
}
