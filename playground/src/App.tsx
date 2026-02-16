import Calendar, { type DataType } from "calendar-simple";
import "calendar-simple/dist/styles.css";

function App() {
  const generateLiveEvents = (): DataType[] => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    // Helper to add days
    const addDays = (d: Date, days: number) => {
      const result = new Date(d);
      result.setDate(result.getDate() + days);
      return result;
    };

    return [
      // --- Current Month Events ---
      {
        startDate: formatDate(today),
        endDate: formatDate(addDays(today, 1)),
        value: "Today's Kickoff (2 days)",
        color: "red",
      },
      {
        startDate: formatDate(addDays(today, 1)),
        endDate: formatDate(addDays(today, 2)),
        value: "Follow-up (2 days)",
      },
      // Overlapping with "Today's Kickoff"
      {
        startDate: formatDate(today),
        endDate: formatDate(addDays(today, 1)),
        value: "Parallel Task (2 days)",
      },
      {
        startDate: formatDate(addDays(today, 3)),
        endDate: formatDate(addDays(today, 4)),
        value: "Mid-week Sprint (2 days)",
      },
      // Overlapping with "Follow-up"
      {
        startDate: formatDate(addDays(today, 1)),
        endDate: formatDate(addDays(today, 2)),
        value: "Review Session (2 days)",
      },
      {
        startDate: formatDate(addDays(today, 5)),
        value: "Single Day Check-in",
      },
      {
        startDate: formatDate(addDays(today, 6)),
        endDate: formatDate(addDays(today, 8)),
        value: "3-Day Workshop",
      },
      {
        startDate: formatDate(addDays(today, 9)),
        endDate: formatDate(addDays(today, 10)),
        value: "Weekend Project",
      },
      {
        startDate: formatDate(addDays(today, 12)),
        endDate: formatDate(addDays(today, 13)),
        value: "Client Meeting",
      },
      // Long spanning event (Cross-month potential depending on today's date)
      {
        startDate: formatDate(addDays(today, -5)),
        endDate: formatDate(addDays(today, 5)),
        value: "10-Day Challenge",
        color: "blue",
      },
      // Long duration
      {
        startDate: formatDate(addDays(today, 10)),
        endDate: formatDate(addDays(today, 40)),
        value: "Long Project (30 days)",
        color: "green",
      },
      {
        startDate: formatDate(addDays(today, 10)),
        endDate: formatDate(addDays(today, 26)),
        value: "Medium Project (16 days)",
      },
      {
        startDate: formatDate(today),
        endDate: formatDate(addDays(today, 2)),
        value: "Urgent Task",
      },
      {
        startDate: formatDate(addDays(today, 1)),
        value: "Quick Sync",
      },

      // --- Previous Month Events ---
      {
        startDate: formatDate(addDays(today, -30)),
        endDate: formatDate(addDays(today, -28)),
        value: "Last Month Review",
        color: "red",
      },
      {
        startDate: formatDate(addDays(today, -25)),
        value: "Past Milestone",
      },
      {
        startDate: formatDate(addDays(today, -40)),
        endDate: formatDate(addDays(today, -10)),
        value: "Previous Long Term Task",
        color: "blue",
      },

      // --- Next Month Events ---
      {
        startDate: formatDate(addDays(today, 35)),
        endDate: formatDate(addDays(today, 37)),
        value: "Future Planning",
        color: "green",
      },
      {
        startDate: formatDate(addDays(today, 45)),
        value: "Q4 Strategy",
      },
      {
        startDate: formatDate(addDays(today, 30)),
        endDate: formatDate(addDays(today, 60)),
        value: "Next Quarter Roadmap",
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
      <Calendar data={eventsList} selectedDate={new Date()} isSelectDate />
    </div>
  );
}

export default App;
