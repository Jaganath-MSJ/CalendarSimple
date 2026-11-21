/**
 * @file Hook that merges context-level calendar config with view-local prop overrides.
 */
import { useCalendar } from "../context/CalendarContext";
import { mergeDefined } from "../utils/common";
import { CalendarProps, CalendarContentProps } from "../types";

/**
 * Merges the global calendar config from context with view-local props.
 * Local props take precedence — undefined values are ignored so they don't
 * accidentally overwrite context defaults.
 *
 * @param localProps - Props specific to the calling view component.
 * @returns Merged `CalendarContentProps` with all required defaults guaranteed.
 */
export default function useCalendarProps<T extends Partial<CalendarProps>>(
  localProps: T,
): CalendarContentProps {
  const { config } = useCalendar();

  return mergeDefined<CalendarContentProps>(config, localProps);
}
