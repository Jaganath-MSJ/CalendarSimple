import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { ECalendarViewType, CalendarEvent } from "../";

const meta: Meta<typeof Calendar> = {
  title: "Schedule View",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    view: ECalendarViewType.schedule,
    width: 600,
    height: 700,
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
    title: "Morning Briefing",
    style: { backgroundColor: "#3B82F6" },
  },
  {
    id: "2",
    startDate: today
      .set({ hour: 13, minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today
      .set({ hour: 14, minute: 30 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Team Lunch",
    style: { backgroundColor: "#10B981" },
  },
  {
    id: "3",
    startDate: today
      .plus({ days: 1 })
      .set({ hour: 10 })
      .set({ minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today
      .plus({ days: 1 })
      .set({ hour: 11 })
      .set({ minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Client Follow-up",
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
      .set({ minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Design Review",
    style: { backgroundColor: "#8B5CF6" },
  },
  {
    id: "5",
    startDate: today
      .plus({ days: 5 })
      .set({ hour: 9 })
      .set({ minute: 30 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today
      .plus({ days: 5 })
      .set({ hour: 10 })
      .set({ minute: 30 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Weekly Sync",
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

export const Format12Hour: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toJSDate(),
    is12Hour: true,
  },
};

export const CustomTheme: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toJSDate(),
    theme: {
      default: {
        color: "#1f2937",
        bgColor: "#f3f4f6",
      },
      today: {
        color: "#ffffff",
        bgColor: "#3b82f6",
      },
    },
  },
};

export const AutoScrollToCurrentTime: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toJSDate(),
    autoScrollToCurrentTime: true,
  },
};
