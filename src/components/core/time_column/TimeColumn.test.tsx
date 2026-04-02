import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TimeColumn from "./TimeColumn";
import { dateFn } from "../../../utils";
import { ECalendarViewType } from "../../../types";
import { CalendarProvider } from "../../../context/CalendarContext";

describe("TimeColumn Component", () => {
  it("renders the correct number of hour slots", () => {
    const { container } = render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <TimeColumn minHour={8} maxHour={18} is12Hour={false} classNames={{}} />
      </CalendarProvider>,
    );

    // Should render 10 hour slots (from 8 to 17)
    expect(container.firstChild?.childNodes).toHaveLength(10);
  });

  it("formats time in 24-hour style when is12Hour is false", () => {
    // Specifically mocking a date that has a deterministic timezone representation is difficult,
    // so we just check if it renders the base strings cleanly.
    // 14:00
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <TimeColumn
          minHour={14}
          maxHour={15}
          is12Hour={false}
          classNames={{}}
        />
      </CalendarProvider>,
    );

    // The rendered text will be "14:00" because of FORMATS.TIME
    expect(screen.getByText("14:00")).toBeInTheDocument();
  });

  it("formats time in 12-hour style when is12Hour is true", () => {
    render(
      <CalendarProvider
        initialDate={dateFn()}
        initialView={ECalendarViewType.week}
      >
        <TimeColumn minHour={14} maxHour={15} is12Hour={true} classNames={{}} />
      </CalendarProvider>,
    );

    // The rendered text should follow 12-hour like "02 PM"
    expect(screen.getByText("02 PM")).toBeInTheDocument();
  });
});
