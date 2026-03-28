import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";
import Calendar, { ECalendarViewType } from "../../index";

const today = dayjs();

const meta: Meta<typeof Calendar> = {
  title: "Tests/Views",
  component: Calendar,
  parameters: {
    layout: "padded",
  },
  args: {
    height: 600,
    selectedDate: today.toDate(),
    resetDateOnViewChange: true,
    showCurrentTime: true,
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const mockEvents = [
  {
    id: "1",
    startDate: today.hour(12).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    endDate: today.hour(13).minute(0).format("YYYY-MM-DDTHH:mm:00"),
    title: "Test Event",
    style: { backgroundColor: "#FF5733" },
  },
];

export const MonthViewTest: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
  },
};

export const WeekViewTest: Story = {
  args: {
    view: ECalendarViewType.week,
    events: mockEvents,
  },
};

export const DayViewTest: Story = {
  args: {
    view: ECalendarViewType.day,
    events: mockEvents,
  },
};

export const CustomDaysTest: Story = {
  args: {
    view: ECalendarViewType.customDays,
    customDays: 4,
    events: mockEvents,
  },
};

export const ScheduleViewTest: Story = {
  args: {
    view: ECalendarViewType.schedule,
    events: mockEvents,
  },
};
