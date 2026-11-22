import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { ECalendarViewType, CalendarEvent } from "../";

const meta: Meta<typeof Calendar> = {
  title: "Recurring Events",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    width: 900,
    height: 700,
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const monday = DateTime.now().startOf("week").minus({ weeks: 4 });
const at = (day: DateTime, hour: number, minute = 0) =>
  day.set({ hour, minute }).toFormat("yyyy-MM-dd'T'HH:mm:ss");

const recurringEvents: CalendarEvent[] = [
  {
    id: "standup",
    title: "Standup (Mon/Wed/Fri)",
    startDate: at(monday, 9),
    endDate: at(monday, 9, 15),
    rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR",
    // Skip one Wednesday standup.
    exdates: [at(monday.plus({ weeks: 4, days: 2 }), 9)],
    style: { backgroundColor: "#3B82F6" },
  },
  {
    id: "review",
    title: "Sprint review (every 2 weeks, 6 times)",
    startDate: at(monday.plus({ days: 3 }), 14),
    endDate: at(monday.plus({ days: 3 }), 15),
    rrule: "FREQ=WEEKLY;INTERVAL=2;COUNT=6",
    style: { backgroundColor: "#10B981" },
  },
  {
    id: "retro",
    title: "Retro (last Friday of the month)",
    startDate: at(monday.plus({ days: 4 }), 16),
    endDate: at(monday.plus({ days: 4 }), 17),
    rrule: "FREQ=MONTHLY;BYDAY=-1FR",
    style: { backgroundColor: "#F59E0B" },
  },
  {
    id: "payday",
    title: "Payday",
    startDate: monday.startOf("month").toISODate()!,
    rrule: "FREQ=MONTHLY;BYMONTHDAY=1,15",
    style: { backgroundColor: "#8B5CF6" },
  },
  {
    id: "one-off",
    title: "One-off event (no rrule)",
    startDate: at(monday.plus({ weeks: 4, days: 1 }), 11),
    endDate: at(monday.plus({ weeks: 4, days: 1 }), 12),
  },
];

/** Weekly, bi-weekly with COUNT, last-Friday and twice-monthly rules. */
export const Month: Story = {
  args: {
    view: ECalendarViewType.month,
    events: recurringEvents,
  },
};

export const Week: Story = {
  args: {
    view: ECalendarViewType.week,
    events: recurringEvents,
  },
};

/** Endless rules stop at selectedDate + 12 months (to the quarter end). */
export const Schedule: Story = {
  args: {
    view: ECalendarViewType.schedule,
    width: 600,
    events: recurringEvents,
  },
};

/** An unsupported rule shows the event once and logs a console warning. */
export const UnsupportedRule: Story = {
  args: {
    view: ECalendarViewType.month,
    events: [
      {
        id: "hourly",
        title: "FREQ=HOURLY (shown once)",
        startDate: at(monday.plus({ weeks: 4 }), 10),
        rrule: "FREQ=HOURLY",
      },
    ],
  },
};

function ClickDemo() {
  const [clicked, setClicked] = useState<CalendarEvent | null>(null);
  return (
    <div>
      <Calendar
        width={900}
        height={600}
        events={recurringEvents}
        onEventClick={setClicked}
      />
      <pre data-testid="clicked-occurrence">
        {clicked
          ? JSON.stringify(
              {
                id: clicked.id,
                recurringEventId: clicked.recurringEventId,
                occurrenceDate: clicked.occurrenceDate,
              },
              null,
              2,
            )
          : "Click an occurrence"}
      </pre>
    </div>
  );
}

/** `onEventClick` receives the occurrence, with `recurringEventId`. */
export const ClickAnOccurrence: Story = {
  render: () => <ClickDemo />,
};
