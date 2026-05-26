import type { Meta, StoryObj } from "@storybook/react";
import Calendar, { ECalendarViewType } from "../";

const meta: Meta<typeof Calendar> = {
  title: "Accessibility",
  component: Calendar,
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const today = new Date();
const sampleEvents = [
  {
    id: "a11y-1",
    title: "Team Meeting",
    startDate: new Date(new Date(today).setHours(10, 0, 0, 0)),
    endDate: new Date(new Date(today).setHours(11, 0, 0, 0)),
  },
  {
    id: "a11y-2",
    title: "Design Review",
    startDate: new Date(new Date(today).setHours(14, 0, 0, 0)),
    endDate: new Date(new Date(today).setHours(15, 0, 0, 0)),
  },
  {
    id: "a11y-3",
    title: "Planning Session",
    startDate: new Date(new Date(today).setHours(16, 0, 0, 0)),
    endDate: new Date(new Date(today).setHours(17, 0, 0, 0)),
  },
];

export const MonthViewKeyboardNav: Story = {
  name: "Month View — Keyboard Navigation",
  args: {
    view: ECalendarViewType.month,
    events: sampleEvents,
    selectable: true,
  },
};

export const WeekViewKeyboardNav: Story = {
  name: "Week View — Keyboard Navigation",
  args: {
    view: ECalendarViewType.week,
    events: sampleEvents,
  },
};

export const DayViewCreatableSlots: Story = {
  name: "Day View — Creatable Slots (Tab + Enter)",
  args: {
    view: ECalendarViewType.day,
    events: [],
    creatable: true,
    onSlotClick: (start: Date, end: Date) =>
      console.log("Slot clicked:", start, end),
  },
};

export const ScheduleViewKeyboardNav: Story = {
  name: "Schedule View — Keyboard Navigation",
  args: {
    view: ECalendarViewType.schedule,
    events: sampleEvents,
  },
};

export const PopoverFocusTrap: Story = {
  name: "Month View — Popover Focus Trap (ESC to close)",
  args: {
    view: ECalendarViewType.month,
    maxEvents: 1,
    events: sampleEvents,
  },
};
