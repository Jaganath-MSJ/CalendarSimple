import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, {
  CalendarEvent,
  ECalendarViewType,
  EventDropInfo,
  EventResizeInfo,
} from "../";

const meta: Meta<typeof Calendar> = {
  title: "Drag and Resize",
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
const toIso = (d: Date, allDay: boolean) => {
  const dt = DateTime.fromJSDate(d);
  return allDay ? dt.toISODate()! : dt.toFormat("yyyy-MM-dd'T'HH:mm:ss");
};

const baseEvents: CalendarEvent[] = [
  {
    id: "standup",
    title: "Standup",
    startDate: at(monday, 9),
    endDate: at(monday, 9, 30),
    editable: true,
    style: { backgroundColor: "#2563eb" },
  },
  {
    id: "design",
    title: "Design review",
    startDate: at(monday.plus({ days: 1 }), 11),
    endDate: at(monday.plus({ days: 1 }), 12, 30),
    editable: true,
    style: { backgroundColor: "#059669" },
  },
  {
    id: "locked",
    title: "Board meeting (locked)",
    startDate: at(monday.plus({ days: 2 }), 14),
    endDate: at(monday.plus({ days: 2 }), 16),
    editable: false,
    style: { backgroundColor: "#6b7280" },
  },
  {
    id: "offsite",
    title: "Team offsite",
    startDate: monday.plus({ days: 3 }).toISODate()!,
    endDate: monday.plus({ days: 4 }).toISODate()!,
    editable: true,
    style: { backgroundColor: "#d97706" },
  },
];

const recurringEvents: CalendarEvent[] = [
  {
    id: "daily",
    title: "Daily sync",
    startDate: at(monday, 10),
    endDate: at(monday, 10, 30),
    rrule: "FREQ=DAILY;COUNT=10",
    style: { backgroundColor: "#7c3aed" },
  },
];

/** Applies drops and resizes to app state, as a host app would. */
function DragDemo({
  initialEvents,
  ...args
}: Args & { initialEvents: CalendarEvent[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [log, setLog] = useState(
    "Drag an event, or focus one and press Alt+arrow.",
  );

  const update = (
    event: CalendarEvent,
    start: Date,
    end: Date,
    allDay: boolean,
  ) => {
    const seriesId = event.recurringEventId as string | undefined;
    setEvents((prev) => {
      if (!seriesId) {
        return prev.map((e) =>
          e.id === event.id
            ? {
                ...e,
                startDate: toIso(start, allDay),
                endDate: toIso(end, allDay),
              }
            : e,
        );
      }
      // Moving one occurrence: skip it in the series and add a one-off copy.
      return [
        ...prev.map((e) =>
          e.id === seriesId
            ? {
                ...e,
                exdates: [...((e.exdates as string[]) ?? []), event.startDate],
              }
            : e,
        ),
        {
          id: `${seriesId}-${Date.now()}`,
          title: `${event.title} (moved)`,
          startDate: toIso(start, allDay),
          endDate: toIso(end, allDay),
          style: event.style,
        },
      ];
    });
  };

  const fmt = (d: Date) => DateTime.fromJSDate(d).toFormat("ccc d LLL HH:mm");
  const onEventDrop = (info: EventDropInfo) => {
    update(info.event, info.start, info.end, info.allDay);
    setLog(
      `Dropped "${info.event.title}" in ${info.view}: ${fmt(info.start)} – ${fmt(info.end)}` +
        (info.event.recurringEventId
          ? ` (occurrence of ${String(info.event.recurringEventId)})`
          : ""),
    );
  };
  const onEventResize = (info: EventResizeInfo) => {
    update(info.event, info.start, info.end, false);
    setLog(
      `Resized "${info.event.title}" (${info.edge}): ${fmt(info.start)} – ${fmt(info.end)}`,
    );
  };

  return (
    <div>
      <p
        data-testid="drag-log"
        style={{ fontFamily: "monospace", margin: "0 0 8px" }}
      >
        {log}
      </p>
      <Calendar
        {...args}
        events={events}
        onEventDrop={onEventDrop}
        onEventResize={args.resizable ? onEventResize : undefined}
      />
    </div>
  );
}

export const TimeGrid: Story = {
  args: { view: ECalendarViewType.week, draggable: true, resizable: true },
  render: (args: Args) => <DragDemo {...args} initialEvents={baseEvents} />,
};

export const Month: Story = {
  args: { view: ECalendarViewType.month, draggable: true },
  render: (args: Args) => <DragDemo {...args} initialEvents={baseEvents} />,
};

export const PerEventPredicate: Story = {
  args: {
    view: ECalendarViewType.week,
    draggable: (event: CalendarEvent) => event.editable === true,
    resizable: (event: CalendarEvent) => event.editable === true,
  },
  render: (args: Args) => <DragDemo {...args} initialEvents={baseEvents} />,
};

export const RecurringOccurrence: Story = {
  args: { view: ECalendarViewType.week, draggable: true, resizable: true },
  render: (args: Args) => (
    <DragDemo {...args} initialEvents={recurringEvents} />
  ),
};

export const RTL: Story = {
  args: {
    view: ECalendarViewType.week,
    draggable: true,
    resizable: true,
    direction: "rtl",
  },
  render: (args: Args) => <DragDemo {...args} initialEvents={baseEvents} />,
};
