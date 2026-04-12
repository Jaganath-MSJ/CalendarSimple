import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useMemo,
  Dispatch,
} from "react";
import { dateFn, DateType } from "../utils";
import { ECalendarViewType, CalendarProps } from "../types";
import { CALENDAR_ACTIONS } from "../constants";

export interface CalendarState {
  selectedDate: DateType;
  view: ECalendarViewType;
  customDays?: number;
}

export type CalendarAction =
  | { type: typeof CALENDAR_ACTIONS.SET_DATE; payload: DateType }
  | { type: typeof CALENDAR_ACTIONS.SET_VIEW; payload: ECalendarViewType }
  | { type: typeof CALENDAR_ACTIONS.NEXT }
  | { type: typeof CALENDAR_ACTIONS.PREV }
  | { type: typeof CALENDAR_ACTIONS.TODAY };

export interface CalendarContextValue {
  state: CalendarState;
  dispatch: Dispatch<CalendarAction>;
  testId?: string;
  config: Omit<CalendarProps, "children" | "selectedDate" | "view">;
}

export const CalendarContext = createContext<CalendarContextValue | undefined>(
  undefined,
);

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
      if (state.view === ECalendarViewType.customDays) {
        return {
          ...state,
          selectedDate: state.selectedDate.plus({
            days: state.customDays || 3,
          }),
        };
      }
      const unit =
        state.view === ECalendarViewType.schedule ? "day" : state.view;
      return { ...state, selectedDate: state.selectedDate.plus({ [unit]: 1 }) };
    }
    case CALENDAR_ACTIONS.PREV: {
      if (state.view === ECalendarViewType.customDays) {
        return {
          ...state,
          selectedDate: state.selectedDate.minus({
            days: state.customDays || 3,
          }),
        };
      }
      const unit =
        state.view === ECalendarViewType.schedule ? "day" : state.view;
      return {
        ...state,
        selectedDate: state.selectedDate.minus({ [unit]: 1 }),
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

export interface CalendarProviderProps {
  children: ReactNode;
  initialDate: DateType;
  initialView: ECalendarViewType;
  initialCustomDays?: number;
  testId?: string;
  config?: Omit<CalendarProps, "children" | "selectedDate" | "view">;
}

export function CalendarProvider({
  children,
  initialDate,
  initialView,
  initialCustomDays,
  testId,
  config,
}: CalendarProviderProps) {
  const [state, dispatch] = useReducer(calendarReducer, {
    selectedDate: initialDate,
    view: initialView,
    customDays: initialCustomDays,
  });

  const value = useMemo(
    () => ({
      state,
      dispatch,
      testId,
      config:
        config ||
        ({} as Omit<CalendarProps, "children" | "selectedDate" | "view">),
    }),
    [state, testId, config],
  );

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
