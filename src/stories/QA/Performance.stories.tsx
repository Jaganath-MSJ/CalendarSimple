import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DateTime } from "luxon";
import Calendar, { ECalendarViewType } from "../../index";
import { CalendarEvent } from "../../types";

const meta: Meta<typeof Calendar> = {
  title: "Tests/Performance Engine",
  component: Calendar,
  parameters: {
    layout: "padded",
  },
  args: {
    height: 800,
    selectedDate: DateTime.now().toJSDate(),
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// Create a massive amount of events
const generateMassiveEventLoad = (amount: number, isSorted = false) => {
  const events: CalendarEvent[] = [];
  const startDay = DateTime.now().startOf("month");

  for (let i = 0; i < amount; i++) {
    const randomDayOffset = Math.floor(Math.random() * 28);
    let startHour = Math.floor(Math.random() * 10) + 8; // 8am to 18pm
    let duration = Math.floor(Math.random() * 60) + 30; // 30 mins to 90 mins

    // Sort logic hack for 'eventsAreSorted'
    if (isSorted) startHour = 8;

    const start = startDay
      .plus({ days: randomDayOffset })
      .set({ hour: startHour, minute: 0 });
    const end = start.plus({ minute: duration });

    events.push({
      id: `perf-ev-${i}`,
      title: `Task #${i + 1}`,
      startDate: start.toFormat("yyyy-MM-ddTHH:mm:00"),
      endDate: end.toFormat("yyyy-MM-ddTHH:mm:00"),
      style: { backgroundColor: `hsl(${i % 360}, 70%, 60%)` },
    });
  }

  // Pre-sort items sequentially if required
  if (isSorted) {
    return events.sort(
      (a, b) =>
        DateTime.fromISO(a.startDate).valueOf() -
        DateTime.fromISO(b.startDate).valueOf(),
    );
  }

  return events;
};

// 1. Extreme payload without optimizations (Baseline - Will be slow)
export const BaselineUnoptimized3000: Story = {
  args: {
    view: ECalendarViewType.week,
    events: generateMassiveEventLoad(3000),
  },
};

// 2. Pre-sorted Events optimization
export const SortedEventsBypass: Story = {
  args: {
    view: ECalendarViewType.week,
    events: generateMassiveEventLoad(3000, true),
    eventsAreSorted: true, // SKIPS the aggressive internal O(n log n) mapping
  },
};

// 3. Skip Slot Mapping Algorithm entirely
export const FastUnorderedPlacement: Story = {
  args: {
    view: ECalendarViewType.week,
    events: generateMassiveEventLoad(3000),
    isEventOrderingEnabled: false, // SKIPS the grouping & "Tetris" placement calculation
  },
};

// 4. Dictionary Enriched Events Bypass
const enrichedPayload = generateMassiveEventLoad(2000);
const preCategorized: Record<string, CalendarEvent[]> = {};
enrichedPayload.forEach((ev) => {
  const dStr = DateTime.fromISO(ev.startDate).toFormat("yyyy-MM-dd");
  if (!preCategorized[dStr]) preCategorized[dStr] = [];
  preCategorized[dStr].push(ev);
});

export const EnrichedDictionaryFastPath: Story = {
  args: {
    view: ECalendarViewType.week,
    events: [], // Ignore master list
    enableEnrichedEvents: true, // Triggers Fast-path O(1) loading
    enrichedEventsByDate: preCategorized, // Provides mapped dictionary
  },
};
