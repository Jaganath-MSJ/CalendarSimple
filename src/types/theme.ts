export interface CalendarClassNames {
  root?: string;
  header?: string;

  // Month view
  table?: string;
  tableHeader?: string;
  tableDate?: string;

  // Shared events
  event?: string;
  selected?: string;
  today?: string;

  // Week & Day view
  dayHeader?: string;
  dayName?: string;
  dayNumber?: string;
  timeColumn?: string;
  timeSlot?: string;
  dayColumn?: string;

  // Schedule view
  scheduleDateGroup?: string;
  scheduleDateNumber?: string;
  scheduleDateSubInfo?: string;
  scheduleTime?: string;
  scheduleTitle?: string;
}

export interface ThemeStyle {
  color?: string;
  bgColor?: string;
}

export interface CalendarTheme {
  default?: ThemeStyle;
  selected?: ThemeStyle;
  today?: ThemeStyle;
}
