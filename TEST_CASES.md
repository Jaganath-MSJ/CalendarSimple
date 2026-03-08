# Comprehensive Calendar Library Test Cases

This document details all supported features, configurations, and data edge cases for the Calendar component. It serves as a testing manifest to verify that future updates preserve all functional, interaction, and rendering logic across views.

---

## 1. Core Feature & Configuration Tests

These test cases verify that the specific props and configurations passed to the `<Calendar />` component behave as expected.

### 1.1 View Rendering & Switching (`view` prop)

- **Month View (`ECalendarViewType.month`)**: Verify grid structures, trailing/leading month dates, and `+X more` truncation for dense days.
- **Week View (`ECalendarViewType.week`)**: Verify 7-day columns align correctly with the Y-axis time grid.
- **Day View (`ECalendarViewType.day`)**: Verify single-day column expands to full width and aligns with the Y-axis time grid.
- **Schedule View (`ECalendarViewType.schedule`)**: Verify a chronological list of events groups successfully by Date headers.
- **View Switching Callback**: Set up an external UI switcher, trigger `onViewChange`, and verify the calendar safely transitions.

### 1.2 Time Display Formatting

- **12-Hour Format (`is12Hour={true}`)**: Verify the Y-axis renders standard AM/PM format (e.g., 2:00 PM).
- **24-Hour Format (`is12Hour={false}`)**: Verify the Y-axis renders military/24-hour format (e.g., 14:00).

### 1.3 Current Time Indicators

- **Show Indicator (`showCurrentTime={true}`)**: Verify the horizontal red line appears at precisely the current local time in `Day` and `Week` views.
- **Hide Indicator (`showCurrentTime={false}`)**: Verify the red line is completely unmounted.
- **Cross-Day Reset**: View the calendar exactly at midnight (12:00 AM) and ensure the line seamlessly resets to the top of the grid on the next column.

### 1.4 Auto-Scrolling Mechanism

- **Initial Load (`autoScrollToCurrentTime={true}`)**: Verify the container immediately scrolls to bring the current time slot into the vertical viewport boundary on mount.
- **View Change Re-Scroll**: Switch from `Month` to `Day` view; verify it auto-scrolls down again.
- **Disabled State (`autoScrollToCurrentTime={false}`)**: Ensure the calendar loads at the very top (12:00 AM) without jumping down.

### 1.5 Interactions (`selectable` prop & Callbacks)

- **Enable Selectable (`selectable={true}`)**:
  - Click an empty grid cell. Assert `onDateClick` fires with the correct `Date` context corresponding to that specific time slot.
  - Click a rendered event. Assert `onEventClick` fires with the fully populated `CalendarEvent` object.
- **Disable Selectable (`selectable={false}`)**: Verify both `onDateClick` and `onEventClick` handlers do not fire and cursor styling neutralizes.
- **More Events Click (`onMoreClick`)**: In Month View or All-Day banner, click the `+X more` pill and assert `onMoreClick` fires with the correct `Date` and array of `hiddenEvents`.
- **Navigation Click (`onNavigate`)**: Click the next/prev chevrons or "Today" button and assert `onNavigate` fires with the target `Date`.
- **Controlled Date State**: Bind a React state (e.g., `const [date, setDate] = useState()`) to `selectedDate` and update it via `onDateClick` and `onNavigate`. Verify the Calendar correctly navigates to the newly selected date when clicked.

### 1.6 All-Day Banner Thresholds & Interactions

- **Custom Max Events (`maxEvents={N}`)**: Provide exactly `N+2` overlapping all-day events. Verify exactly `N` renders fully, and a `+2 more` pill appears left-aligned (matching Google Calendar styling). Ensure no visual overflow occurs.
- **Event Tooltips**: Hover over truncated or fully rendered events inside the All-Day Banner. Verify the custom formatted tooltip text correctly displays the event details to the user.
- **Clipped Edges**: Ensure events that span beyond the currently visible week or day have appropriate styling indicating they are clipped/continue off-screen.

### 1.7 Navigation Constraints

- **Past Bounds (`pastYearLength={N}`)**: Verify the header controls block backward navigation beyond `N` years in the past.
- **Future Bounds (`futureYearLength={N}`)**: Verify the header controls block forward navigation beyond `N` years into the future.

### 1.8 Layout Limits

- **Day Type (`dayType="full" | "half"`)**: Verify day columns render accordingly based on strict boundaries if this feature is activated on custom views.
- **Responsive Sizing (`width`, `height`)**: Test explicitly passing fixed pixel values (e.g., `width={800}`) vs relying on the `useResizeObserver` for `100%` container stretching.

### 1.9 Theming & Styling

- **Custom CSS Classes (`classNames`)**: Inject custom classes into `root`, `header`, `event`, and `timeSlot`. Inspect DOM to ensure class string concatenation is successful without overwriting defaults.
- **Theme Colors (`theme`)**: Pass specific hex codes into `theme={{ default: { bgColor: "black", color: "white" } }}` and verify styling.

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
- **Partial Overlap**: Event A (2:30P - 3:30P) and Event B (3:00P - 4:00P). Verify grid adjusts widths cleanly for overlapping segments and restores full width for non-overlapping segments (if supported).
- **Nested Overlap**: Outer Event is 2 hours. Inner Event fully encompassed inside that 2 hours. Verify stacking contexts visually indicate grouping.
- **Stress Concurrency**: 5 events starting simultaneously. Verify column horizontal math divides width by 5, avoiding container overflow.

### 2.5 Data Integrity (Missing Fields)

- **Missing Title/ID**: Event objects without `id`, or `color`. Ensure auto-generated IDs and default labels ("No Title") are provided natively to prevent crash.
- **Invalid Dates**: Non-standard string like `"fake-date"` passed. Ensure parsing functions exit cleanly and do not crash the component tree.
