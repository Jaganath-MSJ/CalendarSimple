# Migration Guide

This guide provides instructions on how to upgrade your application from older versions of `calendar-simple` to newer, major versions that introduce breaking changes.

---

## Upgrading from v1.x to v2.0

Version 2.0 of `calendar-simple` introduces major improvements to the component architecture, style isolation, and type handling, requiring a few straightforward updates in your application.

### 1. Update Dependencies

Update the `calendar-simple` package to the latest version:

```bash
npm install calendar-simple@2.0.0
# or
yarn add calendar-simple@2.0.0
```

### 2. Breaking Changes

#### CSS Modules and Style Isolation

In v2.0, the library's styling architecture was overhauled to use **CSS Modules**. This change guarantees strict style isolation, preventing `calendar-simple` styles from leaking into your application and vice versa.

**Impact:** Generated class names are now uniquely hashed (e.g., `_MonthView_1x2y3`). If you previously customized the calendar by overriding global class names (like `.calendar-month-view`), your styles will no longer apply.

**Solution:** Only use the officially supported `classNames` and `theme` props provided by the `<Calendar>` component to override styles and inject custom class names safely.

#### Component Library Restructuring

The internal folder layout and file naming conventions have been completely reorganized (now using `snake_case`) and monolithic type definitions were split into separate, modular files.

**Impact:** Top-level package exports remain the same. However, if your code relied on "deep imports" to reach specific internal components, utilities, or types, your build will fail.

**Before (Will Break):**

```ts
import MonthView from "calendar-simple/src/views/month/MonthView";
import type { CalendarEvent } from "calendar-simple/src/types/index";
```

**After (Correct):**

```ts
import Calendar from "calendar-simple";
import type { CalendarEvent, ECalendarViewType } from "calendar-simple";
```

### 3. v1.2.0 - Event Styling Refactor (Breaking)

In v1.2.0, we replaced the limited `color` property on events with a much more flexible `style` property. This allows you to apply any CSS styling (borders, gradients, opacity, etc.) to individual event items.

- **DEPRECATED**: `color?: string`
- **NEW**: `style?: React.CSSProperties`

**Before:**

```tsx
const event = {
  title: "Meeting",
  color: "#3b82f6",
};
```

**After (v1.2.0+):**

```tsx
const event = {
  title: "Meeting",
  style: { backgroundColor: "#3b82f6" },
};
```

### 4. New Features to Keep in Mind

- **Invalid Event Filtering**: We now automatically validate your event data arrays. Events where the `endDate` incorrectly occurs before the `startDate` are considered natively invalid and silently filtered out. This ensures the calendar no longer crashes or renders malformed UI bounds when receiving bad data.

## Schedule navigation (v2.2)

- Prev/Next arrows are no longer shown in Schedule view.
- `CALENDAR_ACTIONS.NEXT`/`PREV` dispatched via `useCalendar().dispatch` do nothing in Schedule view (before: moved the date by one day). Use `SET_DATE`, `onNavigate(date)` (custom headers) or Today.
- Schedule still lists every event; Today and the month/year pickers now scroll the list to the first day on or after the chosen date (last day if none).
- With `autoScrollToCurrentTime`, the mount scroll now goes to the first day on/after today that has events (before: only if today itself had events).
- New `onDateRangeChange(start, end, view)` prop.

### Month titles follow the locale (v2.2.0-beta.2)

- Header titles, the month grid label and the Schedule month labels now use the locale's own month/year pattern (`Intl`). Japanese, Chinese and Korean read "2026年3月" / "2026년 3월" (before: "3 2026"); Spanish and Portuguese gain "de" ("enero de 2024"); Russian uses the nominative month ("январь 2024 г."). English, French, German, Italian and Dutch are unchanged. Tests or snapshots that match the old text may need updating.
- The package no longer ships type declarations for the Storybook stories and test setup, and `calendar-simple/package.json` can be imported.

### CommonJS build (v2.2)

- The CommonJS bundle is now `dist/index.cjs` (was `dist/index.cjs.js`). Because the package is `"type": "module"`, Node read the old `.js` file as an ES module, so `require("calendar-simple")` returned no exports. `require()` now works, and `main` / `exports` point to the new file; only code that imported `dist/index.cjs.js` by path needs updating.
- `require()` users also get CommonJS type declarations (`dist/cjs-types`), so TypeScript with `module: node16`/`nodenext` accepts the import from a CommonJS file.

### Parity with calendar-simple-native (v2.2)

- `customDays` is now typed `1 | 2 | … | 7` (`CustomDaysCount`). A wider `number` is a TypeScript error; at runtime values are rounded and clamped to 1–7. Before, 8–10 drew 8–10 days (now 7) and values outside 1–10 drew nothing (now 1 or 7).
- With the new `keyboardNavigation` (default `true`) the month grid has **one** tab stop (the selected day) and arrow keys move between days; before, every cell was a tab stop. Pass `keyboardNavigation={false}` for the old tab order.
- Month cell labels now end with the event count ("Nov 10, 2026, 3 events"; `localeMessages.eventCount`).
- The "+N more" popover has a close button (it takes the initial focus), and "+ New event" when `creatable` and `onSlotClick` are set.
- The exported `CalendarContentProps` gains required keys `keyboardNavigation`, `swipeNavigation`, `pinchToZoom`, `minHourHeight` and `maxHourHeight` (filled from the defaults); code that builds it by hand must add them.
- `onMoreClick`'s `hiddenEvents` is typed as always present (it always was passed).
- New: `palette`, `hourHeight` / `minHourHeight` / `maxHourHeight` / `onHourHeightChange` / `pinchToZoom`, `swipeNavigation`, `testID`, `DEFAULT_MESSAGES`, and the messages `close`, `newEvent`, `loading`, `eventCount`, `moveEarlier`, `moveLater`, `movePreviousDay`, `moveNextDay`, `makeLonger`, `makeShorter`.

### Recurring events (v2.2)

- `rrule`, `exdates`, `recurringEventId` and `occurrenceDate` on events are now interpreted by the calendar. If you already expand series yourself, either remove `rrule` from the occurrences you pass, or keep `recurringEventId` on them; the calendar leaves events with `recurringEventId` alone. A non-string `rrule` is ignored at runtime, but the TypeScript types now expect a string.

---

_Need help migrating? If you encounter an issue not covered in this guide, please open an issue on our GitHub repository._
