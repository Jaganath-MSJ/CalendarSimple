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
      {
        startDate: formatDate(today),
        endDate: formatDate(addDays(today, 1)),
        value: "Today's Kickoff",
        color: "red",
      },
      {
        startDate: formatDate(addDays(today, 1)),
        endDate: formatDate(addDays(today, 2)),
        value: "Project Briefing",
      },
      {
        startDate: formatDate(addDays(today, -2)),
        endDate: formatDate(addDays(today, -1)),
        value: "Past Review",
      },
      {
        startDate: formatDate(today),
        endDate: formatDate(addDays(today, 3)),
        value: "3-Day Sprint",
        color: "blue",
      },
      {
        startDate: formatDate(addDays(today, 5)),
        value: "Simple Deadline",
        color: "green",
      },
      {
        startDate: formatDate(addDays(today, 10)),
        endDate: formatDate(addDays(today, 15)),
        value: "Hackathon",
      },
      {
        startDate: formatDate(addDays(today, -5)),
        value: "Missed Sync",
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
        data={eventsList}
        selectedDate={new Date()}
        maxEvents={2}
        isSelectDate
      />
    </div>
  );
}

export default App;
