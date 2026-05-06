# Calendar Simple

[![npm version](https://img.shields.io/npm/v/calendar-simple)](https://www.npmjs.com/package/calendar-simple)
[![bundle size](https://img.shields.io/npm/unpacked-size/calendar-simple)](https://www.npmjs.com/package/calendar-simple)
[![npm downloads](https://img.shields.io/npm/dm/calendar-simple)](https://www.npmjs.com/package/calendar-simple)
[![license](https://img.shields.io/npm/l/calendar-simple)](https://github.com/Jaganath-MSJ/CalendarSimple/blob/main/LICENSE)

A lightweight, customizable, and accessible calendar component for React. Built with TypeScript and Luxon.

**[Live Demo](https://calendarsimple.netlify.app)**

## Features

- **🗓️ Multiple Views** — Month, Week, Day, Schedule, and Custom Days views.
- **✨ Event Handling** — Display and manage events with custom styling and arbitrary metadata.
- **📱 Responsive** — Built-in CSS breakpoints at 768px (tablet) and 480px (phone).
- **🎨 Theming & Customization** — Override colors via `theme` and inject CSS classes via `classNames`.
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
  }}
/>
```

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
| `is12Hour`                | `boolean`                                                     | `false`             |
| `colorScheme`             | `'light' \| 'dark' \| 'auto'`                                 | `'auto'`            |
| `direction`               | `'ltr' \| 'rtl'`                                              | `` `auto-detect` `` |
| `locale`                  | `string`                                                      | `'en'`              |
| `localeMessages`          | `object`                                                      | `{}`                |
| `theme`                   | `CalendarTheme`                                               | `{}`                |
| `classNames`              | `CalendarClassNames`                                          | `{}`                |
| `width`                   | `number \| string`                                            | `` `auto` ``        |
| `height`                  | `number \| string`                                            | `` `auto` ``        |
| `dayType`                 | `EDayType`                                                    | `"half"`            |
| `weekStartsOn`            | `number`                                                      | `0`                 |
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
| `onMoreClick`             | `(date: Date, hiddenEvents?: CalendarEvent[]) => void`        | `undefined`         |
| `onNavigate`              | `(date: Date) => void`                                        | `undefined`         |
| `onViewChange`            | `(view: ECalendarViewType) => void`                           | `undefined`         |
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

### Types

#### `CalendarEvent`

```typescript
interface CalendarEvent {
  id?: string;
  startDate: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  endDate?: string;
  title: string;
  style?: CSSProperties;
  [key: string]: unknown; // custom metadata fields
}
```

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

Override individual CSS custom properties for fine-grained control:

```css
[data-color-scheme="dark"] {
  --primary-bg: #1a1a1a;
  --primary-text: #ffffff;
  --accent-color: #818cf8;
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
