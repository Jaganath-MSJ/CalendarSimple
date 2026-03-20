import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";
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

const today = dayjs();

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    startDate: today.hour(9).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    endDate: today.hour(10).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    title: "Morning Kickoff",
    style: { backgroundColor: "#3B82F6" },
  },
  {
    id: "2",
    startDate: today.hour(10).minute(30).format("YYYY-MM-DDTHH:mm:00"),
    endDate: today.hour(11).minute(45).format("YYYY-MM-DDTHH:mm:00"),
    title: "Design Sync",
    style: { backgroundColor: "#10B981" },
  },
  {
    id: "3", // Overlapping event
    startDate: today.hour(10).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    endDate: today.hour(11).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    title: "Urgent Meeting",
    style: { backgroundColor: "#EF4444" },
  },
  {
    id: "4",
    startDate: today.hour(13).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    endDate: today.hour(14).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    title: "Lunch & Learn",
    style: { backgroundColor: "#F59E0B" },
  },
  {
    id: "5",
    startDate: today.hour(15).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    endDate: today.hour(16).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    title: "Project Review",
    style: { backgroundColor: "#8B5CF6" },
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

export const OverlappingEvents: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toDate(),
  },
};

export const Format12Hour: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toDate(),
    is12Hour: true,
  },
};

export const AutoScrollToCurrentTime: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toDate(),
    autoScrollToCurrentTime: true,
  },
};

export const WithTimeLimits: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toDate(),
    minHour: 8,
    maxHour: 18,
  },
};
