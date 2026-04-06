import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { EDayType, ECalendarViewType, CalendarEvent } from "../";

const meta: Meta<typeof Calendar> = {
  title: "Week View",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    view: ECalendarViewType.week,
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
    startDate: today
      .set({ hour: 9, minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today.set({ hour: 10, minute: 0 }).toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Morning Standup",
    style: { backgroundColor: "#3B82F6" },
  },
  {
    id: "2",
    startDate: today
      .set({ hour: 10, minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today
      .set({ hour: 11, minute: 30 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Client Meeting",
    style: { backgroundColor: "#10B981" },
  },
  {
    id: "3",
    startDate: today
      .plus({ days: 1 })
      .set({ hour: 13 })
      .set({ minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today
      .plus({ days: 1 })
      .set({ hour: 14 })
      .set({ minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Lunch with Team",
    style: { backgroundColor: "#F59E0B" },
  },
  {
    id: "4",
    startDate: today
      .plus({ days: 2 })
      .set({ hour: 15 })
      .set({ minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today
      .plus({ days: 2 })
      .set({ hour: 16 })
      .set({ minute: 45 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Design Review",
    style: { backgroundColor: "#8B5CF6" },
  },
  {
    id: "5", // Overlapping event
    startDate: today
      .set({ hour: 9, minute: 30 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today
      .set({ hour: 10, minute: 30 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Urgent Sync",
    style: { backgroundColor: "#EF4444" },
  },
];

export const Default: Story = {
  args: {
    events: [],
    selectedDate: today.toJSDate(),
  },
};

export const WithEvents: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toJSDate(),
  },
};

export const OverlappingEvents: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toJSDate(),
  },
};

export const Format12Hour: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toJSDate(),
    is12Hour: true,
  },
};

export const FullDayNames: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toJSDate(),
    dayType: EDayType.full,
  },
};

export const AutoScrollToCurrentTime: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toJSDate(),
    autoScrollToCurrentTime: true,
  },
};

export const WithTimeLimits: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toJSDate(),
    minHour: 8,
    maxHour: 18,
  },
};

export const CustomWeekStartEnd: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toJSDate(),
    weekStartsOn: 1, // Monday
    weekEndsOn: 5, // Friday
  },
};
