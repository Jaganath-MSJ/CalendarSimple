import React, { useEffect, useState } from "react";
import cx from "classnames";
import styles from "./CurrentTimeLine.module.css";
import { dateFn } from "../../utils";

interface CurrentTimeLineProps {
  className?: string;
}

const CurrentTimeLine = ({ className }: CurrentTimeLineProps) => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      const now = dateFn();
      const hours = now.hour();
      const minutes = now.minute();
      // eventSlot height is 60px per hour
      const totalMinutes = hours * 60 + minutes;
      setPosition(totalMinutes);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000); // update every minute

    return () => clearInterval(interval);
  }, []);

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
