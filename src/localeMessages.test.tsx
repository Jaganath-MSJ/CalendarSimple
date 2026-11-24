import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Calendar from "./Calendar";
import { ECalendarViewType } from "./types";

const date = new Date("2024-03-15T00:00:00");

describe("localeMessages", () => {
  it("localises Schedule 'All day' and the empty state", () => {
    render(
      <Calendar
        width={700}
        height={600}
        view={ECalendarViewType.schedule}
        selectedDate={date}
        events={[{ id: "a", startDate: "2024-03-15", title: "Fête" }]}
        localeMessages={{ allDay: "Toute la journée" }}
      />,
    );
    expect(screen.getByText("Toute la journée")).toBeInTheDocument();
  });

  it("localises the Schedule empty state", () => {
    render(
      <Calendar
        width={700}
        height={600}
        view={ECalendarViewType.schedule}
        selectedDate={date}
        events={[]}
        localeMessages={{ noEvents: "Aucun événement" }}
      />,
    );
    expect(screen.getByText("Aucun événement")).toBeInTheDocument();
  });

  it("localises the month '+N more' text and aria-label", () => {
    const events = [1, 2, 3, 4, 5].map((i) => ({
      id: `e${i}`,
      startDate: "2024-03-15",
      title: `Event ${i}`,
    }));
    render(
      <Calendar
        width={700}
        height={600}
        view={ECalendarViewType.month}
        selectedDate={date}
        events={events}
        maxEvents={2}
        localeMessages={{
          more: (n) => `+${n} autres`,
          moreEventsOn: (n) => `${n} de plus`,
        }}
      />,
    );
    const btn = screen.getByText(/^\+\d+ autres$/);
    expect(btn).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/de plus$/),
    );
  });

  it("localises header labels", () => {
    render(
      <Calendar
        width={700}
        height={600}
        view={ECalendarViewType.month}
        selectedDate={date}
        localeMessages={{ previous: "Précédent", selectMonth: "Mois" }}
      />,
    );
    expect(screen.getByLabelText("Précédent")).toBeInTheDocument();
    expect(screen.getByLabelText("Mois")).toBeInTheDocument();
    expect(screen.getByLabelText("Next period")).toBeInTheDocument();
  });

  it("localises the view region and slot labels", () => {
    render(
      <Calendar
        width={700}
        height={600}
        view={ECalendarViewType.week}
        selectedDate={date}
        creatable
        onSlotClick={() => {}}
        localeMessages={{
          weekView: "Vue semaine",
          createEventAt: (t, d) => `Créer à ${t}, ${d}`,
        }}
      />,
    );
    expect(screen.getByRole("region", { name: "Vue semaine" })).toBeTruthy();
    expect(screen.getAllByLabelText(/^Créer à 00:00, March \d+$/).length).toBe(
      7,
    );
  });

  it("keeps the default English create-slot label", () => {
    render(
      <Calendar
        width={700}
        height={600}
        view={ECalendarViewType.day}
        selectedDate={date}
        creatable
        onSlotClick={() => {}}
      />,
    );
    expect(
      screen.getByLabelText("Create event at 09:00, March 15"),
    ).toBeInTheDocument();
  });

  it("falls back to 'No title' in the aria-label of an untitled event", () => {
    render(
      <Calendar
        width={700}
        height={600}
        view={ECalendarViewType.week}
        selectedDate={date}
        events={[
          {
            id: "n1",
            startDate: "2024-03-15T10:00:00",
            endDate: "2024-03-15T11:00:00",
            title: "",
          },
        ]}
      />,
    );
    const ev = screen.getByTestId("calendar-n1-day-event-item");
    expect(ev.getAttribute("aria-label")).toMatch(/^No title, /);
  });

  it("localises the week-number suffix in the week title", () => {
    const props = {
      width: 700,
      height: 600,
      view: ECalendarViewType.week,
      selectedDate: new Date("2026-11-01T00:00:00"),
      weekStartsOn: 0,
      showWeekNumbers: true,
    };
    const { unmount } = render(
      <Calendar
        {...props}
        localeMessages={{ weekNumber: (n) => `Sem. ${n}` }}
      />,
    );
    expect(screen.getByRole("heading").textContent).toMatch(/Sem\. 45$/);
    unmount();
    render(<Calendar {...props} />);
    expect(screen.getByRole("heading").textContent).toMatch(/W45$/);
  });
});
