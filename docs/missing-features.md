# Missing Features

This document describes features that are **not yet implemented** in `calendar-simple`. Each section covers what is currently missing, the proposed API surface, detailed behavior spec, and implementation notes.

---

## 1. Accessibility (ARIA & Keyboard Navigation)

### What Is Missing Today
The calendar renders almost entirely with `<div>` elements. There are no ARIA roles, no `aria-label` or `aria-describedby` attributes, no `tabIndex` on interactive elements, and no keyboard event handlers anywhere in the component tree. Users who rely on screen readers or keyboard-only navigation cannot use the calendar at all. This is the highest-priority gap in the library.

### Proposed API Surface
```ts
// New optional props on CalendarProps
ariaLabel?: string;           // Accessible name for the calendar root (e.g. "Event calendar")
ariaLabelledBy?: string;      // ID of an external element labeling the calendar
```
All other accessibility improvements are structural (HTML + ARIA attributes added internally) and require no new props.

### Behavior Spec

**Month View:**
- Root element: `role="grid"`, `aria-label` shows current month and year (e.g. "April 2026")
- Week row: `role="row"`
- Day cell: `role="gridcell"`, `aria-label="Monday, April 14"`, `aria-selected` when selectable and selected, `aria-current="date"` on today
- Day header cells: `role="columnheader"`, `aria-label="Monday"` (full name regardless of `dayType`)

**Week / Day / Custom Views:**
- Time grid container: `role="grid"`
- Each time slot column: `role="columnheader"` for day headers
- Hour slots: `role="row"` per hour, slot cells `role="gridcell"` with `aria-label="9:00 AM"`

**Event Items:**
- `role="button"`, `tabIndex={0}`
- `aria-label` = full event description: `"Team standup, 9:00 AM to 9:30 AM"`
- `aria-describedby` pointing to a visually hidden element with additional metadata

**Navigation Buttons:**
- Previous/Next: `<button>` elements with `aria-label="Previous month"` / `"Next month"` (view-aware)
- Today button: `<button aria-label="Go to today">`
- View switcher: `<select aria-label="Calendar view">` or `role="listbox"`

**Popover:**
- `role="dialog"`, `aria-modal="true"`, `aria-label="Hidden events for April 14"`
- Focus trapped inside popover while open
- Focus returns to the "+N more" trigger button on close
- Escape key closes the popover

**Keyboard Navigation:**
- Arrow keys move focus between date cells (month view) or time slots (day/week views)
- `Enter` / `Space` activate the focused cell (fires `onDateClick` if `selectable`)
- `Tab` / `Shift+Tab` cycle through focusable elements: header controls → day cells → events
- `Escape` closes any open popover

**Screen Reader Announcements:**
- Live region (`aria-live="polite"`) announces navigation: "Navigated to May 2026"
- View changes announced: "Switched to week view"

### Implementation Notes
- Replace interactive `<div>` elements with `<button>` or use `role="button"` + `tabIndex={0}` + `onKeyDown` for Enter/Space
- Day header `<th>` in month view (currently `<div>`) improves table semantics
- Use `useId()` (React 18) to generate stable IDs for `aria-labelledby` associations
- WCAG 2.1 Level AA is the target standard
- Run `axe-core` or `@axe-core/react` in Storybook to audit after implementation

---

## 2. Drag-and-Drop Event Rescheduling (not needed)

### What Is Missing Today
Events are click-only. There is no way for a user to drag an event to a new time or date. The library has no drag state, no visual feedback during a drag, and no callback for communicating a dropped position back to the consumer. This is the most-requested interactive feature in any calendar UI.

### Proposed API Surface
```ts
// New props on CalendarProps
draggable?: boolean;                                        // Enable drag on events (default: false)
onEventDrop?: (                                            // Fires when a drag completes
  event: CalendarEvent,
  newStartDate: Date,
  newEndDate: Date,
  originalStartDate: Date
) => void;
dragSnapMinutes?: number;                                  // Snap grid resolution in minutes (default: 15)
```

### Behavior Spec

**Day / Week / Custom Views:**
- When `draggable=true`, event items show a grab cursor on hover
- Dragging an event creates a semi-transparent ghost at the cursor position
- The event's original slot shows a placeholder outline (so the user sees where it was)
- Dragging snaps to `dragSnapMinutes` boundaries (15 min by default)
- Releasing fires `onEventDrop` with the new start/end; the consumer updates their events array
- Dragging to the all-day banner converts the event to an all-day event (`endDate` set to date-only)
- Dragging from all-day banner to time grid converts to a timed event (default duration: 1 hour)
- Cross-day drag in week view: dropping on a different column updates the date component while preserving the time

**Month View:**
- Dragging an event to a different day cell updates the date while preserving the original time (if any)
- Multi-day events can be dragged; start and end shift by the same delta

**All-Day Banner:**
- Events can be reordered by dragging within the banner
- Fires `onEventDrop` with unchanged times but new date if dragged to a different column

**Edge Cases:**
- `onEventDrop` is the source of truth; the library does not mutate the event array itself
- If the consumer does not update the events array, the event snaps back to its original position
- Dragging a recurring-event instance (when supported in the future): the callback should indicate whether the whole series or just this instance should be updated

### Implementation Notes
- Use the HTML5 Drag and Drop API (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) as a baseline; consider `react-dnd` or `@dnd-kit/core` for cross-browser consistency and touch support
- Keep drag state in a local `useRef` (not React state) to avoid re-renders during the drag
- Ghost element should be portaled to `document.body` to avoid z-index clipping issues (same pattern as the existing `Popover`)

---

## 3. Event Resize Handles (not needed)

### What Is Missing Today
Timed events in Day / Week / Custom views have a fixed height. There is no bottom handle to drag and extend or shrink an event's duration. There is no `onEventResize` callback.

### Proposed API Surface
```ts
// New props on CalendarProps
resizable?: boolean;                                       // Enable resize handles (default: false)
onEventResize?: (                                         // Fires when a resize completes
  event: CalendarEvent,
  newStartDate: Date,
  newEndDate: Date
) => void;
resizeSnapMinutes?: number;                               // Snap grid for resizing (default: 15)
minEventDurationMinutes?: number;                         // Minimum allowed duration (default: 15)
```

### Behavior Spec
- When `resizable=true`, a drag handle appears at the bottom edge of timed events in Day/Week/Custom views
- The handle is a small visual indicator (e.g. 4px bar or grip icon) only visible on hover
- Dragging the handle stretches the event block downward or upward
- Snaps to `resizeSnapMinutes` grid
- Minimum duration enforced by `minEventDurationMinutes` (prevents dragging to zero height)
- Live preview: the event visually stretches during the drag; the time label inside updates in real-time
- Releasing fires `onEventResize`; consumer updates their events array
- Month view: resize handles not shown (events in month view don't have a direct time-height relationship)
- All-day events in the banner: not resizable (duration is whole-day)

**Edge Cases:**
- Resizing past `maxHour` clamps at `maxHour`
- Resizing a short event that is already in "tiny" display mode: show the time label as a tooltip instead of inline

### Implementation Notes
- The resize handle is a separate `<div>` rendered at the bottom of `DayWeekEventItem`; it only appears when `resizable=true`
- Mouse/touch events on the handle should stop propagation so they don't trigger `onEventClick`
- Use `onMouseDown` → `document.onMouseMove` → `document.onMouseUp` pattern (same as drag-to-create) to track resize outside the component boundary

---

## 4. Click / Drag to Create Events — Click-only Done

### What Is Implemented
Click-to-create is fully implemented. The `creatable` prop (enables slot hover styling) and `onSlotClick?: (startDate: Date, endDate: Date) => void` callback are wired in all four views:
- **Day / Week / CustomDays views**: clicking an empty hour slot fires `onSlotClick(hourStart, hourStart + 1h)`. Only fires when `creatable === true` and `onSlotClick` is defined.
- **Month view**: clicking a day cell fires `onSlotClick(dayStart, dayEnd)` (full-day intent), alongside existing `onDateClick` behavior.

The drag-select portion (`onSlotSelect`) remains unimplemented. Per the spec below, drag-select was marked "not needed."

### What Is Still Missing
The drag-select feature for time-range selection is not implemented. The click-based API covers the primary use case.

### Proposed API Surface (drag-select not needed)
```ts
// New / updated props on CalendarProps
creatable?: boolean;                                      // Enable click/drag-to-create (default: false)
onSlotClick?: (startDate: Date, endDate: Date) => void;  // Single click on empty slot (endDate = startDate + 1 hour)
onSlotSelect?: (startDate: Date, endDate: Date) => void; // Drag-select a time range
```

### Behavior Spec

**Day / Week / Custom Views — Click:**
- When `creatable=true`, clicking an empty time slot fires `onSlotClick(slotStart, slotStart + 1 hour)`
- The click target is the hour cell background, not an existing event
- Clicking on an existing event still fires `onEventClick` as normal

**Day / Week / Custom Views — Drag-select:**
- Click and hold on an empty slot, then drag down (or up) to select a time range
- A blue selection highlight grows as the user drags
- Snaps to 15-minute boundaries
- Releasing fires `onSlotSelect(rangeStart, rangeEnd)`
- Minimum selectable range: 15 minutes

**Month View:**
- Clicking a date cell when `creatable=true` fires `onSlotClick(startOfDay, endOfDay)` (all-day intent)
- The existing `onDateClick` continues to work alongside `onSlotClick`; `onDateClick` fires for date-identity selection, `onSlotClick` fires for creation intent

**Edge Cases:**
- `creatable` and `selectable` can coexist: selection highlight and creation highlight are visually distinct
- If the user clicks on the time label in the `TimeColumn`, nothing fires (not a slot)
- Dragging from a slot onto an existing event: the drag is cancelled (no partial creation over an event)

### Implementation Notes
- Add `onMouseDown` / `onMouseMove` / `onMouseUp` to `DayColumn`'s background layer
- Track drag state in a `useRef` (not React state) to avoid re-render loops during the drag
- Selection highlight is a `position: absolute` overlay inside `DayColumn`

---

## 5. Inline Event Editing (check is needed user can handle)

### What Is Missing Today
There is no mechanism for editing an event's title, time, or other fields directly in the calendar. Double-clicking an event does nothing. The library provides no edit popover, no input fields, and no controlled "editing" state. This is intentional — the library doesn't own the data model — but the library should provide the hooks a consumer needs to build their own edit UI.

### Proposed API Surface
```ts
// New props on CalendarProps
onEventDoubleClick?: (event: CalendarEvent) => void;     // Double-click to signal edit intent
editingEventId?: string;                                  // Controlled: marks one event as "being edited"
renderEventEditor?: (                                     // Render prop for custom inline editor
  event: CalendarEvent,
  position: { top: number; left: number; width: number; height: number },
  onClose: () => void
) => ReactNode;
```

### Behavior Spec
- `onEventDoubleClick` fires when any event is double-clicked (regardless of `selectable`)
- When `editingEventId` is set, the matching event receives a visual "editing" indicator (e.g. dashed border, muted opacity on other events)
- When `renderEventEditor` is provided and `editingEventId` matches an event, the render prop is called with the event's computed bounding box. The consumer renders whatever editing UI they need (a form, a popover, etc.)
- The `onClose` callback tells the consumer the user wants to dismiss the editor (e.g. clicked away); the consumer clears `editingEventId`
- The library does not mutate events; all edits go through the consumer's state

**Edge Cases:**
- If `editingEventId` points to an event not currently visible (different month/week), the editor is not rendered
- Double-clicking fires after a 200ms debounce to avoid conflicting with single-click's `onEventClick`

### Implementation Notes
- `renderEventEditor` position is calculated from the event item's `getBoundingClientRect()` at the time of double-click
- The editor is portaled to `document.body` (same approach as `Popover`)
- No built-in form components are provided; this is purely a position + lifecycle contract

---

## 6. Mobile & Touch Support (check is needed because this is for web React not React Native)

### What Is Missing Today
The library has zero touch event handlers. On mobile devices: navigation requires tapping small header buttons (no swipe), time-grid events cannot be dragged, there is no long-press to create an event, and the layout does not adapt to narrow viewports. CSS has no `@media` breakpoints.

### Proposed API Surface
```ts
// New props on CalendarProps
enableTouchGestures?: boolean;                            // Enable swipe/long-press (default: false)
onLongPress?: (date: Date) => void;                      // Long-press on a date or slot (300ms)
swipeThreshold?: number;                                  // Minimum swipe distance in px (default: 50)
```

### Behavior Spec

**Swipe Navigation:**
- Swipe left → navigate to next period (same as clicking Next button)
- Swipe right → navigate to previous period
- Requires horizontal delta > `swipeThreshold` and vertical delta < `swipeThreshold` to avoid conflicting with scroll
- Available in all views
- Fires `onNavigate` callback after navigation (consistent with button navigation)

**Long Press:**
- Long-press (300ms hold) on a date cell or time slot fires `onLongPress(date)`
- Consumer typically uses this to open a creation dialog
- Visual feedback: subtle scale-up or ripple animation during the press
- Cancel long-press if the pointer moves more than 10px during the hold

**Responsive Layout (CSS breakpoints):**
- `@media (max-width: 768px)`:
  - Header: collapse view-switcher dropdown and month/year pickers into a single compact row
  - Month view: reduce event font size, reduce cell padding
  - Week view: show 3 days instead of 7 (or scroll horizontally)
  - Day name labels: force `dayType: "half"` on narrow screens regardless of prop
- `@media (max-width: 480px)`:
  - Month view: hide event titles, show only colored dots
  - Week view: show 1 day (behaves like Day view)

**Edge Cases:**
- `enableTouchGestures: false` (default) means no behavior change — existing consumers are unaffected
- Swipe and scroll must be carefully distinguished; only start swipe detection when horizontal movement dominates
- Drag-and-drop (feature #2) shares touch handling; `enableTouchGestures` should also enable touch drag

### Implementation Notes
- Handle `onTouchStart`, `onTouchMove`, `onTouchEnd` on the calendar root element
- Store touch start coordinates in a `useRef`; calculate delta on `onTouchEnd`
- Long-press uses `setTimeout` cancelled on `onTouchMove` or `onTouchEnd` before 300ms
- Responsive CSS changes belong in `src/styles/variables.css` and view-level `.module.css` files

---

## 7. Recurring Events (not needed user can handle it)

### What Is Missing Today
Every event occurrence must be passed as a separate `CalendarEvent` object. The library has no concept of a recurrence rule. A weekly standup for a year requires 52 discrete event objects. There is no way to indicate that events are instances of a series, and no way to update or delete "this and all following" occurrences.

### Proposed API Surface
```ts
// Extended CalendarEvent interface
interface CalendarEvent {
  // ... existing fields ...
  recurrence?: string;           // RFC 5545 RRULE string, e.g. "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"
  exdates?: string[];            // ISO date strings of excluded occurrences
  recurrenceId?: string;         // Links an override event to its master event's startDate
  masterId?: string;             // ID of the master/template event (for override events)
}

// New prop on CalendarProps
expandRecurrences?: boolean;     // If true, library expands RRULE within the visible range (default: false)
```

**Utility function (exported):**
```ts
expandRecurrences(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[]
```

### Behavior Spec

**When `expandRecurrences: false` (default):**
- Behavior unchanged; consumer is responsible for passing expanded occurrences
- The `expandRecurrences()` utility is available for consumers who want to expand externally

**When `expandRecurrences: true`:**
- The library parses each event's `recurrence` field (RRULE string) and generates occurrences within the currently visible date range
- Each generated occurrence inherits all fields from the master event, with `startDate`/`endDate` adjusted per the recurrence rule
- Excluded dates listed in `exdates` are skipped
- Override events (`recurrenceId` set) replace the generated occurrence for that date
- Recurrence is re-expanded any time the visible date range changes

**Visual Indicator:**
- Recurring event items show a small repeat icon (e.g. ↻) alongside the title
- Controlled by a CSS class `classNames.recurringEvent`

**Edge Cases:**
- Events with both `recurrence` and an explicit `endDate` spanning multiple days: each occurrence should span the same duration
- Infinitely recurring events (`RRULE:FREQ=DAILY` with no `COUNT` or `UNTIL`) are only expanded within the visible range
- Timezone handling: RRULE `DTSTART` must include timezone; Luxon's `fromISO` handles this

### Implementation Notes
- RRULE parsing is complex; use the `rrule` npm package (lightweight, well-tested, no dependencies)
- Expansion should be memoized and keyed on the visible date range + events array to avoid re-expansion on every render
- Do not expand recurrences in `useEvents` (which currently only validates); create a new `useExpandedEvents` hook

---

## 8. Week Numbers - Done (onWeekNumberClick and weekNumberFormat props not needed)

### What Is Missing Today
No view displays ISO week numbers. In many regions (especially Europe and enterprise tools) week numbers (e.g. "W15") are a primary navigation reference. The month view has no leftmost column for week numbers, and the week view header has no week-number label.

### Proposed API Surface
```ts
// New props on CalendarProps
showWeekNumbers?: boolean;                                  // Show ISO week number column (default: false)
onWeekNumberClick?: (weekNumber: number, weekStartDate: Date) => void;  // Click on a week number
weekNumberFormat?: "W15" | "15" | string;                  // Display format (default: "W15")
```

```ts
// New classNames slot
classNames?: {
  // ... existing slots ...
  weekNumber?: string;    // Week number cell
}
```

### Behavior Spec

**Month View:**
- When `showWeekNumbers: true`, a narrow column is prepended before the day columns
- Each row shows the ISO 8601 week number for the first day of that row
- The column header cell is empty (or shows a "W" label)
- Week number cells are clickable if `onWeekNumberClick` is provided; cursor changes to pointer

**Week View:**
- Week number is shown in the header area next to the date range label (e.g. "Apr 14 – 20, 2026  ·  W16")
- Not shown as a column (the week view already shows 7 day columns)

**ISO vs. Local Week Numbering:**
- Default: ISO 8601 (week starts Monday; week 1 is the week containing January 4th)
- When `weekStartsOn` is set to a non-Monday value, the library still uses ISO numbering for `showWeekNumbers` (ISO is the standard convention for week numbers)

**Edge Cases:**
- Adjacent-month days (from `showAdjacentMonths: true`) that belong to a different ISO year (e.g. Dec 31 in W1 of next year) show the correct ISO week for their actual date
- When `showAdjacentMonths: false` and adjacent cells are empty, week number cells for rows that are entirely adjacent-month days can be hidden or grayed out

### Implementation Notes
- Luxon provides `DateTime.weekNumber` (ISO 8601) directly — no custom calculation needed
- Month view grid layout uses CSS Grid; adding a week number column means changing the `grid-template-columns` from `repeat(7, 1fr)` to `auto repeat(7, 1fr)`

---

## 9. Dark Mode

### What Is Missing Today
The library defines 10 CSS custom properties in `src/styles/variables.css` (e.g. `--primary-color`, `--bg-color`, `--text-primary`) but all values are hardcoded for a light theme. There is no `@media (prefers-color-scheme: dark)` block and no prop or class to switch to dark colors. The calendar looks broken on systems with a dark OS theme.

### Proposed API Surface
```ts
// New prop on CalendarProps
colorScheme?: "light" | "dark" | "auto";   // Default: "auto" (follows OS preference)
```

### Behavior Spec
- `"auto"`: root element gets `data-color-scheme="light"` or `"dark"` based on `window.matchMedia("(prefers-color-scheme: dark)")`; updates in real time when the OS preference changes
- `"light"`: always light; sets `data-color-scheme="light"`
- `"dark"`: always dark; sets `data-color-scheme="dark"`

**Dark Palette (proposed CSS variable values):**
| Variable | Light Value | Dark Value |
|---|---|---|
| `--primary-color` | `#3b82f6` | `#60a5fa` |
| `--primary-hover` | `#2563eb` | `#3b82f6` |
| `--text-primary` | `#1f2937` | `#f9fafb` |
| `--text-secondary` | `#6b7280` | `#9ca3af` |
| `--bg-color` | `#ffffff` | `#1f2937` |
| `--bg-hover` | `#f3f4f6` | `#374151` |
| `--border-color` | `#e5e7eb` | `#374151` |

**CSS implementation:**
```css
[data-color-scheme="dark"] {
  --bg-color: #1f2937;
  /* ... all variables overridden ... */
}
@media (prefers-color-scheme: dark) {
  :root:not([data-color-scheme="light"]) {
    /* same overrides */
  }
}
```

**Edge Cases:**
- If the consumer has already overridden CSS variables on their own `:root`, the library's dark-mode variables (scoped to `[data-color-scheme="dark"]`) should take precedence within the calendar root
- The `theme` prop (JS color overrides) takes final precedence over CSS variables regardless of color scheme

### Implementation Notes
- The `data-color-scheme` attribute is set on the calendar's root `<div>` (not `<html>` or `<body>`) so it is scoped to the component
- Use `matchMedia` inside a `useEffect` with an event listener for `change` to react to OS preference changes at runtime

---

## 10. RTL Layout

### What Is Missing Today
Setting `locale: "ar"` (Arabic) or `locale: "he"` (Hebrew) causes Luxon to format all text right-to-left, but the CSS layout remains left-to-right. The month grid columns still run left→right, the time column is still on the left, and padding/margins are not flipped. The calendar looks visually incorrect for RTL users.

### Proposed API Surface
```ts
// New prop on CalendarProps
dir?: "ltr" | "rtl" | "auto";   // Layout direction. Default: "auto" (infer from locale)
```

### Behavior Spec
- `"auto"`: RTL locales (`ar`, `he`, `fa`, `ur`, etc.) automatically get `dir="rtl"` on the root element
- `"ltr"` / `"rtl"`: explicit override
- The `dir` attribute is set on the calendar root `<div>` (not the document)

**Layout Changes Required (RTL):**
- Month grid: day columns reversed (Sunday on left becomes Sunday on right for LTR-week-start locales; in RTL Arabic, the week typically starts on Saturday or Sunday visually on the right)
- Week view: day columns reversed
- Time column: moves from left side to right side
- Header: navigation arrows swap (left arrow = next, right arrow = previous)
- All-day banner: clipping indicators swap sides
- Popover: positioning logic inverted horizontally
- CSS: all `margin-left` / `padding-left` / `border-left` / `left: 0` rules should use CSS logical properties (`margin-inline-start`, `padding-inline-start`, `border-inline-start`, `inset-inline-start`) so they flip automatically with `dir`

**Edge Cases:**
- `weekStartsOn` still applies in RTL; if `weekStartsOn=0` (Sunday) in an RTL layout, Sunday appears on the right
- Event items in the time grid: left/width CSS positioning (set by `useDayEventLayout`) needs to be reversed (e.g. `left: 20%` becomes `right: 20%` equivalent)

### Implementation Notes
- The most reliable approach is replacing directional CSS properties with CSS logical properties throughout all `.module.css` files
- Test thoroughly with Arabic (right-to-left, cursive script) and Hebrew (right-to-left, non-cursive) locales
- The `dir` inference table (locale code → direction) can be a small static map; all Arabic/Hebrew/Farsi/Urdu/etc. locales map to `"rtl"`, everything else `"ltr"`

---

## 11. Event Categories & Multi-Calendar (not needed)

### What Is Missing Today
All events are treated as belonging to a single undifferentiated pool. There is no concept of a "calendar source" (e.g. Work, Personal, Team), no built-in color categorization by source, and no filtering UI. Consumers who want to show multiple color-coded calendars must implement all of this themselves.

### Proposed API Surface
```ts
// Extended CalendarEvent interface
interface CalendarEvent {
  // ... existing fields ...
  calendarId?: string;           // Links event to a CalendarSource
}

// New type
interface CalendarSource {
  id: string;
  label: string;
  color: string;                 // Hex or CSS color; used as event background when calendarId matches
  visible?: boolean;             // Whether events from this source are shown (default: true)
}

// New props on CalendarProps
calendars?: CalendarSource[];
onCalendarToggle?: (calendarId: string, visible: boolean) => void;
renderCalendarLegend?: (calendars: CalendarSource[]) => ReactNode;
```

### Behavior Spec
- When `calendars` is provided, each event with a matching `calendarId` inherits the source's `color` as its background (unless the event has an explicit `event.style.backgroundColor`)
- `visible: false` on a `CalendarSource` hides all events from that source
- `onCalendarToggle` fires when a legend item is toggled; the consumer updates their `calendars` array
- `renderCalendarLegend` is called with the full `calendars` array; the consumer renders a legend/filter UI (typically below or beside the calendar). The library does not render a built-in legend UI.
- Events without a `calendarId` use the default event color

**Edge Cases:**
- If `calendars` is not provided, behavior is identical to today (no change)
- If `calendarId` is set on an event but no matching `CalendarSource` exists, fall back to the default event color
- When `visible: false`, the events are still in the events array; they are simply not rendered (so the consumer doesn't need to re-fetch)

### Implementation Notes
- Color inheritance from `CalendarSource` should be handled in `useEvents` or a new `useCalendarSources` hook that merges source color onto each event before it reaches the view layer
- This avoids changing event rendering components

---

## 12. onDateRangeChange Callback (not needed)

### What Is Missing Today
The existing `onNavigate(date: Date)` callback fires the current `selectedDate` when the user navigates. It does not provide the full visible date range (start and end of the currently displayed period). Consumers who want to lazy-load events for the visible window have no reliable way to know what range to fetch. They must infer the range from `view` + `selectedDate`, which requires re-implementing the library's internal navigation logic.

### Proposed API Surface
```ts
// New prop on CalendarProps
onDateRangeChange?: (
  startDate: Date,
  endDate: Date,
  view: ECalendarViewType
) => void;
```

### Behavior Spec
- Fires whenever the visible date range changes:
  - Initial render
  - Navigation (Prev / Next / Today / month-dropdown / year-dropdown)
  - View change
- `startDate`: first day of the visible range (e.g. for Month view, the first day shown including adjacent-month days)
- `endDate`: last day of the visible range (inclusive)
- Fired after `onNavigate` and `onViewChange` (not before)
- Should be debounced internally (16ms) to avoid firing twice when both `selectedDate` and `view` change in the same render cycle

**Range Definitions by View:**
| View | startDate | endDate |
|---|---|---|
| Month | First visible cell (may be prior month) | Last visible cell (may be next month) |
| Week | `weekStartsOn` day of current week | `weekEndsOn` day of current week |
| Day | Current day (start of day) | Current day (end of day) |
| Schedule | Date of first event | Date of last event (or +30 days if no events) |
| Custom Days | First of N days | Last of N days |

**Edge Cases:**
- When `showAdjacentMonths: false` in month view, the range still includes adjacent-month days' dates (for event-loading purposes), even if those cells are visually empty
- When `resetDateOnViewChange: true`, both `onViewChange` and `onDateRangeChange` fire on a view change

### Implementation Notes
- Calculate the range in the same place where `useMonthGrid`, `useDayEventLayout`, and `useScheduleView` calculate their visible windows
- The range should be computed in `CalendarContent` (or a new `useVisibleRange` hook) and passed to the callback via a `useEffect` with the range values as dependencies

---

## 13. Headless Hooks Public API (not needed for now - out of scope)

### What Is Missing Today
The library exports `useCalendar()` (context access) but all layout and data-processing hooks are internal. Consumers who want to build a completely custom visual design — keeping the library's date logic, event layout algorithms, and state management — have no way to do so. They must either fork the library or reimplement the algorithms.

### Proposed Additional Exports
```ts
// From src/index.ts (add to existing exports)

// Already exported:
export { useCalendar } from "./context/CalendarContext";

// New exports:
export { useCalendarEvents } from "./hooks/useEvents";        // Validated event array
export { useMonthGrid } from "./hooks/useMonthGrid";          // Month view grid layout
export { useDayEventLayout } from "./hooks/useDayEventLayout"; // Day/week event positioning
export { useScheduleView } from "./hooks/useScheduleView";    // Schedule view grouping
export { useAllDayBanner } from "./hooks/useAllDayBanner";    // All-day banner layout

// Also export relevant types used by these hooks:
export type { CalendarDayInfo, EventListType, DayEventLayout };
```

### Behavior Spec
- All hooks currently accept their inputs as arguments (they don't implicitly read from context); they are already "headless" in implementation — they just aren't exported
- Exporting them allows a consumer to:
  1. Use `CalendarProvider` + `useCalendar()` for navigation state
  2. Call `useMonthGrid(state.selectedDate, events, options)` themselves
  3. Render the returned data with completely custom components
- No behavior changes to the hooks themselves; this is purely an export surface change

**Documentation Required:**
- Each hook's input/output types must be documented (they currently have TypeScript types but no JSDoc)
- A "headless usage" example in the README showing a custom month view

**Edge Cases:**
- `useAllDayBanner` currently reads `maxEvents` from context via `useCalendarProps`; it should be refactored to accept `maxEvents` as a direct argument when used headlessly

### Implementation Notes
- Audit each hook for implicit context reads (`useCalendarProps()` calls inside hooks) and replace with explicit arguments before exporting
- Add JSDoc comments to each hook's exported signature

---

## 14. Loading / Skeleton State

### What Is Missing Today
When a consumer fetches events from a server (triggered by `onDateRangeChange`), there is no way to communicate a loading state to the calendar. Events either appear instantly or not at all. There is no skeleton placeholder, no spinner, and no disabled-interaction state during loading.

### Proposed API Surface
```ts
// New props on CalendarProps
isLoading?: boolean;                              // Show loading skeleton (default: false)
renderLoading?: () => ReactNode;                  // Custom loading UI replaces default skeleton
```

### Behavior Spec

**Default Skeleton (when `isLoading: true` and no `renderLoading` provided):**
- Month view: each cell shows 1–2 gray animated shimmer bars where events would appear
- Week / Day / Custom views: 2–3 horizontal shimmer bars scattered across the time grid at realistic positions
- Schedule view: 3–4 shimmer rows (circle + two lines each)
- Header: navigation buttons remain fully interactive during loading (user can navigate)
- Interaction: `onEventClick`, `onDateClick`, and `onSlotClick` do not fire while `isLoading: true`

**Custom Loading (`renderLoading` provided):**
- The return value of `renderLoading()` replaces the entire calendar body (not the header) while `isLoading: true`
- The header remains visible and interactive

**Transition:**
- When `isLoading` changes from `true` to `false`, the skeleton fades out and events fade in (CSS transition, ~150ms)

**Edge Cases:**
- If `isLoading` is `true` on the initial render, the skeleton appears immediately (no flash of empty content)
- `isLoading: true` with a non-empty `events` array: show existing events (do not replace them with skeleton); only show skeleton when `events` is empty and `isLoading` is true

### Implementation Notes
- Shimmer animation: CSS `@keyframes` on a gradient background (same pattern as common skeleton UIs)
- Add a CSS class `.calendarSkeleton` to the view body when `isLoading: true`; consumers can override the skeleton style via `classNames` or global CSS

---

## 15. Print & Export (not needed)

### What Is Missing Today
There is no `@media print` CSS block. Printing the calendar produces the default browser output of the screen layout, which includes interactive controls, clipped overflow, and missing events (due to "+N more" truncation). There is no utility to export events to a standard interchange format (iCal / ICS).

### Proposed Additions

**Print CSS (`src/styles/variables.css` or a separate `src/styles/print.css`):**
```css
@media print {
  /* Hide interactive controls */
  .headerControls,
  .viewSwitcher,
  .expandCollapseButton { display: none; }

  /* Show all events, remove truncation */
  .moreEventsButton { display: none; }
  /* All events visible regardless of maxEvents */

  /* Ensure grid fits on one page */
  .calendarRoot { width: 100%; height: auto; }
  .monthGrid { page-break-inside: avoid; }
}
```

- When printing, `maxEvents` should be effectively unlimited (all events rendered)
- Color backgrounds may not print by default; add `-webkit-print-color-adjust: exact` and `print-color-adjust: exact` to event items

**ICS Export Utility (exported function):**
```ts
// New export from src/index.ts
export function exportToICS(events: CalendarEvent[]): string;
```
- Generates a valid RFC 5545 iCalendar string from the events array
- Each `CalendarEvent` maps to a `VEVENT` component:
  - `DTSTART` / `DTEND` from `startDate` / `endDate`
  - `SUMMARY` from `title`
  - `UID` from `id` (or generated if absent)
  - Arbitrary metadata fields are ignored (no standard mapping)
- Returns a string the consumer can trigger a download of:
  ```ts
  const blob = new Blob([exportToICS(events)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  // ... trigger download ...
  ```
- No UI is provided; the consumer controls the download trigger

**Edge Cases:**
- All-day events: ICS `DTSTART` should use `DATE` value type (not `DATE-TIME`) for all-day events
- Multi-day events: `DTEND` is the day after the last day in ICS convention (exclusive end)
- Events with no `endDate`: set `DTEND` to `DTSTART + 1 hour` (timed) or `DTSTART + 1 day` (all-day)

### Implementation Notes
- ICS generation is pure string manipulation; no external library is needed for basic VEVENT output
- The `rrule` npm package (added for feature #7 — Recurring Events) can also serialize recurrence rules to the RRULE property in the ICS file
- Print CSS should be in a dedicated `print.css` file included in the library's build output so consumers can import it separately
