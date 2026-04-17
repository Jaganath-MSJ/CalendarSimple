import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { ECalendarViewType, CalendarEvent } from "../";

const meta: Meta<typeof Calendar> = {
  title: "Features & Interactions",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    width: 800,
    height: 600,
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const today = DateTime.now();

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    startDate: today.toFormat("yyyy-MM-dd"),
    title: "Morning Meeting",
    style: { backgroundColor: "#3B82F6" },
  },
  {
    id: "2",
    startDate: today.toFormat("yyyy-MM-dd"),
    title: "Lunch Break",
    style: { backgroundColor: "#F59E0B" },
  },
  {
    id: "3",
    startDate: today.toFormat("yyyy-MM-dd"),
    title: "Focus Time",
    style: { backgroundColor: "#10B981" },
  },
  {
    id: "4",
    startDate: today.toFormat("yyyy-MM-dd"),
    title: "Team Sync",
    style: { backgroundColor: "#8B5CF6" },
  },
  {
    id: "5",
    startDate: today.toFormat("yyyy-MM-dd"),
    title: "Project Review",
    style: { backgroundColor: "#EF4444" },
  },
];

// Story 1: 12-Hour vs 24-Hour Time Format
export const TimeFormat12Hour: Story = {
  args: {
    view: ECalendarViewType.week,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    is12Hour: true,
  },
};

export const TimeFormat24Hour: Story = {
  args: {
    view: ECalendarViewType.week,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    is12Hour: false,
  },
};

// Story 2: Event Selection & Interaction
export const InteractiveEvents: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    onEventClick: (event: CalendarEvent) => {
      alert(`Event clicked: ${event.title}\nID: ${event.id}`);
    },
  },
};

// Story 3: Date Selection & Interaction
export const InteractiveDates: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    selectable: true,
    onDateClick: (date: Date) => {
      alert(`Date clicked: ${date.toLocaleDateString()}`);
    },
  },
};

// Story 4: Navigational Controls (Observing Nav Callback)
export const NavigationCallback: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    onNavigate: (date: Date) => {
      alert(`Navigated to: ${date.toLocaleDateString()}`);
    },
    onViewChange: (view: ECalendarViewType) => {
      alert(`Switched to view: ${view}`);
    },
  },
};

// Story 5: Over-Capacity Visibility Indicators ("+X More")
export const MaxEventsOverflowLimit: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    maxEvents: 2, // Forces the +X more indicator
    onMoreClick: (date: Date, hiddenEvents?: CalendarEvent[]) => {
      alert(
        `More clicked for ${date.toLocaleDateString()}.\nHidden Events: ${
          hiddenEvents?.length || 0
        }`,
      );
    },
  },
};

// Story 7: Custom Styling and Theming
export const CustomTheming: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    theme: {
      default: { color: "#333", bgColor: "#f0f0f0" },
      today: { color: "#fff", bgColor: "#ff0000" }, // Red for today
      selected: { color: "#fff", bgColor: "#0000ff" }, // Blue for selected
    },
  },
};

// Story 8: Auto Scroll To Current Time
export const AutoScrollToCurrentTime: Story = {
  args: {
    view: ECalendarViewType.day,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    autoScrollToCurrentTime: true,
  },
};

// Story 9: Show Adjacent Months
export const ShowAdjacentMonthsEnabled: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    showAdjacentMonths: true,
  },
};

export const ShowAdjacentMonthsDisabled: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    showAdjacentMonths: false,
  },
};

export const CompoundComponentPattern: Story = {
  render: (args: React.ComponentProps<typeof Calendar>) => (
    <Calendar {...args}>
      <div
        style={{
          border: "2px dashed #ccc",
          borderRadius: "6px",
          padding: "8px",
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Calendar.Header />
        <Calendar.MonthView />
      </div>
    </Calendar>
  ),
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    width: 800,
    height: 600,
  },
};
