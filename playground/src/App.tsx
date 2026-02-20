import Calendar, { ECalendarViewType, type DataType } from "../../src";
// import "calendar-simple/dist/styles.css";

function App() {
  const generateLiveEvents = (): DataType[] => {
    const today = new Date();
    // Reset today to start of day for easier calculation, but keep it dynamic
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const formatDateTime = (d: Date) => d.toISOString();

    // Helper to add days
    const addDays = (d: Date, days: number) => {
      const result = new Date(d);
      result.setDate(result.getDate() + days);
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
        startDate: formatDateTime(setTime(startOfToday, 9, 0)), // 9:00 AM
        endDate: formatDateTime(setTime(startOfToday, 10, 0)), // 10:00 AM
        value: "Daily Standup",
        color: "blue",
      },
      {
        startDate: formatDateTime(setTime(startOfToday, 10, 30)), // 10:30 AM
        endDate: formatDateTime(setTime(startOfToday, 12, 0)), // 12:00 PM
        value: "Deep Work Session",
        color: "green",
      },
      {
        startDate: formatDateTime(setTime(startOfToday, 12, 0)), // 12:00 PM
        endDate: formatDateTime(setTime(startOfToday, 13, 0)), // 1:00 PM
        value: "Lunch Break",
        color: "orange",
      },
      // Overlapping Event 1
      {
        startDate: formatDateTime(setTime(startOfToday, 14, 15)), // 2:00 PM
        endDate: formatDateTime(setTime(startOfToday, 16, 15)), // 3:30 PM
        value: "Project Sync",
        color: "purple",
      },
      // Overlapping Event 2 (Starts during Project Sync)
      {
        startDate: formatDateTime(setTime(startOfToday, 15, 30)), // 2:30 PM
        endDate: formatDateTime(setTime(startOfToday, 17, 30)), // 3:00 PM
        value: "Quick Client Call",
        color: "red",
      },
      {
        startDate: formatDateTime(setTime(startOfToday, 15, 30)), // 2:00 PM
        endDate: formatDateTime(setTime(startOfToday, 16, 30)), // 3:30 PM
        value: "Projec292t Sync",
        color: "orange",
      },
      // {
      //   startDate: formatDateTime(setTime(startOfToday, 16, 0)), // 2:00 PM
      //   endDate: formatDateTime(setTime(startOfToday, 17, 0)), // 3:30 PM
      //   value: "Project Sync 292",
      //   color: "green",
      // },
      // {
      //   startDate: formatDateTime(setTime(startOfToday, 16, 0)), // 2:00 PM
      //   endDate: formatDateTime(setTime(startOfToday, 17, 0)), // 3:30 PM
      //   value: "Project Syn 2ii9c",
      // },
      {
        startDate: formatDateTime(setTime(startOfToday, 16, 0)), // 4:00 PM
        endDate: formatDateTime(setTime(startOfToday, 17, 0)), // 5:00 PM
        value: "Code Review",
        color: "blue",
      },

      // --- TOMORROW'S EVENTS ---
      {
        startDate: formatDateTime(setTime(addDays(startOfToday, 1), 10, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 1), 11, 30)),
        value: "Design Review",
        color: "teal",
      },
      {
        startDate: formatDateTime(setTime(addDays(startOfToday, 1), 13, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 1), 14, 0)),
        value: "Manager 1:1",
      },

      // --- MULTI-DAY EVENTS (Should show in All Day section or span days) ---
      {
        startDate: formatDateTime(setTime(addDays(startOfToday, 2), 9, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 4), 17, 0)),
        value: "Company Offsite",
        color: "indigo",
      },

      // --- THIS WEEK EVENTS ---
      {
        startDate: formatDateTime(setTime(addDays(startOfToday, -1), 15, 0)), // Yesterday
        endDate: formatDateTime(setTime(addDays(startOfToday, -1), 16, 30)),
        value: "Yesterday's Retro",
        color: "gray",
      },
      {
        startDate: formatDateTime(setTime(addDays(startOfToday, 3), 11, 0)),
        endDate: formatDateTime(setTime(addDays(startOfToday, 3), 12, 0)),
        value: "Feature Planning",
      },

      // --- LONG TERM / MONTH VIEW EVENTS ---
      {
        startDate: formatDateTime(addDays(startOfToday, 10)),
        endDate: formatDateTime(addDays(startOfToday, 15)),
        value: "Sprint 25",
        color: "blue",
      },
      {
        startDate: formatDateTime(addDays(startOfToday, 12)),
        value: "Milestone Due",
        color: "red",
      },
      {
        startDate: formatDateTime(addDays(startOfToday, 20)),
        endDate: formatDateTime(addDays(startOfToday, 22)),
        value: "Training Workshop",
        color: "green",
      },

      // --- PAST EVENTS ---
      {
        startDate: formatDateTime(addDays(startOfToday, -10)),
        endDate: formatDateTime(addDays(startOfToday, -8)),
        value: "Past Conference",
        color: "gray",
      },
    ];
  };

  const eventsList: DataType[] = generateLiveEvents();

  return (
    <div
      style={{
        width: "calc(100vw - 100px)",
        height: "calc(100vh - 100px)",
      }}
    >
      <Calendar
        events={eventsList}
        selectedDate={new Date()}
        isSelectDate
        view={ECalendarViewType.day}
      />
    </div>
  );
}

export default App;
