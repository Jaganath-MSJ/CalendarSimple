import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs from "dayjs";
import Calendar, { ECalendarViewType, CalendarEvent } from "../";

const meta: Meta<typeof Calendar> = {
  title: "Customization",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    width: 800,
    height: 600,
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const today = dayjs();

const customizeEvents: CalendarEvent[] = [
  {
    id: "1",
    startDate: today.format("YYYY-MM-DD") + "T10:00:00",
    endDate: today.format("YYYY-MM-DD") + "T12:00:00",
    title: "Static Style (Red Border)",
    style: {
      border: "2px solid red",
      fontWeight: "bold",
    },
  },
  {
    id: "2",
    startDate: today.format("YYYY-MM-DD") + "T13:00:00",
    endDate: today.format("YYYY-MM-DD") + "T15:00:00",
    title: "Static Style (Opacity)",
    style: {
      backgroundColor: "#10B981",
      opacity: 0.5,
      fontStyle: "italic",
    },
  },
  {
    id: "3",
    startDate: today.add(1, "day").format("YYYY-MM-DD") + "T09:00:00",
    title: "All Day Style",
    style: {
      borderRadius: "0px",
      textTransform: "uppercase",
    },
  },
];

export const EventStyle: Story = {
  args: {
    view: ECalendarViewType.week,
    events: customizeEvents,
    selectedDate: today.toDate(),
  },
};

export const EventClassNames: Story = {
  decorators: [
    (Story: React.ComponentType) => (
      <>
        <style>
          {`
            .custom-event {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border-left: 4px solid black !important;
            }
          `}
        </style>
        <Story />
      </>
    ),
  ],
  args: {
    view: ECalendarViewType.month,
    events: [
      {
        id: "4",
        startDate: today.format("YYYY-MM-DD"),
        title: "Event with ClassName",
      },
    ],
    selectedDate: today.toDate(),
    classNames: {
      event: "custom-event",
    },
  },
};

export const ScheduleViewCustomization: Story = {
  args: {
    view: ECalendarViewType.schedule,
    events: customizeEvents,
    selectedDate: today.toDate(),
  },
};
