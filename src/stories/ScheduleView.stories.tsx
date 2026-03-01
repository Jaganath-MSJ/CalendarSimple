import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";
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

const today = dayjs();

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    startDate: today.hour(9).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    endDate: today.hour(10).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    title: "Morning Briefing",
    color: "#3B82F6",
  },
  {
    id: "2",
    startDate: today.hour(13).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    endDate: today.hour(14).minute(30).format("YYYY-MM-DDTHH:mm:00"),
    title: "Team Lunch",
    color: "#10B981",
  },
  {
    id: "3",
    startDate: today
      .add(1, "day")
      .hour(10)
      .minute(0)
      .format("YYYY-MM-DDTHH:mm:00"),
    endDate: today
      .add(1, "day")
      .hour(11)
      .minute(0)
      .format("YYYY-MM-DDTHH:mm:00"),
    title: "Client Follow-up",
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
      .minute(0)
      .format("YYYY-MM-DDTHH:mm:00"),
    title: "Design Review",
    color: "#8B5CF6",
  },
  {
    id: "5",
    startDate: today
      .add(5, "day")
      .hour(9)
      .minute(30)
      .format("YYYY-MM-DDTHH:mm:00"),
    endDate: today
      .add(5, "day")
      .hour(10)
      .minute(30)
      .format("YYYY-MM-DDTHH:mm:00"),
    title: "Weekly Sync",
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

export const Format12Hour: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toDate(),
    is12Hour: true,
  },
};

export const CustomTheme: Story = {
  args: {
    events: mockEvents,
    selectedDate: today.toDate(),
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
    selectedDate: today.toDate(),
    autoScrollToCurrentTime: true,
  },
};
