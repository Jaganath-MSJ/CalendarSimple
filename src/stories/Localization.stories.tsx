import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { ECalendarViewType, CalendarEvent } from "../";

const meta: Meta<typeof Calendar> = {
  title: "Localization",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    locale: {
      control: "select",
      options: ["en", "fr", "es", "ar", "ja", "de", "it", "zh"],
      description: "Luxon locale code",
    },
    view: {
      control: "select",
      options: [
        ECalendarViewType.month,
        ECalendarViewType.week,
        ECalendarViewType.day,
        ECalendarViewType.schedule,
        ECalendarViewType.customDays,
      ],
    },
  },
  args: {
    width: 800,
    height: 600,
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const today = DateTime.now();

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    startDate: today.plus({ hours: 2 }).toISO()!,
    endDate: today.plus({ hours: 3 }).toISO()!,
    title: "Meeting",
    style: { backgroundColor: "#e0f2fe" },
  },
  {
    id: "2",
    startDate: today.plus({ days: 1, hours: 10 }).toISO()!,
    endDate: today.plus({ days: 1, hours: 12 }).toISO()!,
    title: "Project Sync",
    style: { backgroundColor: "#dcfce7" },
  },
];

export const DynamicLocale: Story = {
  args: {
    view: ECalendarViewType.month,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    locale: "en",
  },
};

export const French: Story = {
  args: {
    view: ECalendarViewType.week,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    locale: "fr",
    localeMessages: {
      today: "Aujourd'hui",
      day: "Jour",
      week: "Semaine",
      month: "Mois",
      schedule: "Planning",
    },
  },
};

export const ArabicRTL: Story = {
  args: {
    view: ECalendarViewType.week,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    locale: "ar",
    localeMessages: {
      today: "اليوم",
      day: "يوم",
      week: "أسبوع",
      month: "شهر",
      schedule: "جدول",
    },
  },
};

export const WeekStartSaturday: Story = {
  name: "Week Starts on Saturday (Custom)",
  args: {
    view: ECalendarViewType.week,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    locale: "ar",
    weekStartsOn: 6, // Saturday
    weekEndsOn: 5, // Friday
    localeMessages: {
      today: "اليوم",
      day: "يوم",
      week: "أسبوع",
      month: "شهر",
    },
  },
};

export const JapaneseSchedule: Story = {
  args: {
    view: ECalendarViewType.schedule,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    locale: "ja",
    localeMessages: {
      today: "今日",
      schedule: "スケジュール",
    },
  },
};

export const CustomMessagesFull: Story = {
  args: {
    view: ECalendarViewType.customDays,
    customDays: 4,
    events: mockEvents,
    selectedDate: today.toJSDate(),
    localeMessages: {
      today: "CURRENT",
      day: "VIEW DAY",
      week: "VIEW WEEK",
      month: "VIEW MONTH",
      schedule: "VIEW PLAN",
      days: "DAYS OVERRIDE",
    },
  },
};
