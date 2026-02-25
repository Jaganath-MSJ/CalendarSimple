import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";
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

const today = dayjs();

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    startDate: today.hour(9).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    endDate: today.hour(10).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    title: "Morning Standup",
    color: "#3B82F6",
  },
  {
    id: "2",
    startDate: today.hour(10).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    endDate: today.hour(11).minute(30).format("YYYY-MM-DDTHH:mm:00"),
    title: "Client Meeting",
    color: "#10B981",
  },
  {
    id: "3",
    startDate: today
      .add(1, "day")
      .hour(13)
      .minute(0)
      .format("YYYY-MM-DDTHH:mm:00"),
    endDate: today
      .add(1, "day")
      .hour(14)
      .minute(0)
      .format("YYYY-MM-DDTHH:mm:00"),
    title: "Lunch with Team",
    color: "#F59E0B",
  },
  {
    id: "4",
    startDate: today
      .add(2, "day")
      .hour(15)
      .minute(0)
      .format("YYYY-MM-DDTHH:mm:00"),
    endDate: today
      .add(2, "day")
      .hour(16)
      .minute(45)
      .format("YYYY-MM-DDTHH:mm:00"),
    title: "Design Review",
    color: "#8B5CF6",
  },
  {
    id: "5", // Overlapping event
    startDate: today.hour(9).minute(30).format("YYYY-MM-DDTHH:mm:00"),
    endDate: today.hour(10).minute(30).format("YYYY-MM-DDTHH:mm:00"),
    title: "Urgent Sync",
    color: "#EF4444",
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

export const FullDayNames: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toDate(),
    dayType: EDayType.full,
  },
};
