import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";
import Calendar, { EDayType, ECalendarViewType, CalendarEvent } from "../";

const meta: Meta<typeof Calendar> = {
  title: "Month View",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    view: ECalendarViewType.month,
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
    title: "Project Sync",
    color: "#3B82F6",
  },
  {
    id: "2",
    startDate: today.add(1, "day").format("YYYY-MM-DD"),
    endDate: today.add(3, "day").format("YYYY-MM-DD"),
    title: "Conference",
    color: "#10B981",
  },
  {
    id: "3",
    startDate: today.subtract(2, "day").format("YYYY-MM-DD"),
    title: "Design Review",
    color: "#8B5CF6",
  },
  {
    id: "4",
    startDate: today.format("YYYY-MM-DD"),
    title: "Lunch with Client",
    color: "#F59E0B",
  },
  {
    id: "5",
    startDate: today.format("YYYY-MM-DD"),
    title: "Team Building",
    color: "#EF4444",
  },
  {
    id: "6",
    startDate: today.format("YYYY-MM-DD"),
    title: "Monthly Update",
    color: "#6366F1",
  },
];

export const Default: Story = {
  args: {
    events: [],
    selectedDate: today.toDate(),
  },
};

export const WithEvents: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toDate(),
  },
};

export const ManyEventsOverflow: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toDate(),
    maxEvents: 2,
  },
};

export const ReadOnly: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toDate(),
    selectable: false,
  },
};

export const FullDayNames: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toDate(),
    dayType: EDayType.full,
  },
};
