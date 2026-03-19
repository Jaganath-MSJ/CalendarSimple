import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";
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

const today = dayjs();

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    startDate: today.format("YYYY-MM-DD"),
    title: "Morning Meeting",
    color: "#3B82F6",
  },
  {
    id: "2",
    startDate: today.format("YYYY-MM-DD"),
    title: "Lunch Break",
    color: "#F59E0B",
  },
  {
    id: "3",
    startDate: today.format("YYYY-MM-DD"),
    title: "Focus Time",
    color: "#10B981",
  },
  {
    id: "4",
    startDate: today.format("YYYY-MM-DD"),
    title: "Team Sync",
    color: "#8B5CF6",
  },
  {
    id: "5",
    startDate: today.format("YYYY-MM-DD"),
    title: "Project Review",
    color: "#EF4444",
  },
];

// Story 1: 12-Hour vs 24-Hour Time Format
export const TimeFormat12Hour: Story = {
  args: {
    view: ECalendarViewType.week,
    events: mockEvents,
    selectedDate: today.toDate(),
    is12Hour: true,
  },
};

export const TimeFormat24Hour: Story = {
  args: {
    view: ECalendarViewType.week,
    events: mockEvents,
    selectedDate: today.toDate(),
    is12Hour: false,
  },
};

// Story 2: Event Selection & Interaction
export const InteractiveEvents: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toDate(),
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
    selectedDate: today.toDate(),
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
    selectedDate: today.toDate(),
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
    selectedDate: today.toDate(),
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
    selectedDate: today.toDate(),
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
    selectedDate: today.toDate(),
    autoScrollToCurrentTime: true,
  },
};

// Story 9: Show Adjacent Months
export const ShowAdjacentMonthsEnabled: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toDate(),
    showAdjacentMonths: true,
  },
};

export const ShowAdjacentMonthsDisabled: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toDate(),
    showAdjacentMonths: false,
  },
};
