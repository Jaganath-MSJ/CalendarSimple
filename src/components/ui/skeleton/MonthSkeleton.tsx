import React from "react";
import styles from "./Skeleton.module.css";

export default function MonthSkeleton() {
  const rows = 5;
  const cols = 7;

  return (
    <div className={styles.monthSkeleton} data-testid="month-skeleton">
      <table className={styles.table}>
        <thead>
          <tr>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i} className={styles.headerCell}>
                <div
                  className={styles.shimmer}
                  style={{ width: "60%", height: "14px" }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: cols }, (_, col) => (
                <td key={col} className={styles.cell}>
                  <div
                    className={styles.shimmer}
                    style={{
                      width: "20px",
                      height: "14px",
                      marginBottom: "4px",
                    }}
                  />
                  <div
                    className={styles.shimmer}
                    style={{
                      width: "80%",
                      height: "16px",
                      marginBottom: "3px",
                    }}
                  />
                  {(row + col) % 3 !== 0 && (
                    <div
                      className={styles.shimmer}
                      style={{ width: "60%", height: "16px" }}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
