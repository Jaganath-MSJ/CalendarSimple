/**
 * @file Hook returning the resolved built-in UI strings.
 */
import { useCalendar } from "../context/CalendarContext";
import { resolveMessages } from "../constants";
import type { CalendarMessages } from "../types";

/**
 * Returns the context's resolved messages, falling back to resolving
 * `config.localeMessages` for context values built without `messages`.
 */
export default function useMessages(): CalendarMessages {
  const ctx = useCalendar();
  return ctx.messages ?? resolveMessages(ctx.config?.localeMessages);
}
