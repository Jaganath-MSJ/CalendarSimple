import { RefObject, useEffect } from "react";
import { dateFn, DateType } from "../utils";
import { TIME_CONSTANTS } from "../constants";

const MINUTES_IN_HOUR = TIME_CONSTANTS.MINUTES_IN_HOUR;

/** Scroll offset (px, 1px per minute) that centres `now` within the visible hour range. */
export function getScrollTarget(
  now: DateType,
  minHour: number,
  maxHour: number,
  viewportHeight: number,
): number {
  const minMin = minHour * MINUTES_IN_HOUR;
  const maxMin = maxHour * MINUTES_IN_HOUR;
  const nowMin = now.hour * MINUTES_IN_HOUR + now.minute;
  const clamped = Math.min(Math.max(nowMin, minMin), maxMin);
  return Math.max(0, clamped - minMin - viewportHeight / 2);
}

interface AutoScrollOptions {
  enabled: boolean;
  days: DateType[];
  minHour: number;
  maxHour: number;
}

export default function useAutoScrollToNow(
  ref: RefObject<HTMLElement | null>,
  { enabled, days, minHour, maxHour }: AutoScrollOptions,
): void {
  const key = `${days[0]?.toISODate()}|${days.length}|${minHour}`;

  useEffect(() => {
    const container = ref.current;
    if (!enabled || !container) return;
    const now = dateFn();
    if (!days.some((day) => now.hasSame(day, "day"))) return;
    container.scrollTo({
      top: getScrollTarget(now, minHour, maxHour, container.clientHeight),
      behavior: "smooth",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);
}
