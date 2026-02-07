import Calendar, { EDayType } from "../../src";

function App() {
  return (
    <Calendar
      dayType={EDayType.fullName}
      data={[
        {
          startDate: "2026-01-01",
          endDate: "2026-01-02",
          value: "22",
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
        },
        {
          startDate: "2026-01-10",
          endDate: "2026-02-10",
          value: "5678",
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
      ]}
      width={700}
      height={500}
      selectedDate={new Date("2026-01-26")}
      isSelectDate
      pastYearLength={2}
      futureYearLength={3}
      maxEvents={2}
      theme={{
        default: { color: "#333", bgColor: "#f0f0f0" },
        selected: { color: "#fff", bgColor: "#007bff" },
        today: { color: "#007bff", bgColor: "#e6f2ff" },
      }}
    />
  );
}

export default App;
