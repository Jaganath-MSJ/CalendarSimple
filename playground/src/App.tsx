import Calendar, { EDayType } from "../../src";

function App() {
  return (
    <Calendar
      dayType={EDayType.fullName}
      data={["22", "", "92", "", "", "829", "", "", "", "2810"]}
      width={700}
      height={500}
      selectedDate={new Date('2025-11-16')}
      isSelectDate
      pastYearLength={2}
      futureYearLength={3}
    />
  );
}

export default App;
