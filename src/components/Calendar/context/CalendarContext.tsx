import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useMemo,
} from "react";
import { Dayjs } from "dayjs";
import { date as dayjsInstance } from "../../Calendar.utils";
import { DataType } from "../../Calendar.type";

export type CalendarView = "month" | "week" | "day";

interface CalendarState {
  currentDate: Dayjs;
  selectedDate: Dayjs;
  view: CalendarView;
  events: DataType[];
}

type CalendarAction =
  | { type: "SET_DATE"; payload: Dayjs }
  | { type: "SET_VIEW"; payload: CalendarView }
  | { type: "SET_EVENTS"; payload: DataType[] }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "TODAY" };

const initialState: CalendarState = {
  currentDate: dayjsInstance(),
  selectedDate: dayjsInstance(),
  view: "month",
  events: [],
};

const CalendarContext = createContext<
  | {
      state: CalendarState;
      dispatch: React.Dispatch<CalendarAction>;
    }
  | undefined
>(undefined);

function calendarReducer(
  state: CalendarState,
  action: CalendarAction,
): CalendarState {
  switch (action.type) {
    case "SET_DATE":
      return {
        ...state,
        currentDate: action.payload,
        selectedDate: action.payload,
      };
    case "SET_VIEW":
      return { ...state, view: action.payload };
    case "SET_EVENTS":
      return { ...state, events: action.payload };
    case "NEXT": {
      let nextDate = state.currentDate;
      if (state.view === "month") nextDate = nextDate.add(1, "month");
      else if (state.view === "week") nextDate = nextDate.add(1, "week");
      else if (state.view === "day") nextDate = nextDate.add(1, "day");
      return { ...state, currentDate: nextDate };
    }
    case "PREV": {
      let prevDate = state.currentDate;
      if (state.view === "month") prevDate = prevDate.subtract(1, "month");
      else if (state.view === "week") prevDate = prevDate.subtract(1, "week");
      else if (state.view === "day") prevDate = prevDate.subtract(1, "day");
      return { ...state, currentDate: prevDate };
    }
    case "TODAY":
      return {
        ...state,
        currentDate: dayjsInstance(),
        selectedDate: dayjsInstance(),
      };
    default:
      return state;
  }
}

export const CalendarProvider: React.FC<{
  children: ReactNode;
  initialEvents?: DataType[];
  initialDate?: Dayjs;
}> = ({ children, initialEvents = [], initialDate }) => {
  const [state, dispatch] = useReducer(calendarReducer, {
    ...initialState,
    events: initialEvents,
    currentDate: initialDate || initialState.currentDate,
    selectedDate: initialDate || initialState.selectedDate,
  });

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
};
