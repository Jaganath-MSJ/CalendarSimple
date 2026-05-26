import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { ECalendarViewType } from "../../index";
const action =
  (name: string) =>
  (...params: any[]) =>
    console.log(name, params);

const today = DateTime.now();

const meta: Meta<typeof Calendar> = {
  title: "Tests/Time Formatting",
  component: Calendar,
  parameters: {
    layout: "padded",
  },
  args: {
    height: 600,
    view: ECalendarViewType.day,
    selectedDate: today.toJSDate(),
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const mockEvents = [
  {
    id: "1",
    startDate: today
      .set({ hour: 14, minute: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"), // 2:00 PM / 14:00
    endDate: today
      .set({ hour: 15, minute: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm:00"),
    title: "Afternoon Event",
    style: { backgroundColor: "#F59E0B" },
  },
];

export const TwelveHourFormat: Story = {
  args: {
    is12Hour: true,
    events: mockEvents,
  },
};

export const TwentyFourHourFormat: Story = {
  args: {
    is12Hour: false,
    events: mockEvents,
  },
};

export const ShowCurrentTimeIndicator: Story = {
  args: {
    showCurrentTime: true,
    events: mockEvents,
  },
};

export const HideCurrentTimeIndicator: Story = {
  args: {
    showCurrentTime: false,
    events: mockEvents,
  },
};

export const AutoScrollEnabled: Story = {
  args: {
    autoScrollToCurrentTime: true,
    events: [],
  },
};

export const AutoScrollDisabled: Story = {
  args: {
    autoScrollToCurrentTime: false,
    events: [],
  },
};
