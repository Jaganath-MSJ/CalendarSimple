import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";
import Calendar, { EDayType } from "./";

const meta: Meta<typeof Calendar> = {
  title: "Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    // Actions
    onDateClick: {
      action: "onDateClick",
      description: "Callback when a date is clicked",
    },
    onEventClick: {
      action: "onEventClick",
      description: "Callback when an event is clicked",
    },
    onMonthChange: {
      action: "onMonthChange",
      description: "Callback when the month is changed",
    },
    onMoreClick: {
      action: "onMoreClick",
      description: "Callback when '+ more' is clicked",
    },

    // Primitives
    width: {
      control: { type: "number" },
      description: "Width of the calendar in pixels",
    },
    height: {
      control: { type: "number" },
      description: "Height of the calendar in pixels",
    },
    isSelectDate: {
      control: "boolean",
      description: "Whether dates can be selected",
    },
    maxEvents: {
      control: { type: "number" },
      description: "Maximum number of events to show per day",
    },
    pastYearLength: {
      control: { type: "number" },
      description: "Number of past years to show in year dropdown",
    },
    futureYearLength: {
      control: { type: "number" },
      description: "Number of future years to show in year dropdown",
    },

    // Enums
    dayType: {
      control: "radio",
      options: Object.values(EDayType),
      description: "Format of day names (FULL or HALF)",
    },

    // Objects / Arrays
    selectedDate: { control: "date", description: "Currently selected date" },
    data: { control: "object", description: "Array of events" },
    theme: { control: "object", description: "Custom theme colors" },

    // ClassNames
    className: { control: "text", description: "Root Class Name" },
    headerClassName: { control: "text", description: "Header Class Name" },
    tableClassName: { control: "text", description: "Table Class Name" },
    tableDateClassName: {
      control: "text",
      description: "Date Cell Class Name",
    },
    dataClassName: { control: "text", description: "Event Item Class Name" },
    selectedClassName: {
      control: "text",
      description: "Selected Date Class Name",
    },
    todayClassName: { control: "text", description: "Today Date Class Name" },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const today = dayjs();

export const Default: Story = {
  args: {
    selectedDate: new Date(),
    width: 800,
    height: 600,
  },
};

export const WithEvents: Story = {
  args: {
    selectedDate: new Date(),
    width: 800,
    height: 600,
    data: [
      {
        startDate: today.format("YYYY-MM-DD"),
        value: "Meeting",
        color: "#EF4444", // Red
      },
      {
        startDate: today.add(1, "day").format("YYYY-MM-DD"),
        value: "Lunch",
        color: "#3B82F6", // Blue
      },
      {
        startDate: today.add(3, "day").format("YYYY-MM-DD"),
        value: "Conference",
        color: "#10B981", // Green
      },
    ],
  },
};

export const MultiDayEvents: Story = {
  args: {
    selectedDate: new Date(),
    width: 800,
    height: 700,
    data: [
      {
        startDate: today.format("YYYY-MM-DD"),
        endDate: today.add(2, "day").format("YYYY-MM-DD"),
        value: "Long Weekend Trip",
        color: "#8B5CF6", // Purple
      },
      {
        startDate: today.subtract(1, "day").format("YYYY-MM-DD"),
        endDate: today.add(1, "day").format("YYYY-MM-DD"),
        value: "Workshop",
        color: "#F59E0B", // Amber
      },
    ],
  },
};

export const ManyEventsOverflow: Story = {
  args: {
    selectedDate: new Date(),
    width: 800,
    height: 600,
    maxEvents: 2, // Force overflow
    data: [
      {
        startDate: today.format("YYYY-MM-DD"),
        value: "Event 1",
        color: "#EF4444",
      },
      {
        startDate: today.format("YYYY-MM-DD"),
        value: "Event 2",
        color: "#3B82F6",
      },
      {
        startDate: today.format("YYYY-MM-DD"),
        value: "Event 3",
        color: "#10B981",
      },
      {
        startDate: today.format("YYYY-MM-DD"),
        value: "Event 4",
        color: "#F59E0B",
      },
    ],
  },
};

export const CustomDateFormats: Story = {
  args: {
    selectedDate: new Date(),
    width: 800,
    height: 600,
    dayType: EDayType.full, // Show full day names like "Monday"
  },
};

export const CustomYearRange: Story = {
  args: {
    selectedDate: new Date(),
    width: 800,
    height: 600,
    pastYearLength: 50,
    futureYearLength: 50,
  },
};

export const Themed: Story = {
  args: {
    selectedDate: today.add(2, "day").toDate(),
    isSelectDate: true,
    width: 800,
    height: 600,
    theme: {
      default: {
        color: "#1f2937",
        bgColor: "#f3f4f6",
      },
      selected: {
        color: "#ffffff",
        bgColor: "#be185d", // Pink
      },
      today: {
        color: "#be185d",
        bgColor: "#ffffff",
      },
    },
    data: [
      {
        startDate: today.format("YYYY-MM-DD"),
        value: "Themed Event",
        color: "#10B981",
      },
    ],
  },
};

export const ReadOnly: Story = {
  args: {
    selectedDate: new Date(),
    width: 800,
    height: 600,
    isSelectDate: false, // User cannot select dates
    data: [
      {
        startDate: today.format("YYYY-MM-DD"),
        value: "View Only",
        color: "#6B7280",
      },
    ],
  },
};

export const Interactive: Story = {
  args: {
    isSelectDate: true,
    selectedDate: new Date(),
    data: [],
  },
  render: (args: any) => (
    <div style={{ width: "800px", height: "600px" }}>
      <Calendar {...args} />
    </div>
  ),
};

export const DayViewOverlaps: Story = {
  args: {
    view: "day",
    selectedDate: new Date(),
    width: 600,
    height: 800,
    data: [
      {
        startDate: dayjs().hour(9).minute(0).format("YYYY-MM-DDTHH:mm:00"),
        endDate: dayjs().hour(10).minute(0).format("YYYY-MM-DDTHH:mm:00"),
        value: "Morning Meeting",
        color: "#EF4444",
      },
      {
        startDate: dayjs().hour(9).minute(30).format("YYYY-MM-DDTHH:mm:00"),
        endDate: dayjs().hour(10).minute(30).format("YYYY-MM-DDTHH:mm:00"),
        value: "Overlap A",
        color: "#3B82F6",
      },
      {
        startDate: dayjs().hour(9).minute(45).format("YYYY-MM-DDTHH:mm:00"),
        endDate: dayjs().hour(10).minute(45).format("YYYY-MM-DDTHH:mm:00"),
        value: "Overlap B",
        color: "#10B981",
      },
      {
        startDate: dayjs().hour(11).minute(0).format("YYYY-MM-DDTHH:mm:00"),
        endDate: dayjs().hour(12).minute(0).format("YYYY-MM-DDTHH:mm:00"),
        value: "Luther's Lunch",
        color: "#F59E0B",
      },
    ],
  },
};
