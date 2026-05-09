import React, { useEffect, useState } from "react";
import cx from "classnames";
import styles from "./CurrentTimeLine.module.css";
import { dateFn } from "../../../utils";
import { CalendarContentProps } from "../../../types";
import { useCalendar } from "../../../context/CalendarContext";
import { TIME_CONSTANTS } from "../../../constants";

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
  const { testId } = useCalendar();
  const [position, setPosition] = useState(() => {
    const now = dateFn();
    return (now.hour - minHour) * TIME_CONSTANTS.MINUTES_IN_HOUR + now.minute;
  });

  useEffect(() => {
    const updatePosition = () => {
      const now = dateFn();
      const hours = now.hour;
      const minutes = now.minute;
      // eventSlot height is 60px per hour
      const totalMinutes =
        (hours - minHour) * TIME_CONSTANTS.MINUTES_IN_HOUR + minutes;
      setPosition(totalMinutes);
    };

    updatePosition();
    const interval = setInterval(updatePosition, TIME_CONSTANTS.MS_PER_MINUTE);

    return () => clearInterval(interval);
  }, [minHour]);

  if (
    position < 0 ||
    position > (maxHour - minHour) * TIME_CONSTANTS.MINUTES_IN_HOUR
  ) {
    return null;
  }

  return (
    <div
      className={cx(styles.currentTimeLine, className)}
      style={{ top: `${position}px` }}
      data-testid={`${testId}-current-time-line`}
    >
      <div className={styles.circle} />
      <div className={styles.line} />
    </div>
  );
};

export default CurrentTimeLine;
