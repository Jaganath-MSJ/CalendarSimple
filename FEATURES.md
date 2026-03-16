# Calendar Simple - Detailed Feature Guide

This document provides a comprehensive breakdown of the features available in the `calendar-simple` library and how you can take full advantage of them.

## 🗓️ Multiple Views

The calendar is designed to provide users with multiple perspectives of their schedule. You can switch between these views using the `view` prop (`ECalendarViewType`).

- **Month View (`"month"`)**: The default view, displaying a traditional grid of the entire month. Events are stacked on each day, and if there are too many events to fit, a customizable "+X more" button appears. You can configure which days of the week begin and end the layout (e.g., standard Monday-Friday work week) via `weekStartsOn` and `weekEndsOn`.
- **Week View (`"week"`)**: Displays a 7-day column layout (or custom range using `weekStartsOn`/`weekEndsOn`) with a time grid. Events are rendered as blocks spanning their respective time slots, making it easy to identify overlapping schedules and free time.
- **Day View (`"day"`)**: Similar to the Week View but focused entirely on a single day. This is perfect for detailed daily planning and provides maximum horizontal space for event details.
- **Schedule View (`"schedule"`)**: A chronological list of upcoming events grouped by date. This view is highly optimized for mobile devices or sidebars where space is limited and users just need to see "what's next."

## ✨ Event Handling

`calendar-simple` provides robust capabilities for rendering and interacting with events.

- **Data Structure**: Pass an array of `CalendarEvent` objects to the `events` prop. Each event strictly requires a `startDate` and a `title`, but optionally accepts an `endDate`, custom `color`, and an `id`.
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
- `onNavigate(date: Date)`: Fired when the user clicks the "Next" or "Previous" buttons to flip through months/weeks, or uses the Month/Year dropdowns.
- `onMoreClick(date: Date, hiddenEvents?: CalendarEvent[])`: In the month view, if a day has too many events, a "+X more" text appears. Clicking it fires this callback, returning the specific date and an array of the events that were pushed out of view.

## 📱 Responsive Layout

- The calendar utilizes CSS Grid and Flexbox to fluidly adapt to the width and height of its parent container.
- If no explicitly fixed `width` or `height` props are provided, it relies on a ResizeObserver hook to monitor the DOM wrapper and recalculates internal sizes automatically, ensuring events and columns always align perfectly to the available space.

## 🛡️ TypeScript Support

`calendar-simple` was built ground-up in TypeScript. All props, callback payloads, and internal data structures are exported, ensuring your IDE provides full intellisense and compile-time safety.
