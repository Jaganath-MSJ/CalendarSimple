import React from "react";
import styles from "./Skeleton.module.css";

const EVENT_BARS = [
  { top: "15%", left: "5%", width: "45%" },
  { top: "38%", left: "52%", width: "30%" },
  { top: "62%", left: "15%", width: "55%" },
];

export default function TimeGridSkeleton() {
  return (
    <div className={styles.timeGridSkeleton} data-testid="time-grid-skeleton">
      <div className={styles.timeColumn}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={styles.timeSlot} data-testid="time-slot">
            <div
              className={styles.shimmer}
              style={{ width: "40px", height: "12px" }}
            />
          </div>
        ))}
      </div>
      <div className={styles.eventsArea}>
        {EVENT_BARS.map((bar, i) => (
          <div
            key={i}
            data-testid="event-bar"
            className={styles.shimmer}
            style={{
              position: "absolute",
              top: bar.top,
              left: bar.left,
              width: bar.width,
              height: "40px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
