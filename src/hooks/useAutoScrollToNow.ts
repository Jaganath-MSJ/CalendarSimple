import { RefObject, useEffect } from "react";
import { dateFn, DateType } from "../utils";
import { TIME_CONSTANTS } from "../constants";

const MINUTES_IN_HOUR = TIME_CONSTANTS.MINUTES_IN_HOUR;

/** Scroll offset (px) that centres `now` within the visible hour range; `scale` is px per minute. */
export function getScrollTarget(
  now: DateType,
  minHour: number,
  maxHour: number,
  viewportHeight: number,
  scale = 1,
): number {
  const minMin = minHour * MINUTES_IN_HOUR;
  const maxMin = maxHour * MINUTES_IN_HOUR;
  const nowMin = now.hour * MINUTES_IN_HOUR + now.minute;
  const clamped = Math.min(Math.max(nowMin, minMin), maxMin);
  return Math.max(0, (clamped - minMin) * scale - viewportHeight / 2);
}

interface AutoScrollOptions {
  enabled: boolean;
  days: DateType[];
  minHour: number;
  maxHour: number;
  /** Pixels per minute (`hourHeight / 60`). */
  scale?: number;
}

export default function useAutoScrollToNow(
  ref: RefObject<HTMLElement | null>,
  { enabled, days, minHour, maxHour, scale = 1 }: AutoScrollOptions,
): void {
  const key = `${days[0]?.toISODate()}|${days.length}|${minHour}`;

  useEffect(() => {
    const container = ref.current;
    if (!enabled || !container) return;
    const now = dateFn();
    if (!days.some((day) => now.hasSame(day, "day"))) return;
    container.scrollTo({
      top: getScrollTarget(
        now,
        minHour,
        maxHour,
        container.clientHeight,
        scale,
      ),
      behavior: "smooth",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);
}
