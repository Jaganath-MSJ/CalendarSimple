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
  title: "Tests/Layout Limits",
  component: Calendar,
  parameters: {
    layout: "padded",
  },
  args: {
    height: 600,
    selectedDate: today.toJSDate(),
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const heavyAllDayEvents = Array.from({ length: 8 }).map((_, i) => ({
  id: `all-day-${i}`,
  startDate: today.toFormat("yyyy-MM-dd"), // Date only string
  title: `All Day Event ${i + 1}`,
  style: { backgroundColor: `hsl(${i * 40}, 70%, 50%)` },
}));

export const AllDayBannerConstraints: Story = {
  args: {
    view: ECalendarViewType.week,
    events: heavyAllDayEvents,
    maxEvents: 3, // Shows 3, then +X more
    onMoreClick: action("onMoreClick"),
  },
};

export const HideAllDayRow: Story = {
  args: {
    view: ECalendarViewType.week,
    events: heavyAllDayEvents,
    showAllDayRow: false, // Forces all-day events down to regular time slots OR entirely hidden depending on implementation
  },
};

export const AdjacentMonthsHidden: Story = {
  args: {
    view: ECalendarViewType.month,
    showAdjacentMonths: false,
    selectedDate: today.toJSDate(),
  },
};

export const WorkWeekBoundaries: Story = {
  args: {
    view: ECalendarViewType.week,
    weekStartsOn: 1, // Monday
    weekEndsOn: 5, // Friday
  },
};

export const TimeRangeLimits: Story = {
  args: {
    view: ECalendarViewType.week,
    minHour: 8,
    maxHour: 18,
    events: [
      {
        id: "morning",
        startDate: today
          .set({ hour: 9, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 10, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        title: "Within Range",
      },
      {
        id: "too-early",
        startDate: today
          .set({ hour: 5, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 6, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        title: "Out of Bounds (Should be hidden or clipped)",
        style: { backgroundColor: "red" },
      },
    ],
  },
};

export const PastFutureYearBounds: Story = {
  args: {
    view: ECalendarViewType.month,
    pastYearLength: 1, // Can only navigate 1 year into past
    futureYearLength: 1, // Can only navigate 1 year into future
  },
};
