import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { ECalendarViewType, CalendarEvent } from "../";

const meta: Meta<typeof Calendar> = {
  title: "Custom Day View",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    view: ECalendarViewType.customDays,
    customDays: 3,
    width: 600,
    height: 800,
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
    title: "Morning Kickoff",
    style: { backgroundColor: "#3B82F6" },
  },
  {
    id: "2",
    startDate: today
      .plus({ days: 1 })
      .set({ hour: 10 })
      .set({ minute: 30 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today
      .plus({ days: 1 })
      .set({ hour: 11 })
      .set({ minute: 45 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Design Sync",
    style: { backgroundColor: "#10B981" },
  },
  {
    id: "3", // Overlapping event
    startDate: today
      .set({ hour: 10, minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today.set({ hour: 11, minute: 0 }).toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Urgent Meeting",
    style: { backgroundColor: "#EF4444" },
  },
  {
    id: "4",
    startDate: today
      .plus({ days: 2 })
      .set({ hour: 13 })
      .set({ minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today
      .plus({ days: 2 })
      .set({ hour: 14 })
      .set({ minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Lunch & Learn",
    style: { backgroundColor: "#F59E0B" },
  },
  {
    id: "5",
    startDate: today
      .set({ hour: 15, minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today.set({ hour: 16, minute: 0 }).toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Project Review",
    style: { backgroundColor: "#8B5CF6" },
  },
];

export const Default: Story = {
  args: {
    customDays: 3,
    events: [],
    selectedDate: today.toJSDate(),
  },
};

export const WithEvents: Story = {
  args: {
    customDays: 3,
    events: mockEvents,
    selectedDate: today.toJSDate(),
  },
};

export const FiveDays: Story = {
  args: {
    customDays: 5,
    events: mockEvents,
    selectedDate: today.toJSDate(),
  },
};

export const OneDay: Story = {
  args: {
    customDays: 1,
    events: mockEvents,
    selectedDate: today.toJSDate(),
  },
};

export const TenDays: Story = {
  args: {
    customDays: 10,
    events: mockEvents,
    selectedDate: today.toJSDate(),
  },
};
