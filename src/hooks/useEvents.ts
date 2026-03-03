import { useMemo } from "react";
import { dateFn } from "../utils/date";
import { CalendarEvent } from "../types/events";

export default function useEvents(events: CalendarEvent[]) {
  const validEvents = useMemo(() => {
    return events.filter((event) => {
      if (!event.endDate) return true;
      return !dateFn(event.endDate).isBefore(dateFn(event.startDate));
    });
  }, [events]);

  return validEvents;
}
