# Calendar Simple — Detailed Feature Guide

> **Quick links:** [README](./README.md) · [npm](https://www.npmjs.com/package/calendar-simple) · [Live Demo](https://calendarsimple.netlify.app)

A comprehensive reference for all features in the `calendar-simple` library.

## Table of Contents

- [Multiple Views](#multiple-views)
- [Event Handling](#event-handling)
- [Theming & Customization](#theming--customization)
- [Time Formatting](#time-formatting)
- [Localization](#localization)
- [Right-to-Left (RTL) Support](#right-to-left-rtl-support)
- [Color Schemes & Dark Mode](#color-schemes--dark-mode)
- [Interactive Callbacks](#interactive-callbacks)
- [Responsive Layout](#responsive-layout)
- [Performance Options](#performance-options)
- [Keyboard Navigation & Accessibility](#keyboard-navigation--accessibility)
- [Props Reference](#props-reference)
- [TypeScript Support](#typescript-support)

---

## Multiple Views

Switch between views using the `view` prop (`ECalendarViewType`).

- **Month (`"month"`)** — Traditional month grid. Events stack per day; overflow shows a "+X more" button.
  - `showAdjacentMonths` — Toggle visibility of dates from adjacent months.
  - `showWeekNumbers` — Display ISO week numbers per row.
  - `weekStartsOn` / `weekEndsOn` — Configure which days begin and end the layout.
- **Week (`"week"`)** — 7-column time grid. All-day and multi-day events appear in a top banner.
  - `showAllDayRow={false}` — Pushes all-day events into the time grid as 24-hour blocks.
  - Overlapping events are tiled to prevent collision; use `eventOverlapOffset` for a layered style.
- **Day (`"day"`)** — Single-day time grid. Maximum horizontal space for event details.
- **Custom Days (`"customDays"`)** — Multi-day time grid starting from `selectedDate`. Set the number of days with `customDays`.
- **Schedule (`"schedule"`)** — Chronological event list grouped by date. Optimized for mobile or sidebar use.
  - `renderScheduleSeparator` — Render a custom divider between date groups.

---

## Event Handling

Pass an array of `CalendarEvent` objects to the `events` prop.

- **Required fields** — `startDate` (string) and `title` (string).
- **Optional fields** — `id`, `endDate`, `style` (inline CSS), and any custom metadata via `[key: string]: unknown`.
- **Date-only events** — Use `YYYY-MM-DD` format for full-day events.
- **Timed events** — Use `YYYY-MM-DDTHH:mm:ss` format for specific time blocks.
- **Custom metadata** — Attach any extra fields (database IDs, descriptions, etc.) directly to the event object. These are returned intact in click callbacks.

---

## Theming & Customization

### The `theme` Prop

Quickly override the calendar's core accent colors without touching CSS.

- **`today`** — Style the current real-world date (`color`, `bgColor`).
- **`selected`** — Style the user-selected date.
- **`default`** — Base text and background colors.

### The `classNames` Prop

Inject your own CSS classes (Tailwind, CSS Modules, etc.) into specific DOM elements. Available keys:

`root`, `header`, `table`, `tableHeader`, `tableDate`, `weekNumber`, `event`, `selected`, `today`, `dayHeader`, `dayName`, `dayNumber`, `timeColumn`, `timeSlot`, `dayColumn`, `scheduleDateGroup`, `scheduleDateNumber`, `scheduleDateSubInfo`, `scheduleTime`, `scheduleTitle`

### Custom Renderers

Replace core UI elements entirely with render props.

- **`renderEvent(event)`** — Replaces the default event chip across all views.
- **`renderHeader(props)`** — Replaces the default navigation header. Receives `currentDate`, `view`, `onNavigate`, `onViewChange`.
- **`renderHourCell(date)`** — Customizes background hour slots in Day, Week, and Custom Days views.
- **`renderDateCell(props)`** — Customizes date headers (Week/Day) and date cells (Month). Receives `date`, `isToday`, `isSelected`, `isCurrentMonth`.
- **`renderScheduleSeparator(date)`** — Renders a custom separator between date groups in Schedule view.

---

## Time Formatting

- **`is12Hour`** — Switch all time displays to 12-hour AM/PM format (default: 24-hour).
- **`dayType`** — Day name format: `"full"` (Monday) or `"half"` (Mon).
- **`minHour` / `maxHour`** — Constrain the visible time range (0–24) in Day and Week views.
- **`showCurrentTime`** — Display a line at the current time in Day and Week views.
- **`autoScrollToCurrentTime`** — Automatically scroll to the current time line on load.

---

## Localization

The calendar uses Luxon internally for all date formatting.

- **`locale`** — Any valid Luxon locale string (e.g., `"fr"`, `"es-MX"`, `"zh"`, `"ar"`). All month names, day headers, and date strings adapt automatically.
- **`localeMessages`** — Translate built-in UI labels that aren't date-derived.

  Supported keys: `today`, `day`, `week`, `month`, `schedule`, `days`.

  ```tsx
  localeMessages={{ today: "Hoy", schedule: "Agenda" }}
  ```

- **`weekStartsOn`** — Set the first day of the week (0 = Sunday, 1 = Monday, etc.). Not inferred from `locale` — explicit control is intentional.
- **`is12Hour`** — When combined with a locale, time designators render in the appropriate regional format.

---

## Right-to-Left (RTL) Support

- **Auto-detection** — RTL layout activates automatically for: `ar`, `he`, `fa`, `ur`, `ps`, `sd`, `ckb`, `yi` locales.
- **Manual control** — Override with `direction="rtl"` or `direction="ltr"`.
- **CSS logical properties** — All layout uses `inset-inline-start`, `margin-inline-end`, etc., so the layout flips without separate stylesheets.
- **Full layout flip** — Navigation buttons, date pickers, event placement, and text alignment all adapt to RTL.

---

## Color Schemes & Dark Mode

- **`colorScheme="auto"`** (default) — Detects OS preference via `prefers-color-scheme` and updates live when the user toggles their system theme.
- **`colorScheme="light"`** — Forces the light palette.
- **`colorScheme="dark"`** — Forces the dark palette.

Palettes are implemented as CSS custom properties. The light palette is the `:root` default; the dark palette re-assigns those variables under `[data-color-scheme="dark"]` (the attribute the library sets on the calendar root). Override individual variables for custom theming:

```css
/* Customize the dark palette */
[data-color-scheme="dark"] {
  --bg-color: #1a1a1a;
  --text-primary: #ffffff;
  --primary-color: #818cf8;
}

/* Customize the light palette (the :root default) */
:root {
  --bg-color: #ffffff;
  --text-primary: #000000;
  --primary-color: #2563eb;
}
```

The `theme` prop (inline per-element colors) takes final precedence over color scheme variables. No extra configuration or additional CSS imports are needed.

---

## Interactive Callbacks

- **`onDateClick(date)`** — Fired when an empty cell or day header is clicked. Use to update selected date or open an "Add Event" modal.
- **`onEventClick(event)`** — Fired when an event chip is clicked. Use to open event detail or edit screens.
- **`onViewChange(view)`** — Fired when the user switches views via the header tabs.
  - `resetDateOnViewChange={true}` — Snaps the calendar back to today on each view switch.
- **`onNavigate(date)`** — Fired when the user navigates forward/backward or uses the month/year dropdowns.
- **`onMoreClick(date, hiddenEvents)`** — Fired when the "+X more" indicator is clicked in Month view. Returns the date and the array of overflowed events.
- **`creatable` + `onSlotClick(startDate, endDate)`** — Enable slot-click creation intent.
  - In time-grid views: fires with `hour:00` → `hour+1:00`.
  - In Month view: fires with `startOfDay` → `endOfDay`.
  - Clicking an existing event still fires `onEventClick` — slot clicks do not bubble through events.
  - `creatable` and `selectable` can be used together.

---

## Responsive Layout

The calendar has two layers of responsive behavior.

### Container-width adaptation

When no `width` or `height` props are provided, a `ResizeObserver` monitors the wrapper and feeds pixel dimensions back into the layout engine. Events, columns, and multi-day chips recalculate automatically as the container resizes.

### CSS media-query breakpoints

**768px — Tablet**

| Area              | What changes                                               |
| ----------------- | ---------------------------------------------------------- |
| Header            | Controls collapse into two rows; smaller font and padding  |
| Month             | Day-name header row shrinks to 30px; cell padding tightens |
| Month events      | Chip height reduces to 1.25rem; font shrinks to 0.6875rem  |
| Week / CustomDays | Columns fix to 100px wide, enabling horizontal scroll      |
| Day               | Day-number font reduces from 20px to 16px                  |

**480px — Phone**

| Area              | What changes                                                           |
| ----------------- | ---------------------------------------------------------------------- |
| Month events      | Chips become 6px colored dot-bars (no text, no "+N more")              |
| Week / CustomDays | Each column expands to `calc(100vw − 90px)` — one day fills the screen |
| Schedule          | Padding halves; time column narrows from 140px to 100px; fonts reduce  |

### Usage tip

Drop the `width` prop and let the parent container control sizing for breakpoints to activate naturally:

```tsx
<div style={{ width: "100%", height: "600px" }}>
  <Calendar events={events} />
</div>
```

---

## Performance Options

Use these when rendering thousands of events simultaneously.

- **`enableEnrichedEvents` + `enrichedEventsByDate`** — Pass a pre-mapped `Record<string, CalendarEvent[]>` for O(1) day-rendering lookups instead of filtering a flat array.
- **`eventsAreSorted`** — Skip the initial sort when your input `events` are already ordered.
- **`isEventOrderingEnabled={false}`** — Bypass sweep-line collision detection and Tetris overlap resolution entirely. Events render linearly — fastest path for massive payloads at the cost of visual collision spacing.
- **`sortedMonthView`** — Enforce a custom priority / sort function for Month view Tetris slot allocation, or disable it entirely.

---

## Keyboard Navigation & Accessibility

### Keyboard Navigation

- **Enter & Space** — Activate any interactive element (buttons, date cells, events).
- **Tab / Shift+Tab** — Move focus forward and backward through interactive elements in standard tab order.
- **Popover focus trap** — When a popover opens, Tab cycles within it; the last item wraps back to the first.
- **Escape** — Close open popovers; focus returns to the triggering element.
- **Focus indicators** — All keyboard-navigable elements show a visible `2px solid #005fcc` outline.

### ARIA & Semantic HTML

- Interactive non-button elements carry `role="button"`.
- Popover dialogs use `role="dialog"` with `aria-modal="true"`.
- All interactive elements have descriptive `aria-label` attributes.
- Major view containers are marked with `role="region"` and `aria-label`.
- Expandable elements use `aria-expanded` to communicate state.
- The Month view table uses `scope="col"` on headers.
- The header is a `<nav>` with `aria-label="Calendar navigation"`.

All accessibility features are built-in and require no extra configuration.

---

## Props Reference

### Core & Navigation

| Prop               | Type                | Default     | Description                                                              |
| ------------------ | ------------------- | ----------- | ------------------------------------------------------------------------ |
| `events`           | `CalendarEvent[]`   | `[]`        | Array of event objects to display.                                       |
| `selectedDate`     | `Date`              | `undefined` | The currently selected date.                                             |
| `view`             | `ECalendarViewType` | `"month"`   | Active view: `month`, `week`, `day`, `schedule`, or `customDays`.        |
| `testId`           | `string`            | `undefined` | `data-testid` attribute placed on the root element for testing.          |
| `isLoading`        | `boolean`           | `undefined` | When `true`, renders the loading indicator instead of the calendar body. |
| `customDays`       | `number`            | `3`         | Number of days shown in the `customDays` view.                           |
| `weekStartsOn`     | `number`            | `0`         | First day of the week (0 = Sunday, 1 = Monday, …).                       |
| `weekEndsOn`       | `number`            | `6`         | Last day of the week.                                                    |
| `pastYearLength`   | `number`            | `5`         | Number of past years in the year dropdown.                               |
| `futureYearLength` | `number`            | `5`         | Number of future years in the year dropdown.                             |

### Views & Layout

| Prop                 | Type               | Default | Description                                                    |
| -------------------- | ------------------ | ------- | -------------------------------------------------------------- |
| `showAdjacentMonths` | `boolean`          | `true`  | Show dates from adjacent months in the month grid.             |
| `showWeekNumbers`    | `boolean`          | `false` | Display ISO week numbers in the month view.                    |
| `showAllDayRow`      | `boolean`          | `true`  | Show the all-day event row at the top of Day/Week views.       |
| `maxEvents`          | `number`           | auto    | Max events per day cell before collapsing to "+X more".        |
| `minHour`            | `number`           | `0`     | Minimum hour visible in Day/Week time grids.                   |
| `maxHour`            | `number`           | `24`    | Maximum hour visible in Day/Week time grids.                   |
| `eventOverlapOffset` | `number`           | `0`     | Percentage offset for stacking overlapping events (0 = tiled). |
| `width`              | `number \| string` | auto    | Width of the calendar container.                               |
| `height`             | `number \| string` | auto    | Height of the calendar container.                              |

### Time & Formatting

| Prop                      | Type       | Default  | Description                                            |
| ------------------------- | ---------- | -------- | ------------------------------------------------------ |
| `is12Hour`                | `boolean`  | `false`  | Display time in 12-hour AM/PM format.                  |
| `dayType`                 | `EDayType` | `"half"` | Day name format: `"full"` (Monday) or `"half"` (Mon).  |
| `showCurrentTime`         | `boolean`  | `false`  | Show a line at the current time in Day and Week views. |
| `autoScrollToCurrentTime` | `boolean`  | `false`  | Scroll to the current time line on initial load.       |

### Appearance

| Prop          | Type                          | Default             | Description                                                     |
| ------------- | ----------------------------- | ------------------- | --------------------------------------------------------------- |
| `theme`       | `CalendarTheme`               | `{}`                | Color overrides for `today`, `selected`, and `default` states.  |
| `classNames`  | `CalendarClassNames`          | `{}`                | Custom CSS classes for specific internal elements.              |
| `colorScheme` | `'light' \| 'dark' \| 'auto'` | `'auto'`            | Color palette. `'auto'` follows OS preference and updates live. |
| `direction`   | `'ltr' \| 'rtl'`              | `` `auto-detect` `` | Layout direction. Auto-detected from RTL locales if omitted.    |

### Localization

| Prop             | Type     | Default | Description                                                            |
| ---------------- | -------- | ------- | ---------------------------------------------------------------------- |
| `locale`         | `string` | `'en'`  | Luxon locale code (e.g., `'fr'`, `'ar'`, `'ja-JP'`).                   |
| `localeMessages` | `object` | `{}`    | Translations for: `today`, `day`, `week`, `month`, `schedule`, `days`. |

### Interaction & Callbacks

| Prop                    | Type                                                   | Default     | Description                                                        |
| ----------------------- | ------------------------------------------------------ | ----------- | ------------------------------------------------------------------ |
| `selectable`            | `boolean`                                              | `false`     | Enable visual selection state on date click.                       |
| `creatable`             | `boolean`                                              | `false`     | Enable slot-click creation intent (pointer cursor on empty slots). |
| `resetDateOnViewChange` | `boolean`                                              | `false`     | Snap calendar to today when the user switches views.               |
| `onDateClick`           | `(date: Date) => void`                                 | `undefined` | Fired when an empty cell or day header is clicked.                 |
| `onEventClick`          | `(event: CalendarEvent) => void`                       | `undefined` | Fired when an event is clicked.                                    |
| `onMoreClick`           | `(date: Date, hiddenEvents?: CalendarEvent[]) => void` | `undefined` | Fired when "+X more" is clicked in Month view.                     |
| `onNavigate`            | `(date: Date) => void`                                 | `undefined` | Fired when navigating forward/backward or via dropdowns.           |
| `onViewChange`          | `(view: ECalendarViewType) => void`                    | `undefined` | Fired when the view is changed via the header.                     |
| `onSlotClick`           | `(startDate: Date, endDate: Date) => void`             | `undefined` | Fired when an empty slot is clicked (requires `creatable`).        |

### Custom Renderers

| Prop                      | Type                                        | Default     | Description                                                                       |
| ------------------------- | ------------------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| `renderLoading`           | `() => ReactNode`                           | `undefined` | Custom loading indicator renderer. Falls back to a built-in spinner when omitted. |
| `renderEvent`             | `(event: CalendarEvent) => ReactNode`       | `undefined` | Replace the default event chip across all views.                                  |
| `renderHeader`            | `(props: RenderHeaderProps) => ReactNode`   | `undefined` | Replace the default navigation header.                                            |
| `renderHourCell`          | `(date: Date) => ReactNode`                 | `undefined` | Customize hour slots in Day/Week/CustomDays views.                                |
| `renderDateCell`          | `(props: RenderDateCellProps) => ReactNode` | `undefined` | Customize date headers (Week/Day) and date cells (Month).                         |
| `renderScheduleSeparator` | `(date: Date) => ReactNode`                 | `undefined` | Render a custom separator between date groups in Schedule view.                   |

### Performance

| Prop                     | Type                                                          | Default     | Description                                                     |
| ------------------------ | ------------------------------------------------------------- | ----------- | --------------------------------------------------------------- |
| `enableEnrichedEvents`   | `boolean`                                                     | `false`     | Enable O(1) dictionary lookups instead of filtering all events. |
| `enrichedEventsByDate`   | `Record<string, CalendarEvent[]>`                             | `undefined` | Pre-mapped event payload used with `enableEnrichedEvents`.      |
| `eventsAreSorted`        | `boolean`                                                     | `false`     | Skip sorting when input events are already ordered.             |
| `isEventOrderingEnabled` | `boolean`                                                     | `true`      | Enable collision/overlap resolution (Tetris slot-stacking).     |
| `sortedMonthView`        | `boolean \| ((a: CalendarEvent, b: CalendarEvent) => number)` | `true`      | Sort or customize priority for Month view Tetris allocation.    |

---

## TypeScript Support

`calendar-simple` is written in TypeScript. All props, callback payloads, and internal data structures are exported for full IDE intellisense and compile-time safety.
