import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { CalendarEvent, ECalendarViewType } from "../";

const meta: Meta<typeof Calendar> = {
  title: "Native Parity",
  component: Calendar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { width: 900, height: 700 },
};

export default meta;
type Story = StoryObj<typeof Calendar>;
type Args = React.ComponentProps<typeof Calendar>;

const monday = DateTime.now().startOf("week");
const at = (day: DateTime, hour: number, minute = 0) =>
  day.set({ hour, minute }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
const events: CalendarEvent[] = [
  {
    id: "a",
    title: "Standup",
    startDate: at(monday, 9),
    endDate: at(monday, 9, 30),
  },
  {
    id: "b",
    title: "Design review",
    startDate: at(monday.plus({ days: 1 }), 11),
    endDate: at(monday.plus({ days: 1 }), 12, 30),
  },
  {
    id: "c",
    title: "Offsite",
    startDate: monday.plus({ days: 3 }).toISODate()!,
    endDate: monday.plus({ days: 4 }).toISODate()!,
  },
];

/** Controlled zoom: Ctrl/⌘ + wheel or a trackpad pinch, with a readout. */
function ZoomDemo(args: Args) {
  const [hourHeight, setHourHeight] = useState(60);
  return (
    <div>
      <p
        data-testid="hour-height-readout"
        style={{ fontFamily: "monospace", margin: "0 0 8px" }}
      >
        hourHeight: {hourHeight}px (Ctrl/⌘ + wheel or pinch to zoom)
      </p>
      <Calendar
        {...args}
        hourHeight={hourHeight}
        onHourHeightChange={setHourHeight}
      />
    </div>
  );
}

export const HourHeightZoom: Story = {
  args: {
    view: ECalendarViewType.week,
    events,
    pinchToZoom: true,
    showCurrentTime: true,
  },
  render: (args: Args) => <ZoomDemo {...args} />,
};

export const Palette: Story = {
  args: {
    view: ECalendarViewType.month,
    events,
    palette: {
      light: {
        primary: "#7c3aed",
        primaryStrong: "#6d28d9",
        eventDefault: "#7c3aed",
        nowLine: "#16a34a",
      },
      dark: { primary: "#a78bfa", primaryStrong: "#c4b5fd" },
    },
  },
};

/** Keyboard (on by default) and touch swipe between periods. */
function NavigationDemo(args: Args) {
  const [log, setLog] = useState(
    "Tab into the grid and use the arrow keys, PageUp / PageDown, T; swipe on touch.",
  );
  return (
    <div>
      <p
        data-testid="navigation-readout"
        style={{ fontFamily: "monospace", margin: "0 0 8px" }}
      >
        {log}
      </p>
      <Calendar
        {...args}
        onNavigate={(d) =>
          setLog(
            `onNavigate: ${DateTime.fromJSDate(d).toFormat("ccc d LLL yyyy")}`,
          )
        }
      />
    </div>
  );
}

export const KeyboardAndSwipe: Story = {
  args: { view: ECalendarViewType.month, events, swipeNavigation: true },
  render: (args: Args) => <NavigationDemo {...args} />,
};

export const CustomDaysUpToSeven: Story = {
  args: { view: ECalendarViewType.customDays, customDays: 7, events },
};
