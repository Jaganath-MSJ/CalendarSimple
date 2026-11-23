# Calendar Simple — Detailed Feature Guide

> **Quick links:** [README](./README.md) · [npm](https://www.npmjs.com/package/calendar-simple) · [Live Demo](https://jaganath-msj.github.io/CalendarSimple/)

A comprehensive reference for all features in the `calendar-simple` library.

## Table of Contents

- [Multiple Views](#multiple-views)
- [Event Handling](#event-handling)
- [Recurring Events](#recurring-events)
- [Drag & Resize](#drag--resize)
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
- **Week (`"week"`)** — 7-column time grid. All-day events appear in a top banner, as do multi-day timed events on each day they cover for 12 hours or more. Single-day timed events always stay in the grid, however long they are.
  - `showAllDayRow={false}` — Pushes all-day events into the time grid as 24-hour blocks.
  - Overlapping events are tiled to prevent collision; use `eventOverlapOffset` for a layered style.
- **Day (`"day"`)** — Single-day time grid. Maximum horizontal space for event details.
- **Custom Days (`"customDays"`)** — Multi-day time grid starting from `selectedDate`. Set the number of days with `customDays`.
- **Schedule (`"schedule"`)** — Chronological event list grouped by date. Optimized for mobile or sidebar use.
  - No Prev/Next in Schedule view; Today and the month/year pickers scroll the full list to the chosen date.
  - Code that dispatches `CALENDAR_ACTIONS.NEXT`/`PREV` via `useCalendar()` does nothing in Schedule view; use `SET_DATE` or `onNavigate(date)`.
  - `renderScheduleSeparator` — Render a custom divider between date groups.
  - Multi-day events repeat on each day they cover with a "(Day X/Y)" suffix, counted in calendar days. A timed event ending at exactly 00:00 finishes on the previous day, so it never adds an entry for the day it ends on.

---

## Event Handling

Pass an array of `CalendarEvent` objects to the `events` prop.

- **Required fields** — `startDate` (string) and `title` (string).
- **Optional fields** — `id`, `endDate`, `style` (inline CSS), and any custom metadata via `[key: string]: unknown`. Layout keys in `style` (position, top/right/bottom/left, inset\*, width, height, zIndex) are ignored; colours and other cosmetic keys still apply.
- **Date-only events** — Use `YYYY-MM-DD` format for full-day events.
- **Timed events** — Use `YYYY-MM-DDTHH:mm:ss` format for specific time blocks.
- **Custom metadata** — Attach any extra fields (database IDs, descriptions, etc.) directly to the event object. These are returned intact in click callbacks.

---

## Recurring Events

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
- **Expansion window** — Occurrences are generated around the visible range: two months either side, widened to whole quarters. In Schedule view, which lists every event, series are expanded from two months before `selectedDate` to 12 months after it, widened to whole quarters; every series (endless or not) is cut there, as in calendar-simple-native, while non-recurring events are all listed as usual. `onDateRangeChange` in Schedule reports the span of what is listed, occurrences included.
- **Limits** — At most 1000 occurrences per event per window; the rest are dropped with a warning.
- **Ids** — Give recurring events an `id`; without one, occurrence ids fall back to the start date and two id-less series with the same start would collide.
- **Editing** — Occurrences carry the series' `rrule`; to edit, update the series (via `recurringEventId`), not the occurrence.
- **Time zones** — Times are held in the viewer's local zone: a series given with `Z`/offset repeats at the same local clock time.
- **Weekly intervals** — Weekly `INTERVAL > 1` grouping follows the rule's `WKST` (default Monday, RFC 5545), not the calendar's `weekStartsOn`.
- **Not expanded with `enableEnrichedEvents`** — pre-enriched events are used as given.
- Events without `rrule` are unchanged.

---

## Drag & Resize

Turn on `draggable` (and `resizable` for time grids) and handle the callbacks. **The calendar never changes `events` itself:** apply the new times in your state and pass the updated `events` back.

```tsx
// toIso(date, allDay): your own Date → "yyyy-MM-dd" or "yyyy-MM-ddTHH:mm:ss"
const [events, setEvents] = useState(initialEvents);

<Calendar
  events={events}
  draggable
  resizable
  onEventDrop={({ event, start, end, allDay }) =>
    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id
          ? {
              ...e,
              startDate: toIso(start, allDay),
              endDate: toIso(end, allDay),
            }
          : e,
      ),
    )
  }
  onEventResize={({ event, start, end }) =>
    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id
          ? { ...e, startDate: toIso(start, false), endDate: toIso(end, false) }
          : e,
      ),
    )
  }
/>;
```

| Prop                              | Type                                              | Default      | Description                                                                                            |
| --------------------------------- | ------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| `draggable`                       | `boolean \| (event) => boolean`                   | `undefined`  | Events that can be moved. Needs `onEventDrop`.                                                         |
| `onEventDrop`                     | `(info: EventDropInfo) => void`                   | `undefined`  | `{ event, start: Date, end: Date, allDay, view }` after a move.                                        |
| `dragSnapMinutes`                 | `number`                                          | `15`         | Snap for moves in Day, Week and Custom Days.                                                           |
| `resizable`                       | `boolean \| (event) => boolean`                   | `undefined`  | Timed events that can be resized from the top or bottom edge (time grids). Needs `onEventResize`.      |
| `onEventResize`                   | `(info: EventResizeInfo) => void`                 | `undefined`  | `{ event, start: Date, end: Date, edge: "top" \| "bottom", view }` after a resize.                     |
| `resizeSnapMinutes`               | `number`                                          | `15`         | Snap for resize edges.                                                                                 |
| `minEventDurationMinutes`         | `number`                                          | `15`         | Shortest length a resize can leave.                                                                    |
| `keyboardNavigation`              | `boolean`                                         | `true`       | Arrow-key day / period navigation (see Keyboard Navigation).                                           |
| `swipeNavigation`                 | `boolean`                                         | `false`      | Touch swipe left / right turns the period (Month and time grids).                                      |
| `hourHeight`                      | `number`                                          | `60`         | Pixels per hour in the time grids; control it with `onHourHeightChange`.                               |
| `minHourHeight` / `maxHourHeight` | `number`                                          | `30` / `180` | Zoom limits for `pinchToZoom`.                                                                         |
| `pinchToZoom`                     | `boolean`                                         | `false`      | Ctrl/⌘ + wheel (and trackpad pinch where the browser reports it as Ctrl + wheel) zooms the time grids. |
| `onHourHeightChange`              | `(hourHeight: number) => void`                    | `undefined`  | A zoom gesture ended at a new hour height.                                                             |
| `palette`                         | `{ light?, dark? }` of `Partial<CalendarPalette>` | `undefined`  | calendar-simple-native palette keys, written as CSS custom properties.                                 |
| `testID`                          | `string`                                          | `undefined`  | Alias of `testId` (calendar-simple-native name).                                                       |

- **Where** — Day, Week and Custom Days: x moves days, y moves time (snapped). Month: x moves days, y moves whole weeks; times are kept. All-day row: x moves days. Schedule has no drag.
- **Pointer** — Mouse and pen start after a 4 px move, touch after a 300 ms hold. A press without a move is still a click (`onEventClick`); the click after a drag is not sent. Escape (or a cancelled pointer) puts the event back without a callback, and that Escape does not reach other handlers such as an open popover.
- **Bounds** — An event within one day stays inside `minHour`–`maxHour` when moved or resized, and a resize never leaves less than `minEventDurationMinutes`. Events that run past midnight are moved as they are. Resize edges appear on hover/focus on the first and last day of an event, and not on items shorter than 24 px (use Alt+Shift+↑/↓ there).
- **Wall clock** — Times move by the clock shown in the grid, so on a daylight-saving day 10:00 moved one hour lands on 11:00.
- **RTL** — On screen directions are mirrored: dragging right (or Alt+→) moves to the previous day.
- **Keyboard** — On a focused event: Alt+↑/↓ moves by `dragSnapMinutes` (in Month, by a week), Alt+←/→ moves a day, Alt+Shift+↑/↓ moves the end by `resizeSnapMinutes`. The keys are listed in `aria-keyshortcuts`, and focus stays on the moved event once you update `events`.
- **Recurring events** — You receive the occurrence (`recurringEventId` set). Decide in your handler whether to move the series or just that day (for example add an `exdate` and a one-off event).
- **All-day events in the time grid** — With `showAllDayRow={false}`, all-day events drawn in the grid move by whole days only (`allDay: true`) and cannot be resized.
- **Not supported** — Turning a timed event into an all-day one (or back), and dragging in Schedule.

---

## Theming & Customization

### The `theme` Prop

Quickly override the calendar's core accent colors without touching CSS.

- **`today`** — Style the current real-world date (`color`, `bgColor`).
- **`selected`** — Style the user-selected date.
- **`default`** — Base text and background colors.

The selected day is drawn as an outlined circle (transparent fill, `--primary-color` ring). `theme.selected` (`bgColor` / `color`) colours the whole day cell, not the date label. When a cell is both today and selected, the date label shows the filled today style while `theme.selected` (if set) colours the cell. To get the old filled label back, set `--cal-selected-fill: var(--primary-color); --cal-selected-text: var(--cal-on-primary);` on the calendar root, per colour scheme.

### Palette Tokens

Defined in `src/styles/variables.css` (swapped by `data-color-scheme`) and overridable per scheme from your own CSS (see below):

| Token                  | Light     | Dark      | Used for                                                                    |
| ---------------------- | --------- | --------- | --------------------------------------------------------------------------- |
| `--cal-on-primary`     | `#ffffff` | `#111827` | Text on `--primary-color` fills (today marker, month events, popover items) |
| `--cal-event-default`  | `#3b82f6` | `#3b82f6` | Background of events with no color                                          |
| `--cal-surface-raised` | `#ffffff` | `#374151` | Popover background                                                          |
| `--cal-selected-fill`  | unset     | unset     | Optional: selected date label fill (default transparent)                    |
| `--cal-selected-text`  | unset     | unset     | Optional: selected date label text (default `--primary-color`)              |

An unscoped `[data-color-scheme="dark"]` override has the same specificity as the library's own rule, so it must load after the library CSS (or use the scoped `.myCal[data-color-scheme="dark"]` form with `classNames.root`).

Overriding `--cal-event-default` does not recompute the event text color (it is derived from the default hex), so pick a color with similar contrast or set `style.color`.

Override the tokens on the calendar root, once per scheme:

```css
[data-color-scheme="light"] {
  --cal-event-default: #0ea5e9;
}
[data-color-scheme="dark"] {
  --cal-event-default: #38bdf8;
}
```

To scope this to one calendar, pass `classNames.root` and use `.myCal[data-color-scheme="dark"] { ... }`. An override on `:root`, `body` or a wrapper alone is ignored in dark mode, because the `[data-color-scheme="dark"]` block redefines the tokens on the calendar root itself, closer than any ancestor.

### The `classNames` Prop

Inject your own CSS classes (Tailwind, CSS Modules, etc.) into specific DOM elements. Available keys:

`root`, `header`, `table`, `tableHeader`, `tableDate`, `weekNumber`, `event`, `selected`, `today`, `dayHeader`, `dayName`, `dayNumber`, `timeColumn`, `timeSlot`, `dayColumn`, `scheduleDateGroup`, `scheduleDateNumber`, `scheduleDateSubInfo`, `scheduleTime`, `scheduleTitle`

### Custom Renderers

Replace core UI elements entirely with render props.

- **`renderEvent(event)`** — Replaces the default event chip across all views.
- **`renderHeader(props)`** — Replaces the default navigation header. Receives `currentDate`, `view`, `onNavigate`, `onViewChange`.
- **`renderHourCell(date)`** — Customizes background hour slots in Day, Week, and Custom Days views. Receives each slot's start time on that column's own date, so you can style per day (e.g. shade weekends).
- **`renderDateCell(props)`** — Customizes date headers (Week/Day) and date cells (Month). Receives `date`, `isToday`, `isSelected`, `isCurrentMonth`, `isTodayAdjacent` (today shown in an adjacent-month cell).
- **`renderScheduleSeparator(date)`** — Renders a custom separator between date groups in Schedule view.

---

## Time Formatting

- **Server rendering** — Intl data may differ between server and client; pass explicit values (`weekStartsOn`, `is12Hour`) if you need identical output.
- **`is12Hour`** — Switch all time displays to 12-hour AM/PM format (default: 24-hour).
- **`dayType`** — Day name format: `"full"` (Monday) or `"half"` (Mon).
- **`minHour` / `maxHour`** — Constrain the visible time range (0–24) in Day and Week views.
- **`showCurrentTime`** — Display a line at the current time in Day and Week views.
- **`autoScrollToCurrentTime`** — Automatically scroll to the current time line on load.

---

## Localization

The calendar uses Luxon internally for all date formatting.

- **`locale`** — Any valid Luxon locale string (e.g., `"fr"`, `"es-MX"`, `"zh"`, `"ar"`). All month names, day headers, and date strings adapt automatically, including event times, tooltips, popover headings and slot labels.
- **`localeMessages`** — Translate built-in UI labels that aren't date-derived.

  Plain strings: `today`, `day`, `week`, `month`, `schedule`, `days`, `allDay`, `until`, `noEvents`, `noTitle` (aria-label for untitled events), `previous`, `next`, `selectView`, `selectMonth`, `selectYear`, `calendarNavigation`, `allDayEvents`, `expandAllDay`, `collapseAllDay`, `weekView`, `dayView`, `scheduleView`.

  Functions: `nDaysView(n)`, `more(n)`, `moreAllDay(n)`, `moreEventsOn(n, date)`, `dayOfTotal(i, n)`, `eventsOn(date)`, `createEventAt(time, date)`, `weekNumber(n)` (week-title suffix, default `W45`).

  Keys you leave out (or set to `undefined`) use the English default; an empty string is used as given.

  ```tsx
  localeMessages={{ today: "Hoy", schedule: "Agenda" }}
  ```

- **`weekStartsOn`** — Set the first day of the week (0 = Sunday, 1 = Monday, etc.). Pass `"locale"` to use the `locale`'s first day (Intl week info, then the CLDR region table); the default stays `0`. With `"locale"` the week ends on the day before it starts unless you pass `weekEndsOn`.
- **`is12Hour`** — Pass `"locale"` to follow the `locale`'s 12/24-hour convention (default `false`); time designators render in the appropriate regional format.

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

/* Customize the light palette */
[data-color-scheme="light"] {
  --bg-color: #ffffff;
  --text-primary: #000000;
  --primary-color: #7c3aed;
}
```

The default light primary is `#2563eb` (hover `#1d4ed8`), matching calendar-simple-native; white text on it meets WCAG AA (5.17:1).

The `theme` prop (inline per-element colors) takes final precedence over color scheme variables. No extra configuration or additional CSS imports are needed.

---

## Interactive Callbacks

- **`onDateClick(date)`** — Fired when an empty cell or day header is clicked. Use to update selected date or open an "Add Event" modal.
- **`onEventClick(event)`** — Fired when an event chip is clicked. Use to open event detail or edit screens.
- **`onViewChange(view)`** — Fired when the user switches views via the header tabs.
  - `resetDateOnViewChange={true}` — Snaps the calendar back to today on each view switch.
- **`onDateRangeChange(start, end, view)`** — Visible range (inclusive, start of day) for lazy-loading events. Fires on mount, navigation and view change; debounced 16 ms; Schedule reports the span of all events. In Schedule it also fires when `events` change (so it can't drive lazy-loading there); with `enableEnrichedEvents` it reports `selectedDate…selectedDate`.
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

- **`enableEnrichedEvents` + `enrichedEventsByDate`** — Pass a pre-mapped `Record<string, CalendarEvent[]>` for O(1) day-rendering lookups instead of filtering a flat array. Recurring events (`rrule`) are not expanded in this mode.
- **`eventsAreSorted`** — Skip the initial sort when your input `events` are already ordered.
- **`isEventOrderingEnabled={false}`** — Bypass sweep-line collision detection and Tetris overlap resolution entirely. Events render linearly — fastest path for massive payloads at the cost of visual collision spacing.
- **`sortedMonthView`** — Enforce a custom priority / sort function for Month view Tetris slot allocation, or disable it entirely.

---

## Keyboard Navigation & Accessibility

### Keyboard Navigation

- **Arrow keys (`keyboardNavigation`, default on)** — Month: one tab stop; ← → ↑ ↓, Home / End, PageUp / PageDown (Shift: a year) and T move between days, crossing months. Day / Week / Custom Days: PageUp / PageDown and ← / → turn the period, T goes to today. Schedule: ↑ / ↓ between rows, T today. Mirrored in RTL; ignored with Ctrl / ⌘ / Alt and inside inputs.
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

| Prop               | Type                 | Default     | Description                                                              |
| ------------------ | -------------------- | ----------- | ------------------------------------------------------------------------ |
| `events`           | `CalendarEvent[]`    | `[]`        | Array of event objects to display.                                       |
| `selectedDate`     | `Date`               | `undefined` | The currently selected date.                                             |
| `view`             | `ECalendarViewType`  | `"month"`   | Active view: `month`, `week`, `day`, `schedule`, or `customDays`.        |
| `testId`           | `string`             | `undefined` | `data-testid` attribute placed on the root element for testing.          |
| `isLoading`        | `boolean`            | `undefined` | When `true`, renders the loading indicator instead of the calendar body. |
| `customDays`       | `number`             | `3`         | Number of days shown in the `customDays` view.                           |
| `weekStartsOn`     | `number \| "locale"` | `0`         | First day of the week (0 = Sunday, 1 = Monday, …) or `"locale"`.         |
| `weekEndsOn`       | `number`             | `6`         | Last day of the week.                                                    |
| `pastYearLength`   | `number`             | `5`         | Number of past years in the year dropdown.                               |
| `futureYearLength` | `number`             | `5`         | Number of future years in the year dropdown.                             |

### Views & Layout

| Prop                 | Type               | Default | Description                                                                 |
| -------------------- | ------------------ | ------- | --------------------------------------------------------------------------- |
| `showAdjacentMonths` | `boolean`          | `true`  | Show dates from adjacent months in the month grid.                          |
| `showWeekNumbers`    | `boolean`          | `false` | Display ISO week numbers in the month view.                                 |
| `showAllDayRow`      | `boolean`          | `true`  | Show the all-day event row at the top of Day/Week views.                    |
| `maxEvents`          | `number`           | auto    | Max events per day cell before collapsing to "+X more".                     |
| `showMorePopover`    | `boolean`          | `true`  | Open the built-in popover on "+X more"; `false` leaves it to `onMoreClick`. |
| `minHour`            | `number`           | `0`     | Minimum hour visible in Day/Week time grids.                                |
| `maxHour`            | `number`           | `24`    | Maximum hour visible in Day/Week time grids.                                |
| `eventOverlapOffset` | `number`           | `0`     | Percentage offset for stacking overlapping events (0 = tiled).              |
| `width`              | `number \| string` | auto    | Width of the calendar container.                                            |
| `height`             | `number \| string` | auto    | Height of the calendar container.                                           |

### Time & Formatting

| Prop                      | Type                  | Default  | Description                                                               |
| ------------------------- | --------------------- | -------- | ------------------------------------------------------------------------- |
| `is12Hour`                | `boolean \| "locale"` | `false`  | Display time in 12-hour AM/PM format, or `"locale"` to follow the locale. |
| `dayType`                 | `EDayType`            | `"half"` | Day name format: `"full"` (Monday) or `"half"` (Mon).                     |
| `showCurrentTime`         | `boolean`             | `false`  | Show a line at the current time in Day and Week views.                    |
| `autoScrollToCurrentTime` | `boolean`             | `false`  | Scroll to the current time line on initial load.                          |

### Appearance

| Prop          | Type                          | Default             | Description                                                     |
| ------------- | ----------------------------- | ------------------- | --------------------------------------------------------------- |
| `theme`       | `CalendarTheme`               | `{}`                | Color overrides for `today`, `selected`, and `default` states.  |
| `classNames`  | `CalendarClassNames`          | `{}`                | Custom CSS classes for specific internal elements.              |
| `colorScheme` | `'light' \| 'dark' \| 'auto'` | `'auto'`            | Color palette. `'auto'` follows OS preference and updates live. |
| `direction`   | `'ltr' \| 'rtl'`              | `` `auto-detect` `` | Layout direction. Auto-detected from RTL locales if omitted.    |

### Localization

| Prop             | Type                        | Default | Description                                                      |
| ---------------- | --------------------------- | ------- | ---------------------------------------------------------------- |
| `locale`         | `string`                    | `'en'`  | Luxon locale code (e.g., `'fr'`, `'ar'`, `'ja-JP'`).             |
| `localeMessages` | `Partial<CalendarMessages>` | `{}`    | Partial map of built-in UI strings (see `localeMessages` above). |

### Interaction & Callbacks

| Prop                      | Type                                                        | Default     | Description                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selectable`              | `boolean`                                                   | `false`     | Enable visual selection state on date click.                                                                                                                      |
| `creatable`               | `boolean`                                                   | `false`     | Enable slot-click creation intent (pointer cursor on empty slots).                                                                                                |
| `resetDateOnViewChange`   | `boolean`                                                   | `false`     | Snap calendar to today when the user switches views.                                                                                                              |
| `onDateClick`             | `(date: Date) => void`                                      | `undefined` | Fired when an empty cell or day header is clicked.                                                                                                                |
| `onEventClick`            | `(event: CalendarEvent) => void`                            | `undefined` | Fired when an event is clicked.                                                                                                                                   |
| `onMoreClick`             | `(date: Date, hiddenEvents: CalendarEvent[]) => void`       | `undefined` | Fired when "+X more" is clicked in Month view.                                                                                                                    |
| `onNavigate`              | `(date: Date) => void`                                      | `undefined` | Fired when navigating forward/backward or via dropdowns.                                                                                                          |
| `onViewChange`            | `(view: ECalendarViewType) => void`                         | `undefined` | Fired when the view is changed via the header.                                                                                                                    |
| `onDateRangeChange`       | `(start: Date, end: Date, view: ECalendarViewType) => void` | `undefined` | Visible range on mount, navigation and view change (debounced 16 ms). Schedule: also fires on `events` change; enriched mode reports `selectedDate…selectedDate`. |
| `onSlotClick`             | `(startDate: Date, endDate: Date) => void`                  | `undefined` | Fired when an empty slot is clicked (requires `creatable`).                                                                                                       |
| `draggable`               | `boolean \| (event) => boolean`                             | `undefined` | Events that can be moved by pointer or Alt+arrows. Needs `onEventDrop`.                                                                                           |
| `onEventDrop`             | `(info: EventDropInfo) => void`                             | `undefined` | New `start`/`end` after a move; update `events` yourself.                                                                                                         |
| `dragSnapMinutes`         | `number`                                                    | `15`        | Snap for moves in time grids.                                                                                                                                     |
| `resizable`               | `boolean \| (event) => boolean`                             | `undefined` | Timed events resizable from their edges in time grids. Needs `onEventResize`.                                                                                     |
| `onEventResize`           | `(info: EventResizeInfo) => void`                           | `undefined` | New `start`/`end` and `edge` after a resize.                                                                                                                      |
| `resizeSnapMinutes`       | `number`                                                    | `15`        | Snap for resize edges.                                                                                                                                            |
| `minEventDurationMinutes` | `number`                                                    | `15`        | Shortest length a resize can leave.                                                                                                                               |

### Custom Renderers

| Prop                      | Type                                        | Default     | Description                                                                       |
| ------------------------- | ------------------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| `renderLoading`           | `() => ReactNode`                           | `undefined` | Custom loading indicator renderer. Falls back to a built-in spinner when omitted. |
| `renderEvent`             | `(event: CalendarEvent) => ReactNode`       | `undefined` | Replace the default event chip across all views.                                  |
| `renderHeader`            | `(props: RenderHeaderProps) => ReactNode`   | `undefined` | Replace the default navigation header.                                            |
| `renderHourCell`          | `(date: Date) => ReactNode`                 | `undefined` | Customize hour slots in Day/Week/CustomDays views; receives the slot's own date.  |
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
