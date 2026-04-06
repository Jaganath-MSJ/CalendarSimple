import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { ECalendarViewType } from "../../index";
const action =
  (name: string) =>
  (...params: any[]) =>
    console.log(name, params);

const today = DateTime.now();

const meta: Meta<typeof Calendar> = {
  title: "Tests/Interactions",
  component: Calendar,
  parameters: {
    layout: "padded",
  },
  args: {
    height: 600,
    view: ECalendarViewType.week,
    selectable: true,
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const mockEvents = [
  {
    id: "interact-1",
    startDate: today
      .set({ hour: 10, minute: 0 })
      .toFormat("yyyy-MM-ddTHH:mm:00"),
    endDate: today.set({ hour: 11, minute: 0 }).toFormat("yyyy-MM-ddTHH:mm:00"),
    title: "Clickable Event",
    style: { backgroundColor: "#8B5CF6" },
  },
];

export const CallbacksAndSelectable: Story = {
  args: {
    events: mockEvents,
    onDateClick: action("onDateClick"),
    onEventClick: action("onEventClick"),
    onNavigate: action("onNavigate"),
    onViewChange: action("onViewChange"),
  },
};

export const DisabledSelectable: Story = {
  args: {
    events: mockEvents,
    selectable: false,
    onDateClick: action("SHOULD NOT FIRE: onDateClick"),
    onEventClick: action("SHOULD NOT FIRE: onEventClick"),
  },
};

export const ControlledState: Story = {
  render: (args: any) => {
    const [date, setDate] = useState(today.toJSDate());
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h3>
            Controlled Date State:{" "}
            {DateTime.fromJSDate(date).toFormat("yyyy-MM-dd")}
          </h3>
          <p>
            Click on cells or use navigation headers to test controlled state
            change via `onNavigate` and `onDateClick`.
          </p>
        </div>
        <Calendar
          {...args}
          selectedDate={date}
          onDateClick={(d) => {
            setDate(d);
            action("onDateClick-UpdatingState")(d);
          }}
          onNavigate={(d) => {
            setDate(d);
            action("onNavigate-UpdatingState")(d);
          }}
        />
      </div>
    );
  },
  args: {
    events: mockEvents,
  },
};
