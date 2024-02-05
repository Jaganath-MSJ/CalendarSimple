import Calender from "./calender/Calender";

function App() {
  const data: React.ReactNode[] = [];
  for (let i = 1; i < 29; i++) {
    data.push(<p>${Math.round(Math.random() * 300)}</p>);
  }

  return (
    <main className="App">
      <Calender
        width={700}
        data={data}
        selectedClassName="Selected"
        todayClassName="Today"
        isSelectDate
      />
    </main>
  );
}

export default App;
