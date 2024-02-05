import Calender from "./calender/Calender";

function App() {
  return (
    <Calender
      width={700}
      selectedClassName="Selected"
      todayClassName="Today"
      isSelectDate
    />
  );
}

export default App;
