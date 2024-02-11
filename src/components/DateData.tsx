import React from "react";
import styled from "styled-components";
import cx from "classnames";
import { DateDataType } from "./Calendar.type";

function DateData(props: DateDataType) {
  const {
    date,
    data,
    className,
    dataClassName,
    isSelected,
    isToday,
    onClick,
    selectedClassName,
    todayClassName,
  } = props;

  return (
    <DateDataStyles
      $isSelected={isSelected}
      $isToday={isToday}
      onClick={() => onClick?.(date)}
      className={cx(
        className,
        isSelected && selectedClassName,
        isToday && todayClassName
      )}
    >
      <div>
        <p>{date}</p>
        {data && <div className={dataClassName}>{data}</div>}
      </div>
    </DateDataStyles>
  );
}

const DateDataStyles = styled.td<{
  $isSelected: boolean;
  $isToday: boolean;
}>`
  & > div {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    & > div > * {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  ${(props) =>
    props.$isSelected
      ? `
        background-color: #EEEEEE;
        color: #737373;
        font-weight: bold;
      `
      : ``}
  ${(props) =>
    props.$isToday
      ? `
        color: #2E75B6;
        font-size: 18px;
        font-weight: bold;
      `
      : ``}
`;

export default DateData;
