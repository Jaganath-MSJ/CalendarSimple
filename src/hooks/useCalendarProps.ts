import { useCalendar } from "../context/CalendarContext";
import { CalendarProps, CalendarContentProps } from "../types";

export default function useCalendarProps<T extends Partial<CalendarProps>>(
  localProps: T,
): CalendarContentProps {
  const { config } = useCalendar();

  const merged = { ...config } as Record<string, unknown>;
  for (const key in localProps) {
    if (localProps[key] !== undefined) {
      merged[key] = localProps[key];
    }
  }

  return merged as CalendarContentProps;
}
