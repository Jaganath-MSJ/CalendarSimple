/**
 * @file Theme and CSS class name customization types for the calendar.
 */

/**
 * CSS class name overrides for individual calendar elements.
 * Each key targets a specific DOM element; assign a custom class to override default styles.
 */
export interface CalendarClassNames {
  /** Root calendar container. */
  root?: string;
  /** Header bar containing navigation controls and view switcher. */
  header?: string;

  // Month view
  /** Month view table grid. */
  table?: string;
  /** Day-of-week header row in the month grid. */
  tableHeader?: string;
  /** Individual date cell in the month grid. */
  tableDate?: string;
  /** Week number label in the leftmost column (requires `showWeekNumbers`). */
  weekNumber?: string;

  // Shared events
  /** Event chip element — applies across all views. */
  event?: string;
  /** Date cell or event marked as currently selected. */
  selected?: string;
  /** Date cell or event representing today. */
  today?: string;

  // Week & Day view
  /** Date column header in Week / Day views. */
  dayHeader?: string;
  /** Day name label (e.g. "Mon") inside the column header. */
  dayName?: string;
  /** Day number label inside the column header. */
  dayNumber?: string;
  /** Left-side time label column in the time grid. */
  timeColumn?: string;
  /** Individual hour row in the time grid. */
  timeSlot?: string;
  /** Vertical day column in the time grid. */
  dayColumn?: string;

  // Schedule view
  /** Date group header row in Schedule view. */
  scheduleDateGroup?: string;
  /** Date number within the Schedule view group header. */
  scheduleDateNumber?: string;
  /** Sub-info text (day name / relative label) in the Schedule group header. */
  scheduleDateSubInfo?: string;
  /** Time label on a Schedule event row. */
  scheduleTime?: string;
  /** Title label on a Schedule event row. */
  scheduleTitle?: string;
}

/**
 * A color pair (text + background) used for theme state overrides.
 */
export interface ThemeStyle {
  /** Text / foreground color (any valid CSS color value). */
  color?: string;
  /** Background color (any valid CSS color value). */
  bgColor?: string;
}

/**
 * Per-state color overrides for a single color scheme.
 */
export interface ThemeScheme {
  /** Colors for standard, unselected, non-today date cells. */
  default?: ThemeStyle;
  /** Colors for the currently selected date. */
  selected?: ThemeStyle;
  /** Colors for today's date cell. */
  today?: ThemeStyle;
}

/**
 * Color overrides applied to key calendar states.
 * Flat keys apply to both schemes unless overridden.
 * `dark` / `light` sub-objects take precedence over flat keys
 * when the resolved color scheme matches.
 */
export interface CalendarTheme extends ThemeScheme {
  /** Overrides applied only when the resolved scheme is "dark". */
  dark?: ThemeScheme;
  /** Overrides applied only when the resolved scheme is "light". */
  light?: ThemeScheme;
}
