# Comprehensive Calendar Library Test Cases

This document details all supported features, configurations, and data edge cases for the Calendar component. It serves as a testing manifest to verify that future updates preserve all functional, interaction, and rendering logic across views.

---

## 1. Core Feature & Configuration Tests

These test cases verify that the specific props and configurations passed to the `<Calendar />` component behave as expected.

### 1.1 View Rendering & Switching (`view` prop)

- **Month View (`ECalendarViewType.month`)**: Verify grid structures, trailing/leading month dates, and `+X more` truncation for dense days.
- **Week View (`ECalendarViewType.week`)**: Verify 7-day columns align correctly with the Y-axis time grid.
- **Day View (`ECalendarViewType.day`)**: Verify single-day column expands to full width and aligns with the Y-axis time grid.
- **Custom Days View (`ECalendarViewType.customDays`)**: Verify the specified `customDays` number of columns renders sequentially, starting from the current date.
- **Schedule View (`ECalendarViewType.schedule`)**: Verify a chronological list of events groups successfully by Date headers.
- **View Switching Callback**: Set up an external UI switcher, trigger `onViewChange`, and verify the calendar safely transitions.
  - **Reset Date**: Verify `resetDateOnViewChange={true}` correctly resets the calendar to the current real-world date upon view change.

### 1.2 Loading States (`isLoading`, `renderLoading`)

Two distinct loading modes apply depending on whether events are present:

- **Skeleton mode (no events)**: `isLoading={true}` with `events=[]`. Verify each view renders its own per-view skeleton: `MonthSkeleton` (month view), `TimeGridSkeleton` (week/day/customDays), `ScheduleSkeleton` (schedule).
- **Overlay mode (events present)**: `isLoading={true}` with non-empty events. Verify existing events remain visible under a non-interactive overlay (background-refresh pattern). Toggling `isLoading` back to `false` removes the overlay cleanly.
- **Custom skeleton (`renderLoading`)**: Provide a custom `() => ReactNode` renderer. Verify it replaces the default skeleton — only invoked when `isLoading=true` AND events are absent.
- **Header stays interactive**: In both skeleton and overlay modes, Prev/Next navigation must remain functional.
- **Toggle recovery**: `isLoading` true→false with no events; verify the live view restores and the selected date is preserved.
- **Style inheritance**: Skeleton respects `width`/`height` props and the resolved `colorScheme` (dark vs light palette).
- **RTL skeleton**: Skeleton layout mirrors correctly when `direction="rtl"` or auto-RTL locale is active.
- **Console hygiene**: Zero `console.error` / `console.warn` during skeleton render.

### 1.3 Time Display Formatting

- **12-Hour Format (`is12Hour={true}`)**: Verify the Y-axis renders standard AM/PM format (e.g., 2:00 PM).
- **24-Hour Format (`is12Hour={false}`)**: Verify the Y-axis renders military/24-hour format (e.g., 14:00).

### 1.4 Current Time Indicators

- **Show Indicator (`showCurrentTime={true}`)**: Verify the horizontal red line appears at precisely the current local time in `Day` and `Week` views.
- **Hide Indicator (`showCurrentTime={false}`)**: Verify the red line is completely unmounted.
- **Cross-Day Reset**: View the calendar exactly at midnight (12:00 AM) and ensure the line seamlessly resets to the top of the grid on the next column.

### 1.5 Auto-Scrolling Mechanism

- **Initial Load (`autoScrollToCurrentTime={true}`)**: Verify the container immediately scrolls to bring the current time slot into the vertical viewport boundary on mount.
- **View Change Re-Scroll**: Switch from `Month` to `Day` view; verify it auto-scrolls down again.
- **Disabled State (`autoScrollToCurrentTime={false}`)**: Ensure the calendar loads at the very top (12:00 AM) without jumping down.

### 1.6 Interactions (`selectable`, `creatable` & Callbacks)

- **Enable Selectable (`selectable={true}`)**:
  - Click an empty grid cell. Assert `onDateClick` fires with the correct `Date` context corresponding to that specific time slot.
  - Click a rendered event. Assert `onEventClick` fires with the fully populated `CalendarEvent` object.
- **Disable Selectable (`selectable={false}`)**: Verify both `onDateClick` and `onEventClick` handlers do not fire and cursor styling neutralizes.
- **Enable Creatable (`creatable={true}`)**:
  - Click an empty time slot in Week/Day view. Assert `onSlotClick(start, end)` fires with hour-aligned boundaries (e.g., 2:00 PM → 3:00 PM).
  - Click an empty cell in Month view. Assert `onSlotClick(start, end)` fires with `startOfDay → endOfDay`.
  - Click an existing event with `creatable=true`. Assert `onEventClick` fires; `onSlotClick` must NOT fire (event handler stops propagation).
- **`creatable` + `selectable` together**: Both callbacks fire independently on the same click target.
- **Disable Creatable (`creatable={false}`, default)**: `onSlotClick` never fires; no creation cursor appears.
- **More Events Click (`onMoreClick`)**: In Month View or All-Day banner, click the `+X more` pill and assert `onMoreClick` fires with the correct `Date` and array of `hiddenEvents`.
- **Navigation Click (`onNavigate`)**: Click the next/prev chevrons or "Today" button and assert `onNavigate` fires with the target `Date`.
- **Controlled Date State**: Bind a React state (e.g., `const [date, setDate] = useState()`) to `selectedDate` and update it via `onDateClick` and `onNavigate`. Verify the Calendar correctly navigates to the newly selected date when clicked.
- **`testId` Prop**:
  - Default (no prop): root container carries `data-testid="calendar-container"`.
  - Custom: Pass `testId="myCal"`. Verify all internal elements are prefixed (`myCal-header`, `myCal-month-view`, `myCal-{date}-month-cell`, etc.).
- **Popover ("+N more" overflow)**:
  - **Open**: Click `+N more` chip; assert popover appears as `role="dialog"` with `aria-modal=true` and `aria-label="Events on <date>"`.
  - **Close via click-outside**: Click outside popover; assert it closes and focus returns to the anchor element.
  - **Close via Escape**: Press Escape; assert popover closes and focus returns to the anchor.
  - **Tab cycle**: Tab within popover wraps from last item to first; Shift-Tab wraps in reverse.
  - **Viewport flip**: When the popover anchor is near the bottom of the viewport, the popover renders above the anchor instead of below.
  - **Viewport clamp**: When overflowing the right edge, the popover aligns to the right edge.

### 1.7 All-Day Banner Thresholds & Interactions

- **Toggle Row Visibility (`showAllDayRow={false}`)**: Verify the all-day banner unmounts entirely and all-day events are shifted down as 24-hour blocks within the time grid.
- **Custom Max Events (`maxEvents={N}`)**: Provide exactly `N+2` overlapping all-day events. Verify exactly `N` renders fully, and a `+2 more` pill appears left-aligned (matching Google Calendar styling). Ensure no visual overflow occurs.
- **Expand/Collapse Toggle**: When more all-day events exist than `maxEvents` allows, a show-more / show-less control renders. Click expand; all hidden events become visible. Click collapse; banner returns to `maxEvents` rows.
- **No Expand Toggle When Not Needed**: When total rows ≤ `maxEvents`, verify no expand control is rendered.
- **Event Tooltips**: Hover over truncated or fully rendered events inside the All-Day Banner. Verify the custom formatted tooltip text correctly displays the event details to the user.
- **Clipped Edges**: Ensure events that span beyond the currently visible week or day have appropriate styling indicating they are clipped/continue off-screen.

### 1.8 Navigation Constraints

- **Past Bounds (`pastYearLength={N}`)**: Verify the header controls block backward navigation beyond `N` years in the past.
- **Future Bounds (`futureYearLength={N}`)**: Verify the header controls block forward navigation beyond `N` years into the future.

### 1.9 Layout Limits

- **Adjacent Months (`showAdjacentMonths={true|false}`)**: Verify visibility toggle of dates from previous and following months filling out the start and end rows of the Month view grid.
- **Week Numbers (`showWeekNumbers={true|false}`)**: When `true`, verify an ISO week number column renders as the leftmost column in Month view, and the week-view header title appends a `· W{n}` suffix. When `false` (default), verify the column and suffix are absent.
- **Work Week Boundaries (`weekStartsOn`, `weekEndsOn`)**: Verify providing numeric ranges (e.g., 1-5 for Mon-Fri) strictly filters out rendering of weekend columns.
- **Visible Time Range (`minHour`, `maxHour`)**: Filter bounds to (e.g., 8 to 18). Verify the time grid correctly truncates the top and bottom hours while preserving correct proportional sizing of event positions.
- **Day Name Format (`dayType="full" | "half"`)**: Verify `"full"` renders complete weekday names in day-column headers ("Monday", "Tuesday"…) and `"half"` renders abbreviated names ("Mon", "Tue"…). Note: this prop controls name formatting only — time bounds are controlled by `minHour`/`maxHour`.
- **Invalid `weekEndsOn`**: Pass `weekEndsOn` value less than `weekStartsOn`. Verify the component handles gracefully without crash and uses a fallback day range.
- **Responsive Sizing (`width`, `height`)**: Test explicitly passing fixed pixel values (e.g., `width={800}`) vs relying on the `useResizeObserver` for `100%` container stretching.

### 1.10 Theming & Customization

- **Custom CSS Classes (`classNames`)**: Inject custom classes into `root`, `header`, `event`, and `timeSlot`. Inspect DOM to ensure class string concatenation is successful without overwriting defaults.
- **Theme Colors (`theme`)**: Pass specific hex codes into `theme={{ default: { bgColor: "black", color: "white" } }}` and verify styling.
- **Custom Render Props (`renderEvent`, `renderHeader`, `renderHourCell`, `renderDateCell`, `renderScheduleSeparator`)**: Replace default rendering (events, header, hour grid, date cells, schedule division lines) with custom React components and verify interaction callbacks/scaling integrity are preserved.

### 1.11 Performance Options

- **Enriched Events (`enableEnrichedEvents`, `enrichedEventsByDate`)**: Pass a pre-mapped dictionary of events directly to dates. Verify the layout renders the same UI via O(1) logic bypassing raw iteration.
- **Pre-Sorted Events (`eventsAreSorted`)**: Pass a pre-sorted array of events and true marker. Verify that the time-slot assignments match logic without executing intensive background mapping validations.
- **Unordered Placement Bypass (`isEventOrderingEnabled={false}`)**: Render thousands of heavy-payload events. Verify bypass disables Tetris and logic overlap, clamping DOM stack-ordering (z-index) properly without overflowing into sticky headers.
- **Sorted Month Logic (`sortedMonthView`)**: Pass a customized sort-function priority and assert Tetris grid stacks visually prioritize matching the custom logical rule.

### 1.12 Color Scheme & Dark Mode (`colorScheme`)

- **`colorScheme="light"`**: Force light theme regardless of OS setting; verify `data-color-scheme="light"` on root container and light palette CSS variables are active.
- **`colorScheme="dark"`**: Force dark theme; verify `data-color-scheme="dark"` and dark palette applied to grid, header, and event chips.
- **`colorScheme="auto"` (default) + OS dark**: Simulate `prefers-color-scheme: dark`; verify calendar resolves to dark and `data-color-scheme="dark"` is set.
- **`colorScheme="auto"` + OS light**: Simulate `prefers-color-scheme: light`; verify resolves to light.
- **Live OS toggle**: Fire the `prefers-color-scheme` change event; verify calendar updates without remount.
- **`theme.dark` / `theme.light` sub-objects**: When `colorScheme="dark"`, `theme.dark.today` overrides flat `theme.today`. When `colorScheme="light"`, `theme.light.today` wins.
- **Event `style` inline override**: `style={{ backgroundColor: 'red' }}` on an event overrides the CSS-var palette color.
- **Contrast utility**: Text color on event chips is auto-selected (black or white) based on background luminance for WCAG readability (`src/utils/contrast.ts`).
- **Skeleton in dark mode**: Loading skeleton correctly applies dark palette when resolved scheme is dark.

### 1.13 Internationalization & RTL (`locale`, `localeMessages`, `direction`)

- **`locale` prop**: Pass `locale="fr"`; verify month names and weekday abbreviations render in French. Repeat for other locales (e.g., `es-MX`, `ja`, `zh`, `hi-IN`).
- **`localeMessages` full override**: Pass all 6 keys (`today`, `day`, `week`, `month`, `schedule`, `days`); verify all header UI strings replaced.
- **`localeMessages` partial override**: Unspecified keys fall back to English defaults.
- **`weekStartsOn` independent of locale**: `weekStartsOn=1` (Monday) with `locale="en"` must start the week on Monday — locale does NOT auto-infer `weekStartsOn`.
- **Auto-RTL from locale**: Pass `locale="ar"` without explicit `direction`; verify `dir="rtl"` is auto-applied on the container and the layout mirrors. Same for `he`, `fa`, `ur`.
- **Manual `direction="rtl"` override**: With `locale="en"`, `direction="rtl"` forces RTL layout regardless of locale.
- **Manual `direction="ltr"` beats auto**: `locale="ar"` + `direction="ltr"` stays LTR, overriding auto-detection.
- **RTL layout checks**: Day columns flow right-to-left; prev/next header arrows mirror via CSS logical properties; time column moves to the right side.
- **RTL skeleton**: Loading skeleton mirrors correctly under RTL layout.

### 1.14 Responsive Layout & Container Sizing

- **Desktop (≥1280px wide)**: Standard layout — full header, full day-name row, normal event chip sizes.
- **Tablet (≤768px wide)**: Header collapses to two rows; smaller font sizes; Month day-name header row shrinks; event chips height at 1.25rem.
- **Phone (≤480px wide)**: Month event chips collapse to 6px colored dot-bars — no text, no `+N more` pill. Week/Day columns width = `calc(100vw - 90px)` with horizontal scroll.
- **Narrow phone (≤360px wide)**: Calendar still usable; no overflow or clipping.
- **Live resize**: Resize from desktop to phone; layout reflows via ResizeObserver without remounting the component.
- **Numeric `width`/`height`**: Providing numbers (e.g., `width={800}`) locks size via CSS vars (`--calendar-width`, `--calendar-height`); ResizeObserver listener is not attached.
- **String `width="100%"`**: Container fills parent; ResizeObserver stays active.
- **Flexbox parent**: Calendar fills correctly within a flex container; no infinite-resize loop.

### 1.15 Keyboard Navigation & Accessibility

- **Tab order (LTR)**: Focus cycles Today → Prev → Next → View select → Month select → Year select in order.
- **Tab order (RTL)**: Tab order is reversed to match reading direction.
- **Enter/Space activation**: Pressing Enter or Space on a focused Today, Prev, or Next button activates the handler identically to a mouse click.
- **ARIA labels on header controls**: `Previous period`, `Next period`, `Select calendar view`, `Select month`, `Select year` — all present as `aria-label` values.
- **Header landmark**: `<nav aria-label="Calendar navigation">` wraps all header controls.
- **Month table ARIA**: `<table aria-label="Month YYYY">` with `<th scope="col">` on all day-name and week-number column headers.
- **Focus ring visibility**: All `role="button"` non-button elements have `tabindex=0` and a visible focus ring (minimum 2px solid outline).
- **Popover focus trap**: Tab and Shift-Tab cycle within the popover only; pressing Escape closes it and returns focus to the `+N more` anchor.

### 1.16 Compound Sub-component API

- **Default render (no children)**: `<Calendar>` without children renders the built-in layout (header bar + active view body).
- **Children pattern**: Use `<Calendar.Header />` and `<Calendar.View />` as explicit children inside `<Calendar>{...}</Calendar>`; verify they share the same context state — navigation and view switching work identically.
- **Named view sub-components**: `<Calendar.MonthView />`, `<Calendar.WeekView />`, `<Calendar.DayView />`, `<Calendar.ScheduleView />`, `<Calendar.CustomDaysView />` — each renders correctly when composed inside a `<Calendar>` children layout via shared context.

---

## 2. Event Data & Edge Cases (The "Stress Suite")

These scenarios ensure that the calendar's internal math, layout engine, and data validation safely handle abnormal data inputs.

### 2.1 Multi-Day / All-Day Logic

- **Single-Day Date-Only (YYYY-MM-DD)**: An event missing a specific time. Must render in the All-Day Banner exclusively for that 1 day.
- **Multi-Day Date-Only (YYYY-MM-DD)**: E.g., spanning 3 full days. Must stretch seamlessly across 3 columns in the All-Day Banner.
- **Overnight Datetime Event (YYYY-MM-DDTHH:mm:ss)**: Starts 10:00 PM today, ends 2:00 AM tomorrow. Must render at the bottom of Day 1's grid and top of Day 2's grid, OR securely in the All-Day banner depending on library thresholds.
- **Cross-Midnight Precisely**: Starts 11:59 PM, ends 12:01 AM. Ensure no layout breakage from zero-height calculation errors.

### 2.2 Date String Oddities

- **Missing End Date (Datetime)**: Provide only a `startDate` with a specific time. Should fallback to a default duration block (e.g., 1 hour).
- **Missing End Date (Date-Only)**: Provide only a `startDate` like `2024-01-01`. Should assume it's a 1-day All-Day event.

### 2.3 Mathematical Boundaries

- **Zero Duration**: `startDate` equals `endDate`. Ensure it doesn't cause a divide-by-zero error in layout height; renders a minimum visual strip.
- **Negative Duration (Reversed Dates)**: `startDate` is temporally later than `endDate`. Ensure the library fails gracefully by actively filtering out and ignoring these invalid events to prevent layout engine crashes.
- **Extreme Range**: Event spans 5 years. Ensure Month layout handles it cleanly across navigations, and Week/Day view banners truncate safely.

### 2.4 Overlap & Layout Concurrency Constraints

- **Absolute Overlap**: 2 events exactly share 1:00 PM - 2:00 PM. Verify they share 50% width horizontally.
- **Layered Event Styling (`eventOverlapOffset={N}`)**: Verify overlapping events stagger horizontally to create a layered aesthetic rather than strictly splitting column width.
- **Partial Overlap**: Event A (2:30P - 3:30P) and Event B (3:00P - 4:00P). Verify grid adjusts widths cleanly for overlapping segments and restores full width for non-overlapping segments (if supported).
- **Nested Overlap**: Outer Event is 2 hours. Inner Event fully encompassed inside that 2 hours. Verify stacking contexts visually indicate grouping.
- **Stress Concurrency**: 5 events starting simultaneously. Verify column horizontal math divides width by 5, avoiding container overflow.

### 2.5 Data Integrity (Missing Fields)

- **Missing Title/ID**: Event objects without `id`, or `style`. Ensure auto-generated IDs and default labels ("No Title") are provided natively to prevent crash.
- **Invalid Dates**: Non-standard string like `"fake-date"` passed. Ensure parsing functions exit cleanly and do not crash the component tree.

### 2.6 Daylight Saving Time Boundaries

- **DST Spring-forward**: Event spanning the spring-forward night (e.g., US 2026-03-07 → 2026-03-08); verify the event renders at the correct local-clock hour on both sides of the DST boundary with no duplication or skipped rendering.
- **DST Fall-back**: Event spanning the fall-back night (e.g., US 2026-10-31 → 2026-11-01); verify no duplicate hour slot is rendered and the event is displayed at the correct wall-clock time throughout.

### 2.7 Year & Month Boundary Spanning

- **Year boundary**: Event spanning `2025-12-30 → 2026-01-02`; verify Month view shows the event in both the December grid and the January grid correctly.
- **Month boundary**: Event spanning `2026-04-28 → 2026-05-03`; verify the All-Day Banner correctly clips at the week edge and shows a continuation indicator in the following week's view.

### 2.8 Content & Title Edge Cases

- **Unicode titles**: Events with Arabic text, Chinese characters, emoji, RTL+LTR mixed strings, and 200-character titles; verify no layout overflow, truncation is visually clean, and no crash or render error occurs.
- **Custom metadata extensibility**: Events with extra fields (`category`, `attendees`, `location`, `priority`); verify `onEventClick` returns the full object including all custom keys verbatim — tests the `[key: string]: unknown` index signature.
- **HTML injection / XSS prevention**: Event titles containing `<script>alert("XSS")</script>` or `<b>HTML</b>`; verify React escaping prevents script execution and raw HTML rendering — content must appear as literal text only.

---

## 3. Known Issues (Open Bugs)

These are confirmed bugs discovered during Playwright test runs. They are tracked here so regression tests can target them and future fixes can be verified.

| ID   | Test                                              | Observed                                                                                                                         | Expected                                              | How to Reproduce                                                                                |
| ---- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| G-12 | `onMoreClick(date, hiddenEvents)` second argument | Second argument is always `undefined`                                                                                            | Should receive `CalendarEvent[]` of the hidden events | Month view + `maxEvents=2` + 12 events on one day → click `+10 more` → inspect callback payload |
| K-03 | `eventsAreSorted=true` with unsorted input        | ~~Events render in wrong visual order; no developer warning~~ **FIXED** — `console.warn` emitted when array is detected unsorted | `console.warn` logged in browser console              | Pass an unsorted `events` array with `eventsAreSorted=true` — check browser console             |
| K-05 | `enableEnrichedEvents=true` without map           | ~~Silently falls back to flat array; no warning emitted~~ **FIXED** — `console.warn` emitted when map is absent                  | `console.warn` logged in browser console              | Enable `enableEnrichedEvents=true` in ControlPanel without providing `enrichedEventsByDate`     |
| TC3  | Negative-duration events                          | Correctly filtered out (not rendered) — no dev-mode warning                                                                      | `console.warn` should be emitted in development mode  | Pass an event where `startDate` is later than `endDate` → check browser console for warning     |
