import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { ECalendarViewType } from "../../index";

const today = DateTime.now();

const meta: Meta<typeof Calendar> = {
  title: "Tests/Edge Cases",
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

export const AbsoluteOverlap: Story = {
  args: {
    view: ECalendarViewType.day,
    events: [
      {
        id: "ev1",
        startDate: today
          .set({ hour: 13, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 14, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        title: "Same Time 1",
        style: { backgroundColor: "red" },
      },
      {
        id: "ev2",
        startDate: today
          .set({ hour: 13, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 14, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        title: "Same Time 2",
        style: { backgroundColor: "blue" },
      },
    ],
  },
};

export const ConcurrentStress: Story = {
  args: {
    view: ECalendarViewType.day,
    events: Array.from({ length: 5 }).map((_, i) => ({
      id: `concurrent-${i}`,
      startDate: today
        .set({ hour: 15, minute: 0 })
        .toFormat("yyyy-MM-ddTHH:mm:00"),
      endDate: today
        .set({ hour: 16, minute: 0 })
        .toFormat("yyyy-MM-ddTHH:mm:00"),
      title: `Parallel ${i + 1}`,
      style: { backgroundColor: `hsl(${i * 60}, 70%, 50%)` },
    })),
  },
};

export const NestedOverlaps: Story = {
  args: {
    view: ECalendarViewType.day,
    events: [
      {
        id: "outer",
        startDate: today
          .set({ hour: 10, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 12, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        title: "2-Hour Outer",
        style: { backgroundColor: "#d1d5db" },
      },
      {
        id: "inner",
        startDate: today
          .set({ hour: 10, minute: 30 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 11, minute: 30 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        title: "1-Hour Inner",
        style: { backgroundColor: "#3b82f6" },
      },
    ],
  },
};

export const LayoutOverlapOffset: Story = {
  args: {
    view: ECalendarViewType.day,
    eventOverlapOffset: 20, // Verify stagger visual
    events: [
      {
        id: "o1",
        startDate: today
          .set({ hour: 13, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 15, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        title: "Offset Layer 1",
        style: { backgroundColor: "#fca5a5" },
      },
      {
        id: "o2",
        startDate: today
          .set({ hour: 13, minute: 30 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 15, minute: 30 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        title: "Offset Layer 2",
        style: { backgroundColor: "#f87171" },
      },
      {
        id: "o3",
        startDate: today
          .set({ hour: 14, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 16, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        title: "Offset Layer 3",
        style: { backgroundColor: "#ef4444" },
      },
    ],
  },
};

export const DurationOddities: Story = {
  args: {
    view: ECalendarViewType.week,
    events: [
      {
        id: "zero-duration",
        startDate: today
          .set({ hour: 10, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 10, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        title: "Zero Duration Event",
        style: { backgroundColor: "#f43f5e" },
      },
      {
        id: "negative-duration",
        startDate: today
          .set({ hour: 14, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 12, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"), // Reverses time!
        title: "Negative Duration (Should ignore/fail safe)",
        style: { backgroundColor: "#8b5cf6" },
      },
      {
        id: "missing-end",
        startDate: today
          .set({ hour: 16, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        // endDate omitted deliberately
        title: "Missing End Date",
        style: { backgroundColor: "#10b981" },
      } as any,
    ],
  },
};

export const MultiDayOvernight: Story = {
  args: {
    view: ECalendarViewType.week,
    events: [
      {
        // Multi-day Date-only
        id: "md",
        startDate: today.toFormat("yyyy-MM-dd"),
        endDate: today.plus({ days: 2 }).toFormat("yyyy-MM-dd"),
        title: "3-Day Stretch",
        style: { backgroundColor: "#6366f1" },
      },
      {
        // Overnight Datetime
        id: "on",
        startDate: today
          .set({ hour: 22, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .plus({ days: 1 })
          .set({ hour: 2 })
          .set({ minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        title: "Overnight Switch (10PM to 2AM)",
        style: { backgroundColor: "#ec4899" },
      },
    ],
  },
};

export const MissingDataFields: Story = {
  args: {
    view: ECalendarViewType.week,
    events: [
      {
        // Missing title, missing ID
        startDate: today
          .set({ hour: 9, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
        endDate: today
          .set({ hour: 10, minute: 0 })
          .toFormat("yyyy-MM-ddTHH:mm:00"),
      } as any,
      {
        // Invalid Dates
        id: "invalid-date",
        startDate: "fake-date",
        endDate: "fake-date",
        title: "Bad string",
      } as any,
    ],
  },
};
