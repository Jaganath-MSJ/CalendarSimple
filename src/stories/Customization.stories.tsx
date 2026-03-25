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

export const CustomRenderers: Story = {
  args: {
    view: ECalendarViewType.week,
    events: customizeEvents,
    selectedDate: today.toDate(),
    renderEvent: (event: CalendarEvent) => (
      <div
        style={{
          padding: "8px 12px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          fontSize: "0.85rem",
          fontWeight: 500,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
            }}
          />
          <span style={{ color: "#1e293b", fontWeight: 600 }}>
            {event.title}
          </span>
        </div>
        <div style={{ color: "#64748b", fontSize: "0.75rem" }}>
          {dayjs(event.startDate).format("h:mm A")} -{" "}
          {dayjs(event.endDate).format("h:mm A")}
        </div>
      </div>
    ),
    renderHeader: (props: any) => (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          backgroundColor: "white",
          borderBottom: "1px solid #f1f5f9",
          marginBottom: "1px",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() =>
              props.onNavigate(
                dayjs(props.currentDate).subtract(1, "week").toDate(),
              )
            }
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              border: "1px solid #e2e8f0",
              borderRadius: "9999px",
              backgroundColor: "white",
              color: "#475569",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            Previous
          </button>
          <button
            onClick={() =>
              props.onNavigate(dayjs(props.currentDate).add(1, "week").toDate())
            }
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              border: "1px solid #e2e8f0",
              borderRadius: "9999px",
              backgroundColor: "white",
              color: "#475569",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Next
          </button>
        </div>
        <span
          style={{
            fontWeight: 700,
            fontSize: "18px",
            color: "#0f172a",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {dayjs(props.currentDate).format("MMMM YYYY")}
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          {["day", "week", "month"].map((v) => (
            <button
              key={v}
              onClick={() => props.onViewChange(v as ECalendarViewType)}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                border: "1px solid transparent",
                borderRadius: "9999px",
                backgroundColor: props.view === v ? "#f1f5f9" : "transparent",
                color: props.view === v ? "#0f172a" : "#64748b",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    ),
    renderDateCell: (props: any) => (
      <div
        style={{
          flex: 1,
          padding: "12px 0",
          textAlign: "center",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 600,
            color: props.isToday ? "#3b82f6" : "#64748b",
          }}
        >
          {dayjs(props.date).format("ddd")}
        </span>
        <div
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            backgroundColor: props.isToday ? "#3b82f6" : "transparent",
            color: props.isToday ? "white" : "#1e293b",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          {dayjs(props.date).format("D")}
        </div>
      </div>
    ),
    renderHourCell: (date: Date) => {
      const isTop = dayjs(date).minute() === 0;
      return (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderTop: isTop ? "1px dashed #f1f5f9" : "none",
            backgroundColor:
              dayjs(date).hour() >= 9 && dayjs(date).hour() < 18
                ? "transparent"
                : "rgba(248, 250, 252, 0.4)",
          }}
        />
      );
    },
  },
};

export const PagerResets: Story = {
  args: {
    view: ECalendarViewType.month,
    events: customizeEvents,
    selectedDate: today.toDate(),
    selectable: true,
    resetDateOnViewChange: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "When `resetDateOnViewChange` is true, changing the calendar view (e.g., from Month to Week) will automatically reset the selected date to Today.",
      },
    },
  },
};

export const HideAllDayRow: Story = {
  args: {
    view: ECalendarViewType.week,
    events: [
      ...customizeEvents,
      {
        id: "5",
        startDate: today.add(1, "day").format("YYYY-MM-DD"),
        title: "Top",
      },
      {
        id: "6",
        startDate: today.format("YYYY-MM-DD"),
        endDate: today.add(1, "day").format("YYYY-MM-DD"),
        title: "Top 2",
      },
    ],
    selectedDate: today.toDate(),
    showAllDayRow: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Set `showAllDayRow` to `false` to completely hide the all-day event banner at the top of the Day and Week views.",
      },
    },
  },
};
