import { useState } from "react";
import Calendar from "calendar-simple";
import type { CalendarProps } from "calendar-simple";
import "calendar-simple/dist/styles.css";
import { ControlPanel } from "./ControlPanel";
import { fixtureList } from "./TestFixtures";

function App() {
  const [fixtureIndex, setFixtureIndex] = useState(0);
  const [calendarProps, setCalendarProps] = useState<Partial<CalendarProps>>(
    {},
  );

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 16px)",
        background: "#f1f5f9",
      }}
    >
      <div
        style={{
          flex: 1,
          padding: "16px",
          marginRight: "320px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Calendar
          events={fixtureList[fixtureIndex].fn()}
          {...calendarProps}
          testId={calendarProps.testId ?? "playground-calendar"}
          onEventClick={(e) => console.log("onEventClick", e)}
          onDateClick={(d) => console.log("onDateClick", d)}
          onMoreClick={(d, ev) => console.log("onMoreClick", d, ev)}
          onNavigate={(d) => console.log("onNavigate", d)}
          onViewChange={(v) => console.log("onViewChange", v)}
          onSlotClick={(s, e) => console.log("onSlotClick", s, e)}
        />
      </div>

      <ControlPanel
        value={calendarProps}
        onChange={setCalendarProps}
        fixtureIndex={fixtureIndex}
        onFixtureChange={setFixtureIndex}
      />
    </div>
  );
}

export default App;
