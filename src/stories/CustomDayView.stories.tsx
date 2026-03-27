import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";
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
    startDate: today
      .add(1, "day")
      .hour(10)
      .minute(30)
      .format("YYYY-MM-DDTHH:mm:00"),
    endDate: today
      .add(1, "day")
      .hour(11)
      .minute(45)
      .format("YYYY-MM-DDTHH:mm:00"),
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
    startDate: today
      .add(2, "day")
      .hour(13)
      .minute(0)
      .format("YYYY-MM-DDTHH:mm:00"),
    endDate: today
      .add(2, "day")
      .hour(14)
      .minute(0)
      .format("YYYY-MM-DDTHH:mm:00"),
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
    customDays: 3,
    events: [],
    selectedDate: today.toDate(),
  },
};

export const WithEvents: Story = {
  args: {
    customDays: 3,
    events: mockEvents,
    selectedDate: today.toDate(),
  },
};

export const FiveDays: Story = {
  args: {
    customDays: 5,
    events: mockEvents,
    selectedDate: today.toDate(),
  },
};

export const OneDay: Story = {
  args: {
    customDays: 1,
    events: mockEvents,
    selectedDate: today.toDate(),
  },
};

export const TenDays: Story = {
  args: {
    customDays: 10,
    events: mockEvents,
    selectedDate: today.toDate(),
  },
};
