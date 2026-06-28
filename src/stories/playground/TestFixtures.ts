import type { CalendarEvent } from "../../";

const formatDateTime = (d: Date) => d.toISOString();
const formatDate = (d: Date) => {
  const timezoneOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - timezoneOffset).toISOString().split("T")[0];
};
const addDays = (d: Date, days: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};
const setTime = (d: Date, hour: number, minute: number = 0) => {
  const result = new Date(d);
  result.setHours(hour, minute, 0, 0);
  return result;
};

export const edgeCaseEvents = (): CalendarEvent[] => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return [
    {
      id: "TC1",
      startDate: formatDateTime(setTime(startOfToday, 9, 0)),
      endDate: formatDateTime(setTime(startOfToday, 10, 0)),
      title: "Standard Event",
      style: { backgroundColor: "blue" },
    },
    {
      id: "TC2",
      startDate: formatDateTime(setTime(startOfToday, 10, 30)),
      endDate: formatDateTime(setTime(startOfToday, 10, 30)),
      title: "Zero Duration",
      style: { backgroundColor: "red" },
    },
    {
      id: "TC3",
      startDate: formatDateTime(setTime(startOfToday, 12, 0)),
      endDate: formatDateTime(setTime(startOfToday, 11, 0)),
      title: "Negative Duration",
      style: { backgroundColor: "orange" },
    },
    {
      id: "TC4a",
      startDate: formatDateTime(setTime(startOfToday, 13, 0)),
      endDate: formatDateTime(setTime(startOfToday, 14, 0)),
      title: "Completely Overlapping A",
      style: { backgroundColor: "green" },
    },
    {
      id: "TC4b",
      startDate: formatDateTime(setTime(startOfToday, 13, 0)),
      endDate: formatDateTime(setTime(startOfToday, 14, 0)),
      title: "Completely Overlapping B",
      style: { backgroundColor: "teal" },
    },
    {
      id: "TC5a",
      startDate: formatDateTime(setTime(startOfToday, 14, 30)),
      endDate: formatDateTime(setTime(startOfToday, 15, 30)),
      title: "Partially Overlapping A",
      style: { backgroundColor: "purple" },
    },
    {
      id: "TC5b",
      startDate: formatDateTime(setTime(startOfToday, 15, 0)),
      endDate: formatDateTime(setTime(startOfToday, 16, 0)),
      title: "Partially Overlapping B",
      style: { backgroundColor: "indigo" },
    },
    {
      id: "TC6a",
      startDate: formatDateTime(setTime(startOfToday, 16, 0)),
      endDate: formatDateTime(setTime(startOfToday, 18, 0)),
      title: "Outer Event",
      style: { backgroundColor: "pink" },
    },
    {
      id: "TC6b",
      startDate: formatDateTime(setTime(startOfToday, 16, 30)),
      endDate: formatDateTime(setTime(startOfToday, 17, 30)),
      title: "Inner Event",
      style: { backgroundColor: "rose" },
    },
    ...Array.from({ length: 5 }).map((_, i) => ({
      id: `TC7-${i}`,
      startDate: formatDateTime(setTime(addDays(startOfToday, 1), 9, 0)),
      endDate: formatDateTime(setTime(addDays(startOfToday, 1), 9, 30)),
      title: `Short Event ${i + 1}`,
      style: { backgroundColor: "gray" },
    })),
    {
      id: "TC8",
      startDate: formatDateTime(setTime(addDays(startOfToday, 1), 22, 0)),
      endDate: formatDateTime(setTime(addDays(startOfToday, 2), 2, 0)),
      title: "Overnight Event (Datetime)",
      style: { backgroundColor: "cyan" },
    },
    {
      id: "TC9",
      startDate: formatDateTime(setTime(addDays(startOfToday, 2), 23, 0)),
      endDate: formatDateTime(setTime(addDays(startOfToday, 3), 1, 0)),
      title: "Cross Midnight",
      style: { backgroundColor: "sky" },
    },
    {
      id: "TC10",
      startDate: formatDateTime(setTime(startOfToday, 8, 0)),
      title: "Missing End Time",
      style: { backgroundColor: "violet" },
    },
    {
      id: "TC11",
      startDate: formatDate(addDays(startOfToday, 3)),
      endDate: formatDate(addDays(startOfToday, 5)),
      title: "Multi-Day Date Only",
      style: { backgroundColor: "fuchsia" },
    },
    {
      id: "TC12",
      startDate: formatDate(addDays(startOfToday, 1)),
      endDate: formatDate(addDays(startOfToday, 1)),
      title: "Single-Day Date Only",
      style: { backgroundColor: "magenta" },
    },
    {
      id: "TC13",
      startDate: formatDate(addDays(startOfToday, -1)),
      title: "Missing End Date (Date Only)",
      style: { backgroundColor: "lime" },
    },
    {
      id: "TC14",
      startDate: formatDate(addDays(today, -10)),
      endDate: formatDate(addDays(today, 10)),
      title: "Very Long Event (20 Days)",
      style: { backgroundColor: "slate" },
    },
    {
      id: "TC15",
      startDate: formatDateTime(setTime(addDays(startOfToday, 4), 0, 0)),
      endDate: formatDateTime(setTime(addDays(startOfToday, 4), 23, 59)),
      title: "Full Day (Datetime)",
      style: { backgroundColor: "emerald" },
    },
    {
      id: "TC16",
      startDate: formatDateTime(setTime(addDays(startOfToday, 0), 11, 0)),
      endDate: formatDateTime(setTime(addDays(startOfToday, 2), 0, 1)),
      title: "Day last second",
      style: { backgroundColor: "amber" },
    },
  ];
};

export const emptyEvents = (): CalendarEvent[] => [];

export const singleTimedEvent = (): CalendarEvent[] => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return [
    {
      id: "single-timed",
      startDate: formatDateTime(setTime(startOfToday, 9, 0)),
      endDate: formatDateTime(setTime(startOfToday, 10, 0)),
      title: "Single Timed Event",
      style: { backgroundColor: "#3b82f6" },
    },
  ];
};

export const singleAllDayEvent = (): CalendarEvent[] => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return [
    {
      id: "single-allday",
      startDate: formatDate(startOfToday),
      endDate: formatDate(startOfToday),
      title: "Single All-Day Event",
      style: { backgroundColor: "#10b981" },
    },
  ];
};

export const allDayBannerStress = (): CalendarEvent[] => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#06b6d4",
    "#0ea5e9",
    "#6366f1",
  ];
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `allday-stress-${i}`,
    startDate: formatDate(addDays(startOfToday, i % 4)),
    endDate: formatDate(addDays(startOfToday, (i % 4) + 2)),
    title: `Multi-Day Event ${i + 1}`,
    style: { backgroundColor: colors[i] },
  }));
};

export const monthOverflow = (): CalendarEvent[] => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const colors = [
    "#e53e3e",
    "#ed8936",
    "#ecc94b",
    "#48bb78",
    "#38b2ac",
    "#3182ce",
    "#805ad5",
    "#d69e2e",
    "#d6bcfa",
    "#fca5a5",
    "#fed7aa",
    "#fefce8",
  ];
  return Array.from({ length: 12 }).map((_, i) => ({
    id: `overflow-${i}`,
    startDate: formatDateTime(setTime(startOfToday, 8 + (i % 8), 0)),
    endDate: formatDateTime(setTime(startOfToday, 9 + (i % 8), 0)),
    title: `Event ${i + 1}`,
    style: { backgroundColor: colors[i] },
  }));
};

export const largeDataset_1k = (): CalendarEvent[] => {
  const today = new Date();
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#06b6d4",
    "#0ea5e9",
    "#6366f1",
  ];
  return Array.from({ length: 1000 }).map((_, i) => {
    const date = addDays(today, Math.floor(i / 10) - 50);
    const hour = 8 + (i % 12);
    return {
      id: `event-1k-${i}`,
      startDate: formatDateTime(setTime(date, hour, 0)),
      endDate: formatDateTime(setTime(date, hour + 1, 0)),
      title: `Event ${i}`,
      style: { backgroundColor: colors[i % colors.length] },
    };
  });
};

export const largeDataset_10k = (): CalendarEvent[] => {
  const today = new Date();
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#06b6d4",
    "#0ea5e9",
    "#6366f1",
  ];
  return Array.from({ length: 10000 }).map((_, i) => {
    const date = addDays(today, Math.floor(i / 50) - 100);
    const hour = 8 + (i % 12);
    return {
      id: `event-10k-${i}`,
      startDate: formatDateTime(setTime(date, hour, 0)),
      endDate: formatDateTime(setTime(date, hour + 1, 0)),
      title: `Event ${i}`,
      style: { backgroundColor: colors[i % colors.length] },
    };
  });
};

export const dstSpring = (): CalendarEvent[] => [
  {
    id: "dst-spring",
    startDate: "2026-03-07T20:00:00",
    endDate: "2026-03-08T04:00:00",
    title: "Spans Spring DST",
    style: { backgroundColor: "#06b6d4" },
  },
];
export const dstFall = (): CalendarEvent[] => [
  {
    id: "dst-fall",
    startDate: "2026-10-31T20:00:00",
    endDate: "2026-11-01T04:00:00",
    title: "Spans Fall DST",
    style: { backgroundColor: "#f59e0b" },
  },
];
export const yearBoundary = (): CalendarEvent[] => [
  {
    id: "year-boundary",
    startDate: "2025-12-30T20:00:00",
    endDate: "2026-01-02T02:00:00",
    title: "Spans Year Boundary",
    style: { backgroundColor: "#8b5cf6" },
  },
];
export const monthBoundary = (): CalendarEvent[] => [
  {
    id: "month-boundary",
    startDate: "2026-04-28T18:00:00",
    endDate: "2026-05-03T02:00:00",
    title: "Spans Month Boundary",
    style: { backgroundColor: "#ec4899" },
  },
];

export const unicodeTitles = (): CalendarEvent[] => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return [
    {
      id: "unicode-arabic",
      startDate: formatDateTime(setTime(startOfToday, 9, 0)),
      endDate: formatDateTime(setTime(startOfToday, 10, 0)),
      title: "اجتماع العمل العربي",
      style: { backgroundColor: "#f59e0b" },
    },
    {
      id: "unicode-chinese",
      startDate: formatDateTime(setTime(startOfToday, 10, 0)),
      endDate: formatDateTime(setTime(startOfToday, 11, 0)),
      title: "中文会议标题",
      style: { backgroundColor: "#ef4444" },
    },
    {
      id: "unicode-emoji",
      startDate: formatDateTime(setTime(startOfToday, 11, 0)),
      endDate: formatDateTime(setTime(startOfToday, 12, 0)),
      title: "🎉 Party Time 🎊",
      style: { backgroundColor: "#a855f7" },
    },
    {
      id: "unicode-rtl-ltr",
      startDate: formatDateTime(setTime(startOfToday, 13, 0)),
      endDate: formatDateTime(setTime(startOfToday, 14, 0)),
      title: "English + العربية mixed",
      style: { backgroundColor: "#06b6d4" },
    },
    {
      id: "unicode-long",
      startDate: formatDateTime(setTime(startOfToday, 14, 0)),
      endDate: formatDateTime(setTime(startOfToday, 15, 0)),
      title:
        "This is a very long event title that exceeds 200 characters to test how the calendar handles wrapping and overflow in event chips across different views and screen sizes. It contains multiple sentences and words.",
      style: { backgroundColor: "#10b981" },
    },
  ];
};

export const customMetadata = (): CalendarEvent[] => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return [
    {
      id: "custom-1",
      startDate: formatDateTime(setTime(startOfToday, 9, 0)),
      endDate: formatDateTime(setTime(startOfToday, 10, 0)),
      title: "Meeting with team",
      style: { backgroundColor: "#3b82f6" },
      category: "work",
      attendees: ["Alice", "Bob", "Charlie"],
      location: "Conference Room A",
      priority: "high",
    } as CalendarEvent,
    {
      id: "custom-2",
      startDate: formatDateTime(setTime(startOfToday, 14, 0)),
      endDate: formatDateTime(setTime(startOfToday, 15, 0)),
      title: "Lunch with client",
      style: { backgroundColor: "#10b981" },
      category: "personal",
      attendees: ["Client X"],
      location: "Downtown Restaurant",
      priority: "medium",
    } as CalendarEvent,
  ];
};

export const htmlInjection = (): CalendarEvent[] => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return [
    {
      id: "html-injection",
      startDate: formatDateTime(setTime(startOfToday, 9, 0)),
      endDate: formatDateTime(setTime(startOfToday, 10, 0)),
      title: '<script>alert("XSS")</script>',
      style: { backgroundColor: "#ef4444" },
    },
    {
      id: "html-safe",
      startDate: formatDateTime(setTime(startOfToday, 11, 0)),
      endDate: formatDateTime(setTime(startOfToday, 12, 0)),
      title: "Normal <b>HTML</b> should not render",
      style: { backgroundColor: "#3b82f6" },
    },
  ];
};

export const fixtureList: Array<{ name: string; fn: () => CalendarEvent[] }> = [
  { name: "Edge Cases", fn: edgeCaseEvents },
  { name: "Empty", fn: emptyEvents },
  { name: "Single Timed", fn: singleTimedEvent },
  { name: "Single All-Day", fn: singleAllDayEvent },
  { name: "All-Day Banner Stress", fn: allDayBannerStress },
  { name: "Month Overflow", fn: monthOverflow },
  { name: "Large Dataset (1k)", fn: largeDataset_1k },
  { name: "Large Dataset (10k)", fn: largeDataset_10k },
  { name: "DST Spring", fn: dstSpring },
  { name: "DST Fall", fn: dstFall },
  { name: "Year Boundary", fn: yearBoundary },
  { name: "Month Boundary", fn: monthBoundary },
  { name: "Unicode Titles", fn: unicodeTitles },
  { name: "Custom Metadata", fn: customMetadata },
  { name: "HTML Injection", fn: htmlInjection },
];
