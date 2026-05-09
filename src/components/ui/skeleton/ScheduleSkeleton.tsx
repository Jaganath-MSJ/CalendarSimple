import React from "react";
import styles from "./Skeleton.module.css";

export default function ScheduleSkeleton() {
  return (
    <div className={styles.scheduleSkeleton} data-testid="schedule-skeleton">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className={styles.scheduleRow}
          data-testid="schedule-skeleton-row"
        >
          <div
            data-testid="skeleton-circle"
            className={styles.shimmer}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          <div className={styles.scheduleLines}>
            <div
              data-testid="skeleton-line"
              className={styles.shimmer}
              style={{ width: "70%", height: "14px" }}
            />
            <div
              data-testid="skeleton-line"
              className={styles.shimmer}
              style={{ width: "50%", height: "12px" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
