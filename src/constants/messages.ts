/**
 * @file English defaults for every localisable string, and the merge helper.
 */
import type { CalendarMessages } from "../types";

/** English defaults for every message. */
export const DEFAULT_MESSAGES: CalendarMessages = {
  today: "Today",
  day: "Day",
  week: "Week",
  month: "Month",
  schedule: "Schedule",
  days: "Days",
  allDay: "All day",
  until: "Until",
  noEvents: "No events to display",
  noTitle: "No title",
  previous: "Previous period",
  next: "Next period",
  selectView: "Select calendar view",
  selectMonth: "Select month",
  selectYear: "Select year",
  calendarNavigation: "Calendar navigation",
  allDayEvents: "All-day events",
  expandAllDay: "Expand all-day events",
  collapseAllDay: "Collapse all-day events",
  weekView: "Week view",
  dayView: "Day view",
  scheduleView: "Schedule view",
  weekNumber: (n) => `W${n}`,
  nDaysView: (n) => `${n} days view`,
  more: (n) => `+ ${n} more`,
  moreAllDay: (n) => `${n} more all-day events, click to expand`,
  moreEventsOn: (n, d) => `${n} more events on ${d}`,
  dayOfTotal: (i, n) => `(Day ${i}/${n})`,
  eventsOn: (d) => `Events on ${d}`,
  createEventAt: (t, d) => `Create event at ${t}, ${d}`,
};

/**
 * Merges partial overrides over `DEFAULT_MESSAGES` key by key; `undefined`
 * values fall back to the default.
 */
export function resolveMessages(
  partial?: Partial<CalendarMessages>,
): CalendarMessages {
  if (!partial) return DEFAULT_MESSAGES;
  const out: Record<string, unknown> = { ...DEFAULT_MESSAGES };
  for (const [key, value] of Object.entries(partial)) {
    if (value !== undefined) out[key] = value;
  }
  return out as unknown as CalendarMessages;
}
