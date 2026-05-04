/**
 * @file Calendar context — state management, reducer, provider, and consumer hook.
 */
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
import useColorScheme from "../hooks/useColorScheme";

/**
 * Mutable runtime state managed by the calendar reducer.
 */
export interface CalendarState {
  /** The currently selected (navigated-to) date. */
  selectedDate: DateType;
  /** The active view mode. */
  view: ECalendarViewType;
  /** Number of days shown when view is `customDays`. */
  customDays?: number;
}

/**
 * Union of all dispatchable actions for the calendar reducer.
 * - `SET_DATE` — jump to a specific date
 * - `SET_VIEW` — switch the active view
 * - `NEXT` / `PREV` — advance or retreat by one view-unit (month, week, day, or N custom days)
 * - `TODAY` — reset navigation to today
 */
export type CalendarAction =
  | { type: typeof CALENDAR_ACTIONS.SET_DATE; payload: DateType }
  | { type: typeof CALENDAR_ACTIONS.SET_VIEW; payload: ECalendarViewType }
  | { type: typeof CALENDAR_ACTIONS.NEXT }
  | { type: typeof CALENDAR_ACTIONS.PREV }
  | { type: typeof CALENDAR_ACTIONS.TODAY };

/**
 * Shape of the value exposed by `CalendarContext`.
 */
export interface CalendarContextValue {
  /** Current reducer state (selected date, view, customDays). */
  state: CalendarState;
  /** Dispatch function for sending actions to the reducer. */
  dispatch: Dispatch<CalendarAction>;
  /** `data-testid` forwarded from the root `<Calendar>` prop. */
  testId?: string;
  /** Static calendar configuration props (everything except `children`, `selectedDate`, and `view`). */
  config: Omit<CalendarProps, "children" | "selectedDate" | "view">;
  /** Resolved color scheme ("light" or "dark") for portaled UI such as Popover. */
  colorScheme: "light" | "dark";
}

export const CalendarContext = createContext<CalendarContextValue | undefined>(
  undefined,
);

/**
 * Pure reducer that computes the next calendar state.
 * Navigation units map directly to Luxon duration keys (`month`, `week`, `day`);
 * `schedule` reuses `day` since it paginates one day at a time.
 *
 * @param state - Current calendar state.
 * @param action - Action to apply.
 * @returns Next calendar state.
 */
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

/**
 * Props accepted by `CalendarProvider`.
 */
export interface CalendarProviderProps {
  /** Content rendered inside the calendar layout. */
  children: ReactNode;
  /** Starting selected date for the reducer. */
  initialDate: DateType;
  /** Starting view mode for the reducer. */
  initialView: ECalendarViewType;
  /** Starting value for `customDays` when the initial view is `customDays`. */
  initialCustomDays?: number;
  /** Forwarded `data-testid` from the root `<Calendar>` prop. */
  testId?: string;
  /** Static configuration props passed through to all child components via context. */
  config?: Omit<CalendarProps, "children" | "selectedDate" | "view">;
}

/**
 * Provides calendar state and dispatch to the component tree via `CalendarContext`.
 * Wrap view components with this provider; consume state via `useCalendar()`.
 */
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

  const resolvedScheme = useColorScheme(config?.colorScheme);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      testId,
      config:
        config ||
        ({} as Omit<CalendarProps, "children" | "selectedDate" | "view">),
      colorScheme: resolvedScheme,
    }),
    [state, testId, config, resolvedScheme],
  );

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

/**
 * Consumes `CalendarContext` and returns the current state, dispatch, and config.
 * Must be called inside a `CalendarProvider` — throws if the context is missing.
 *
 * @returns The current `CalendarContextValue`.
 */
export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
