import React, { useEffect, useState } from "react";
import cx from "classnames";
import styles from "./CurrentTimeLine.module.css";
import { dateFn } from "../../../utils";
import { CalendarContentProps } from "../../../types";

interface CurrentTimeLineProps extends Pick<
  CalendarContentProps,
  "minHour" | "maxHour"
> {
  className?: string;
}

const CurrentTimeLine = ({
  className,
  minHour,
  maxHour,
}: CurrentTimeLineProps) => {
  const [position, setPosition] = useState(() => {
    const now = dateFn();
    return (now.hour() - minHour) * 60 + now.minute();
  });

  useEffect(() => {
    const updatePosition = () => {
      const now = dateFn();
      const hours = now.hour();
      const minutes = now.minute();
      // eventSlot height is 60px per hour
      const totalMinutes = (hours - minHour) * 60 + minutes;
      setPosition(totalMinutes);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000); // update every minute

    return () => clearInterval(interval);
  }, [minHour]);

  if (position < 0 || position > (maxHour - minHour) * 60) {
    return null;
  }

  return (
    <div
      className={cx(styles.currentTimeLine, className)}
      style={{ top: `${position}px` }}
    >
      <div className={styles.circle} />
      <div className={styles.line} />
    </div>
  );
};

export default CurrentTimeLine;
