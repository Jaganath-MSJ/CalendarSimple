import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { ECalendarViewType } from "../../index";

const today = DateTime.now();

const meta: Meta<typeof Calendar> = {
  title: "Tests/Views",
  component: Calendar,
  parameters: {
    layout: "padded",
  },
  args: {
    height: 600,
    selectedDate: today.toJSDate(),
    resetDateOnViewChange: true,
    showCurrentTime: true,
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const mockEvents = [
  {
    id: "1",
    startDate: today
      .set({ hour: 12, minute: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    endDate: today
      .set({ hour: 13, minute: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
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
