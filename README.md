# Calendar Simple

![npm](https://img.shields.io/npm/v/calendar-simple)
![npm unpacked size](https://img.shields.io/npm/unpacked-size/calendar-simple)
![npm downloads](https://img.shields.io/npm/dm/calendar-simple)
![license](https://img.shields.io/npm/l/calendar-simple)

A lightweight, customizable, and responsive calendar component for React applications. Built with TypeScript and Day.js, `calendar-simple` provides a flexible solution for date selection and event management in your React projects.

**[Live Demo](http://calendarsimple.netlify.app)**

## Features

- **🗓️ Multiple Views**: Support for Month, Week, Day, and Schedule views, giving users different perspectives of their events.
- **✨ Event Handling**: Built-in support for displaying and managing events with custom colors.
- **📱 Responsive**: Automatically adjusts layout based on container dimensions.
- **🎨 Theming & Customization**: Fully customizable colors via the `theme` prop and individual element styling via `classNames`.
- **🕒 Time Formatting**: Options for 12-hour (AM/PM) and 24-hour time formats.
- **👆 Interactive**: Granular control with click handlers for dates, specific events, view changes, and "more" indicators.
- **🕒 Current Time & Timezone**: Display a real-time indicator with automatic local timezone GMT offset, and optionally auto-scroll to the current time on load.
- **🛡️ TypeScript**: Written in TypeScript for robust type safety and developer experience.

## Installation

Install using your preferred package manager:

```bash
npm install calendar-simple
# or
yarn add calendar-simple
# or
pnpm add calendar-simple
```

## Usage

### Basic Example

Import the component and its styles to get started:

```tsx
import React, { useState } from "react";
import Calendar from "calendar-simple";
import "calendar-simple/dist/styles.css";

const App = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

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
      color: "#ffcccc",
    },
    {
      id: "2",
      startDate: "2024-02-20",
      endDate: "2024-02-22",
      title: "Tech Conference",
      color: "#e6f7ff",
    },
    {
      id: "3",
      startDate: "2024-02-21T10:00:00",
      endDate: "2024-02-21T12:00:00",
      title: "Team Meeting",
      color: "#cce5ff",
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

### Schedule View Example

The Schedule view displays a continuous scrollable list of events, grouped by date.

```tsx
import React from "react";
import Calendar, { CalendarEvent } from "calendar-simple";

const upcomingEvents: CalendarEvent[] = [
  // ... your events ...
];

const ScheduleApp = () => (
  <Calendar events={upcomingEvents} view="schedule" is12Hour={true} />
);
```

### Custom Days View Example

Display a specific number of days in a time-grid layout.

```tsx
import React from "react";
import Calendar from "calendar-simple";

const ThreeDayApp = () => (
  <Calendar view="customDays" customDays={3} is12Hour={true} />
);
```

## API Reference

### Props

| Prop                      | Type                                                   | Description                                                                       | Default           |
| ------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- | ----------------- |
| `events`                  | `CalendarEvent[]`                                      | Array of event data objects to display.                                           | `[]`              |
| `selectedDate`            | `Date`                                                 | The currently selected date object.                                               | `undefined`       |
| `view`                    | `ECalendarViewType`                                    | The current view: `"month"`, `"week"`, `"day"`, `"schedule"`, or `"customDays"`.  | `"month"`         |
| `selectable`              | `boolean`                                              | Enables visual selection state.                                                   | `false`           |
| `is12Hour`                | `boolean`                                              | Display time in 12-hour AM/PM format instead of 24-hour format.                   | `false`           |
| `onDateClick`             | `(date: Date) => void`                                 | Callback function fired when a date is clicked.                                   | `undefined`       |
| `onEventClick`            | `(event: CalendarEvent) => void`                       | Callback function fired when an event is clicked.                                 | `undefined`       |
| `onMoreClick`             | `(date: Date, hiddenEvents?: CalendarEvent[]) => void` | Callback fired when the "+X more" indicator is clicked.                           | `undefined`       |
| `onNavigate`              | `(date: Date) => void`                                 | Callback fired when the calendar date range is changed (e.g. next month).         | `undefined`       |
| `onViewChange`            | `(view: ECalendarViewType) => void`                    | Callback fired when the calendar view is changed via header buttons.              | `undefined`       |
| `width`                   | `number \| string`                                     | Width of the calendar container.                                                  | `auto-calculated` |
| `height`                  | `number \| string`                                     | Height of the calendar container.                                                 | `auto-calculated` |
| `theme`                   | `CalendarTheme`                                        | Configuration object for custom colors.                                           | `{}`              |
| `classNames`              | `CalendarClassNames`                                   | Custom CSS classes for various internal elements.                                 | `{}`              |
| `dayType`                 | `EDayType`                                             | Format for day names: `"full"` (Monday) or `"half"` (Mon).                        | `"half"`          |
| `pastYearLength`          | `number`                                               | Number of past years to show in the year dropdown.                                | `5`               |
| `futureYearLength`        | `number`                                               | Number of future years to show in the year dropdown.                              | `5`               |
| `maxEvents`               | `number`                                               | Maximum events to show per day cell before collapsing.                            | Auto-calc         |
| `showCurrentTime`         | `boolean`                                              | Displays a line indicating the current time in day and week views.                | `false`           |
| `autoScrollToCurrentTime` | `boolean`                                              | Automatically scrolls to the current time line when the view is initially loaded. | `false`           |
| `minHour`                 | `number`                                               | Minimum hour (0-24) to display in day and week view time grids.                   | `0`               |
| `maxHour`                 | `number`                                               | Maximum hour (0-24) to display in day and week view time grids.                   | `24`              |
| `weekStartsOn`            | `number`                                               | Start day of the week (0 = Sunday, 1 = Monday, etc.).                             | `0`               |
| `weekEndsOn`              | `number`                                               | End day of the week (0 = Sunday, 1 = Monday, etc.).                               | `6`               |
| `showAdjacentMonths`      | `boolean`                                              | Show dates from the previous and next months in the month view grid.              | `false`           |
| `customDays`              | `number`                                               | The number of days to display in the `customDays` view.                           | `3`               |

### Types

#### `CalendarEvent`

```typescript
interface CalendarEvent {
  id?: string;
  startDate: string; // Format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  endDate?: string; // Format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  title: string; // Event title or description
  color?: string; // CSS color string for event background
  [key: string]: unknown; // Allow any custom metadata fields
}
```

#### `ECalendarViewType` & `EDayType`

```typescript
type ECalendarViewType = "month" | "week" | "day" | "schedule" | "customDays";
type EDayType = "full" | "half";
```

#### `CalendarTheme`

```typescript
interface CalendarTheme {
  default?: {
    color?: string;
    bgColor?: string;
  };
  selected?: {
    color?: string;
    bgColor?: string;
  };
  today?: {
    color?: string;
    bgColor?: string;
  };
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
