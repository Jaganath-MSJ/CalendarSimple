import Calendar, { ECalendarViewType, type CalendarEvent } from "../../src";
// import "calendar-simple/dist/styles.css";

function App() {
  const generateLiveEvents = (): CalendarEvent[] => {
    const today = new Date();
    // Reset today to start of day for easier calculation, but keep it dynamic
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const formatDateTime = (d: Date) => d.toISOString();

    const formatDate = (d: Date) =>
      new Date(d.setHours(5, 30, 0, 0)).toISOString().split("T")[0];

    // Helper to add days
    const addDays = (d: Date, days: number) => {
      const result = new Date(d);
      result.setDate(result.getDate() + days);
      result.setHours(0, 0, 0, 0);
      return result;
    };

    // Helper to set specific time
    const setTime = (d: Date, hour: number, minute: number = 0) => {
      const result = new Date(d);
      result.setHours(hour, minute, 0, 0);
      return result;
    };

    return [
      // --- TODAY'S EVENTS (Critical for Day/Week View) ---
      {
        id: "E101",
        startDate: formatDateTime(setTime(startOfToday, 9, 0)), // 9:00 AM
        endDate: formatDateTime(setTime(startOfToday, 10, 0)), // 10:00 AM
        title: "Daily Standup",
        color: "blue",
      },
      {
        id: "E102",
        startDate: formatDateTime(setTime(startOfToday, 10, 30)), // 10:30 AM
        endDate: formatDateTime(setTime(startOfToday, 12, 0)), // 12:00 PM
        title: "Deep Work Session",
        color: "green",
      },
      {
        startDate: formatDateTime(setTime(startOfToday, 12, 0)), // 12:00 PM
        endDate: formatDateTime(setTime(startOfToday, 13, 0)), // 1:00 PM
        title: "Lunch Break",
        color: "orange",
      },
      // Overlapping Event 1
      {
        startDate: formatDateTime(setTime(startOfToday, 14, 0)), // 2:00 PM
        endDate: formatDateTime(setTime(startOfToday, 15, 30)), // 3:30 PM
        title: "Project Sync",
        color: "purple",
      },
      // Overlapping Event 2 (Starts during Project Sync)
      {
        startDate: formatDateTime(setTime(startOfToday, 14, 30)), // 2:30 PM
        endDate: formatDateTime(setTime(startOfToday, 15, 0)), // 3:00 PM
        title: "Quick Client Call",
        color: "red",
      },
      {
        startDate: formatDateTime(setTime(startOfToday, 16, 0)), // 4:00 PM
        endDate: formatDateTime(setTime(startOfToday, 17, 0)), // 5:00 PM
        title: "Code Review",
      },
      // --- TOMORROW'S EVENTS ---
      {
        id: "E201",
        startDate: formatDateTime(setTime(addDays(startOfToday, 1), 10, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 1), 11, 30)),
        title: "Design Review",
        color: "teal",
      },
      {
        startDate: formatDateTime(setTime(addDays(startOfToday, 1), 13, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 1), 14, 0)),
        title: "Manager 1:1",
      },

      // --- MULTI-DAY EVENTS (Should show in All Day section or span days) ---
      {
        startDate: formatDateTime(setTime(addDays(startOfToday, 2), 9, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 4), 17, 0)),
        title: "Company Offsite",
        color: "indigo",
      },

      // --- THIS WEEK EVENTS ---
      {
        startDate: formatDateTime(setTime(addDays(startOfToday, -1), 15, 0)), // Yesterday
        endDate: formatDateTime(setTime(addDays(startOfToday, -1), 16, 30)),
        title: "Yesterday's Retro",
        color: "gray",
      },
      {
        startDate: formatDateTime(setTime(addDays(startOfToday, 3), 11, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 3), 12, 0)),
        title: "Feature Planning",
      },

      // --- LONG TERM / MONTH VIEW EVENTS ---
      {
        startDate: formatDateTime(addDays(startOfToday, 10)),
        endDate: formatDateTime(addDays(startOfToday, 15)),
        title: "Sprint 25",
        color: "blue",
      },
      {
        startDate: formatDateTime(addDays(startOfToday, 12)),
        title: "Milestone Due",
        color: "red",
      },
      {
        startDate: formatDateTime(addDays(startOfToday, 20)),
        endDate: formatDateTime(addDays(startOfToday, 22)),
        title: "Training Workshop",
        color: "green",
      },

      // --- PAST EVENTS ---
      {
        startDate: formatDateTime(addDays(startOfToday, -10)),
        endDate: formatDateTime(addDays(startOfToday, -8)),
        title: "Past Conference",
        color: "gray",
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
