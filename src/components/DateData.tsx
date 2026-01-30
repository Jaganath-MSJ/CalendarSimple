import React from "react";
import styled from "styled-components";
import cx from "classnames";
import { DateDataType } from "./Calendar.type";
import { date as dateFn } from "./Calendar.utils";

function DateData(props: DateDataType) {
  const {
    date,
    data,
    cellWidth,
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
        isToday && todayClassName,
      )}
    >
      <div>
        <p>{date}</p>
        {/* {data && <div className={dataClassName}>{data}</div>} */}
        {data &&(
          <div
            className={dataClassName}
            style={{
              padding: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {data.map((item, index) => {
              let diffDates = 1;
              if (item.endDate) {
                diffDates =
                  dateFn(item.endDate).diff(item.startDate, "days") + 1;
              }
              const width = `${(cellWidth * diffDates) - 16}px`;

              return (
                <div
                  key={`${item.startDate}-${index}`}
                  style={{
                    backgroundColor: "#2E75B6",
                    borderRadius: "4px",
                    width,
                    zIndex: 2,
                    position: "relative",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: "12px",
                    padding: "2px 4px",
                    color: 'black',
                    fontWeight: 'normal',
                  }}
                  title={item.value}
                >
                  {item.value}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DateDataStyles>
  );
}

const DateDataStyles = styled.td<{
  $isSelected: boolean;
  $isToday: boolean;
}>`
  cursor: pointer;
  & > div {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    & > div > p {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    & > div > div {
       overflow: visible;
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
