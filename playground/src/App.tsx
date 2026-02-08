import Calendar, { type DataType } from "../../src";
// import "calendar-simple/dist/styles.css";

function App() {
  const eventsList: DataType[] = [
    {
      startDate: "2026-01-01",
      endDate: "2026-01-02",
      value: "22",
      color: "red",
    },
    {
      startDate: "2026-01-02",
      endDate: "2026-01-03",
      value: "98392",
    },
    {
      startDate: "2026-01-01",
      endDate: "2026-01-02",
      value: "3932329",
    },
    {
      startDate: "2026-01-03",
      endDate: "2026-01-04",
      value: "92",
    },
    {
      startDate: "2026-01-02",
      endDate: "2026-01-03",
      value: "39232",
    },
    { startDate: "2026-01-05", value: "55" },
    {
      startDate: "2026-01-06",
      endDate: "2026-01-08",
      value: "829",
    },
    {
      startDate: "2026-01-09",
      endDate: "2026-01-10",
      value: "2810",
    },
    {
      startDate: "2026-01-12",
      endDate: "2026-01-13",
      value: "28133220",
    },
    {
      startDate: "2025-12-22",
      endDate: "2026-01-02",
      value: "Leave",
      color: "blue",
    },
    {
      startDate: "2026-01-10",
      endDate: "2026-02-10",
      value: "5678",
      color: "green",
    },
    {
      startDate: "2026-01-10",
      endDate: "2026-01-26",
      value: "939912",
    },
    {
      startDate: "2026-01-01",
      endDate: "2026-01-03",
      value: "only 1-3 jan 2",
    },
    {
      startDate: "2026-01-02",
      value: "only sajasj 2",
    },
  ];
  return (
    <div
      style={{
        width: "1400px",
        height: "650px",
      }}
    >
      <Calendar
        data={eventsList}
        selectedDate={new Date("2026-01-26")}
        isSelectDate
      />
    </div>
  );
}

export default App;
