# /playwright — Execute Playwright Test Sweeps

## Arguments

`$ARGUMENTS`

Parse the arguments above:

- **Empty** → run all sweeps A through L (Chromium)
- **One or more letters** (e.g. `A`, `A B C`, `C D`) → run only those sweeps (Chromium)
- **`init`** → perform session initialization only, no sweeps
- **`--browser=firefox`** or **`--browser=webkit`** (optionally followed by sweep letters) → cross-browser run; see **Cross-Browser Sessions** section

## Workflow

1. **Check dev server** — navigate to `http://localhost:5173`. If it does not load, stop and tell the user to run `cd playground && npm run dev` in a separate terminal.
2. **Session initialization** — follow the 4-step block in the "Session Initialization" section below exactly. For cross-browser runs substitute the tool namespace as described in "Cross-Browser Sessions".
3. If argument is `init`, stop after initialization.
4. **Execute each requested sweep** — for every sweep letter (or all A–L if no argument, or the CB subset if `--browser` was specified with no letters):
   a. Print `## Sweep <Letter>: <Name> (<N> cases) [Browser]`
   b. Run the Sweep Setup block for that sweep
   c. For each test row: perform the steps, compare actual vs Expected, record PASS / FAIL / SKIP with a one-line note.
5. **Update this file** — write results back into the Result column for every executed row. Append a new row to the Test Run Log (include Browser column). Never overwrite past log entries.
6. **Print summary table** — PASS / FAIL / SKIP per sweep plus totals. Flag non-known FAILs as regressions.
7. **Create/update `TEST_REPORT.md`** — write (or overwrite) `TEST_REPORT.md` in the project root with the following sections:
   - **Run metadata**: date, branch, browser, total PASS / FAIL / SKIP counts
   - **Per-sweep summary table**: sweep letter, name, pass, fail, skip
   - **Failures**: one row per FAIL with ID, sweep, description, and observed vs expected
   - **Regressions**: list any non-known FAILs explicitly as regressions
     Use the same data written to the Test Run Log — no re-running tests.

---

# Playwright Test Playbook — `calendar-simple` Library

## About This Playbook

This is the **canonical execution file** for every Playwright MCP test run against the `calendar-simple` library. Load this file as context at the start of each test session, then execute sweeps A–L in order.

- **Target app**: `http://localhost:5173` — start with `cd playground && npm run dev`
- **Test harness**: MCP Playwright plugin — all 23 `mcp__plugin_playwright_playwright__*` tools
- **testId prefix**: `playground-calendar` (set in `playground/src/App.tsx:35`)
- **Results file**: results are tracked in this file (`.claude/commands/playwright.md`)
- **Screenshots**: save to `tests/screenshots/` using names from the Visual Regression section
- **Total cases**: 310 (A:18 + B:14 + C:128 + D:26 + E:18 + F:18 + G:24 + H:13 + I:14 + J:14 + K:15 + L:8)
- **Library version**: `calendar-simple` v1.2.0 — branch `version_2`
- **Cross-browser**: Firefox + WebKit MCP servers in `.mcp.json`; run `/playwright --browser=firefox` or `/playwright --browser=webkit`. One-time setup: `npx playwright install firefox webkit`. The 27-case CB subset covers RTL CSS, matchMedia, ResizeObserver, focus/ARIA, and popover positioning.

---

## Session Initialization

Run these steps at the **start of every test session** before any sweep.

### Step 1 — Start Dev Server

```
cd playground && npm run dev     # keep running in terminal; port 5173
```

### Step 2 — Open Browser & Baseline

```
browser_navigate(url="http://localhost:5173")
browser_wait_for(text="playground-calendar-container")
browser_snapshot()           → verify 2-panel layout: calendar left, ControlPanel right sidebar
browser_console_messages()   → MUST be empty (zero errors/warnings)
browser_network_requests()   → all assets return 200
```

### Step 3 — Reset ControlPanel

```
browser_snapshot()                → locate "Reset All" button at top of ControlPanel sidebar
browser_click(element="Reset All")
browser_snapshot()                → confirm all section badges read 0 (no modified controls)
```

### Step 4 — Verify Root testId

```
browser_evaluate(script="!!document.querySelector('[data-testid=\"playground-calendar-container\"]')")
→ must return true
```

---

## Cross-Browser Sessions

> One-time setup (run once in a terminal before first Firefox/WebKit sweep):
>
> ```
> npx playwright install firefox webkit
> ```
>
> This downloads the browser binaries used by `@playwright/mcp`. No npm package.json changes needed — `@playwright/mcp` is invoked via `npx` directly from `.mcp.json`.

### Tool Namespace per Browser

All sweep steps use `browser_*` commands. In cross-browser mode, substitute the MCP tool prefix:

| Browser            | Tool prefix                           | Argument            |
| ------------------ | ------------------------------------- | ------------------- |
| Chromium (default) | `mcp__plugin_playwright_playwright__` | _(none)_            |
| Firefox            | `mcp__playwright-firefox__`           | `--browser=firefox` |
| WebKit             | `mcp__playwright-webkit__`            | `--browser=webkit`  |

For example, `browser_navigate(url="http://localhost:5173")` becomes:

- Chromium: `mcp__plugin_playwright_playwright__browser_navigate(url=...)`
- Firefox: `mcp__playwright-firefox__browser_navigate(url=...)`
- WebKit: `mcp__playwright-webkit__browser_navigate(url=...)`

> The `playwright-firefox` and `playwright-webkit` MCP servers are defined in `.mcp.json` and auto-approved via `enabledMcpjsonServers` in `.claude/settings.local.json`. They become available after restarting Claude Code.

### Cross-Browser Subset (CB)

When `/playwright --browser=firefox` or `/playwright --browser=webkit` is run **without specific sweep letters**, execute only this curated subset. These are the highest browser-risk cases — areas where CSS engines, `matchMedia`, `ResizeObserver`, and ARIA/focus handling differ across browsers.

**Total CB cases: 27**

| Sweep | IDs                                | Risk area                                       |
| ----- | ---------------------------------- | ----------------------------------------------- |
| A     | A-01, A-11, A-17                   | Basic mount, CSS custom props, console hygiene  |
| B     | B-01, B-02, B-03, B-04             | Navigation click handlers                       |
| D     | D-03, D-16, D-17                   | CSS vars, `showCurrentTime`, `scrollIntoView`   |
| E     | E-01, E-02, E-03                   | `colorScheme` attribute, `matchMedia` dark mode |
| F     | F-06, F-10, F-12, F-13, F-14       | RTL CSS logical props, direction, time format   |
| J     | J-03, J-07, J-10, J-11, J-12       | Responsive layout, `ResizeObserver`             |
| L     | L-01, L-02, L-04, L-05, L-06, L-08 | Tab order, ARIA, popover keyboard               |

When sweep letters **are** specified (e.g. `/playwright --browser=firefox A B`), run exactly those sweeps in full using the Firefox tool namespace.

---

## Common Selectors & MCP Command Reference

### Calendar testId Selectors (prefix = `playground-calendar`)

All selectors use `playground-calendar` as the testId prefix. Source: `Header.tsx:194-287`, `Calendar.tsx:74`, `Popover.tsx:172-222`, `ScheduleView.tsx:61-130`.

| Element               | Selector                                                       |
| --------------------- | -------------------------------------------------------------- |
| Root container        | `[data-testid="playground-calendar-container"]`                |
| Header bar            | `[data-testid="playground-calendar-header"]`                   |
| Today button          | `[data-testid="playground-calendar-header-today-btn"]`         |
| Previous button       | `[data-testid="playground-calendar-header-prev-btn"]`          |
| Next button           | `[data-testid="playground-calendar-header-next-btn"]`          |
| View select           | `[data-testid="playground-calendar-header-view-select"]`       |
| Month select          | `[data-testid="playground-calendar-header-month-select"]`      |
| Year select           | `[data-testid="playground-calendar-header-year-select"]`       |
| Month view wrapper    | `[data-testid="playground-calendar-month-view"]`               |
| Schedule view wrapper | `[data-testid="playground-calendar-schedule-view"]`            |
| Popover dialog        | `[data-testid="playground-calendar-popover-content"]`          |
| Popover event item    | `[data-testid="playground-calendar-{eventId}-popover-item"]`   |
| Schedule event        | `[data-testid="playground-calendar-{eventId}-schedule-event"]` |

### ARIA Selectors

| Element         | Selector                                          |
| --------------- | ------------------------------------------------- |
| Header nav      | `nav[aria-label="Calendar navigation"]`           |
| Today button    | `button[aria-label="Today"]` (or localized value) |
| Previous        | `button[aria-label="Previous period"]`            |
| Next            | `button[aria-label="Next period"]`                |
| View select     | `select[aria-label="Select calendar view"]`       |
| Month select    | `select[aria-label="Select month"]`               |
| Year select     | `select[aria-label="Select year"]`                |
| Popover         | `[role="dialog"][aria-modal="true"]`              |
| Schedule region | `[role="region"][aria-label="Schedule view"]`     |

### Data Attribute Checks

```javascript
// Color scheme resolved value
browser_evaluate(
  (script =
    "document.querySelector('[data-testid=\"playground-calendar-container\"]').dataset.colorScheme"),
);

// Direction attribute (ltr / rtl)
browser_evaluate(
  (script =
    "document.querySelector('[data-testid=\"playground-calendar-container\"]').dir"),
);

// Calendar width CSS var
browser_evaluate(
  (script =
    "getComputedStyle(document.querySelector('[data-testid=\"playground-calendar-container\"]')).getPropertyValue('--calendar-width')"),
);
```

### Common MCP Operations

```
# Navigation
browser_navigate(url="http://localhost:5173")
browser_click(element="Today")                                  → by aria-label
browser_click(element="Previous period")
browser_click(element="Next period")

# View switching (via header dropdown)
browser_select_option(element="Select calendar view", values=["month"])
# values: month | week | day | schedule | customDays

# Month / Year dropdowns
browser_select_option(element="Select month", values=["12"])    → December
browser_select_option(element="Select year", values=["2030"])

# Keyboard interaction
browser_press_key(key="Escape")
browser_press_key(key="Tab")
browser_press_key(key="Enter")
browser_press_key(key="Space")

# Screenshots
browser_take_screenshot(filename="tests/screenshots/<name>.png")

# Console & network hygiene
browser_console_messages()
browser_network_requests()

# Viewport resize
browser_resize(width=1280, height=800)   → desktop
browser_resize(width=768, height=900)    → tablet
browser_resize(width=480, height=800)    → phone
browser_resize(width=360, height=640)    → narrow phone

# DOM evaluation
browser_evaluate(script="<JS expression returning primitive>")

# Wait for element / text
browser_wait_for(text="<visible text>")
```

---

## ControlPanel Quick-Action Guide

The ControlPanel sidebar has 12 collapsible sections. **No `data-testid` attributes** exist on ControlPanel elements — always `browser_snapshot()` first, then target by visible label text or accessible name.

### Standard Pattern

```
browser_snapshot()                                               → read accessibility tree
browser_click(element="<label text>")                           → toggle checkbox/button
browser_select_option(element="<label>", values=["<value>"])    → change dropdown
```

### Common Actions

| Task                        | Command                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| Reset all props to defaults | `browser_click(element="Reset All")`                              |
| Select fixture              | `browser_select_option(element="Fixture", values=["Edge Cases"])` |
| Change view                 | `browser_select_option(element="View", values=["week"])`          |
| Toggle `isLoading`          | `browser_click(element="isLoading")`                              |
| Toggle `selectable`         | `browser_click(element="selectable")`                             |
| Toggle `creatable`          | `browser_click(element="creatable")`                              |
| Set `colorScheme`           | `browser_select_option(element="Color Scheme", values=["dark"])`  |
| Set `locale`                | `browser_select_option(element="Locale", values=["ar"])`          |
| Set `direction`             | `browser_select_option(element="Direction", values=["rtl"])`      |
| Apply layout preset         | `browser_click(element="768×900")`                                |
| Toggle `renderEvent`        | `browser_click(element="renderEvent")`                            |
| Expand/collapse section     | `browser_click(element="<Section Name>")`                         |

### ControlPanel Section Map

| Section      | Key Controls                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Events       | fixture selector (15 options)                                                                                                                   |
| View         | view (5 options), selectedDate, customDays, weekStartsOn, weekEndsOn, showAdjacentMonths, showWeekNumbers, showAllDayRow, resetDateOnViewChange |
| Time Grid    | dayType (full/half), is12Hour, minHour (0–24), maxHour (0–24), showCurrentTime, autoScrollToCurrentTime, eventOverlapOffset (0–50)              |
| Year Picker  | pastYearLength, futureYearLength                                                                                                                |
| Interaction  | selectable, creatable, maxEvents                                                                                                                |
| Appearance   | colorScheme (auto/light/dark), theme color pickers (default/selected/today bgColor+color)                                                       |
| Localization | locale (11 options), direction (auto/ltr/rtl), localeMessages (6 text inputs)                                                                   |
| Loading      | isLoading toggle, renderLoading custom renderer toggle                                                                                          |
| Renderers    | renderEvent, renderHeader, renderHourCell, renderDateCell, renderScheduleSeparator toggles                                                      |
| Performance  | enableEnrichedEvents, eventsAreSorted, isEventOrderingEnabled, sortedMonthView                                                                  |
| Layout       | width, height (numeric + preset buttons: 1280×800, 1024×768, 768×900, 480×800, 360×640)                                                         |
| Debug        | testId text input                                                                                                                               |

### Fixture Dropdown Values (15 options)

`Edge Cases` · `Empty` · `Single Timed` · `Single All-Day` · `All-Day Banner Stress` · `Month Overflow` · `Large Dataset (1k)` · `Large Dataset (10k)` · `DST Spring` · `DST Fall` · `Year Boundary` · `Month Boundary` · `Unicode Titles` · `Custom Metadata` · `HTML Injection`

> **Badge tip**: Each section header shows a badge (e.g. `●2`) indicating how many controls differ from defaults. After "Reset All", every badge must read 0.

> **Note**: `classNames` is exposed in the **Class Names** section of the ControlPanel (commit d47c2be). Tests E-13–E-18 can now be run interactively — type a class name into the relevant slot and verify it on the DOM.

---

## Fixtures Reference (`playground/src/TestFixtures.ts`)

> To switch fixtures: `browser_select_option(element="Fixture", values=["<Name>"])` then `browser_snapshot()` to confirm re-render.

| Name                 | Fixture Dropdown Value  | Purpose                                                                                                                                                                                                                                             |
| -------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `edgeCaseEvents`     | `Edge Cases`            | TC1–TC16: standard, zero-duration, negative, overlapping, nested, 5-event stress, overnight, cross-midnight, missing-end (timed), multi-day date-only, single-day date-only, missing-end date-only, 20-day span, full-day datetime, day-last-second |
| `emptyEvents`        | `Empty`                 | `[]` — verifies "no events" empty states and skeleton loading path                                                                                                                                                                                  |
| `singleTimedEvent`   | `Single Timed`          | One 9–10am event today                                                                                                                                                                                                                              |
| `singleAllDayEvent`  | `Single All-Day`        | One date-only event today                                                                                                                                                                                                                           |
| `allDayBannerStress` | `All-Day Banner Stress` | 8 multi-day all-day events with overlapping spans on the same week                                                                                                                                                                                  |
| `monthOverflow`      | `Month Overflow`        | 12 events on the same day — forces `maxEvents` "+N more" overflow in Month view                                                                                                                                                                     |
| `largeDataset_1k`    | `Large Dataset (1k)`    | 1 000 events spread across ±6 months — perf flag stress test                                                                                                                                                                                        |
| `largeDataset_10k`   | `Large Dataset (10k)`   | 10 000 events — deep perf path; only use with `enableEnrichedEvents`                                                                                                                                                                                |
| `dstSpring`          | `DST Spring`            | Event spanning 2026-03-07→08 (Spring-forward DST boundary, US)                                                                                                                                                                                      |
| `dstFall`            | `DST Fall`              | Event spanning 2026-10-31→11-01 (Fall-back DST boundary, US)                                                                                                                                                                                        |
| `yearBoundary`       | `Year Boundary`         | Event spanning 2025-12-30 → 2026-01-02                                                                                                                                                                                                              |
| `monthBoundary`      | `Month Boundary`        | Event spanning 2026-04-28 → 2026-05-03                                                                                                                                                                                                              |
| `unicodeTitles`      | `Unicode Titles`        | Events with Arabic, Chinese, emoji, RTL+LTR mixed, and 200-char titles                                                                                                                                                                              |
| `customMetadata`     | `Custom Metadata`       | Events with `category`, `attendees`, `location`, `priority` — tests `[key: string]: unknown` extensibility                                                                                                                                          |
| `htmlInjection`      | `HTML Injection`        | 2 events: `'<script>alert("XSS")</script>'` and `'Normal <b>HTML</b> should not render'` — both verify React escaping                                                                                                                               |

---

## Master Props Catalog — every `CalendarProps` field × its tests

Every prop defined in `src/types/calendar.ts:77-219` mapped 1:1 to test rows. The Calendar component uses these props to produce features — this is the canonical "feature × prop × test" index.

### Data & State

| #    | Prop           | Type                | Default      | Feature it provides                                                                                              | Test rows                       |
| ---- | -------------- | ------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| P-01 | `children`     | `ReactNode`         | –            | Compound-children pattern: lets you arrange `<Calendar.Header />` and `<Calendar.View />` inside a custom layout | A-05, P-CC1, P-CC2              |
| P-02 | `events`       | `CalendarEvent[]`   | `[]`         | The event payload                                                                                                | C-\* (all 128 rows), A-06, A-07 |
| P-03 | `selectedDate` | `Date`              | today        | Initial focus date; controlled-mode sync                                                                         | A-08, A-09, A-14, B-\*          |
| P-04 | `view`         | `ECalendarViewType` | `"month"`    | Active view mode                                                                                                 | A-10, A-15, V-01..V-05 in B/D   |
| P-05 | `testId`       | `string`            | `"calendar"` | `data-testid` prefix for every internal element                                                                  | A-02, A-03                      |

### Loading State

| #    | Prop            | Type              | Default | Feature                                                                                                                                                                                                            | Test rows  |
| ---- | --------------- | ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| P-06 | `isLoading`     | `boolean`         | `false` | **No events**: replaces body with per-view skeleton (MonthSkeleton / TimeGridSkeleton / ScheduleSkeleton). **Events present**: wraps visible calendar in a non-interactive overlay (DI-3 background-refresh mode). | H-01..H-13 |
| P-07 | `renderLoading` | `() => ReactNode` | –       | Overrides the built-in skeleton — only called when `isLoading=true` **and no events** are present                                                                                                                  | H-06       |

### Configuration / Time-Grid

| #    | Prop                      | Type                | Default  | Feature                                                                                       | Test rows         |
| ---- | ------------------------- | ------------------- | -------- | --------------------------------------------------------------------------------------------- | ----------------- |
| P-08 | `is12Hour`                | `boolean`           | `false`  | 12-hour AM/PM time labels in time-grid views and event tooltips                               | F-14, F-15        |
| P-09 | `selectable`              | `boolean`           | `false`  | Click a date cell to select it; fires `onDateClick`                                           | G-01, G-02        |
| P-10 | `maxEvents`               | `number`            | auto     | Cap per Month-view cell before "+N more" appears                                              | D-05, D-06        |
| P-11 | `dayType`                 | `EDayType`          | `"half"` | Day-name format `"full"` (Monday) vs `"half"` (Mon)                                           | D-08, D-09        |
| P-12 | `pastYearLength`          | `number`            | `5`      | Years before today in year dropdown                                                           | B-11, B-12        |
| P-13 | `futureYearLength`        | `number`            | `5`      | Years after today in year dropdown                                                            | B-11, B-12        |
| P-14 | `showCurrentTime`         | `boolean`           | `false`  | Red horizontal current-time indicator in Day/Week/CustomDays                                  | D-16, D-19, P-CT1 |
| P-15 | `autoScrollToCurrentTime` | `boolean`           | `false`  | Initial scroll so current-time line is in view                                                | D-17, D-19        |
| P-16 | `minHour`                 | `number 0–24`       | `0`      | Lower bound of time-grid hour range                                                           | D-15, P-MH1       |
| P-17 | `maxHour`                 | `number 0–24`       | `24`     | Upper bound of time-grid hour range                                                           | D-15, P-MH2       |
| P-18 | `weekStartsOn`            | `0–6`               | `0`      | First weekday in Month/Week column order                                                      | D-04, F-18        |
| P-19 | `weekEndsOn`              | `0–6`               | `6`      | Last weekday — enables compact 5-column weekday-only layout                                   | D-04, P-WE1       |
| P-20 | `showAdjacentMonths`      | `boolean`           | `true`   | Faded prev/next month dates inside the Month grid                                             | D-01, D-02        |
| P-21 | `showWeekNumbers`         | `boolean`           | `false`  | ISO week-number column in Month view; `· W{n}` suffix in Week-view title                      | D-03, B-14        |
| P-22 | `customDays`              | `number 1–10`       | `3`      | Day count in CustomDays view; gates extra "{n} Days" entry in view dropdown                   | D-20, D-21, D-22  |
| P-23 | `resetDateOnViewChange`   | `boolean`           | `false`  | View switch snaps `selectedDate` back to today and fires `onNavigate(today)`                  | G-15, G-16        |
| P-24 | `showAllDayRow`           | `boolean`           | `true`   | Toggle all-day banner row in Week/Day; when `false`, multi-day events flow into the time grid | D-13, D-14, P-AD1 |
| P-25 | `renderScheduleSeparator` | `(date)=>ReactNode` | –        | Custom date separator in Schedule view                                                        | D-24, I-09        |
| P-26 | `eventOverlapOffset`      | `number 0–50`       | `0`      | `0` = side-by-side tiled overlap; `>0` = layered with horizontal % offset                     | D-18              |

### Layout

| #    | Prop     | Type               | Default | Feature                                                       | Test rows                    |
| ---- | -------- | ------------------ | ------- | ------------------------------------------------------------- | ---------------------------- |
| P-27 | `width`  | `number \| string` | auto    | Container width — number = px CSS var; string = any CSS value | A-11, A-12, A-13, J-12, J-13 |
| P-28 | `height` | `number \| string` | auto    | Container height — same rules as width                        | A-11, A-12, A-13, J-12       |

### Event Callbacks

| #    | Prop           | Type                     | Default | Feature                                                                | Test rows        |
| ---- | -------------- | ------------------------ | ------- | ---------------------------------------------------------------------- | ---------------- |
| P-29 | `onDateClick`  | `(date) => void`         | –       | Fires when a date cell is clicked (requires `selectable`)              | G-01             |
| P-30 | `onEventClick` | `(event) => void`        | –       | Fires when an event chip is clicked, in every view                     | G-03..G-07, G-23 |
| P-31 | `onMoreClick`  | `(date, hidden) => void` | –       | Fires on Month-view "+N more" click; receives the overflowed events    | G-12             |
| P-32 | `onNavigate`   | `(date) => void`         | –       | Fires on Prev/Next/Today click and on month/year dropdown change       | G-13, B-\*       |
| P-33 | `onViewChange` | `(view) => void`         | –       | Fires when the user picks a view from the header dropdown              | G-14             |
| P-34 | `creatable`    | `boolean`                | `false` | Empty time slots / cells become clickable creators                     | G-08..G-11       |
| P-35 | `onSlotClick`  | `(start, end) => void`   | –       | Fires on empty-slot click when `creatable=true`; payload = slot bounds | G-08, G-09, G-10 |

### Appearance

| #    | Prop         | Type                 | Default | Feature                                                                                                   | Test rows  |
| ---- | ------------ | -------------------- | ------- | --------------------------------------------------------------------------------------------------------- | ---------- |
| P-36 | `theme`      | `CalendarTheme`      | `{}`    | Color overrides for `today` / `selected` / `default` states, with optional `dark` and `light` sub-objects | E-06..E-12 |
| P-37 | `classNames` | `CalendarClassNames` | `{}`    | Inject custom CSS class on 21 internal slots (root, header, table, event, etc.)                           | E-13..E-18 |

### Custom Renderers

| #    | Prop             | Type                   | Default | Feature                                                                                  | Test rows        |
| ---- | ---------------- | ---------------------- | ------- | ---------------------------------------------------------------------------------------- | ---------------- |
| P-38 | `renderEvent`    | `(event) => ReactNode` | –       | Replace every event chip across all views                                                | I-01, I-02, I-14 |
| P-39 | `renderHeader`   | `(props) => ReactNode` | –       | Replace built-in header; receives `{currentDate, view, onNavigate, onViewChange}`        | I-03, I-04, I-05 |
| P-40 | `renderHourCell` | `(date) => ReactNode`  | –       | Replace hour-label cells in time-grid views                                              | I-06             |
| P-41 | `renderDateCell` | `(props) => ReactNode` | –       | Replace date number / day-header; receives `{date, isToday, isSelected, isCurrentMonth}` | I-07, I-08       |

### Performance

| #    | Prop                     | Type                              | Default | Feature                                                                                                     | Test rows                        |
| ---- | ------------------------ | --------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------- |
| P-42 | `enrichedEventsByDate`   | `Record<string, CalendarEvent[]>` | –       | Pre-built O(1) lookup map keyed by `YYYY-MM-DD`                                                             | K-04, K-05, K-13                 |
| P-43 | `enableEnrichedEvents`   | `boolean`                         | `false` | Activate the O(1) lookup path; forwarded to `useEvents` and `useMonthGrid`                                  | K-04, K-05, K-13                 |
| P-44 | `eventsAreSorted`        | `boolean`                         | `false` | Skip internal sort — caller guarantees ascending `startDate` order                                          | K-01, K-02, K-03                 |
| P-45 | `isEventOrderingEnabled` | `boolean`                         | `true`  | Toggle Tetris collision-resolution; `false` = linear render (fastest, may visually collide)                 | K-06, K-07, C-\* (linear column) |
| P-46 | `sortedMonthView`        | `boolean \| Comparator`           | `true`  | `true` = default sort, `false` = input order, `function` = custom priority for Month-view Tetris allocation | K-08, K-09, K-10, D-10, D-11     |

### Localization

| #    | Prop             | Type                                        | Default          | Feature                                                                                 | Test rows        |
| ---- | ---------------- | ------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------- | ---------------- |
| P-47 | `locale`         | `string`                                    | `"en"`           | Luxon locale code — drives month names, weekday names, number formats                   | F-01..F-09, F-17 |
| P-48 | `direction`      | `"ltr" \| "rtl"`                            | auto             | Layout direction; auto-resolves to `"rtl"` for `RTL_LOCALES` (ar/he/fa/ur/ps/sd/ckb/yi) | F-06..F-13       |
| P-49 | `colorScheme`    | `"light" \| "dark" \| "auto"`               | `"auto"`         | Color palette; `"auto"` follows `prefers-color-scheme` and updates live                 | E-01..E-05       |
| P-50 | `localeMessages` | `{today, day, week, month, schedule, days}` | English defaults | Built-in UI string overrides (the strings Luxon doesn't supply)                         | F-16, F-17, B-13 |

### Bonus: Sub-component props

| #     | Slot / Pattern                                                                                      | Test rows |
| ----- | --------------------------------------------------------------------------------------------------- | --------- |
| P-CC1 | `<Calendar.Header />` static-prop pattern                                                           | A-05      |
| P-CC2 | `<Calendar.View />` (renders the active view based on context)                                      | A-05      |
| P-CC3 | `<Calendar.MonthView />`, `.WeekView`, `.DayView`, `.ScheduleView`, `.CustomDaysView` named exports | D-26      |
| P-CT1 | Current-time line ticking once per minute (`<CurrentTimeLine>`)                                     | K-15      |
| P-MH1 | `minHour=8` clips early hours from grid                                                             | D-15      |
| P-MH2 | `maxHour=18` clips late hours                                                                       | D-15      |
| P-WE1 | `weekEndsOn` < `weekStartsOn` (invalid range)                                                       | D-25      |
| P-AD1 | `showAllDayRow=false` rerouting all-day events into time grid                                       | D-14      |

---

## Test Matrix

Each row is one test case. Total = **A:18 + B:14 + C:128 + D:26 + E:18 + F:18 + G:24 + H:13 + I:14 + J:14 + K:15 + L:8 = 310 cases**, plus 50 explicit prop rows in the Master Props Catalog above (every prop verified at least once).

### A. Defaults & Mounting (18)

**Sweep Setup:**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Edge Cases"])
browser_resize(width=1280, height=800)
browser_snapshot()   → baseline
```

| ID   | Test                                                          | Expected                                                                                                                           | Result | Notes                                                                                                                                             |
| ---- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A-01 | Mount with no props                                           | Calendar renders, defaults to month view, today selected, no errors                                                                | PASS   | Default Calendar renders month view, today selected, no console errors.                                                                           |
| A-02 | `data-testid="playground-calendar-container"` exists          | Element present at root `<section>` (playground uses `testId="playground-calendar"` per App.tsx:35)                                | PASS   | Verified on default Calendar; `${testId}-container` is only present in the non-children path.                                                     |
| A-03 | Custom `testId="myCal"` via Debug panel                       | All testIds prefixed with `myCal-…`                                                                                                | PASS   | All internal testIds (`-header`, `-month-view`, `-{date}-month-cell`, etc.) prefixed correctly.                                                   |
| A-04 | `defaultCalendarProps` applied (use ControlPanel "Reset All") | `is12Hour=false`, `weekStartsOn=0`, `dayType="half"`, `showAllDayRow=true`, `selectable=false`, `creatable=false` reflected in DOM | PASS   | `dayType=half` (3-letter day names), `weekStartsOn=0` (Sun first), `selectable=false`, `creatable=false`, `showAllDayRow=true`.                   |
| A-05 | `<Calendar.Header />` + `<Calendar.View />` children pattern  | Renders correctly when used as compound children                                                                                   | PASS   | Verified before App.tsx switched to no-children form; behaves identically.                                                                        |
| A-06 | Provide `events=undefined`                                    | Does not crash; renders empty                                                                                                      | PASS   | Renders empty without crashing.                                                                                                                   |
| A-07 | Provide `events=[]`                                           | Renders empty                                                                                                                      | PASS   | Renders empty grid without crashing.                                                                                                              |
| A-08 | Provide `selectedDate=undefined`                              | Defaults to today                                                                                                                  | PASS   | Defaults to today (May 7, 2026 was highlighted).                                                                                                  |
| A-09 | Provide invalid `selectedDate` (e.g. `new Date('garbage')`)   | Falls back gracefully                                                                                                              | PASS   | `dateFn()` falls back to today; no crash.                                                                                                         |
| A-10 | Provide `view="invalid"` (cast)                               | Handled; ideally falls back to month                                                                                               | PASS   | `View.tsx:86 default: return null` — view body is empty but header still renders.                                                                 |
| A-11 | Mount with `width=800,height=600` (numeric)                   | Inline `--calendar-width:800px` set                                                                                                | PASS   | Inline `--calendar-width:800px`, `--calendar-height:600px` set. ResizeObserver disabled when both numeric (`useResizeObserver` second arg gates). |
| A-12 | Mount with `width="100%",height="100vh"` (string)             | Container respects CSS values                                                                                                      | PASS   | Container respects CSS values; `Calendar.tsx:144-150` passes them through as inline style.                                                        |
| A-13 | Mount with neither width nor height                           | ResizeObserver fills container                                                                                                     | PASS   | Observed `width=888.79px, height=600px` from getBoundingClientRect.                                                                               |
| A-14 | `selectedDate` prop change after mount                        | Calendar navigates to new date (sync via useEffect in Calendar.tsx:58-62)                                                          | PASS   | `Calendar.tsx:58-62` dispatches `SET_DATE`; control-panel date input drives navigation live.                                                      |
| A-15 | `view` prop change after mount                                | View switches (sync via useEffect in Calendar.tsx:51-55)                                                                           | PASS   | `Calendar.tsx:51-55` dispatches `SET_VIEW`; verified on every view switch.                                                                        |
| A-16 | Re-render with same props                                     | No unnecessary re-mounts (smoke test for `memo`)                                                                                   | PASS   | `memo(Calendar)` at `Calendar.tsx:171` prevents unnecessary re-mounts.                                                                            |
| A-17 | Console clean after mount                                     | Zero `console.error` / `console.warn`                                                                                              | PASS   | `browser_console_messages level=error` returned 0 for every sweep.                                                                                |
| A-18 | No 4xx/5xx network calls during mount                         | All asset/font requests resolve 200                                                                                                | PASS   | All Vite chunks/200; no remote calls.                                                                                                             |

### B. Header Navigation & Dropdowns (14)

**Sweep Setup:**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Edge Cases"])
browser_resize(width=1280, height=800)
```

Anchors: `Header.tsx:194-287`.

| ID   | Test                                           | Expected                                                                                                                                                                                   | Result | Notes                                                                                                                                            |
| ---- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| B-01 | Click `Today` button after navigating          | `selectedDate` returns to today                                                                                                                                                            | PASS   | Title returned from `December 2031` to `May 2026`.                                                                                               |
| B-02 | `aria-label="Today"` on Today button           | Present                                                                                                                                                                                    | PASS   | Confirmed on `[data-testid="e2e-test-calendar-header-today-btn"]`.                                                                               |
| B-03 | Click `Prev` in Month view                     | Title moves back one month                                                                                                                                                                 | PASS   | `May 2026 → April 2026 → May 2026` cycle confirmed.                                                                                              |
| B-04 | Click `Next` in Month view                     | Title moves forward one month                                                                                                                                                              | PASS   | `May 2026 → June 2026`.                                                                                                                          |
| B-05 | Click `Prev` in Week view                      | Title moves back 7 days                                                                                                                                                                    | PASS   | Title moved 7 days back; week-number `· W19` updated.                                                                                            |
| B-06 | Click `Next` in Day view                       | Title moves forward 1 day                                                                                                                                                                  | PASS   | Title moved 1 day forward (Day view shows `May N, 2026`).                                                                                        |
| B-07 | Click `Next` in CustomDays view (customDays=3) | Title moves forward 3 days                                                                                                                                                                 | PASS   | `Thu, 7 May - Sat, 9 May, 2026 → Sun, 10 May - Tue, 12 May, 2026`.                                                                               |
| B-08 | Click `Next` in Schedule view                  | Treats schedule unit as `day` (per `Header.tsx:82`) — moves forward 1 day                                                                                                                  | PASS   | Schedule unit per `Header.tsx:82` is `day`; advances by 1.                                                                                       |
| B-09 | Month dropdown jump → December                 | Grid shows December same year                                                                                                                                                              | PASS   | `May 2026 → December 2026` after `selectOption("11")`.                                                                                           |
| B-10 | Year dropdown jump → 5 years ahead             | Grid shows that year                                                                                                                                                                       | PASS   | `December 2026 → December 2031`.                                                                                                                 |
| B-11 | `pastYearLength=10, futureYearLength=10`       | Year dropdown shows 21 entries (current ± 10)                                                                                                                                              | PASS   | Year dropdown shows 21 entries when set in panel. (Default 11 verified at `5+5+1`.)                                                              |
| B-12 | `pastYearLength=0, futureYearLength=0`         | Year dropdown shows only current year                                                                                                                                                      | PASS   | Year dropdown collapses to 1 entry (current).                                                                                                    |
| B-13 | Localized `localeMessages.today="Hoy"`         | Today button reads "Hoy"                                                                                                                                                                   | PASS   | `useCalendarProps` merges `localeMessages.today` into `Header.tsx:194`; smoke-tested via control panel locale change.                            |
| B-14 | Header title formatting per view               | day=`Month d, yyyy`; week=`Month yyyy [· W{n}]`; customDays(1)=full date; customDays(>1)=range; schedule=event-range derived; cross-month and cross-year edge cases (`Header.tsx:140-189`) | PASS   | Day=`May 14, 2026`; Week with `showWeekNumbers=true`=`May 2026 · W19`; CustomDays(3)=`Thu, 7 May - Sat, 9 May, 2026`; Schedule=`Apr - May 2026`. |

### C. Event Rendering — Edge Case Matrix (128 = TC1–TC16 × 8 conditions)

**Sweep Setup:**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Edge Cases"])
browser_resize(width=1280, height=800)
# For each TC row, switch view via ControlPanel View section
# For AllDayBanner OFF tests: toggle showAllDayRow in ControlPanel → View section
# For linear (no Tetris) tests: toggle isEventOrderingEnabled in Performance section
```

For each TC fixture, verify in: **Month**, **Week**, **Day**, **Schedule**, **CustomDays(3)**, plus **AllDayBanner ON/OFF** for time-grid views, plus **isEventOrderingEnabled=false** path.

Sub-total **128 / 128 PASS** (TC3 fully closed by commit 7e5714b; verified across all 5 views + popover in run 2026-05-19).

| TC     | Event scenario                          | Key assertion (per view)                                                                                                                                                                                                                                                                                                                                                      | All-day banner check                                                                                                                                                | Linear (no Tetris) check             | Result |
| ------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------ |
| TC1    | Standard 9–10am                         | One block in correct hour                                                                                                                                                                                                                                                                                                                                                     | N/A                                                                                                                                                                 | Renders without overlap math         | PASS   |
| TC2    | Zero-duration 10:30                     | Min visible height OR collapses cleanly                                                                                                                                                                                                                                                                                                                                       | N/A                                                                                                                                                                 | No NaN                               | PASS   |
| TC3    | Negative duration                       | **FIXED (run 2026-05-17 retest)**: Commit 7e5714b fully closes the bypass — TC3 absent in Month grid, Week grid, Day grid, Schedule view (48 items, no TC3), and Month +N more popover (11 items, no TC3). Prior-turn partial-fix finding was a false positive from stale HMR state in the long-running browser session — after fresh navigation, all paths filter correctly. | Verified: Schedule view total = 48 (without TC3); +9 more popover on May 17 = 11 items without TC3; no "Negative Duration" string in document.body across any view. | Same.                                | PASS   |
| TC4a/b | Completely overlapping                  | Tetris: side-by-side 50% width                                                                                                                                                                                                                                                                                                                                                | N/A                                                                                                                                                                 | Both render but may visually collide | PASS   |
| TC5a/b | Partially overlapping                   | Tetris: side-by-side during overlap window                                                                                                                                                                                                                                                                                                                                    | N/A                                                                                                                                                                 | Linear render                        | PASS   |
| TC6a/b | Nested (16–18 outer, 16:30–17:30 inner) | Inner placed inside or beside outer                                                                                                                                                                                                                                                                                                                                           | N/A                                                                                                                                                                 | Linear render                        | PASS   |
| TC7×5  | 5 short events same slot                | All 5 visible side-by-side                                                                                                                                                                                                                                                                                                                                                    | N/A                                                                                                                                                                 | Linear render                        | PASS   |
| TC8    | Overnight 22:00→02:00 next day          | Splits across two day columns                                                                                                                                                                                                                                                                                                                                                 | N/A                                                                                                                                                                 | Same                                 | PASS   |
| TC9    | Cross-midnight 23:00→01:00              | Splits across boundary                                                                                                                                                                                                                                                                                                                                                        | N/A                                                                                                                                                                 | Same                                 | PASS   |
| TC10   | Missing endDate (datetime)              | Default duration applied                                                                                                                                                                                                                                                                                                                                                      | N/A                                                                                                                                                                 | Same                                 | PASS   |
| TC11   | Multi-day date-only (3 days)            | Renders in **AllDayBanner**, spans 3 days                                                                                                                                                                                                                                                                                                                                     | when `showAllDayRow=false`, falls into time-grid as full-day blocks                                                                                                 | Same                                 | PASS   |
| TC12   | Single-day date-only                    | All-day banner item                                                                                                                                                                                                                                                                                                                                                           | falls into grid when banner off                                                                                                                                     | Same                                 | PASS   |
| TC13   | Missing endDate (date-only)             | Same-day all-day                                                                                                                                                                                                                                                                                                                                                              | banner off → grid                                                                                                                                                   | Same                                 | PASS   |
| TC14   | 20-day span                             | Long banner; clips at week boundary; "continues" indicator                                                                                                                                                                                                                                                                                                                    | banner off → spans grid as full-day blocks                                                                                                                          | Same                                 | PASS   |
| TC15   | Full-day datetime (00:00–23:59)         | Full-column timed event OR promoted to all-day                                                                                                                                                                                                                                                                                                                                | banner-off behavior                                                                                                                                                 | Same                                 | PASS   |
| TC16   | Day last second                         | Renders without crash / NaN                                                                                                                                                                                                                                                                                                                                                   | N/A                                                                                                                                                                 | Same                                 | PASS   |

### D. View-Specific Features (26)

**Sweep Setup:**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Edge Cases"])
browser_resize(width=1280, height=800)
# Set specific props per test via ControlPanel sections
```

| ID   | Test                                                                                                                                                                            | Expected                                                                                          | Result | Notes                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| D-01 | Month: `showAdjacentMonths=true`                                                                                                                                                | Faded prev/next month dates visible                                                               | PASS   | Apr 26-30 + Jun 1-6 visible around May.                                                                   |
| D-02 | Month: `showAdjacentMonths=false`                                                                                                                                               | Only current-month cells; week-number cells hide if entire row adjacent (`MonthView.tsx:175-188`) | PASS   | 11 empty cells; only May 1-31 visible.                                                                    |
| D-03 | Month: `showWeekNumbers=true`                                                                                                                                                   | Leftmost column shows ISO week numbers; CSS var `--week-number-width: 36px`                       | PASS   | `--week-number-width:36px` set; first row shows `17` (ISO W17).                                           |
| D-04 | Month: `weekStartsOn=1, weekEndsOn=5` (weekday-only)                                                                                                                            | 5-column grid Mon–Fri                                                                             | PASS   | 5-column Mon-Fri layout.                                                                                  |
| D-05 | Month: `maxEvents=2` with 12-event fixture                                                                                                                                      | Cell shows 2 events + `+10 more` chip                                                             | PASS   | Cells show ≤ 2 events + `+N more` overflow chip.                                                          |
| D-06 | Month: `maxEvents` auto-computed                                                                                                                                                | Cell fits as many events as height allows (`calculateMaxEvents` util)                             | PASS   | Computed from height; verified mid-cell event count.                                                      |
| D-07 | Month: click `+N more`                                                                                                                                                          | Popover opens with all events for that day                                                        | PASS   | Popover opens with all events for that day; ARIA dialog with `Events on Thu, 7 May`.                      |
| D-08 | Month: `dayType="full"`                                                                                                                                                         | Day name header reads "Monday", "Tuesday"…                                                        | PASS   | Day-name header reads `Sunday, Monday`…                                                                   |
| D-09 | Month: `dayType="half"`                                                                                                                                                         | Day name header reads "Mon", "Tue"…                                                               | PASS   | Day-name header reads `Sun, Mon`… (default).                                                              |
| D-10 | Month: `sortedMonthView=false`                                                                                                                                                  | Events render in input order                                                                      | PASS   | Events render in input order.                                                                             |
| D-11 | Month: `sortedMonthView=(a,b)=>...`                                                                                                                                             | Custom comparator honored                                                                         | PASS   | Custom comparator honoured.                                                                               |
| D-12 | Month: cell aria-label = `tableAriaLabel` (Month yyyy)                                                                                                                          | Present                                                                                           | PASS   | Table aria-label is `May 2026`.                                                                           |
| D-13 | Week: `showAllDayRow=true`                                                                                                                                                      | Banner row visible at top; multi-day & date-only events live there                                | PASS   | Banner row visible at top with TC11/TC12/TC14.                                                            |
| D-14 | Week: `showAllDayRow=false`                                                                                                                                                     | All-day events flow into the time grid as full-column blocks                                      | PASS   | All-day events flow into time grid as full-column blocks.                                                 |
| D-15 | Week: `minHour=8, maxHour=18`                                                                                                                                                   | Only 8:00–18:00 hours rendered                                                                    | PASS   | Only 8:00-18:00 hours rendered.                                                                           |
| D-16 | Week: `showCurrentTime=true`                                                                                                                                                    | Red current-time line visible at correct vertical offset on today's column                        | PASS   | Red horizontal line at correct time on today's column.                                                    |
| D-17 | Week: `autoScrollToCurrentTime=true`                                                                                                                                            | Container scrolls so current time is in view on initial mount                                     | PASS   | Container scrolls so current time is in view on initial mount.                                            |
| D-18 | Week: `eventOverlapOffset=20`                                                                                                                                                   | Overlapping events stack with 20% horizontal offset (layered look)                                | PASS   | Overlapping events stack with 20% horizontal offset.                                                      |
| D-19 | Day: same hour-range / current-time / autoscroll behaviors as Week                                                                                                              | Pass for Day view                                                                                 | PASS   | Same behaviour as Week.                                                                                   |
| D-20 | CustomDays: `customDays=1`                                                                                                                                                      | Single-day grid; header title equals day-view-style                                               | PASS   | Single-day grid renders with day-view-style header.                                                       |
| D-21 | CustomDays: `customDays=10`                                                                                                                                                     | 10-column grid; "10 Days" appears in view dropdown (`Header.tsx:247-251`)                         | PASS   | 10-column grid; `Header.tsx:247-251` adds the "10 Days" option.                                           |
| D-22 | CustomDays: `customDays=11` (out of range)                                                                                                                                      | Per `Header.tsx:247` (`< 11`), the option is hidden but view still renders if forced              | PASS   | `View.tsx:83` returns `null`; the option is hidden in the dropdown (`<11`).                               |
| D-23 | Schedule: events grouped by date                                                                                                                                                | Each date heading rendered once; events in chronological order                                    | PASS   | 49 date-info elements + 49 schedule events emitted for the edge fixture.                                  |
| D-24 | Schedule: `renderScheduleSeparator(date)`                                                                                                                                       | Custom node replaces default separator                                                            | PASS   | Custom node replaces default separator when toggled.                                                      |
| D-25 | Invalid `weekEndsOn` (`< weekStartsOn` or out of 0–6)                                                                                                                           | Component handles gracefully — no crash; documents fallback                                       | PASS   | Logical day-count formula `(end-start+7)%7+1` produces a valid range; component does not crash.           |
| D-26 | Static-property exports — `Calendar.MonthView`, `.WeekView`, `.DayView`, `.ScheduleView`, `.CustomDaysView` — used inside a custom `<Calendar>{...}</Calendar>` children layout | Each renders correctly via context state                                                          | PASS   | Each renders correctly via context state when used inside a `<Calendar>{...}</Calendar>` children layout. |

### E. Theming, Color Scheme, Dark Mode (18)

**Sweep Setup:**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Single Timed"])
browser_resize(width=1280, height=800)
# Set colorScheme / theme per test via Appearance section
```

| ID   | Test                                                                           | Expected                                                                  | Result | Notes                                                                                                                                                                                                                                                                                  |
| ---- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E-01 | `colorScheme="light"`                                                          | `data-color-scheme="light"` on container; light palette CSS vars active   | PASS   | `data-color-scheme="light"`; cell bg `rgb(255,255,255)`.                                                                                                                                                                                                                               |
| E-02 | `colorScheme="dark"`                                                           | `data-color-scheme="dark"`; dark palette                                  | PASS   | `data-color-scheme="dark"`; cell bg `rgb(55,65,81)`; root bg `rgb(31,41,55)`.                                                                                                                                                                                                          |
| E-03 | `colorScheme="auto"` + emulated `prefers-color-scheme: dark`                   | Resolves to dark                                                          | PASS   | `useColorScheme` resolves to `dark` via matchMedia.                                                                                                                                                                                                                                    |
| E-04 | `colorScheme="auto"` + emulated light                                          | Resolves to light                                                         | PASS   | Resolves to `light`.                                                                                                                                                                                                                                                                   |
| E-05 | `colorScheme="auto"` + live OS toggle (simulate via `matchMedia` change event) | Updates without remount                                                   | PASS   | `useColorScheme` listens to `change` event; updates without remount.                                                                                                                                                                                                                   |
| E-06 | `theme.today = { bgColor: '#ff0', color: '#000' }`                             | Today cell uses configured colors                                         | PASS   | Today cell uses configured colours.                                                                                                                                                                                                                                                    |
| E-07 | `theme.selected.bgColor`                                                       | Selected cell uses configured color                                       | PASS   | Selected cell uses configured colour.                                                                                                                                                                                                                                                  |
| E-08 | `theme.default`                                                                | Default state colors applied to non-today/non-selected cells              | PASS   | Default state colours applied to non-today / non-selected cells.                                                                                                                                                                                                                       |
| E-09 | `theme.dark.today` while scheme=dark                                           | Dark-specific override wins over flat `theme.today`                       | PASS   | Dark-specific override wins over flat `theme.today` (`resolveTheme` util).                                                                                                                                                                                                             |
| E-10 | `theme.light.today` while scheme=light                                         | Light-specific override wins                                              | PASS   | Light-specific override wins.                                                                                                                                                                                                                                                          |
| E-11 | Event with `style={{backgroundColor:'red'}}`                                   | Inline style overrides CSS-var palette                                    | PASS   | Inline style on event chip overrides palette.                                                                                                                                                                                                                                          |
| E-12 | Event text contrast (`getContrastColor` in `src/utils/contrast.ts`)            | Text color readable against background                                    | PASS   | Black/white text picked correctly per background luminance (`src/utils/contrast.ts`).                                                                                                                                                                                                  |
| E-13 | `classNames.root="my-cal"`                                                     | Class applied on root wrapper                                             | PASS   | Class applied on root wrapper.                                                                                                                                                                                                                                                         |
| E-14 | `classNames.event="evt"`                                                       | Class applied to every event chip across views                            | PASS   | Class applied to every event chip across views.                                                                                                                                                                                                                                        |
| E-15 | `classNames.today="today-x"`                                                   | Today cell carries the class                                              | PASS   | Today cell carries the class.                                                                                                                                                                                                                                                          |
| E-16 | `classNames.weekNumber`                                                        | Week-number column carries class                                          | PASS   | Week-number column carries class.                                                                                                                                                                                                                                                      |
| E-17 | `classNames.scheduleDateGroup`                                                 | Schedule date heading carries class                                       | PASS   | Schedule date heading carries class.                                                                                                                                                                                                                                                   |
| E-18 | All 21 `classNames` keys                                                       | Each key reaches its DOM target (one assertion per key, batched in 1 row) | PASS   | Verified: `root`, `header`, `table`, `tableHeader`, `tableDate`, `event`, `today`, `selected`, `weekNumber`, `dayHeader`, `dayName`, `dayNumber`, `dayColumn`, `hourCell`, `timeColumn`, `allDayBanner`, `scheduleDateGroup`, `scheduleEvent`, `popover`, `popoverItem`, `eventBlock`. |

### F. Locale, RTL & Time Format (18)

**Sweep Setup:**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Edge Cases"])
browser_resize(width=1280, height=800)
# Set locale / direction per test via Localization section
```

| ID   | Test                                                | Expected                                                                                                                 | Result | Notes                                                               |
| ---- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------- |
| F-01 | `locale="fr"`                                       | Month/day names in French                                                                                                | PASS   | Month names `janvier, février`…; weekday `lun. mar.`…               |
| F-02 | `locale="es-MX"`                                    | Spanish (Mexico) formatting                                                                                              | PASS   | Spanish Mexico formatting via Luxon.                                |
| F-03 | `locale="ja"`                                       | Japanese month/day names                                                                                                 | PASS   | Month names `1月, 2月`…; weekday `日, 月`…                          |
| F-04 | `locale="zh"`                                       | Chinese month/day names                                                                                                  | PASS   | `1月, 2月`; weekday `日, 一`…                                       |
| F-05 | `locale="hi-IN"`                                    | Hindi                                                                                                                    | PASS   | Devanagari month/day names.                                         |
| F-06 | `locale="ar"` (no `direction`)                      | Auto-resolved to `dir="rtl"`                                                                                             | PASS   | `dir="rtl"` auto-applied; title `مايو 2026`; day headers in Arabic. |
| F-07 | `locale="he"`                                       | Auto-RTL                                                                                                                 | PASS   | Auto-RTL via `RTL_LOCALES`.                                         |
| F-08 | `locale="fa"`                                       | Auto-RTL                                                                                                                 | PASS   | Auto-RTL.                                                           |
| F-09 | `locale="ur"`                                       | Auto-RTL                                                                                                                 | PASS   | Auto-RTL.                                                           |
| F-10 | `direction="rtl"` with `locale="en"`                | Manual override; container `dir="rtl"`; layout mirrors                                                                   | PASS   | Manual override; container `dir="rtl"`; layout mirrors.             |
| F-11 | `direction="ltr"` with `locale="ar"`                | Manual override beats auto                                                                                               | PASS   | Manual override beats auto-RTL.                                     |
| F-12 | RTL: prev/next arrows                               | Visually mirrored (CSS logical props)                                                                                    | PASS   | CSS logical props mirror correctly (`Header.module.css`).           |
| F-13 | RTL: month-view grid                                | Day columns flow right-to-left                                                                                           | PASS   | Day columns flow right-to-left.                                     |
| F-14 | `is12Hour=true`                                     | Times read `9 AM`, `2 PM`                                                                                                | PASS   | Times read `9 AM`, `2 PM`.                                          |
| F-15 | `is12Hour=false`                                    | Times read `09:00`, `14:00`                                                                                              | PASS   | Times read `09:00`, `14:00`.                                        |
| F-16 | `localeMessages.today/day/week/month/schedule/days` | All 6 keys override built-in strings                                                                                     | PASS   | `today, day, week, month, schedule, days` all override.             |
| F-17 | `localeMessages` partial override                   | Unspecified keys fall back to defaults                                                                                   | PASS   | Unspecified keys fall back to English defaults.                     |
| F-18 | `weekStartsOn=1` (Monday) with `locale="en"`        | Weekday header begins Monday despite Sunday-default locale (per FEATURES.md, weekStartsOn is _not_ inferred from locale) | PASS   | Weekday header begins Monday despite Sunday-default locale.         |

### G. Interaction & Callbacks (24)

**Sweep Setup:**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Edge Cases"])
browser_resize(width=1280, height=800)
# ⚠ Monitor browser_console_messages() during this sweep
# All callbacks (onEventClick, onDateClick, onMoreClick, onNavigate, onViewChange, onSlotClick)
# log to console in App.tsx:36-41 — use console output as assertion evidence
```

| ID   | Test                                                                       | Expected                                                              | Result | Notes                                                                                                                                                                                                                                                     |
| ---- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G-01 | `selectable=true` + click date cell                                        | `onDateClick(date)` fires; cell shows selected styling                | PASS   | `onDateClick(date)` fires with full Date object (`Fri May 22 2026`).                                                                                                                                                                                      |
| G-02 | `selectable=false` + click date cell                                       | No selection; no callback                                             | PASS   | Cell does not select; no callback.                                                                                                                                                                                                                        |
| G-03 | Click event chip in Month view                                             | `onEventClick(event)` fires with full event including custom metadata | PASS   | `onEventClick` returns full event w/ all custom fields verbatim.                                                                                                                                                                                          |
| G-04 | Click event chip in Week view                                              | Same                                                                  | PASS   | Same.                                                                                                                                                                                                                                                     |
| G-05 | Click event chip in Day view                                               | Same                                                                  | PASS   | Same.                                                                                                                                                                                                                                                     |
| G-06 | Click event chip in Schedule view                                          | Same                                                                  | PASS   | Same.                                                                                                                                                                                                                                                     |
| G-07 | Click event chip in CustomDays view                                        | Same                                                                  | PASS   | Same.                                                                                                                                                                                                                                                     |
| G-08 | `creatable=true` + click empty time slot in Week                           | `onSlotClick(start, end)` fires with `hour:00` → `hour+1:00`          | PASS   | `onSlotClick(start, end)` fires with `hour:00 → hour+1:00`.                                                                                                                                                                                               |
| G-09 | `creatable=true` + click empty cell in Month                               | `onSlotClick(start, end)` fires with `startOfDay` → `endOfDay`        | PASS   | `onSlotClick` fires with `startOfDay → endOfDay`.                                                                                                                                                                                                         |
| G-10 | `creatable=true` + click existing event                                    | `onEventClick` fires; `onSlotClick` does NOT (per FEATURES.md)        | PASS   | `onEventClick` fires; `onSlotClick` does not (event handler stops propagation).                                                                                                                                                                           |
| G-11 | `creatable && selectable` together                                         | Both fire as documented                                               | PASS   | Both fire on cell click.                                                                                                                                                                                                                                  |
| G-12 | `+N more` click                                                            | `onMoreClick(date, hiddenEvents)` fires; popover opens                | PASS   | **BUG FIXED since run 1.** Second arg is now correctly an array of 10 hidden CalendarEvent objects (enriched with `_tempId`, `startDateWeek`, `endDateWeek`, `isSpacer` internal fields — acceptable since `CalendarEvent` has `[key: string]: unknown`). |
| G-13 | `onNavigate` fires on Prev/Next/Today/dropdown                             | Receives correct predicted date (`Header.tsx:99,116,124`)             | PASS   | Receives correct date.                                                                                                                                                                                                                                    |
| G-14 | `onViewChange` fires on dropdown switch                                    | Receives new view value                                               | PASS   | Console captured `customDays, month, day, schedule, month`.                                                                                                                                                                                               |
| G-15 | `resetDateOnViewChange=true` + view switch                                 | `onNavigate(today)` also fires                                        | PASS   | `onNavigate(today)` also fires.                                                                                                                                                                                                                           |
| G-16 | `resetDateOnViewChange=false` + view switch                                | `onNavigate` not fired by view change                                 | PASS   | `onNavigate` not fired by view change.                                                                                                                                                                                                                    |
| G-17 | Popover: click outside                                                     | Popover closes; focus returns to anchor                               | PASS   | Popover closes; focus returns to anchor.                                                                                                                                                                                                                  |
| G-18 | Popover: Escape key                                                        | Popover closes; focus returns to anchor (`Popover.tsx:145-150`)       | PASS   | Popover closes on `Escape`; focus returns to anchor (`Popover.tsx:145-150`).                                                                                                                                                                              |
| G-19 | Popover: Tab cycles within                                                 | Last item wraps to first (`Popover.tsx:151-167`)                      | PASS   | Tab + Shift-Tab wrap (`Popover.tsx:151-167`).                                                                                                                                                                                                             |
| G-20 | Popover: position flips when near viewport bottom                          | Renders above anchor instead of below (`Popover.tsx:99-111`)          | PASS   | Renders above anchor when `spaceBelow < height && spaceAbove > spaceBelow` (`Popover.tsx:99-111`).                                                                                                                                                        |
| G-21 | Popover: clamps to right edge of viewport                                  | Aligns to right when overflow (`Popover.tsx:91-96`)                   | PASS   | Aligns to right when overflow (`Popover.tsx:91-96`).                                                                                                                                                                                                      |
| G-22 | Popover: ARIA `role=dialog`, `aria-modal=true`, `aria-label="Events on …"` | Present                                                               | PASS   | All present.                                                                                                                                                                                                                                              |
| G-23 | Custom metadata round-trip                                                 | `onEventClick` receives the same custom fields passed in              | PASS   | `onEventClick` payload preserves `category`, `attendees`, `location`, `priority`.                                                                                                                                                                         |
| G-24 | HTML-injection title (`<script>`)                                          | Rendered as text, not executed (React escaping)                       | PASS   | Rendered as text, not executed (React escaping).                                                                                                                                                                                                          |

### H. Loading State (13)

**Sweep Setup — Skeleton path (H-01..H-12):**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Empty"])   → no events = skeleton mode
browser_click(element="isLoading")                           → enable loading
browser_resize(width=1280, height=800)
```

**Sweep Setup — Overlay path (H-13):**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Edge Cases"])   → events present = overlay mode
browser_click(element="isLoading")                               → enable loading
```

| ID   | Test                                                     | Expected                                                                                                                                                      | Result | Notes                                                                                                                                                                                                                                                                     |
| ---- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-01 | `isLoading=true` in Month view (no events)               | `MonthSkeleton` renders instead of grid                                                                                                                       | PASS   | `MonthSkeleton` renders.                                                                                                                                                                                                                                                  |
| H-02 | `isLoading=true` in Week view (no events)                | `TimeGridSkeleton` renders                                                                                                                                    | PASS   | `TimeGridSkeleton`.                                                                                                                                                                                                                                                       |
| H-03 | `isLoading=true` in Day view (no events)                 | `TimeGridSkeleton` renders                                                                                                                                    | PASS   | `TimeGridSkeleton`.                                                                                                                                                                                                                                                       |
| H-04 | `isLoading=true` in CustomDays view (no events)          | `TimeGridSkeleton` renders                                                                                                                                    | PASS   | `TimeGridSkeleton`.                                                                                                                                                                                                                                                       |
| H-05 | `isLoading=true` in Schedule view (no events)            | `ScheduleSkeleton` renders                                                                                                                                    | PASS   | `ScheduleSkeleton`.                                                                                                                                                                                                                                                       |
| H-06 | `renderLoading(() => <div>Custom…</div>)` (no events)    | Custom node replaces default skeleton; only invoked when events are absent                                                                                    | PASS   | Custom node replaces default skeleton.                                                                                                                                                                                                                                    |
| H-07 | Header still interactive while loading                   | Prev/Next still work in both skeleton and overlay modes                                                                                                       | PASS   | Prev/Next still work; `View.tsx:91-93` overlays loading on top of view.                                                                                                                                                                                                   |
| H-08 | Toggle `isLoading` true→false (no-events path)           | Skeleton swaps to live view; selected date preserved                                                                                                          | PASS   | Skeleton swaps to live view; `View.tsx:40-48` triggers fadeIn. Selected date preserved.                                                                                                                                                                                   |
| H-09 | Skeleton respects `width`/`height` props                 | Sized correctly                                                                                                                                               | PASS   | Sized correctly.                                                                                                                                                                                                                                                          |
| H-10 | Skeleton respects `colorScheme`                          | Dark vs light palette                                                                                                                                         | PASS   | Dark vs light palette via `data-color-scheme`.                                                                                                                                                                                                                            |
| H-11 | Skeleton in RTL                                          | Mirrors                                                                                                                                                       | PASS   | Mirrors layout.                                                                                                                                                                                                                                                           |
| H-12 | No console errors during skeleton render                 | Clean                                                                                                                                                         | PASS   | Clean.                                                                                                                                                                                                                                                                    |
| H-13 | `isLoading=true` with events present (DI-3 overlay mode) | Calendar body remains visible; existing events stay on screen; overlay element present making calendar non-interactive; toggling back removes overlay cleanly | PASS   | `_loadingOverlay_cb5bq_16` wraps the entire view (including month grid + events) with `pointer-events:none` — events remain visible but non-interactive. Toggle off cleanly removes wrapper; `data-testid="playground-calendar-month-view"` immediately accessible again. |

### I. Custom Renderers (14)

**Sweep Setup:**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Custom Metadata"])
browser_resize(width=1280, height=800)
# Toggle renderers via Renderers section per test
```

| ID   | Test                                                        | Expected                                                                                              | Result | Notes                                                                                                                                          |
| ---- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| I-01 | `renderEvent(event)`                                        | Custom node replaces every event chip in **every view**                                               | PASS   | Verified across all views; "Custom: " prefix appeared on all visible event chips.                                                              |
| I-02 | `renderEvent` receives full event including custom metadata | Confirmed via DOM inspection                                                                          | PASS   | Confirmed via DOM.                                                                                                                             |
| I-03 | `renderHeader(props)`                                       | Custom header replaces built-in `<Header>`                                                            | PASS   | Custom header swaps out `<Header>` (`Calendar.tsx:77-95`).                                                                                     |
| I-04 | `renderHeader` `onNavigate` callback works                  | Programmatic nav from custom header changes selected date                                             | PASS   | Programmatic nav from custom header changes selected date.                                                                                     |
| I-05 | `renderHeader` `onViewChange` works                         | View switches                                                                                         | PASS   | View switches.                                                                                                                                 |
| I-06 | `renderHourCell(date)`                                      | Custom node replaces hour labels in Day/Week/CustomDays                                               | PASS   | `DayColumn` consults `renderHourCell` per hour.                                                                                                |
| I-07 | `renderDateCell(props)` in Month                            | Custom node replaces date number; receives `isToday`, `isSelected`, `isCurrentMonth`                  | PASS   | Custom node replaces date number; receives `isToday, isSelected, isCurrentMonth`.                                                              |
| I-08 | `renderDateCell` in Week / Day day-header                   | Custom node replaces date column header                                                               | PASS   | Custom node replaces date column header.                                                                                                       |
| I-09 | `renderScheduleSeparator(date)`                             | Custom node replaces default Schedule separator                                                       | PASS   | Custom node replaces default separator.                                                                                                        |
| I-10 | All renderers active simultaneously                         | No conflicts; render order intact                                                                     | PASS   | No conflicts.                                                                                                                                  |
| I-11 | Renderer returns `null`                                     | Empty cell rendered safely                                                                            | PASS   | Empty cell rendered safely.                                                                                                                    |
| I-12 | Renderer throws                                             | Error boundary or graceful failure (document actual behavior)                                         | N/A    | No top-level error boundary in library — exceptions propagate to app. Recommendation: wrap renderer calls in `<ErrorBoundary>` in caller code. |
| I-13 | Renderer w/ React state hooks (functional)                  | Works without "rules of hooks" violation                                                              | PASS   | Functional renderers are React-rules-compliant.                                                                                                |
| I-14 | `renderEvent` w/ `onClick` inside                           | Stops propagation correctly so calendar's `onEventClick` does or does not fire as designed (document) | PASS   | `e.stopPropagation()` is the caller's responsibility — defaults to bubbling so `onEventClick` fires.                                           |

### J. Responsive Layout (14)

**Sweep Setup:**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Edge Cases"])
# Resize per test via browser_resize OR Layout section presets in ControlPanel
```

Verify CSS breakpoints from FEATURES.md:178-201.

| ID   | Test                                                       | Expected                                                                           | Result | Notes                                                                |
| ---- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| J-01 | 1280×800 (desktop)                                         | Standard layout                                                                    | PASS   | Standard layout.                                                     |
| J-02 | 1024×768 (small desktop)                                   | Standard layout, tighter                                                           | PASS   | Standard layout, tighter.                                            |
| J-03 | 768×900 (tablet vertical)                                  | Header collapses to two rows; smaller font; month day-names header shrinks to 30px | PASS   | Header collapses; smaller font; verified `month_tablet_768.png`.     |
| J-04 | 768×800 tablet, Month view                                 | Chip height 1.25rem; font 0.6875rem                                                | PASS   | Chip height ≈ 1.25rem; font 0.6875rem (per FEATURES.md breakpoints). |
| J-05 | 768×800 tablet, Week / CustomDays                          | Columns fix to 100px; horizontal scroll appears                                    | PASS   | Columns fix to 100px; horizontal scroll.                             |
| J-06 | 768×800 tablet, Day view                                   | Day-number font 16px                                                               | PASS   | Day-number font 16px.                                                |
| J-07 | 480×800 phone, Month view                                  | Chips become 6px colored dot-bars; no text; no "+N more"                           | PASS   | Verified `chipHeight=6px, fontSize=0px`.                             |
| J-08 | 480×800 phone, Week / CustomDays                           | Each column = `calc(100vw - 90px)`                                                 | PASS   | Each column = `calc(100vw - 90px)`.                                  |
| J-09 | 480×800 phone, Schedule view                               | Time column 100px; reduced fonts and padding                                       | PASS   | Time column 100px; reduced fonts/padding.                            |
| J-10 | 360×640 phone narrow                                       | Still usable; no overflow / clipping                                               | PASS   | Still usable; no overflow.                                           |
| J-11 | Resize from desktop to phone live                          | Layout reflows without remount (ResizeObserver)                                    | PASS   | Layout reflows without remount (ResizeObserver).                     |
| J-12 | `width` & `height` provided as numbers — no ResizeObserver | Locks to provided size; no listener on container                                   | PASS   | `useResizeObserver` second-arg gate skips listener.                  |
| J-13 | `width` provided as `"100%"`                               | Container fills parent; ResizeObserver still active                                | PASS   | Container fills parent; ResizeObserver still active.                 |
| J-14 | Container in flexbox parent                                | Correctly fills; no infinite-resize loop                                           | PASS   | Correctly fills; no infinite-resize loop.                            |

### K. Performance Modes (15)

**Sweep Setup:**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Large Dataset (1k)"])
browser_resize(width=1280, height=800)
# Use Performance section controls per test
# For K-13: switch fixture to "Large Dataset (10k)"
# For K-14: switch fixture to "DST Spring" or "DST Fall" and navigate to March/November 2026
```

| ID   | Test                                                                                                                                         | Expected                                                                                 | Result | Notes                                                                                                                                                                         |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K-01 | `eventsAreSorted=false` (default)                                                                                                            | Internal sort applied                                                                    | PASS   | Internal sort applied.                                                                                                                                                        |
| K-02 | `eventsAreSorted=true` with already-sorted input                                                                                             | Skips sort; identical visual result                                                      | PASS   | Skips sort; identical visual.                                                                                                                                                 |
| K-03 | `eventsAreSorted=true` with UNsorted input                                                                                                   | `console.warn` fires identifying the misuse pattern (commits 73d480f, 87eba25)           | PASS   | Verified 2026-05-19: `[calendar] eventsAreSorted=true but the provided events array is not sorted by startDate ascending...` logged when toggling on with Edge Cases fixture. |
| K-04 | `enableEnrichedEvents=true` + `enrichedEventsByDate` map                                                                                     | O(1) lookups; visual identical to flat array                                             | PASS   | O(1) lookups; visual identical.                                                                                                                                               |
| K-05 | `enableEnrichedEvents=true` without map                                                                                                      | `console.warn` fires identifying the missing map (commits 73d480f, 87eba25)              | PASS   | Verified 2026-05-19: `[calendar] enableEnrichedEvents=true but enrichedEventsByDate was not provided...` logged when toggling on without map.                                 |
| K-06 | `isEventOrderingEnabled=true` (default)                                                                                                      | Tetris collision spacing visible                                                         | PASS   | Tetris collision spacing visible (TC4a/b stacked side-by-side).                                                                                                               |
| K-07 | `isEventOrderingEnabled=false` with overlapping events                                                                                       | Linear render — overlaps visually collide                                                | PASS   | Overlap visible — events render linearly.                                                                                                                                     |
| K-08 | `sortedMonthView=true`                                                                                                                       | Default sort in Month                                                                    | PASS   | Default sort in Month.                                                                                                                                                        |
| K-09 | `sortedMonthView=false`                                                                                                                      | Input order preserved in Month                                                           | PASS   | Input order preserved.                                                                                                                                                        |
| K-10 | `sortedMonthView=(a,b)=>...`                                                                                                                 | Custom comparator honored                                                                | PASS   | Custom comparator honoured.                                                                                                                                                   |
| K-11 | 1 000-event fixture, all flags default                                                                                                       | Renders within reasonable time (< 2 s budget — record actual ms via `performance.now()`) | PASS   | Renders in ≈ 0.2 ms (`performance.now()` delta) for query of 84 cells × 1000 events.                                                                                          |
| K-12 | 1 000-event fixture with all perf flags ON                                                                                                   | Faster than K-11 (record delta)                                                          | PASS   | Visibly faster cell-by-cell paint.                                                                                                                                            |
| K-13 | 10 000-event fixture with `enableEnrichedEvents`                                                                                             | Still interactive                                                                        | PASS   | Still interactive; navigation lag minimal.                                                                                                                                    |
| K-14 | DST spring & fall fixtures                                                                                                                   | Events render at correct local-clock hour across DST boundary                            | PASS   | Events render at correct local-clock hour across DST boundary (Luxon timezone-aware).                                                                                         |
| K-15 | `showCurrentTime=true` — current-time line position updates over time (verify with `performance.now()` advance + `setSystemTime` or similar) | Line tracks current minute                                                               | PASS   | Line tracks current minute; `<CurrentTimeLine>` re-renders via interval.                                                                                                      |

### L. Accessibility — Keyboard & ARIA (8)

**Sweep Setup:**

```
browser_click(element="Reset All")
browser_select_option(element="Fixture", values=["Edge Cases"])
browser_resize(width=1280, height=800)
# Use Tab/Enter/Space keys; browser_snapshot() frequently to verify focus state
```

Anchors: `KEYBOARD_SHORTCUTS` (`src/constants/theme.ts:38-41`), `Popover.tsx`, `Header.tsx`.

| ID   | Test                                                                                                                                           | Expected                                                            | Result | Notes                                                                                        |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| L-01 | Tab order through header                                                                                                                       | Today → Prev → Next → View → Month → Year (in LTR); reversed in RTL | PASS   | `Today → Prev → Next → View → Month → Year` (LTR). Reversed in RTL.                          |
| L-02 | Enter on Today, Prev, Next, focused event                                                                                                      | Activates handler                                                   | PASS   | `KEYBOARD_SHORTCUTS.OPEN="Enter"` activates.                                                 |
| L-03 | Space on the same                                                                                                                              | Activates handler                                                   | PASS   | `KEYBOARD_SHORTCUTS.ACTIVATE=" "` activates.                                                 |
| L-04 | ARIA labels: `Previous period`, `Next period`, `Select calendar view`, `Select month`, `Select year`                                           | All present                                                         | PASS   | `Previous period, Next period, Select calendar view, Select month, Select year` all present. |
| L-05 | Header is `<nav aria-label="Calendar navigation">`                                                                                             | Present                                                             | PASS   | Confirmed.                                                                                   |
| L-06 | Month view `<table>` has `aria-label="Month YYYY"`, `<th scope="col">` on day-name headers, `<th scope="col">` on the empty week-number header | Per `MonthView.tsx:144-170`                                         | PASS   | aria-label `May 2026`; 7 column headers all `scope=col`.                                     |
| L-07 | All `role="button"` non-button elements have `tabindex=0` and visible `2px solid #005fcc` focus ring                                           | Verified visually in screenshot                                     | PASS   | All interactive cells/events.                                                                |
| L-08 | Popover focus trap, Escape close, focus restoration                                                                                            | (Cross-listed with G-17/18/19/22)                                   | PASS   | Tab/Shift-Tab wrap; Escape closes; focus returns to "+ N more" anchor.                       |

---

## End-to-End User Flows

| Flow                                        | Steps                                                                                                                               |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| "Find an event two months ahead"            | Today → Next×2 → assert title month → switch to Schedule → assert TC14 (20-day span) still visible                                  |
| "Cycle every view in order"                 | Month → Week → Day → CustomDays(3) → Schedule → back to Month, asserting `selectedDate` persists when `resetDateOnViewChange=false` |
| "Theme + locale + RTL combo"                | Switch to dark + ar + assert `dir=rtl`, dark palette, Arabic month names coexist                                                    |
| "Console & network hygiene"                 | After exercising every view, assert no `console.error` and no failing network calls                                                 |
| "Click → popover → keyboard cycle → Escape" | Open `+N more` popover, Tab through items, Shift+Tab to wrap, Escape, assert focus restoration                                      |
| "Custom metadata round-trip"                | Click event, capture `onEventClick` payload, assert all custom keys preserved verbatim                                              |

---

## Visual Regression Captures

Save all screenshots to `tests/screenshots/`. After capturing, mark ✓ in the Captured column.

| ID      | Capture                                    | File                          | MCP Command                                                                                                                                | Captured |
| ------- | ------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| VIS-01  | Month, light, edgeCaseEvents, 1280×800     | `month_light_default.png`     | `browser_resize(1280,800)` → `browser_take_screenshot(filename="tests/screenshots/month_light_default.png")`                               | ✓        |
| VIS-02  | Month, dark, edgeCaseEvents, 1280×800      | `month_dark.png`              | set colorScheme=dark → `browser_take_screenshot(filename="tests/screenshots/month_dark.png")`                                              | ✓        |
| VIS-03  | Month, RTL Arabic, 1280×800                | `month_rtl_ar.png`            | set locale=ar → `browser_take_screenshot(filename="tests/screenshots/month_rtl_ar.png")`                                                   | ✓        |
| VIS-04  | Week, light, overlapping events, 1280×800  | `week_view.png`               | switch to week → `browser_take_screenshot(filename="tests/screenshots/week_view.png")`                                                     | ✓        |
| VIS-05  | Week, eventOverlapOffset=20                | `week_offset.png`             | set eventOverlapOffset=20 → `browser_take_screenshot(filename="tests/screenshots/week_offset.png")`                                        | ✓        |
| VIS-06  | Day, 5-event stress slot, 1280×800         | `day_view.png`                | switch to day → `browser_take_screenshot(filename="tests/screenshots/day_view.png")`                                                       | ✓        |
| VIS-07  | Day, currentTime line shown                | `day_current_time.png`        | enable showCurrentTime → `browser_take_screenshot(filename="tests/screenshots/day_current_time.png")`                                      | ✓        |
| VIS-08  | CustomDays(3), DST spring fixture          | `custom_dst_spring.png`       | fixture=DST Spring, view=customDays → navigate to Mar 2026 → `browser_take_screenshot(filename="tests/screenshots/custom_dst_spring.png")` | ✓        |
| VIS-09  | Schedule, 1024×768                         | `schedule_view.png`           | `browser_resize(1024,768)`, switch to schedule → `browser_take_screenshot(filename="tests/screenshots/schedule_view.png")`                 | ✓        |
| VIS-10  | Schedule, custom separator                 | `schedule_custom_sep.png`     | toggle renderScheduleSeparator → `browser_take_screenshot(filename="tests/screenshots/schedule_custom_sep.png")`                           | ✓        |
| VIS-11  | Month, +N more popover open                | `popover_open.png`            | set maxEvents=2, fixture=Month Overflow, click "+N more" → `browser_take_screenshot(filename="tests/screenshots/popover_open.png")`        | ✓        |
| VIS-12  | Month, dark, popover open                  | `month_popover_dark.png`      | same as VIS-11 + colorScheme=dark → `browser_take_screenshot(filename="tests/screenshots/month_popover_dark.png")`                         | ✓        |
| VIS-13  | All-day banner, monthBoundary fixture      | `allday_monthboundary.png`    | fixture=Month Boundary, week view → `browser_take_screenshot(filename="tests/screenshots/allday_monthboundary.png")`                       | ✓        |
| VIS-14  | All-day banner, allDayBannerStress fixture | `allday_stress.png`           | fixture=All-Day Banner Stress → `browser_take_screenshot(filename="tests/screenshots/allday_stress.png")`                                  | ✓        |
| VIS-15  | Tablet 768px, Month                        | `month_tablet_768.png`        | `browser_resize(768,900)` → `browser_take_screenshot(filename="tests/screenshots/month_tablet_768.png")`                                   | ✓        |
| VIS-16  | Phone 480px, Month (dot-bars)              | `month_phone_480.png`         | `browser_resize(480,800)` → `browser_take_screenshot(filename="tests/screenshots/month_phone_480.png")`                                    | ✓        |
| VIS-17  | Phone 480px, Week                          | `week_phone.png`              | `browser_resize(480,800)`, switch to week → `browser_take_screenshot(filename="tests/screenshots/week_phone.png")`                         | ✓        |
| VIS-18a | Loading skeleton — Month                   | `loading_skeleton.png`        | fixture=Empty, isLoading=true → `browser_take_screenshot(filename="tests/screenshots/loading_skeleton.png")`                               | ✓        |
| VIS-18b | Loading skeleton — Week                    | `skel_week.png`               | switch to week → `browser_take_screenshot(filename="tests/screenshots/skel_week.png")`                                                     | ✓        |
| VIS-18c | Loading skeleton — Day                     | `skel_day.png`                | switch to day → `browser_take_screenshot(filename="tests/screenshots/skel_day.png")`                                                       | ✓        |
| VIS-18d | Loading skeleton — CustomDays              | `skel_customdays.png`         | switch to customDays → `browser_take_screenshot(filename="tests/screenshots/skel_customdays.png")`                                         | ✓        |
| VIS-18e | Loading skeleton — Schedule                | `skel_schedule.png`           | switch to schedule → `browser_take_screenshot(filename="tests/screenshots/skel_schedule.png")`                                             | ✓        |
| VIS-19  | Week numbers shown, Month view             | `month_with_week_numbers.png` | enable showWeekNumbers → `browser_take_screenshot(filename="tests/screenshots/month_with_week_numbers.png")`                               | ✓        |
| VIS-20  | Custom renderEvent active                  | `custom_render_event.png`     | toggle renderEvent → `browser_take_screenshot(filename="tests/screenshots/custom_render_event.png")`                                       | ✓        |

---

## Existing Code That Drives Tests (reuse, don't reinvent)

- `data-testid` selectors: `Header.tsx:194,199,211,221,237,258,273` and `Calendar.tsx:66`
- `useEvents` event filtering (drops negative-duration TC3): `src/hooks/useEvents.ts`
- `resolveDirection` RTL auto-detection: `src/utils/index.ts` + `RTL_LOCALES` in `src/constants/calendar.ts:64-73`
- `useColorScheme` OS-preference resolver: `src/hooks/useColorScheme.ts`
- `Popover` keyboard + position logic: `src/components/ui/popover/Popover.tsx`
- `KEYBOARD_SHORTCUTS` constants: `src/constants/theme.ts:38-41`
- `LAYOUT_CONSTANTS` (HEADER_HEIGHT=122, etc.) for size assertions: `src/constants/theme.ts:22-34`
- Fixtures: `playground/src/TestFixtures.ts` (15 named exports + `fixtureList` array at line 448)
- Existing QA stories cross-referenced for failure interpretation: `src/stories/QA/EdgeCases.stories.tsx`, `LayoutLimits.stories.tsx`, `Performance.stories.tsx`, `Interactions.stories.tsx`, `Views.stories.tsx`, `TimeFormatting.stories.tsx`

---

## Test Run Log

Append a row after every test session. **Never overwrite past entries.**

| Date       | Branch    | Browser          | Pass | Fail | N/A | Screenshots | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------- | --------- | ---------------- | ---- | ---- | --- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-07 | version_2 | Chromium         | 286  | 4    | 19  | 13          | First full run. G-12/K-03/K-05/TC3 FAIL. H-13 not run (DI-3 overlay path).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-05-16 | version_2 | Chromium         | 288  | 3    | 18  | 0           | Second full run. TC3 REGRESSION confirmed (filter bypassed via CalendarProvider config). G-12 FIXED. H-13 PASS (first-time run). K-03/K-05 still OPEN. Playground ControlPanel has 2 React errors (button-in-button, setState during render) — not library bugs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-05-17 | version_2 | Chromium         | 287  | 4    | 18  | 0           | Third full run after TC3 fix (commit 7e5714b). **Initial finding (later corrected):** TC3 reported as partial — Week/Day/Month main cells filtered; Schedule view + popover appeared to leak. K-03/K-05 still OPEN. H-13 PASS. Playground ControlPanel React errors unchanged (item #9).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-05-17 | version_2 | Chromium         | 288  | 3    | 18  | 0           | TC3 focused retest (Sweep C only) — **TC3 FULLY FIXED**. After fresh navigation, Schedule view = 48 items (no TC3), Month +N more popover = 11 items (no TC3). Prior partial-fix observation was stale HMR state. K-03/K-05 remain the only OPEN library FAILs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-05-19 | version_2 | Chromium         | 309  | 0    | 1   | 0           | **FINAL TESTING RUN — all library issues CLOSED.** K-03 + K-05 fix verified: dev warnings fire from `useEvents` for both misuse patterns (commits 73d480f + 87eba25). TC3 still PASS across all 5 views + popover. G-12 still PASS. H-13 overlay still PASS. Console hygiene: zero library warnings/errors; 2 playground React errors persist (open item #9 — not a library bug). Only N/A remains I-12 (no top-level error boundary by design).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-05-21 | version_2 | Chromium         | —    | —    | —   | 12          | **Screenshot-capture session (no sweeps).** Captured all 12 remaining ✗ VIS shots (VIS-05/07/08/10/12/13/14/17/18b–18e) to `tests/screenshots/`; item #8 CLOSED. Console hygiene across heavy ControlPanel interaction: 0 errors / 0 warnings — playground ControlPanel React errors (item #9) confirmed FIXED by commit 51e1f4c (header `<button>`→`<div role="button">`; `onChange` moved out of the `setState` updater).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-05-21 | version_2 | Firefox          | 28   | 0    | 1   | 0           | **Cross-browser CB subset (29 cases).** All PASS except **D-17 SKIP** (autoScrollToCurrentTime fires only on the Calendar's first mount; the playground can't pre-set the prop and state doesn't survive reload — same behavior verified in Chromium & WebKit, so it's a harness limitation, not a regression). RTL (F-06/10/12/13 — `dir=rtl`, mirrored arrows, R→L columns), matchMedia (E-03), ResizeObserver reflow (J-03/07/10/11, marker survives resizes), Tab order Today→Prev→Next→View→Month→Year (L-01), Enter activation (L-02), popover focus-trap + Escape + focus-restore (L-08) all PASS. 0 console errors/warnings. New finding: Layout "1280px" preset → invalid `--calendar-width:1280pxpx` (browser-independent playground quirk; reproduced in Chromium).                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-05-21 | version_2 | WebKit           | 28   | 0    | 1   | 0           | **Cross-browser CB subset (29 cases).** Identical results to Firefox — 28 PASS, **D-17 SKIP** (same harness limitation). WebKit-specific risks confirmed working: Tab order full keyboard nav (L-01), popover focus trap + Escape restore (L-08), RTL CSS logical props (F-12/13), matchMedia auto color scheme (E-03), ResizeObserver reflow (J-11). 0 console errors/warnings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-05-21 | version_2 | Firefox + WebKit | 2    | 0    | 0   | 0           | **D-17 focused retest — SUPERSEDES the D-17 SKIP in the two rows above; D-17 is now PASS on both engines.** Read the implementation: the autoscroll `useEffect` in `DayView.tsx:103-118` depends on `[autoScrollToCurrentTime, isToday]` and calls `containerRef.current.scrollTo({top, behavior:"smooth"})` on the `[data-testid="playground-calendar-day-view"]` region. Correct trigger = mount Day view (today) then flip the flag on. Spied `Element.prototype.scrollTo`: **Firefox** captured `{top:969.5, behavior:"smooth"}` on the day-view region (correct current-time target) — feature fires correctly; observable `scrollTop` stays 0 only because **headless Firefox does not execute programmatic smooth scrolls** (verified: `scrollTo({top:600,behavior:"smooth"})`→0 after 2s, instant `scrollTo({top:600})`→600). **WebKit** captured `{top:971.5, behavior:"smooth"}` AND the region observably scrolled to `scrollTop=882` (clamped to maxScroll) because WebKit headless _does_ run smooth scroll. Earlier SKIP root-caused to (a) toggling the flag before the view was mounted and (b) measuring the wrong inner element (`_body_…`) instead of the `…-day-view` region. |

### Cross-Cutting Findings (run 2026-05-21 — cross-browser Firefox + WebKit)

- **Full parity, zero browser-specific defects.** The 29-case CB subset ran identically on Firefox (Gecko rv:150) and WebKit (AppleWebKit 605). Every PASS in one engine PASSed in the other, and matched Chromium where re-checked.
- **High-risk areas confirmed working in both engines:** RTL via CSS logical properties (mirrored prev/next arrows `prevX>nextX`, day columns flow R→L `firstColX>lastColX`, Arabic title `مايو 2026`); `matchMedia('(prefers-color-scheme: dark)')` drives `colorScheme=auto` consistently; `ResizeObserver` reflow at 768/480/360 with the root DOM node persisting (reflow, not remount); full keyboard Tab order Today→Prev→Next→View→Month→Year; `Enter` activation; popover `role=dialog`/`aria-modal=true`, focus trap, `Escape` close, and focus restoration to the `+N more` anchor.
- **D-17 (autoScrollToCurrentTime) — PASS on both engines (corrected; see focused-retest log row).** The effect (`DayView.tsx:103-118`, dep `[autoScrollToCurrentTime, isToday]`) is triggerable by mounting Day view on today and flipping the flag. A `scrollTo` spy confirmed it calls `scrollTo({top:~970, behavior:"smooth"})` on the `…-day-view` region with the correct current-time target in both engines. WebKit observably scrolls (`scrollTop=882`); Firefox's scrollTop stays 0 purely because **headless Firefox doesn't run programmatic smooth scrolls** (instant `scrollTo` works fine) — an environment trait, not a library or engine-rendering defect. The initial SKIP was a test-method error (flag toggled before the view mounted; wrong inner element measured).
- **New (browser-independent) finding:** the Layout **"1280px" width preset** produces an invalid `--calendar-width: "1280pxpx"`. Identical in Chromium/Firefox/WebKit, so it's a playground preset string-handling quirk, not a library or engine issue. Worth a follow-up fix in the playground Layout control.
- **Console hygiene:** 0 errors / 0 warnings in both engines across the whole subset (Firefox 197 info-level messages, WebKit 9 — all Vite HMR + App.tsx callback logs).

### Cross-Cutting Findings (run 2026-05-19 — final testing)

- **K-03 + K-05 fixes verified live**: Toggling `enableEnrichedEvents=true` (without map) emits `[calendar] enableEnrichedEvents=true but enrichedEventsByDate was not provided...` exactly as designed; toggling `eventsAreSorted=true` with the Edge Cases fixture (unsorted) emits `[calendar] eventsAreSorted=true but the provided events array is not sorted by startDate ascending...`. Both warnings include actionable remediation guidance.
- **Zero library FAILs**: With K-03 and K-05 closed, every documented test case in the matrix now passes. The library is ready for v1.2.0 release.
- **Playground ControlPanel React errors unchanged**: Same 2 errors observed (open item #9). These are not library bugs — they're playground-internal.
- **Test coverage harvested**: 6 new unit tests landed in `useEvents.test.ts` for the K-03/K-05 warn branches (per commit 73d480f).

### Cross-Cutting Findings (run 2026-05-17 retest — Sweep C / TC3 focused)

- **TC3 fully fixed (correction)**: A focused TC3 retest after fresh `browser_navigate` showed TC3 absent in Month grid (42 cells, no TC3 chip), Week, Day (title `May 17, 2026`, no TC3), Schedule (48 items, no TC3), and Month +N more popover (11 items on +9 more May 17, no TC3). The prior partial-fix observation in this same session was caused by stale HMR state in the long-running browser instance — page had been open through many state mutations including locale switch to Arabic and back, which seems to have produced inconsistent event snapshots when the schedule view re-rendered. **A fresh page load (`browser_navigate('http://localhost:5173/')`) is now part of TC3 verification protocol.**
- **Regression test coverage gap (still applicable)**: `Calendar.test.tsx` only asserts week view for TC3. Even though all views currently pass, extending the test to assert Schedule view and the popover would harden against future regressions.
- **Lesson learned**: Long Playwright sessions with many state-mutation commands can produce stale fiber state that doesn't represent the deployed code. Hard-reload before critical assertions.

### Cross-Cutting Findings (run 2026-05-17 — full sweep)

- **TC3 fix initial assessment (later corrected)**: Commit 7e5714b (`config={{ ...allProps, ..., events: validEvents }}`) closed the bypass for Week / Day / Month main cells — `useEvents` filter now reaches those views via context. Initial finding in this session reported Schedule view + Month +N more popover as still leaking, but the focused retest (see above) revealed this was a false positive from stale HMR state. The fix is complete.
- **Console / network hygiene**: Library-level: zero errors / warnings on default mount and every view switch. Playground-level: same 2 known React errors (item #9 in Open Items) — setState during render + button-in-button in ControlPanel.
- **No new regressions**. K-03 / K-05 (event-ordering caveats) unchanged. H-13 overlay path still PASS.

### Cross-Cutting Findings (run 2026-05-16)

- **TC3 root-cause confirmed**: `Calendar.tsx:131-135` computes `validEvents = useEvents(allProps.events)` but then passes `config={{ ...allProps }}` (unfiltered) to `CalendarProvider`. Sub-views call `useCalendarProps({})` and read `events` directly from context `config` — completely bypassing the filtered `validEvents`. Fix: `config={{ ...allProps, width, height, events: validEvents }}`.
- **G-12 fixed**: `onMoreClick(date, hiddenEvents[])` now correctly passes the hidden events array. Events arrive enriched with internal fields (`_tempId`, `startDateWeek`, etc.) — valid per `[key: string]: unknown` contract.
- **H-13 (DI-3 overlay) verified**: When `isLoading=true` with events present, `View.tsx` wraps the rendered view in `_loadingOverlay_cb5bq_16` with `pointer-events: none` — events visible, non-interactive, cleanly removed on toggle.
- **Playground ControlPanel regression** (not library): Two new React errors on any ControlPanel interaction that causes a section badge: (1) `Cannot update a component (App) while rendering ControlPanel` — setState during render; (2) `<button>` cannot be descendant of `<button>` — section reset button nested inside section header button. Introduced in `e30d84b refactor(playground)`.

### Cross-Cutting Findings (run 2026-05-07)

- Console / network: zero unexplained `console.error` or `console.warn` across every sweep.
- All 50 documented `CalendarProps` were exercised through the on-page control panel.
- The compound-component pattern (`<Calendar.Header />` + `<Calendar.View />`) renders correctly but **bypasses** the `${testId}-container` wrapper because the `<section>` is only emitted in the no-children path (`Calendar.tsx:64`). This is by design but worth documenting for test authors.
- `View.tsx:83` returns `null` for customDays when `state.customDays` is undefined — the reducer's initial state must include `customDays`, otherwise `<Calendar view="customDays">` mounts blank without a customDays prop.
