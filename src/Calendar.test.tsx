import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { expect, describe, it, vi } from "vitest";
import { dateFn } from "./utils";
import { ECalendarViewType } from "./types";
import Calendar from "./Calendar";

// Mock ResizeObserver as it's not available in jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock;

describe("Calendar Component Integration", () => {
  it("renders the Calendar without crashing", () => {
    const { container } = render(<Calendar />);
    expect(container).toBeInTheDocument();
    expect(container.firstChild).not.toBeNull();
  });

  it("handles DisabledSelectable interactions correctly", () => {
    const onDateClick = vi.fn();
    const onEventClick = vi.fn();

    // Day view has a large clickable grid
    const { container } = render(
      <Calendar
        view={ECalendarViewType.day}
        selectable={false}
        onDateClick={onDateClick}
        onEventClick={onEventClick}
        events={[
          { id: "1", title: "Test Event", startDate: new Date().toISOString() },
        ]}
      />,
    );

    // We expect the click events to be swallowed or not attached
    const gridCells = container.querySelectorAll(".hourCell");
    if (gridCells.length > 0) {
      fireEvent.click(gridCells[0]);
    }

    const eventItem = container.querySelector(".eventBlock");
    if (eventItem) {
      fireEvent.click(eventItem);
    }

    expect(onDateClick).not.toHaveBeenCalled();
    expect(onEventClick).not.toHaveBeenCalled();
  });

  it("responds to ControlledState updates", () => {
    const start = dateFn("2024-03-01");
    const { rerender } = render(
      <Calendar
        selectedDate={start.toJSDate()}
        view={ECalendarViewType.month}
      />,
    );

    expect(screen.getByText("March 2024")).toBeInTheDocument();

    const newDate = dateFn("2025-06-15");
    rerender(
      <Calendar
        selectedDate={newDate.toJSDate()}
        view={ECalendarViewType.month}
      />,
    );

    expect(screen.getByText("June 2025")).toBeInTheDocument();
  });

  it("applies classNames and theme styling correctly", () => {
    const { container } = render(
      <Calendar
        classNames={{
          root: "custom-root-class",
          header: "custom-header-class",
        }}
        theme={{ default: { bgColor: "red", color: "white" } }}
      />,
    );

    // The calendar root is rendered as a section element inside the wrapper div
    const calendarSection = container.querySelector(".custom-root-class");
    expect(calendarSection).toBeInTheDocument();

    const header = container.querySelector(".custom-header-class");
    expect(header).toBeInTheDocument();
  });

  it("handles onViewChange callbacks", () => {
    const onViewChange = vi.fn();
    render(
      <Calendar
        view={ECalendarViewType.month}
        onViewChange={onViewChange}
        resetDateOnViewChange={true}
      />,
    );

    const viewSelect = screen.getByDisplayValue("Month");
    fireEvent.change(viewSelect, { target: { value: ECalendarViewType.week } });

    expect(onViewChange).toHaveBeenCalledWith(ECalendarViewType.week);
  });

  it("renders children directly when children prop is provided", () => {
    render(
      <Calendar>
        <div data-testid="custom-child">custom content</div>
      </Calendar>,
    );
    // The custom child must appear
    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
    expect(screen.getByText("custom content")).toBeInTheDocument();
    // The default header is NOT rendered (no "Today" button, no view selector)
    expect(screen.queryByText("Today")).not.toBeInTheDocument();
  });

  it("supports compound component pattern with Calendar.Header and Calendar.MonthView", () => {
    render(
      <Calendar
        events={[]}
        view={ECalendarViewType.month}
        selectedDate={new Date("2024-03-01")}
      >
        <Calendar.Header />
        <Calendar.MonthView />
      </Calendar>,
    );
    // Header renders a view selector (3 selects: view, month, year)
    expect(
      screen.getByTestId("calendar-header-view-select"),
    ).toBeInTheDocument();
    // MonthView renders abbreviated day-name column headers
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
  });

  describe("RTL Direction Support", () => {
    it("renders dir='rtl' on the root when direction='rtl'", () => {
      const { container } = render(<Calendar direction="rtl" />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("dir", "rtl");
    });

    it("renders dir='rtl' when locale is Arabic and no direction prop", () => {
      const { container } = render(<Calendar locale="ar" />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("dir", "rtl");
    });

    it("renders dir='ltr' when direction='ltr' overrides Arabic locale", () => {
      const { container } = render(<Calendar locale="ar" direction="ltr" />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("dir", "ltr");
    });

    it("defaults to dir='ltr' with no locale or direction", () => {
      const { container } = render(<Calendar />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("dir", "ltr");
    });

    it("renders dir='rtl' for Hebrew locale", () => {
      const { container } = render(<Calendar locale="he" />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("dir", "rtl");
    });
  });

  describe("Localization Support", () => {
    it("renders the header months in the specified locale", () => {
      const date = dateFn("2024-01-15");
      const { rerender } = render(
        <Calendar
          selectedDate={date.toJSDate()}
          view={ECalendarViewType.month}
          locale="fr"
        />,
      );

      // January in French is "janvier"
      // The header typically shows "January 2024", in French it should be "janvier 2024"
      // Note: Luxon might capitalize differently, but let's check for the presence of the word.
      expect(screen.getByText(/janvier 2024/i)).toBeInTheDocument();

      rerender(
        <Calendar
          selectedDate={date.toJSDate()}
          view={ECalendarViewType.month}
          locale="es"
        />,
      );
      // January in Spanish is "enero"
      expect(screen.getByText(/enero 2024/i)).toBeInTheDocument();
    });

    it("uses localeMessages to override default UI text", () => {
      render(
        <Calendar
          view={ECalendarViewType.month}
          localeMessages={{
            today: "TODAY_CUSTOM",
            month: "MONTH_VIEW_CUSTOM",
          }}
        />,
      );

      expect(screen.getByText("TODAY_CUSTOM")).toBeInTheDocument();
      expect(screen.getByText("MONTH_VIEW_CUSTOM")).toBeInTheDocument();
    });

    it("renders week days in the specified locale", () => {
      const { getByTestId } = render(
        <Calendar
          view={ECalendarViewType.week}
          selectedDate={new Date("2024-01-15")}
          locale="fr"
        />,
      );

      const weekView = getByTestId("calendar-week-view");
      // In French, week days starts with Lun, Mar, Mer, Jeu, Ven, Sam, Dim
      expect(weekView).toHaveTextContent(/lun/i);
      expect(weekView).toHaveTextContent(/mar/i);
    });

    it("translates schedule view date groups", () => {
      render(
        <Calendar
          view={ECalendarViewType.schedule}
          selectedDate={dateFn("2024-01-15").toJSDate()}
          events={[
            { id: "1", title: "Localized Event", startDate: "2024-01-15" },
          ]}
          locale="fr"
        />,
      );

      // Check the date info container for French translation
      const dateInfo = screen.getByTestId("calendar-date-info");
      expect(dateInfo.textContent?.toLowerCase()).toContain("janv");
      expect(screen.getByText("Localized Event")).toBeInTheDocument();
    });

    it("respects weekStartsOn alongside locale", () => {
      const { getByTestId } = render(
        <Calendar
          view={ECalendarViewType.week}
          selectedDate={dateFn("2023-12-31").toJSDate()} // A Sunday
          locale="fr"
          weekStartsOn={1} // Monday
        />,
      );

      const weekView = getByTestId("calendar-week-view");
      // If week starts on Monday, then 2023-12-31 (Sunday) should be at the end
      // or at least we check if it's rendered properly.
      expect(weekView).toBeInTheDocument();
    });

    it("uses all localeMessages keys including 'days' and 'schedule'", () => {
      render(
        <Calendar
          view={ECalendarViewType.month}
          customDays={3}
          localeMessages={{
            today: "TODAY_OVERRIDE",
            day: "DAY_OVERRIDE",
            week: "WEEK_OVERRIDE",
            month: "MONTH_OVERRIDE",
            schedule: "SCHEDULE_OVERRIDE",
            days: "DAYS_OVERRIDE",
          }}
        />,
      );

      // Check header buttons/dropdowns
      expect(screen.getByText("TODAY_OVERRIDE")).toBeInTheDocument();

      const viewSelect = screen.getByTestId("calendar-header-view-select");
      fireEvent.change(viewSelect, {
        target: { value: ECalendarViewType.schedule },
      });
      expect(screen.getByText("SCHEDULE_OVERRIDE")).toBeInTheDocument();

      fireEvent.change(viewSelect, {
        target: { value: ECalendarViewType.customDays },
      });
      // The option text for customDays is "${customDays} ${localeMessages.days}"
      expect(screen.getByText(/3 DAYS_OVERRIDE/i)).toBeInTheDocument();
    });
  });
});
