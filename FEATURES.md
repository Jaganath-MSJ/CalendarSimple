# Calendar Simple - Detailed Feature Guide

This document provides a comprehensive breakdown of the features available in the `calendar-simple` library and how you can take full advantage of them.

## 🗓️ Multiple Views

The calendar is designed to provide users with multiple perspectives of their schedule. You can switch between these views using the `view` prop (`ECalendarViewType`).

- **Month View (`"month"`)**: The default view, displaying a traditional grid of the entire month. Events are stacked on each day, and if there are too many events to fit, a customizable "+X more" button appears.
  - **Adjacent Months**: Use the `showAdjacentMonths` prop to toggle the visibility of dates from the previous and next months in the current month's grid.
  - **Week Boundaries**: You can configure which days of the week begin and end the layout (e.g., standard Monday-Friday work week) via `weekStartsOn` and `weekEndsOn`.
- **Week View (`"week"`)**: Displays a 7-day column layout (or custom range using `weekStartsOn`/`weekEndsOn`) with a time grid. Events are rendered as blocks spanning their respective time slots, making it easy to identify overlapping schedules and free time.
  - **All-Day Row**: Automatically extracts all-day and multi-day events to a top banner. This can be disabled using `showAllDayRow={false}` which pushes them into the time grid as 24-hour blocks.
  - **Concurrent Event Layout**: Overlapping events are mathematically tiled to prevent collision. You can switch to a sleek, layered styling by providing a percentage via `eventOverlapOffset` (e.g. `15`).
- **Day View (`"day"`)**: Similar to the Week View but focused entirely on a single day. This is perfect for detailed daily planning and provides maximum horizontal space for event details.
- **Custom Days View (`"customDays"`)**: A flexible time-grid view that displays a specific number of days, starting from the current `selectedDate`. This is ideal for 3-day or 5-day "short week" views. The number of days is controlled by the `customDays` prop.
- **Schedule View (`"schedule"`)**: A chronological list of upcoming events grouped by date. This view is highly optimized for mobile devices or sidebars where space is limited and users just need to see "what's next."
  - **Custom Separators**: You can use `renderScheduleSeparator` to cleanly divide groups of events by rendering a line or date marker between dates.

## ✨ Event Handling

`calendar-simple` provides robust capabilities for rendering and interacting with events.

- **Data Structure**: Pass an array of `CalendarEvent` objects to the `events` prop. Each event strictly requires a `startDate` and a `title`, but optionally accepts an `endDate`, custom `style`, and an `id`.
- **Custom Metadata**: The `CalendarEvent` interface allows any `[key: string]: unknown`, meaning you can attach custom database IDs, descriptions, or payload data directly to the event object. This metadata is returned to you intact when the event is clicked.
- **Time Parsing**: `startDate` and `endDate` gracefully handle both Date-only formats (`YYYY-MM-DD`) for full-day events, and DateTime formats (`YYYY-MM-DDTHH:mm:ss`) for specific time blocks.

## 🎨 Theming & Customization

We provide two powerful layers of visual customization to ensure the calendar seamlessly integrates with your application's design system.

### 1. The `theme` Prop (Quick Colors)

The `theme` object allows you to quickly override the core accent colors of the calendar without touching CSS.

- **`today`**: Style the current real-world date. You can set the text `color` and the background `bgColor`.
- **`selected`**: Style the date that is currently selected by the user.
- **`default`**: Base colors for the calendar text and backgrounds.

### 2. The `classNames` Prop (Deep Customization)

For complete control over the layout, borders, font weights, and spacing, you can pass a `classNames` object. This allows you to inject your own CSS classes (like Tailwind utility classes or CSS Modules) directly into specific DOM elements.

- Example keys include `root`, `header`, `dayColumn`, `timeSlot`, `event`, `scheduleTitle`, and many more.

### 🧩 Custom Renderers (Ultimate Flexibility)

For scenarios where simple CSS/theme overrides aren't enough, `calendar-simple` provides high-level render props. This allows you to completely replace core UI elements with your own React components.

- **`renderEvent(event: CalendarEvent)`**: Completely replaces the default event chip across all views (Month, Week, Day, Schedule, and All-Day banners). This enables you to build complex, interactive event cards with custom internal layouts and logic.
- **`renderHeader(props: RenderHeaderProps)`**: Replaces the default top navigation header. You receive the `currentDate`, `view`, `onNavigate`, and `onViewChange` as props, allowing you to build a completely bespoke navigation experience.
- **`renderHourCell(date: Date)`**: Customizes the time grid slots in Day, Week, and Custom Days views. Ideal for adding background patterns, custom time labels, or indicating "busy" vs "free" time slots independently of events.
- **`renderDateCell(props: RenderDateCellProps)`**: Customizes individual date headers in Week/Day views and individual date cells in the Month view. You receive `date`, `isToday`, `isSelected`, and `isCurrentMonth`.

## 🕒 Time Formatting

Global applications require flexible time display options.

- **12-Hour vs 24-Hour**: By default, time is shown in the 24-hour format (e.g., `14:00`). By passing the `is12Hour={true}` prop, all time indicators across the Week, Day, and Schedule views, as well as event tooltips, will automatically switch to the 12-hour AM/PM format (e.g., `02:00 PM`).
- **Day Name Formatting**: Use the `dayType` prop to dictate how the days of the week are displayed in the headers. Choose between `"full"` (Monday, Tuesday) or `"half"` (Mon, Tue).
- **Time Range Limits**: Use `minHour` and `maxHour` (values 0-24) to constrain the visible time lines in Day and Week views, removing unnecessary empty hours.
- **Current Time Indicator**: Display a line indicating the current time in the Day and Week views by passing `showCurrentTime={true}`. You can also automatically scroll to this time when the view loads by passing `autoScrollToCurrentTime={true}`.

## 👆 Interactive Callbacks

Make your calendar reactive to user input by hooking into these extensive callback props:

- `onDateClick(date: Date)`: Triggered when a user clicks an empty cell or day header. Use this to update your local state or open an "Add Event" modal.
- `onEventClick(event: CalendarEvent)`: Triggered when a user clicks on a rendered event. Perfect for opening event details or edit screens.
- `onViewChange(view: ECalendarViewType)`: Fired when the user uses the built-in header tabs to change the view (e.g., switching from Month to Week).
  - **Auto-Reset Date**: If you pass `resetDateOnViewChange={true}`, the calendar will automatically snap back to the current day ("Today") whenever the user manually switches the view.
- `onNavigate(date: Date)`: Fired when the user clicks the "Next" or "Previous" buttons to flip through months/weeks, or uses the Month/Year dropdowns.
- `onMoreClick(date: Date, hiddenEvents?: CalendarEvent[])`: In the month view, if a day has too many events, a "+X more" text appears. Clicking it fires this callback, returning the specific date and an array of the events that were pushed out of view.

## 📱 Responsive Layout

- The calendar utilizes CSS Grid and Flexbox to fluidly adapt to the width and height of its parent container.
- If no explicitly fixed `width` or `height` props are provided, it relies on a ResizeObserver hook to monitor the DOM wrapper and recalculates internal sizes automatically, ensuring events and columns always align perfectly to the available space.

## ⚡ Performance Options

When rendering thousands of events simultaneously, you can utilize the internal performance engine to bypass intensive layout checks.

- **`enableEnrichedEvents` & `enrichedEventsByDate`**: Instead of passing a flat array of events and forcing the calendar to filter them by intersecting dates, you can map them externally (`Record<string, CalendarEvent[]>`) and pass them in to achieve true O(1) day-rendering lookups.
- **`eventsAreSorted`**: Skips the expensive initial `[...events].sort()` operations algorithmically when you feed the calendar a pre-sorted dataset.
- **`isEventOrderingEnabled`**: Setting this to `false` is an ultra-fast path for massive data payloads. It bypasses iterative sweep-line calculations and Tetris overlapping resolutions to assign items linearly, keeping performance instantaneous at the expense of visual collision spacing.
- **`sortedMonthView`**: Exposes the ability to enforce a custom priority/sorting-function inside the Month View for Tetris slot allocations, or turn them off completely.

## 🛡️ TypeScript Support

`calendar-simple` was built ground-up in TypeScript. All props, callback payloads, and internal data structures are exported, ensuring your IDE provides full intellisense and compile-time safety.
