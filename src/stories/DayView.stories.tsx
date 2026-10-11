import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { ECalendarViewType, CalendarEvent } from "../";

const meta: Meta<typeof Calendar> = {
  title: "Day View",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    view: ECalendarViewType.day,
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
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    endDate: today
      .set({ hour: 10, minute: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    title: "Morning Kickoff",
    style: { backgroundColor: "#3B82F6" },
  },
  {
    id: "2",
    startDate: today
      .set({ hour: 10, minute: 30 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    endDate: today
      .set({ hour: 11, minute: 45 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    title: "Design Sync",
    style: { backgroundColor: "#10B981" },
  },
  {
    id: "3", // Overlapping event
    startDate: today
      .set({ hour: 10, minute: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    endDate: today
      .set({ hour: 11, minute: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    title: "Urgent Meeting",
    style: { backgroundColor: "#EF4444" },
  },
  {
    id: "4",
    startDate: today
      .set({ hour: 13, minute: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    endDate: today
      .set({ hour: 14, minute: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    title: "Lunch & Learn",
    style: { backgroundColor: "#F59E0B" },
  },
  {
    id: "5",
    startDate: today
      .set({ hour: 15, minute: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    endDate: today
      .set({ hour: 16, minute: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    title: "Project Review",
    style: { backgroundColor: "#8B5CF6" },
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

export const LongSingleDayEvent: Story = {
  args: {
    events: [
      {
        id: "shift",
        title: "On-call shift (08:00–21:00)",
        startDate: today.set({ hour: 8, minute: 0 }).toISO()!,
        endDate: today.set({ hour: 21, minute: 0 }).toISO()!,
        style: { backgroundColor: "#0EA5E9" },
      },
      {
        id: "handover",
        title: "Handover",
        startDate: today.set({ hour: 12, minute: 0 }).toISO()!,
        endDate: today.set({ hour: 13, minute: 0 }).toISO()!,
        style: { backgroundColor: "#8B5CF6" },
      },
      {
        id: "trip",
        title: "Trip (multi-day, moves to banner)",
        startDate: today.minus({ days: 1 }).set({ hour: 9 }).toISO()!,
        endDate: today.plus({ days: 1 }).set({ hour: 18 }).toISO()!,
        style: { backgroundColor: "#10B981" },
      },
    ],
    selectedDate: today.toJSDate(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "A single-day event of 12 hours or more stays in the time grid at its real times. Only multi-day events with 12h+ on a day move to the all-day banner.",
      },
    },
  },
};
