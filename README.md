# Calendar Simple

[![npm version](https://img.shields.io/npm/v/calendar-simple)](https://www.npmjs.com/package/calendar-simple)
[![bundle size](https://img.shields.io/npm/unpacked-size/calendar-simple)](https://www.npmjs.com/package/calendar-simple)
[![npm downloads](https://img.shields.io/npm/dm/calendar-simple)](https://www.npmjs.com/package/calendar-simple)
[![license](https://img.shields.io/npm/l/calendar-simple)](https://github.com/Jaganath-MSJ/CalendarSimple/blob/main/LICENSE)

A lightweight, customizable, and accessible calendar component for React. Built with TypeScript and Luxon.

**[Live Demo](https://calendarsimple.netlify.app)**

Using React Native? See [calendar-simple-native](https://www.npmjs.com/package/calendar-simple-native).

## Features

- **🗓️ Multiple Views** — Month, Week, Day, Schedule, and Custom Days views. No Prev/Next in Schedule view; Today and the month/year pickers scroll the full list to the chosen date.
- **✨ Event Handling** — Display and manage events with custom styling and arbitrary metadata.
- **🔁 Recurring Events** — RFC 5545 `rrule` (daily, weekly, monthly, yearly) with `exdates`, expanded for the visible range.
- **📱 Responsive** — Built-in CSS breakpoints at 768px (tablet) and 480px (phone).
- **🎨 Theming & Customization** — Override colors via `theme` and inject CSS classes via `classNames`. The selected day is outlined; see the dark mode section for overridable palette tokens.
- **🌙 Dark Mode & Color Schemes** — Built-in light/dark palettes with OS auto-detection.
- **🌐 RTL Support** — Full right-to-left layout with auto-detection for Arabic, Hebrew, Farsi, and more.
- **🧩 Custom Renderers** — Replace events, headers, and grid cells with your own React components.
- **⌨️ Keyboard Navigation** — Enter/Space activation, Tab focus trap in popovers, Escape to close.
- **♿ Accessibility** — Semantic HTML, ARIA roles, labels, and screen reader support throughout.
- **🕒 Time Formatting** — 12-hour (AM/PM) and 24-hour formats with a live current-time indicator.
- **👆 Interactive** — Click handlers for dates, events, "+more" indicators, and empty slot creation.
- **🌍 Localization** — Full i18n via Luxon locale codes and custom UI message translations.
- **🛡️ TypeScript** — Fully typed props, callbacks, and interfaces — all exported.

## Requirements

| Dependency | Version                   |
| ---------- | ------------------------- |
| React      | ≥ 19.0                    |
| React DOM  | ≥ 19.0                    |
| Node.js    | ≥ 18 LTS (build/dev only) |

Luxon is bundled as a direct dependency — no separate install needed.

## Installation

```bash
npm install calendar-simple
# or
yarn add calendar-simple
# or
pnpm add calendar-simple
```

## Usage

### Basic Example

```tsx
import React, { useState } from "react";
import Calendar from "calendar-simple";
import "calendar-simple/dist/styles.css";

const App = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calendar fills its container — give the parent an explicit height
  return (
    <div style={{ height: "600px", padding: "20px" }}>
      <Calendar
        selectedDate={selectedDate}
        onDateClick={setSelectedDate}
        selectable
      />
    </div>
  );
};
```

### Advanced Usage with Events & Views

```tsx
import React, { useState } from "react";
import Calendar, { CalendarEvent, ECalendarViewType } from "calendar-simple";
import "calendar-simple/dist/styles.css";

const MyCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<ECalendarViewType>("month");

  const events: CalendarEvent[] = [
    {
      id: "1",
      startDate: "2024-02-14",
      title: "Valentine's Day",
      style: { backgroundColor: "#ffcccc" },
    },
    {
      id: "2",
      startDate: "2024-02-20",
      endDate: "2024-02-22",
      title: "Tech Conference",
      style: { backgroundColor: "#e6f7ff" },
    },
    {
      id: "3",
      startDate: "2024-02-21T10:00:00",
      endDate: "2024-02-21T12:00:00",
      title: "Team Meeting",
      style: { backgroundColor: "#cce5ff" },
    },
  ];

  return (
    <Calendar
      events={events}
      selectedDate={selectedDate}
      view={view}
      onDateClick={setSelectedDate}
      onViewChange={setView}
      selectable
      is12Hour
      showCurrentTime
      autoScrollToCurrentTime
      theme={{
        selected: { color: "#fff", bgColor: "#007bff" },
        today: { color: "#007bff", bgColor: "#e6f2ff" },
      }}
      onEventClick={(event) => alert(`Clicked: ${event.title}`)}
    />
  );
};
```

### 🧩 Custom Renderers

```tsx
<Calendar
  renderEvent={(event) => (
    <div
      style={{
        padding: "2px",
        backgroundColor: "#e0f2fe",
        borderRadius: "4px",
      }}
    >
      <strong>🚀 {event.title}</strong>
    </div>
  )}
  renderHeader={({ currentDate, onNavigate }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px",
      }}
    >
      <button
        onClick={() => {
          const d = new Date(currentDate);
          d.setMonth(d.getMonth() - 1);
          onNavigate(d);
        }}
      >
        Prev
      </button>
      <h2>
        {currentDate.toLocaleDateString("default", {
          month: "long",
          year: "numeric",
        })}
      </h2>
      <button
        onClick={() => {
          const d = new Date(currentDate);
          d.setMonth(d.getMonth() + 1);
          onNavigate(d);
        }}
      >
        Next
      </button>
    </div>
  )}
/>
```

`renderHourCell` receives the start of each hour slot on that column's own date, so it can style per day:

```tsx
<Calendar
  view="week"
  renderHourCell={(date) =>
    date.getDay() === 0 || date.getDay() === 6 ? (
      <div style={{ height: "100%", background: "rgba(239, 68, 68, 0.08)" }} />
    ) : null
  }
/>
```

### 🌍 Localization

```tsx
<Calendar
  locale="fr"
  localeMessages={{
    today: "Aujourd'hui",
    day: "Jour",
    week: "Semaine",
    month: "Mois",
    schedule: "Planning",
    days: "Jours",
    more: (n) => `+ ${n} autres`,
  }}
/>
```

Plain strings: `today`, `day`, `week`, `month`, `schedule`, `days`, `allDay`, `until`, `noEvents`, `noTitle` (aria-label for untitled events), `previous`, `next`, `selectView`, `selectMonth`, `selectYear`, `calendarNavigation`, `allDayEvents`, `expandAllDay`, `collapseAllDay`, `weekView`, `dayView`, `scheduleView`.

Functions: `nDaysView(n)`, `more(n)`, `moreAllDay(n)`, `moreEventsOn(n, date)`, `dayOfTotal(i, n)`, `eventsOn(date)`, `createEventAt(time, date)`, `weekNumber(n)` (week-title suffix, default `W45`).

Keys you leave out (or set to `undefined`) use the English default; an empty string is used as given.

### Recurring events

Give an event an RFC 5545 `rrule` and the calendar shows each occurrence as its own event. `startDate` is the first occurrence and sets the time and the length (from `endDate`).

```tsx
const events = [
  {
    id: "standup",
    title: "Standup",
    startDate: "2026-10-05T09:00:00",
    endDate: "2026-10-05T09:15:00",
    rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR",
    exdates: ["2026-11-11", "2026-11-13T09:00:00"],
  },
];
```

- **Supported rule parts** — `FREQ` (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), `INTERVAL`, `COUNT`, `UNTIL` (`YYYYMMDD`, `YYYYMMDDTHHMMSS` or `…Z`), `WKST`, `BYDAY` (with ordinals such as `1MO` or `-1FR` in `MONTHLY`, and in `YEARLY` with `BYMONTH`), `BYMONTHDAY` (1 to 31 or -1 to -31) and `BYMONTH`. An optional `RRULE:` prefix is allowed.
- **Unsupported rules** — Any other part (for example `BYSETPOS`, `BYHOUR`, `FREQ=HOURLY`), or a malformed rule, shows the event once, unexpanded, and logs a `console.warn` (once per calendar). A series whose `startDate` or `endDate` is not a valid date is passed through unexpanded, and the usual invalid-date handling drops it.
- **`exdates`** — Occurrences to skip, as ISO dates (`"2026-11-04"`, skips that day) or exact start times (`"2026-11-04T09:00:00"`).
- **Occurrences** — Each occurrence copies the event with its own `startDate` / `endDate`, the id `"<id>::<occurrence start>"` (for example `"standup::2026-11-09T09:00:00"`), `recurringEventId` (the series `id`) and `occurrenceDate` (its start). `onEventClick` and `renderEvent` receive the occurrence.
- **Expansion window** — Occurrences are generated around the visible range: two months either side, widened to whole quarters. In Schedule view, which lists every event, series are expanded from two months before `selectedDate` to 12 months after it, widened to whole quarters; every series (endless or not) is cut there, while non-recurring events are all listed as usual. `onDateRangeChange` in Schedule reports the span of what is listed, occurrences included.
- **Limits** — At most 1000 occurrences per event per window; the rest are dropped with a warning.
- **Ids** — Give recurring events an `id`; without one, occurrence ids fall back to the start date and two id-less series with the same start would collide.
- **Editing** — Occurrences carry the series' `rrule`; to edit, update the series (via `recurringEventId`), not the occurrence.
- **Time zones** — Times are held in the viewer's local zone: a series given with `Z`/offset repeats at the same local clock time.
- **Weekly intervals** — Weekly `INTERVAL > 1` grouping follows the rule's `WKST` (default Monday, RFC 5545), not the calendar's `weekStartsOn`.
- **Not expanded with `enableEnrichedEvents`** — pre-enriched events are used as given.
- Events without `rrule` are unchanged.

**Upgrading:** `rrule`, `exdates`, `recurringEventId` and `occurrenceDate` on events are now interpreted by the calendar. If you already expand series yourself, either remove `rrule` from the occurrences you pass, or keep `recurringEventId` on them; the calendar leaves events with `recurringEventId` alone. A non-string `rrule` is ignored at runtime, but the TypeScript types now expect a string.

### TypeScript: typed events

`Calendar` is generic over your event shape, so callbacks and renderers receive your type instead of `CalendarEvent`:

```tsx
import Calendar, { useCalendar, type CalendarEvent } from "calendar-simple";

interface MyEvent extends CalendarEvent {
  room: number;
}

<Calendar<MyEvent> events={events} onEventClick={(e) => e.room} />;

// Inside compound children:
const { config } = useCalendar<MyEvent>(); // config.events: MyEvent[] | undefined
```

`TEvent` is set only by an explicit type argument (`<Calendar<MyEvent>>`, `useCalendar<MyEvent>()`); without one it stays `CalendarEvent`, even when `events` has a narrower type. The type definitions need TypeScript ≥ 5.4 (they use `NoInfer`). It types `events`, `onEventClick`, `onMoreClick`, `renderEvent`, `enrichedEventsByDate` and the `sortedMonthView` comparator; it is not checked at runtime.

## API Reference

> For full prop descriptions and usage examples, see [FEATURES.md](./FEATURES.md).

### Props

| Prop                      | Type                                                          | Default             |
| ------------------------- | ------------------------------------------------------------- | ------------------- |
| `events`                  | `CalendarEvent[]`                                             | `[]`                |
| `selectedDate`            | `Date`                                                        | `undefined`         |
| `view`                    | `ECalendarViewType`                                           | `"month"`           |
| `testId`                  | `string`                                                      | `undefined`         |
| `isLoading`               | `boolean`                                                     | `undefined`         |
| `renderLoading`           | `() => ReactNode`                                             | `undefined`         |
| `selectable`              | `boolean`                                                     | `false`             |
| `creatable`               | `boolean`                                                     | `false`             |
| `is12Hour`                | `boolean \| "locale"`                                         | `false`             |
| `colorScheme`             | `'light' \| 'dark' \| 'auto'`                                 | `'auto'`            |
| `direction`               | `'ltr' \| 'rtl'`                                              | `` `auto-detect` `` |
| `locale`                  | `string`                                                      | `'en'`              |
| `localeMessages`          | `Partial<CalendarMessages>`                                   | `{}`                |
| `theme`                   | `CalendarTheme`                                               | `{}`                |
| `classNames`              | `CalendarClassNames`                                          | `{}`                |
| `width`                   | `number \| string`                                            | `` `auto` ``        |
| `height`                  | `number \| string`                                            | `` `auto` ``        |
| `dayType`                 | `EDayType`                                                    | `"half"`            |
| `weekStartsOn`            | `number \| "locale"`                                          | `0`                 |
| `weekEndsOn`              | `number`                                                      | `6`                 |
| `customDays`              | `number`                                                      | `3`                 |
| `showAdjacentMonths`      | `boolean`                                                     | `true`              |
| `showWeekNumbers`         | `boolean`                                                     | `false`             |
| `showAllDayRow`           | `boolean`                                                     | `true`              |
| `maxEvents`               | `number`                                                      | `` `auto` ``        |
| `minHour`                 | `number`                                                      | `0`                 |
| `maxHour`                 | `number`                                                      | `24`                |
| `eventOverlapOffset`      | `number`                                                      | `0`                 |
| `showCurrentTime`         | `boolean`                                                     | `false`             |
| `autoScrollToCurrentTime` | `boolean`                                                     | `false`             |
| `resetDateOnViewChange`   | `boolean`                                                     | `false`             |
| `pastYearLength`          | `number`                                                      | `5`                 |
| `futureYearLength`        | `number`                                                      | `5`                 |
| `onDateClick`             | `(date: Date) => void`                                        | `undefined`         |
| `onEventClick`            | `(event: CalendarEvent) => void`                              | `undefined`         |
| `showMorePopover`         | `boolean`                                                     | `true`              |
| `onMoreClick`             | `(date: Date, hiddenEvents?: CalendarEvent[]) => void`        | `undefined`         |
| `onNavigate`              | `(date: Date) => void`                                        | `undefined`         |
| `onViewChange`            | `(view: ECalendarViewType) => void`                           | `undefined`         |
| `onDateRangeChange`       | `(start: Date, end: Date, view: ECalendarViewType) => void`   | `undefined`         |
| `onSlotClick`             | `(startDate: Date, endDate: Date) => void`                    | `undefined`         |
| `renderEvent`             | `(event: CalendarEvent) => ReactNode`                         | `undefined`         |
| `renderHeader`            | `(props: RenderHeaderProps) => ReactNode`                     | `undefined`         |
| `renderHourCell`          | `(date: Date) => ReactNode`                                   | `undefined`         |
| `renderDateCell`          | `(props: RenderDateCellProps) => ReactNode`                   | `undefined`         |
| `renderScheduleSeparator` | `(date: Date) => ReactNode`                                   | `undefined`         |
| `enableEnrichedEvents`    | `boolean`                                                     | `false`             |
| `enrichedEventsByDate`    | `Record<string, CalendarEvent[]>`                             | `undefined`         |
| `eventsAreSorted`         | `boolean`                                                     | `false`             |
| `isEventOrderingEnabled`  | `boolean`                                                     | `true`              |
| `sortedMonthView`         | `boolean \| ((a: CalendarEvent, b: CalendarEvent) => number)` | `true`              |

> `onDateRangeChange`: in Schedule view it also fires when `events` change (the range is the span of the loaded events, so it cannot drive lazy-loading there); with `enableEnrichedEvents` Schedule reports `selectedDate…selectedDate`.

### Types

All types below can be imported from the package, e.g. `import type { RenderHeaderProps, RenderDateCellProps } from "calendar-simple";`.

#### `CalendarEvent`

```typescript
interface CalendarEvent {
  id?: string;
  startDate: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  endDate?: string;
  title: string;
  style?: CSSProperties;
  rrule?: string; // RFC 5545 rule, e.g. "FREQ=WEEKLY;BYDAY=TU"
  exdates?: string[]; // occurrences to skip (dates or exact start times)
  recurringEventId?: string; // set on occurrences: the series id
  occurrenceDate?: string; // set on occurrences: their start
  [key: string]: unknown; // custom metadata fields
}
```

Layout keys in `style` (position, top/right/bottom/left, inset\*, width, height, zIndex) are ignored; colours and other cosmetic keys still apply.

#### `ECalendarViewType` & `EDayType`

```typescript
type ECalendarViewType = "month" | "week" | "day" | "schedule" | "customDays";
type EDayType = "full" | "half";
```

#### `CalendarTheme`

```typescript
interface ThemeStyle {
  color?: string; // Text / foreground color
  bgColor?: string; // Background color
}

interface ThemeScheme {
  default?: ThemeStyle;
  selected?: ThemeStyle;
  today?: ThemeStyle;
}

interface CalendarTheme extends ThemeScheme {
  dark?: ThemeScheme; // Overrides applied only when resolved scheme is "dark"
  light?: ThemeScheme; // Overrides applied only when resolved scheme is "light"
}
```

#### `RenderHeaderProps`

```typescript
interface RenderHeaderProps {
  currentDate: Date;
  view: ECalendarViewType;
  onNavigate: (date: Date) => void;
  onViewChange: (view: ECalendarViewType) => void;
}
```

#### `RenderDateCellProps`

```typescript
interface RenderDateCellProps {
  date: Date;
  isToday: boolean;
  isSelected?: boolean;
  isCurrentMonth?: boolean;
  isTodayAdjacent?: boolean; // today shown in an adjacent-month cell
}
```

#### `CalendarClassNames`

```typescript
interface CalendarClassNames {
  root?: string;
  header?: string;

  // Month view
  table?: string;
  tableHeader?: string;
  tableDate?: string;
  weekNumber?: string;

  // Shared events
  event?: string;
  selected?: string;
  today?: string;

  // Week & Day view
  dayHeader?: string;
  dayName?: string;
  dayNumber?: string;
  timeColumn?: string;
  timeSlot?: string;
  dayColumn?: string;

  // Schedule view
  scheduleDateGroup?: string;
  scheduleDateNumber?: string;
  scheduleDateSubInfo?: string;
  scheduleTime?: string;
  scheduleTitle?: string;
}
```

## Configuration

### Color Scheme

```tsx
// Follow OS preference (default)
<Calendar colorScheme="auto" />

// Force dark mode
<Calendar colorScheme="dark" />

// Force light mode
<Calendar colorScheme="light" />
```

Override individual CSS custom properties for fine-grained control. Override per scheme on the calendar root (`[data-color-scheme="light"]` / `[data-color-scheme="dark"]`, or scope with `classNames.root`); a `:root`-only override is ignored in dark mode. With `weekStartsOn="locale"` the week ends on the day before it unless you pass `weekEndsOn`. With server rendering, Intl data may differ between server and client; pass explicit values if you need identical output. Palette tokens `--cal-on-primary`, `--cal-event-default` and `--cal-surface-raised` follow the same pattern:

```css
[data-color-scheme="dark"] {
  --bg-color: #1a1a1a;
  --text-primary: #ffffff;
  --primary-color: #818cf8;
}
```

### Theme Colors

```tsx
<Calendar
  theme={{
    today: { color: "#007bff", bgColor: "#e6f2ff" },
    selected: { color: "#fff", bgColor: "#007bff" },
  }}
/>
```

### RTL Layout

```tsx
// Auto-detected for Arabic, Hebrew, Farsi, Urdu, and more
<Calendar locale="ar" />

// Manual override
<Calendar direction="rtl" />
```

### Custom CSS Classes

```tsx
<Calendar
  classNames={{
    root: "my-calendar",
    event: "my-event-chip",
    header: "my-header",
  }}
/>
```

> See [FEATURES.md](./FEATURES.md) for the full `classNames` key list and Props Reference.

## Responsive & Mobile

Built-in CSS breakpoints adapt the layout at **768px** (tablet) and **480px** (phone) with no extra configuration. Drop the `width` prop and let the parent container control sizing for breakpoints to activate naturally.

See [FEATURES.md — Responsive Layout](./FEATURES.md#responsive-layout) for the full breakpoint table.

## Changelog

All notable changes are tracked via [GitHub Releases](https://github.com/Jaganath-MSJ/CalendarSimple/releases).

## FAQ

**Why aren't my breakpoints activating?**
CSS breakpoints fire based on _viewport_ width when an explicit `width` prop is passed. Drop the `width` prop and let the parent container control sizing for container-relative behaviour.

**How do I show only work hours (e.g. 9–17)?**
Use `minHour={9}` and `maxHour={17}` to hide hours outside that range in Day and Week views.

**Do I need to install Luxon separately?**
No — Luxon is a direct dependency bundled inside `calendar-simple`.

**How do I pre-populate the selected date?**
Pass a JavaScript `Date` object to the `selectedDate` prop and update it via `onDateClick`.

**Why does RTL not activate when I set `locale="ar"`?**
If you also pass `direction="ltr"` explicitly, that overrides auto-detection. Remove the `direction` prop to allow auto-detection to work.

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository and create a branch from `dev`:
   ```bash
   git checkout -b feat/your-feature-name dev
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the dev environment:**
   ```bash
   npm run storybook   # Component explorer on http://localhost:6006
   npm run test:watch  # Tests in watch mode
   ```
4. **Make your changes** — follow the existing TypeScript and CSS Module patterns.
5. **Add or update tests** — new behaviour must be covered.
6. **Submit a Pull Request** to the `dev` branch with a clear description of the change.

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages (`feat:`, `fix:`, `docs:`, etc.).

## License

This project is licensed under the [MIT License](LICENSE).
