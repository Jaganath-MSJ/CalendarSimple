import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useMemo,
  Dispatch,
} from "react";
import { dateFn, DateType, ManipulateType } from "../utils";
import { ECalendarViewType } from "../types";
import { CALENDAR_ACTIONS } from "../constants";

interface CalendarState {
  selectedDate: DateType;
  view: ECalendarViewType;
}

type CalendarAction =
  | { type: typeof CALENDAR_ACTIONS.SET_DATE; payload: DateType }
  | { type: typeof CALENDAR_ACTIONS.SET_VIEW; payload: ECalendarViewType }
  | { type: typeof CALENDAR_ACTIONS.NEXT }
  | { type: typeof CALENDAR_ACTIONS.PREV }
  | { type: typeof CALENDAR_ACTIONS.TODAY };

const CalendarContext = createContext<
  | {
      state: CalendarState;
      dispatch: Dispatch<CalendarAction>;
    }
  | undefined
>(undefined);

function calendarReducer(
  state: CalendarState,
  action: CalendarAction,
): CalendarState {
  switch (action.type) {
    case CALENDAR_ACTIONS.SET_DATE:
      return {
        ...state,
        selectedDate: action.payload,
      };
    case CALENDAR_ACTIONS.SET_VIEW:
      return { ...state, view: action.payload };
    case CALENDAR_ACTIONS.NEXT: {
      const unit = (
        state.view === ECalendarViewType.schedule ? "day" : state.view
      ) as ManipulateType;
      return { ...state, selectedDate: state.selectedDate.add(1, unit) };
    }
    case CALENDAR_ACTIONS.PREV: {
      const unit = (
        state.view === ECalendarViewType.schedule ? "day" : state.view
      ) as ManipulateType;
      return {
        ...state,
        selectedDate: state.selectedDate.subtract(1, unit),
      };
    }
    case CALENDAR_ACTIONS.TODAY:
      return {
        ...state,
        selectedDate: dateFn(),
      };
    default:
      return state;
  }
}

interface CalendarProviderProps {
  children: ReactNode;
  initialDate: DateType;
  initialView: ECalendarViewType;
}

export function CalendarProvider({
  children,
  initialDate,
  initialView,
}: CalendarProviderProps) {
  const [state, dispatch] = useReducer(calendarReducer, {
    selectedDate: initialDate,
    view: initialView,
  });

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
