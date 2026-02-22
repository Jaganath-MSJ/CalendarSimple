/**
 * @file calendarLogic.ts
 * @description Core logic for generating the calendar grid and managing event layout.
 *
 * This utility handles the complex task of:
 * 1. Generating a grid of dates for the current month view.
 * 2. Placing events onto this grid.
 * 3. Handling multi-day events that span across weeks.
 * 4. Calculating vertical slot assignments for events to prevent visual overlaps (the "Tetris" problem).
 */

import calendarize from "calendarize";
import {
  dateFn,
  checkIsToday,
  DateType,
  getMonthStartingDay,
  getStartOfDay,
  getDiffDays,
  getStartOfMonth,
  setDate,
  addDays,
  isBeforeDate,
  isAfterDate,
  isSameDate,
  formatDate,
  subDays,
  getDate,
} from "./date";
import { CalendarEvent, EventListType } from "../types";
import { DATE_FORMATS } from "../constants";

interface InternalCalendarEvent extends CalendarEvent {
  _tempId?: string;
}

/**
 * Represents the information for a single day in the calendar grid.
 */
interface CalendarDayInfo {
  /** The full date object */
  currentDate: DateType;
  /** Whether the day belongs to the currently selected month (for styling) */
  isCurrentMonth: boolean;
  /** The day number to display (1-31) */
  displayDay: number;
  /** List of events or spacers for this day's slots */
  events: (EventListType | null)[];
  /** Total number of events on this day (including hidden ones) */
  totalEvents: number;
  /** Whether this day is today */
  isToday: boolean;
}

/**
 * 2D array representing the calendar grid: [week][day]
 */
type CalendarMatrix = CalendarDayInfo[][];

/**
 * Generates the grid of days and events for the monthly view.
 *
 * This function handles:
 * 1. Grid Generation: Calculates the days for each week, handling previous/next month overlap.
 * 2. Event Processing: Filters events for each week and sorts them.
 * 3. Slot Assignment: Uses a "tetris-like" algorithm to stack overlapping events into available vertical slots.
 * 4. Data Preparation: Formats the data for the UI, including calculating event continuity across days.
 *
 * @param selectedDate - The currently selected date (determining the month to show)
 * @param events - List of all events
 * @returns A structured matrix of weeks and days with assigned events
 */
export function generateCalendarGrid(
  selectedDate: DateType,
  events: CalendarEvent[],
): CalendarMatrix {
  // Sort events
  const dataEvents = [...events].sort((a, b) => {
    return getDiffDays(getStartOfDay(a.startDate), getStartOfDay(b.startDate));
  });

  const calendarArray = calendarize(selectedDate.toDate());

  return calendarArray.map((week: number[], weekIndex: number) => {
    // -------------------------------------------------------------------------
    // 1. Grid Generation: Calculate dates for the entire week first
    // -------------------------------------------------------------------------
    const processedWeek = week.map((day: number, dayIndex: number) => {
      let currentDate = dateFn(selectedDate);
      let isCurrentMonth = true;
      let displayDay = day;

      if (day === 0) {
        isCurrentMonth = false;
        if (weekIndex === 0) {
          const startOfMonth = getStartOfMonth(selectedDate);
          const startDayOfWeek = getMonthStartingDay(selectedDate);
          currentDate = subDays(startOfMonth, startDayOfWeek - dayIndex);
          displayDay = getDate(currentDate);
        } else {
          const startOfMonth = getStartOfMonth(selectedDate);
          const startDayOfWeek = getMonthStartingDay(selectedDate);

          const globalIndex = weekIndex * 7 + dayIndex;
          const daysFromStart = globalIndex - startDayOfWeek;

          currentDate = addDays(startOfMonth, daysFromStart);
          displayDay = getDate(currentDate);
        }
      } else {
        currentDate = setDate(selectedDate, day);
      }
      return { currentDate, isCurrentMonth, displayDay };
    });

    // -------------------------------------------------------------------------
    // 2. Event Identification: Identify all events overlapping with this week
    // -------------------------------------------------------------------------
    const weekStart = getStartOfDay(processedWeek[0].currentDate);
    const weekEnd = getStartOfDay(processedWeek[6].currentDate);

    const weekEvents: InternalCalendarEvent[] = dataEvents.filter((item) => {
      const start = getStartOfDay(item.startDate);
      const end = item.endDate ? getStartOfDay(item.endDate) : start;
      // Check overlap
      return (
        isBeforeDate(start, addDays(weekEnd, 1)) &&
        isAfterDate(end, subDays(weekStart, 1))
      );
    });

    // -------------------------------------------------------------------------
    // 3. Event Sorting: Start Date asc, then Duration desc
    //
    // Sorting is crucial for the slot assignment algorithm ("Tetris" algorithm) to work efficiently.
    // By placing earlier events first, we fill the timeline from left to right.
    // By placing longer events first (among those starting on the same day), we ensure
    // that long-spanning events get stable top slots, reducing visual fragmentation.
    // -------------------------------------------------------------------------
    weekEvents.sort((a, b) => {
      const startA = getStartOfDay(a.startDate);
      const startB = getStartOfDay(b.startDate);
      // Primary sort: Start date (ascending)
      if (!isSameDate(startA, startB)) return getDiffDays(startA, startB);

      // Secondary sort: Duration (descending)
      const endA = a.endDate ? getStartOfDay(a.endDate) : startA;
      const endB = b.endDate ? getStartOfDay(b.endDate) : startB;
      const durA = getDiffDays(endA, startA);
      const durB = getDiffDays(endB, startB);
      return durB - durA; // Longer events first
    });

    // -------------------------------------------------------------------------
    // 4. Slot Assignment: "Tetris" Algorithm
    //
    // The goal here is to assign a vertical "slot" index (0, 1, 2...) to each event
    // so that no two overlapping events share the same slot.
    //
    // We maintain a 2D array `slots[dayIndex][slotIndex]` to track usage.
    // dayIndex: 0..6 (Mon-Sun)
    // slotIndex: 0..N (Vertical position)
    //
    // For each event:
    // 1. Determine its start/end range within this week (clipped to 0..6).
    // 2. Find the lowest `slotIndex` where `slots[day][slotIndex]` is empty for all days in the range.
    // 3. Mark that slot as used for those days.
    // -------------------------------------------------------------------------
    const slots: string[][] = Array(7)
      .fill(null)
      .map(() => []); // slots[dayIndex][slotIndex] = eventId
    const eventSlots = new Map<string, number>(); // Map<eventId, slotIndex> for quick lookup later

    weekEvents.forEach((event, index) => {
      // Determine start/end indices in this week (0..6)
      // We clip the event's start/end to the current week's boundaries because
      // we are only rendering one week at a time in this loop.
      const start = getStartOfDay(event.startDate);
      const end = event.endDate ? getStartOfDay(event.endDate) : start;

      let startIndex = getDiffDays(start, weekStart);
      let endIndex = getDiffDays(end, weekStart);

      // Clip to week boundaries
      if (startIndex < 0) startIndex = 0;
      if (endIndex > 6) endIndex = 6;

      // Find first available slot
      let slotIndex = 0;
      while (true) {
        let isAvailable = true;
        // Check if this slotIndex is free for the entire duration of the event (within this week)
        for (let i = startIndex; i <= endIndex; i++) {
          if (slots[i][slotIndex]) {
            isAvailable = false;
            break;
          }
        }
        if (isAvailable) break; // Found a spot!
        slotIndex++; // Try the next slot down
      }

      // Assign the found slot
      // We create a unique temporary ID because the raw event data might not have one,
      // or we might be processing split segments of the same logical event.
      const eventId = event.startDate + event.title + index;
      eventSlots.set(eventId, slotIndex);

      // Mark the slots as occupied
      for (let i = startIndex; i <= endIndex; i++) {
        slots[i][slotIndex] = eventId;
      }

      // Store the ID on the event object temporarily for step 5
      event._tempId = eventId;
    });

    // -------------------------------------------------------------------------
    // 5. Content Generation: Generate final display data for each day
    // Map the calculated slots back to individual day cells.
    // -------------------------------------------------------------------------
    return processedWeek.map((dayObj, dayIndex) => {
      const { currentDate, isCurrentMonth, displayDay } = dayObj;

      // Find events active on this day
      const activeEvents = weekEvents.filter((event) => {
        const start = getStartOfDay(event.startDate);
        const end = event.endDate ? getStartOfDay(event.endDate) : start;
        return (
          !isBeforeDate(currentDate, start) && !isAfterDate(currentDate, end)
        );
      });

      const displayData: (EventListType | null)[] = [];

      let maxDaySlot = -1;
      activeEvents.forEach((e) => {
        const s = eventSlots.get(e._tempId!);
        if (s !== undefined && s > maxDaySlot) maxDaySlot = s;
      });

      for (let s = 0; s <= maxDaySlot; s++) {
        const event = activeEvents.find(
          (e) => eventSlots.get(e._tempId!) === s,
        );
        if (event) {
          const itemStartDate = getStartOfDay(event.startDate);
          const isStart = isSameDate(itemStartDate, currentDate);
          const isWeekStart = dayIndex === 0;

          // If the event starts today (or earlier but this is the start of the week),
          // we render the "segment" of the event.
          if (isStart || isWeekStart) {
            // Ensure the visual end date doesn't exceed the end of the current week.
            // This is crucial for rendering the correct width for the event bar using CSS/col-span.
            const itemEndDate = event.endDate
              ? getStartOfDay(event.endDate)
              : getStartOfDay(event.startDate);
            const endOfWeekDate = addDays(currentDate, 6 - dayIndex);

            let effectiveEndDate = itemEndDate;
            if (isAfterDate(itemEndDate, endOfWeekDate)) {
              effectiveEndDate = endOfWeekDate;
            }

            displayData.push({
              ...event,
              startDateWeek: formatDate(currentDate, DATE_FORMATS.DATE),
              endDateWeek: formatDate(effectiveEndDate, DATE_FORMATS.DATE),
              isSpacer: false,
            });
          } else {
            // Spacer: The event exists on this day but was started in a previous cell in this row.
            // We insert a spacer so that subsequent events in this column get pushed down to their correct slots.
            displayData.push({ ...event, isSpacer: true });
          }
        } else {
          // Empty slot: No event assigned to this vertical index.
          displayData.push(null);
        }
      }

      return {
        currentDate,
        isCurrentMonth,
        displayDay,
        events: displayData,
        totalEvents: activeEvents.length,
        isToday: checkIsToday(selectedDate, displayDay) && isCurrentMonth,
      };
    });
  });
}
