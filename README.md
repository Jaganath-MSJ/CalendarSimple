# Calendar Simple

![npm](https://img.shields.io/npm/v/calendar-simple)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/calendar-simple)
![npm downloads](https://img.shields.io/npm/dm/calendar-simple)
![license](https://img.shields.io/npm/l/calendar-simple)

A lightweight, customizable, and responsive calendar component for React applications. Built with TypeScript and Day.js, `calendar-simple` provides a flexible solution for date selection and event management in your React projects.

**[Live Demo](http://calendarsimple.netlify.app)**

## Features

- **📅 Month View**: Intuitive navigation through monthly views.
- **✨ Event Handling**: Built-in support for displaying and managing events with custom colors.
- **📱 Responsive**: Automatically adjusts layout based on container dimensions.
- **🎨 Theming**: Fully customizable colors for selected dates, current day, and general theme.
- **👆 Interactive**: granular control with click handlers for dates, specific events, and "more" indicators.
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
import Calendar, { CalendarType } from "calendar-simple";
import "calendar-simple/dist/styles.css";

const App = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div style={{ height: "600px", padding: "20px" }}>
      <Calendar
        selectedDate={selectedDate}
        onDateClick={setSelectedDate}
        isSelectDate
      />
    </div>
  );
};
```

### Advanced Usage with Events & Theme

```tsx
import React, { useState } from "react";
import Calendar, { DataType } from "calendar-simple";
import "calendar-simple/dist/styles.css";

const MyCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events: DataType[] = [
    {
      startDate: "2024-02-14",
      value: "Valentine's Day",
      color: "#ffcccc",
    },
    {
      startDate: "2024-02-20",
      endDate: "2024-02-22",
      value: "Tech Conference",
      color: "#e6f7ff",
    },
  ];

  return (
    <Calendar
      selectedDate={selectedDate}
      onDateClick={setSelectedDate}
      isSelectDate
      data={events}
      width={800}
      height={600}
      theme={{
        selected: { color: "#fff", bgColor: "#007bff" },
        today: { color: "#007bff", bgColor: "#e6f2ff" },
      }}
      onEventClick={(event) => alert(`Clicked: ${event.value}`)}
    />
  );
};
```

## API Reference

### Props

| Prop               | Type                        | Description                                                | Default         |
| ------------------ | --------------------------- | ---------------------------------------------------------- | --------------- |
| `data`             | `DataType[]`                | Array of event data objects to display.                    | `[]`            |
| `selectedDate`     | `Date`                      | The currently selected date object.                        | `undefined`     |
| `onDateClick`      | `(date: Date) => void`      | Callback function fired when a date is clicked.            | `undefined`     |
| `onEventClick`     | `(event: DataType) => void` | Callback function fired when an event is clicked.          | `undefined`     |
| `onMoreClick`      | `(date: Date) => void`      | Callback fired when the "+X more" indicator is clicked.    | `undefined`     |
| `onMonthChange`    | `(date: Date) => void`      | Callback fired when the visible month is changed.          | `undefined`     |
| `width`            | `number`                    | Width of the calendar container in pixels.                 | `400`           |
| `height`           | `number`                    | Height of the calendar container in pixels.                | `400`           |
| `theme`            | `CalendarTheme`             | Configuration object for custom colors.                    | `Default Theme` |
| `dayType`          | `EDayType`                  | Format for day names: `"FULL"` (Monday) or `"HALF"` (Mon). | `HALF`          |
| `isSelectDate`     | `boolean`                   | Enables visual selection state.                            | `false`         |
| `pastYearLength`   | `number`                    | Number of past years to show in the year dropdown.         | `5`             |
| `futureYearLength` | `number`                    | Number of future years to show in the year dropdown.       | `5`             |
| `maxEvents`        | `number`                    | Maximum events to show per day cell before collapsing.     | Auto-calc       |

### Types

#### `DataType`

```typescript
interface DataType {
  startDate: string; // Format: YYYY-MM-DD
  endDate?: string; // Format: YYYY-MM-DD
  value: string; // Event title or description
  color?: string; // CSS color string for event background
}
```

#### `CalendarTheme`

```typescript
interface CalendarTheme {
  selected?: {
    color?: string; // Text color for selected date
    bgColor?: string; // Background color for selected date
  };
  today?: {
    color?: string; // Text color for today's date
    bgColor?: string; // Background color for today's date
  };
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
