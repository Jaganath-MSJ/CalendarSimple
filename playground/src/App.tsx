import Calendar, { ECalendarViewType, type CalendarEvent } from "../../src";
// import "calendar-simple/dist/styles.css";

function App() {
  const generateLiveEvents = (): CalendarEvent[] => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const formatDateTime = (d: Date) => d.toISOString();
    const formatDate = (d: Date) => {
      const timezoneOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - timezoneOffset).toISOString().split("T")[0];
    };

    const addDays = (d: Date, days: number) => {
      const result = new Date(d);
      result.setDate(result.getDate() + days);
      return result;
    };

    const setTime = (d: Date, hour: number, minute: number = 0) => {
      const result = new Date(d);
      result.setHours(hour, minute, 0, 0);
      return result;
    };

    return [
      // 1. Standard Event
      {
        id: "TC1",
        startDate: formatDateTime(setTime(startOfToday, 9, 0)),
        endDate: formatDateTime(setTime(startOfToday, 10, 0)),
        title: "Standard Event",
        style: { backgroundColor: "blue" },
      },

      // 2. Zero Duration Event
      {
        id: "TC2",
        startDate: formatDateTime(setTime(startOfToday, 10, 30)),
        endDate: formatDateTime(setTime(startOfToday, 10, 30)),
        title: "Zero Duration",
        style: { backgroundColor: "red" },
      },

      // 3. Negative Duration (should be handled gracefully)
      {
        id: "TC3",
        startDate: formatDateTime(setTime(startOfToday, 12, 0)),
        endDate: formatDateTime(setTime(startOfToday, 11, 0)),
        title: "Negative Duration",
        style: { backgroundColor: "orange" },
      },

      // 4. Overlapping - Completely Overlapping
      {
        id: "TC4a",
        startDate: formatDateTime(setTime(startOfToday, 13, 0)),
        endDate: formatDateTime(setTime(startOfToday, 14, 0)),
        title: "Completely Overlapping A",
        style: { backgroundColor: "green" },
      },
      {
        id: "TC4b",
        startDate: formatDateTime(setTime(startOfToday, 13, 0)),
        endDate: formatDateTime(setTime(startOfToday, 14, 0)),
        title: "Completely Overlapping B",
        style: { backgroundColor: "teal" },
      },

      // 5. Overlapping - Partially Overlapping
      {
        id: "TC5a",
        startDate: formatDateTime(setTime(startOfToday, 14, 30)),
        endDate: formatDateTime(setTime(startOfToday, 15, 30)),
        title: "Partially Overlapping A",
        style: { backgroundColor: "purple" },
      },
      {
        id: "TC5b",
        startDate: formatDateTime(setTime(startOfToday, 15, 0)),
        endDate: formatDateTime(setTime(startOfToday, 16, 0)),
        title: "Partially Overlapping B",
        style: { backgroundColor: "indigo" },
      },

      // 6. Overlapping - Nested
      {
        id: "TC6a",
        startDate: formatDateTime(setTime(startOfToday, 16, 0)),
        endDate: formatDateTime(setTime(startOfToday, 18, 0)),
        title: "Outer Event",
        style: { backgroundColor: "pink" },
      },
      {
        id: "TC6b",
        startDate: formatDateTime(setTime(startOfToday, 16, 30)),
        endDate: formatDateTime(setTime(startOfToday, 17, 30)),
        title: "Inner Event",
        style: { backgroundColor: "rose" },
      },

      // 7. Many short events at same time (stress test)
      ...Array.from({ length: 5 }).map((_, i) => ({
        id: `TC7-${i}`,
        startDate: formatDateTime(setTime(addDays(startOfToday, 1), 9, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 1), 9, 30)),
        title: `Short Event ${i + 1}`,
        style: { backgroundColor: "gray" },
      })),

      // 8. Multi-day Event (Datetime)
      {
        id: "TC8",
        startDate: formatDateTime(setTime(addDays(startOfToday, 1), 22, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 2), 2, 0)),
        title: "Overnight Event (Datetime)",
        style: { backgroundColor: "cyan" },
      },

      // 9. Cross-midnight exactly
      {
        id: "TC9",
        startDate: formatDateTime(setTime(addDays(startOfToday, 2), 23, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 3), 1, 0)),
        title: "Cross Midnight",
        style: { backgroundColor: "sky" },
      },

      // 10. Only Start Date (Datetime) - Missing End Date
      {
        id: "TC10",
        startDate: formatDateTime(setTime(startOfToday, 8, 0)),
        title: "Missing End Time",
        style: { backgroundColor: "violet" },
      },

      // 11. Multi-day Date-only String (YYYY-MM-DD)
      {
        id: "TC11",
        startDate: formatDate(addDays(startOfToday, 3)),
        endDate: formatDate(addDays(startOfToday, 5)),
        title: "Multi-Day Date Only",
        style: { backgroundColor: "fuchsia" },
      },

      // 12. Single-day Date-only String (YYYY-MM-DD)
      {
        id: "TC12",
        startDate: formatDate(addDays(startOfToday, 1)),
        endDate: formatDate(addDays(startOfToday, 1)),
        title: "Single-Day Date Only",
        style: { backgroundColor: "magenta" },
      },

      // 13. Only Start Date (Date-only String)
      {
        id: "TC13",
        startDate: formatDate(addDays(startOfToday, -1)),
        title: "Missing End Date (Date Only)",
        style: { backgroundColor: "lime" },
      },

      // 14. Very Long Event
      {
        id: "TC14",
        startDate: formatDate(addDays(today, -10)),
        endDate: formatDate(addDays(today, 10)),
        title: "Very Long Event (20 Days)",
        style: { backgroundColor: "slate" },
      },

      // 15. Spanning entire day (Datetime)
      {
        id: "TC15",
        startDate: formatDateTime(setTime(addDays(startOfToday, 4), 0, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 4), 23, 59)),
        title: "Full Day (Datetime)",
        style: { backgroundColor: "emerald" },
      },
    ];
  };

  const eventsList = generateLiveEvents();

  return (
    <div
      style={{
        width: "calc(100vw - 100px)",
        height: "calc(100vh - 100px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Calendar
        events={eventsList}
        selectedDate={new Date()}
        selectable
        view={ECalendarViewType.week}
        is12Hour
        showCurrentTime
        autoScrollToCurrentTime
        // width={400}
        // height={400}
      />
    </div>
  );
}

export default App;
