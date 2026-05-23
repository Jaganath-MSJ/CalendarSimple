import { useState } from "react";
import type { ReactNode } from "react";
import { ECalendarViewType, EDayType } from "calendar-simple";
import type {
  CalendarProps,
  ColorScheme,
  CalendarTheme,
  CalendarClassNames,
} from "calendar-simple";
import { fixtureList } from "./TestFixtures";
import styles from "./ControlPanel.module.css";

interface ControlPanelProps {
  value: Partial<CalendarProps>;
  onChange: (next: Partial<CalendarProps>) => void;
  fixtureIndex: number;
  onFixtureChange: (i: number) => void;
}

// ── Internal state shape ──────────────────────────────────────────────────────

interface PanelState {
  view: ECalendarViewType;
  selectedDate: string; // ISO date string for input[type=date]
  customDays: number;
  weekStartsOn: number;
  weekEndsOn: number;
  showAdjacentMonths: boolean;
  showWeekNumbers: boolean;
  showAllDayRow: boolean;
  resetDateOnViewChange: boolean;
  is12Hour: boolean;
  minHour: number;
  maxHour: number;
  dayType: EDayType;
  showCurrentTime: boolean;
  autoScrollToCurrentTime: boolean;
  eventOverlapOffset: number;
  pastYearLength: number;
  futureYearLength: number;
  selectable: boolean;
  creatable: boolean;
  maxEvents: number | undefined;
  colorScheme: ColorScheme;
  themeDefaultColor: string;
  themeDefaultBg: string;
  themeSelectedColor: string;
  themeSelectedBg: string;
  themeTodayColor: string;
  themeTodayBg: string;
  locale: string;
  direction: "ltr" | "rtl" | "auto";
  msgToday: string;
  msgDay: string;
  msgWeek: string;
  msgMonth: string;
  msgSchedule: string;
  msgDays: string;
  isLoading: boolean;
  renderLoading: boolean;
  renderEvent: boolean;
  renderHeader: boolean;
  renderHourCell: boolean;
  renderDateCell: boolean;
  renderScheduleSeparator: boolean;
  enableEnrichedEvents: boolean;
  eventsAreSorted: boolean;
  isEventOrderingEnabled: boolean;
  sortedMonthView: "true" | "false" | "custom";
  width: string;
  height: string;
  testId: string;
  cnRoot: string;
  cnHeader: string;
  cnTable: string;
  cnTableHeader: string;
  cnTableDate: string;
  cnWeekNumber: string;
  cnEvent: string;
  cnSelected: string;
  cnToday: string;
  cnDayHeader: string;
  cnDayName: string;
  cnDayNumber: string;
  cnTimeColumn: string;
  cnTimeSlot: string;
  cnDayColumn: string;
  cnScheduleDateGroup: string;
  cnScheduleDateNumber: string;
  cnScheduleDateSubInfo: string;
  cnScheduleTime: string;
  cnScheduleTitle: string;
}

const DEFAULTS: PanelState = {
  view: ECalendarViewType.month,
  selectedDate: new Date().toISOString().split("T")[0],
  customDays: 3,
  weekStartsOn: 0,
  weekEndsOn: 6,
  showAdjacentMonths: true,
  showWeekNumbers: false,
  showAllDayRow: true,
  resetDateOnViewChange: false,
  is12Hour: false,
  minHour: 0,
  maxHour: 24,
  dayType: "half",
  showCurrentTime: false,
  autoScrollToCurrentTime: false,
  eventOverlapOffset: 0,
  pastYearLength: 5,
  futureYearLength: 5,
  selectable: false,
  creatable: false,
  maxEvents: undefined,
  colorScheme: "auto",
  themeDefaultColor: "",
  themeDefaultBg: "",
  themeSelectedColor: "",
  themeSelectedBg: "",
  themeTodayColor: "",
  themeTodayBg: "",
  locale: "en",
  direction: "auto",
  msgToday: "",
  msgDay: "",
  msgWeek: "",
  msgMonth: "",
  msgSchedule: "",
  msgDays: "",
  isLoading: false,
  renderLoading: false,
  renderEvent: false,
  renderHeader: false,
  renderHourCell: false,
  renderDateCell: false,
  renderScheduleSeparator: false,
  enableEnrichedEvents: false,
  eventsAreSorted: false,
  isEventOrderingEnabled: true,
  sortedMonthView: "true",
  width: "",
  height: "",
  testId: "playground-calendar",
  cnRoot: "",
  cnHeader: "",
  cnTable: "",
  cnTableHeader: "",
  cnTableDate: "",
  cnWeekNumber: "",
  cnEvent: "",
  cnSelected: "",
  cnToday: "",
  cnDayHeader: "",
  cnDayName: "",
  cnDayNumber: "",
  cnTimeColumn: "",
  cnTimeSlot: "",
  cnDayColumn: "",
  cnScheduleDateGroup: "",
  cnScheduleDateNumber: "",
  cnScheduleDateSubInfo: "",
  cnScheduleTime: "",
  cnScheduleTitle: "",
};

// ── State → CalendarProps conversion ─────────────────────────────────────────

function toCalendarProps(s: PanelState): Partial<CalendarProps> {
  const theme: CalendarTheme = {};
  if (s.themeDefaultColor || s.themeDefaultBg)
    theme.default = {
      color: s.themeDefaultColor || undefined,
      bgColor: s.themeDefaultBg || undefined,
    };
  if (s.themeSelectedColor || s.themeSelectedBg)
    theme.selected = {
      color: s.themeSelectedColor || undefined,
      bgColor: s.themeSelectedBg || undefined,
    };
  if (s.themeTodayColor || s.themeTodayBg)
    theme.today = {
      color: s.themeTodayColor || undefined,
      bgColor: s.themeTodayBg || undefined,
    };

  const localeMessages: CalendarProps["localeMessages"] = {};
  if (s.msgToday) localeMessages.today = s.msgToday;
  if (s.msgDay) localeMessages.day = s.msgDay;
  if (s.msgWeek) localeMessages.week = s.msgWeek;
  if (s.msgMonth) localeMessages.month = s.msgMonth;
  if (s.msgSchedule) localeMessages.schedule = s.msgSchedule;
  if (s.msgDays) localeMessages.days = s.msgDays;

  const classNames: CalendarClassNames = {};
  if (s.cnRoot) classNames.root = s.cnRoot;
  if (s.cnHeader) classNames.header = s.cnHeader;
  if (s.cnTable) classNames.table = s.cnTable;
  if (s.cnTableHeader) classNames.tableHeader = s.cnTableHeader;
  if (s.cnTableDate) classNames.tableDate = s.cnTableDate;
  if (s.cnWeekNumber) classNames.weekNumber = s.cnWeekNumber;
  if (s.cnEvent) classNames.event = s.cnEvent;
  if (s.cnSelected) classNames.selected = s.cnSelected;
  if (s.cnToday) classNames.today = s.cnToday;
  if (s.cnDayHeader) classNames.dayHeader = s.cnDayHeader;
  if (s.cnDayName) classNames.dayName = s.cnDayName;
  if (s.cnDayNumber) classNames.dayNumber = s.cnDayNumber;
  if (s.cnTimeColumn) classNames.timeColumn = s.cnTimeColumn;
  if (s.cnTimeSlot) classNames.timeSlot = s.cnTimeSlot;
  if (s.cnDayColumn) classNames.dayColumn = s.cnDayColumn;
  if (s.cnScheduleDateGroup)
    classNames.scheduleDateGroup = s.cnScheduleDateGroup;
  if (s.cnScheduleDateNumber)
    classNames.scheduleDateNumber = s.cnScheduleDateNumber;
  if (s.cnScheduleDateSubInfo)
    classNames.scheduleDateSubInfo = s.cnScheduleDateSubInfo;
  if (s.cnScheduleTime) classNames.scheduleTime = s.cnScheduleTime;
  if (s.cnScheduleTitle) classNames.scheduleTitle = s.cnScheduleTitle;

  return {
    view: s.view,
    selectedDate: new Date(s.selectedDate),
    customDays: s.customDays,
    weekStartsOn: s.weekStartsOn,
    weekEndsOn: s.weekEndsOn,
    showAdjacentMonths: s.showAdjacentMonths,
    showWeekNumbers: s.showWeekNumbers,
    showAllDayRow: s.showAllDayRow,
    resetDateOnViewChange: s.resetDateOnViewChange,
    is12Hour: s.is12Hour,
    minHour: s.minHour,
    maxHour: s.maxHour,
    dayType: s.dayType,
    showCurrentTime: s.showCurrentTime,
    autoScrollToCurrentTime: s.autoScrollToCurrentTime,
    eventOverlapOffset: s.eventOverlapOffset,
    pastYearLength: s.pastYearLength,
    futureYearLength: s.futureYearLength,
    selectable: s.selectable,
    creatable: s.creatable,
    maxEvents: s.maxEvents,
    colorScheme: s.colorScheme,
    theme: Object.keys(theme).length > 0 ? theme : undefined,
    classNames: Object.keys(classNames).length > 0 ? classNames : undefined,
    locale: s.locale,
    direction: s.direction === "auto" ? undefined : s.direction,
    localeMessages:
      Object.keys(localeMessages).length > 0 ? localeMessages : undefined,
    isLoading: s.isLoading,
    renderLoading: s.renderLoading
      ? () => (
          <div style={{ padding: 20, color: "#64748b", textAlign: "center" }}>
            Loading…
          </div>
        )
      : undefined,
    renderEvent: s.renderEvent
      ? (e) => (
          <div
            style={{
              padding: "2px 4px",
              fontSize: 11,
              background: "#dbeafe",
              borderRadius: 3,
            }}
          >
            ⚡ {e.title}
          </div>
        )
      : undefined,
    renderHeader: s.renderHeader
      ? () => (
          <div
            style={{
              padding: 10,
              background: "#fef3c7",
              textAlign: "center",
              fontSize: 12,
            }}
          >
            Custom Header
          </div>
        )
      : undefined,
    renderHourCell: s.renderHourCell
      ? (d) => (
          <div style={{ fontSize: 10, color: "#94a3b8" }}>{d.getHours()}h</div>
        )
      : undefined,
    renderDateCell: s.renderDateCell
      ? (p) => (
          <div
            style={{
              fontWeight: p.isToday ? "bold" : "normal",
              color: p.isToday ? "#3b82f6" : undefined,
            }}
          >
            {p.date.getDate()}
          </div>
        )
      : undefined,
    renderScheduleSeparator: s.renderScheduleSeparator
      ? (d) => (
          <div
            style={{
              padding: "6px 12px",
              background: "#f1f5f9",
              fontSize: 11,
              color: "#64748b",
            }}
          >
            {d.toLocaleDateString()}
          </div>
        )
      : undefined,
    enableEnrichedEvents: s.enableEnrichedEvents,
    eventsAreSorted: s.eventsAreSorted,
    isEventOrderingEnabled: s.isEventOrderingEnabled,
    sortedMonthView:
      s.sortedMonthView === "true"
        ? true
        : s.sortedMonthView === "false"
          ? false
          : (a, b) => (a.id ?? "").localeCompare(b.id ?? ""),
    width: s.width || undefined,
    height: s.height || undefined,
    testId: s.testId,
  };
}

// ── Section keys ──────────────────────────────────────────────────────────────

type SectionId =
  | "view"
  | "timeGrid"
  | "yearPicker"
  | "interaction"
  | "appearance"
  | "classNames"
  | "localization"
  | "loading"
  | "renderers"
  | "performance"
  | "layout"
  | "debug";

const SECTION_KEYS: Record<SectionId, (keyof PanelState)[]> = {
  view: [
    "view",
    "customDays",
    "weekStartsOn",
    "weekEndsOn",
    "showAdjacentMonths",
    "showWeekNumbers",
    "showAllDayRow",
    "resetDateOnViewChange",
    "selectedDate",
  ],
  timeGrid: [
    "is12Hour",
    "minHour",
    "maxHour",
    "dayType",
    "showCurrentTime",
    "autoScrollToCurrentTime",
    "eventOverlapOffset",
  ],
  yearPicker: ["pastYearLength", "futureYearLength"],
  interaction: ["selectable", "creatable", "maxEvents"],
  appearance: [
    "colorScheme",
    "themeDefaultColor",
    "themeDefaultBg",
    "themeSelectedColor",
    "themeSelectedBg",
    "themeTodayColor",
    "themeTodayBg",
  ],
  classNames: [
    "cnRoot",
    "cnHeader",
    "cnTable",
    "cnTableHeader",
    "cnTableDate",
    "cnWeekNumber",
    "cnEvent",
    "cnSelected",
    "cnToday",
    "cnDayHeader",
    "cnDayName",
    "cnDayNumber",
    "cnTimeColumn",
    "cnTimeSlot",
    "cnDayColumn",
    "cnScheduleDateGroup",
    "cnScheduleDateNumber",
    "cnScheduleDateSubInfo",
    "cnScheduleTime",
    "cnScheduleTitle",
  ],
  localization: [
    "locale",
    "direction",
    "msgToday",
    "msgDay",
    "msgWeek",
    "msgMonth",
    "msgSchedule",
    "msgDays",
  ],
  loading: ["isLoading", "renderLoading"],
  renderers: [
    "renderEvent",
    "renderHeader",
    "renderHourCell",
    "renderDateCell",
    "renderScheduleSeparator",
  ],
  performance: [
    "enableEnrichedEvents",
    "eventsAreSorted",
    "isEventOrderingEnabled",
    "sortedMonthView",
  ],
  layout: ["width", "height"],
  debug: ["testId"],
};

function modifiedCount(s: PanelState, keys: (keyof PanelState)[]): number {
  return keys.filter((k) => {
    const val = s[k];
    const def = DEFAULTS[k];
    if (typeof val === "boolean" || typeof def === "boolean")
      return val !== def;
    if (val === undefined || val === null)
      return def !== undefined && def !== null;
    return String(val) !== String(def);
  }).length;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.toggleTrack} />
    </label>
  );
}

function ColorControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.colorRow}>
      <input
        type="color"
        className={styles.colorSwatch}
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="text"
        className={styles.colorHex}
        value={value}
        placeholder="—"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Row({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.row}>
      <span className={sub ? styles.subLabel : styles.rowLabel}>{label}</span>
      <div className={styles.rowControl}>{children}</div>
    </div>
  );
}

function RangeRow({
  label,
  min,
  max,
  value,
  onChange,
  unit = "",
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <Row label={label}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
      <span className={styles.rangeValue}>
        {value}
        {unit}
      </span>
    </Row>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  open,
  badge,
  onToggle,
  onReset,
  children,
}: {
  id: SectionId;
  title: string;
  open: boolean;
  badge: number;
  onToggle: () => void;
  onReset: () => void;
  children: ReactNode;
}) {
  return (
    <div className={styles.section}>
      {/* Header is a div (not a button) so the reset control can be a real
          nested button without producing invalid <button> in <button> markup.
          role/tabIndex/onKeyDown keep it keyboard-operable. */}
      <div
        className={styles.sectionHeader}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={open}
      >
        <span className={styles.sectionLabel}>{title}</span>
        {badge > 0 && <span className={styles.badge}>{badge}</span>}
        {badge > 0 && (
          <button
            className={styles.sectionReset}
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            type="button"
            title="Reset section"
          >
            ↺
          </button>
        )}
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          ▼
        </span>
      </div>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ControlPanel({
  onChange,
  fixtureIndex,
  onFixtureChange,
}: ControlPanelProps) {
  const [state, setState] = useState<PanelState>(DEFAULTS);
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    new Set(Object.keys(SECTION_KEYS) as SectionId[]),
  );

  // Notify the parent outside the setState updater. Updater functions run
  // during React's render phase, so calling onChange (the parent's setState)
  // inside one triggers "Cannot update a component while rendering a different
  // component". These handlers run from DOM events, so reading the current
  // `state` from the closure is safe — each event gets a fresh render/closure.
  const patch = <K extends keyof PanelState>(key: K, val: PanelState[K]) => {
    const next = { ...state, [key]: val };
    setState(next);
    onChange(toCalendarProps(next));
  };

  const resetSection = (id: SectionId) => {
    const next = { ...state };
    for (const k of SECTION_KEYS[id]) {
      (next as Record<string, unknown>)[k] = DEFAULTS[k];
    }
    setState(next);
    onChange(toCalendarProps(next));
  };

  const resetAll = () => {
    setState(DEFAULTS);
    onChange(toCalendarProps(DEFAULTS));
  };

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const s = state;
  const sectionProps = (id: SectionId, title: string) => ({
    id,
    title,
    open: openSections.has(id),
    badge: modifiedCount(s, SECTION_KEYS[id]),
    onToggle: () => toggleSection(id),
    onReset: () => resetSection(id),
  });

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Props</span>
        <button className={styles.resetAll} onClick={resetAll} type="button">
          Reset All
        </button>
      </div>

      <div className={styles.body}>
        {/* ── Events (fixture selector, not a CalendarProp) ── */}
        <div className={styles.section}>
          <div className={styles.sectionHeader} style={{ cursor: "default" }}>
            <span className={styles.sectionLabel}>Events</span>
          </div>
          <div className={styles.sectionBody}>
            <Row label="Fixture">
              <select
                value={fixtureIndex}
                onChange={(e) => onFixtureChange(+e.target.value)}
              >
                {fixtureList.map((f, i) => (
                  <option key={i} value={i}>
                    {f.name}
                  </option>
                ))}
              </select>
            </Row>
          </div>
        </div>

        {/* ── View ── */}
        <Section {...sectionProps("view", "View")}>
          <Row label="View">
            <select
              value={s.view}
              onChange={(e) =>
                patch("view", e.target.value as ECalendarViewType)
              }
            >
              <option value={ECalendarViewType.month}>Month</option>
              <option value={ECalendarViewType.week}>Week</option>
              <option value={ECalendarViewType.day}>Day</option>
              <option value={ECalendarViewType.schedule}>Schedule</option>
              <option value={ECalendarViewType.customDays}>Custom Days</option>
            </select>
          </Row>
          <Row label="Selected Date">
            <input
              type="date"
              value={s.selectedDate}
              onChange={(e) => patch("selectedDate", e.target.value)}
            />
          </Row>
          <RangeRow
            label="Custom Days"
            min={1}
            max={10}
            value={s.customDays}
            onChange={(v) => patch("customDays", v)}
          />
          <RangeRow
            label="Week Starts On"
            min={0}
            max={6}
            value={s.weekStartsOn}
            onChange={(v) => patch("weekStartsOn", v)}
          />
          <RangeRow
            label="Week Ends On"
            min={0}
            max={6}
            value={s.weekEndsOn}
            onChange={(v) => patch("weekEndsOn", v)}
          />
          <Row label="Adjacent Months">
            <Toggle
              checked={s.showAdjacentMonths}
              onChange={(v) => patch("showAdjacentMonths", v)}
            />
          </Row>
          <Row label="Week Numbers">
            <Toggle
              checked={s.showWeekNumbers}
              onChange={(v) => patch("showWeekNumbers", v)}
            />
          </Row>
          <Row label="All-Day Row">
            <Toggle
              checked={s.showAllDayRow}
              onChange={(v) => patch("showAllDayRow", v)}
            />
          </Row>
          <Row label="Reset on View Change">
            <Toggle
              checked={s.resetDateOnViewChange}
              onChange={(v) => patch("resetDateOnViewChange", v)}
            />
          </Row>
        </Section>

        {/* ── Time Grid ── */}
        <Section {...sectionProps("timeGrid", "Time Grid")}>
          <Row label="Day Type">
            <select
              value={s.dayType}
              onChange={(e) => patch("dayType", e.target.value as EDayType)}
            >
              <option value="half">Half</option>
              <option value="full">Full</option>
            </select>
          </Row>
          <Row label="12-Hour Format">
            <Toggle
              checked={s.is12Hour}
              onChange={(v) => patch("is12Hour", v)}
            />
          </Row>
          <RangeRow
            label="Min Hour"
            min={0}
            max={23}
            value={s.minHour}
            onChange={(v) => patch("minHour", v)}
          />
          <RangeRow
            label="Max Hour"
            min={1}
            max={24}
            value={s.maxHour}
            onChange={(v) => patch("maxHour", v)}
          />
          <Row label="Current Time Line">
            <Toggle
              checked={s.showCurrentTime}
              onChange={(v) => patch("showCurrentTime", v)}
            />
          </Row>
          <Row label="Auto-Scroll">
            <Toggle
              checked={s.autoScrollToCurrentTime}
              onChange={(v) => patch("autoScrollToCurrentTime", v)}
            />
          </Row>
          <RangeRow
            label="Overlap Offset"
            min={0}
            max={50}
            value={s.eventOverlapOffset}
            onChange={(v) => patch("eventOverlapOffset", v)}
            unit="%"
          />
        </Section>

        {/* ── Year Picker ── */}
        <Section {...sectionProps("yearPicker", "Year Picker")}>
          <Row label="Past Years">
            <input
              type="number"
              min={0}
              max={50}
              value={s.pastYearLength}
              onChange={(e) => patch("pastYearLength", +e.target.value)}
            />
          </Row>
          <Row label="Future Years">
            <input
              type="number"
              min={0}
              max={50}
              value={s.futureYearLength}
              onChange={(e) => patch("futureYearLength", +e.target.value)}
            />
          </Row>
        </Section>

        {/* ── Interaction ── */}
        <Section {...sectionProps("interaction", "Interaction")}>
          <Row label="Selectable">
            <Toggle
              checked={s.selectable}
              onChange={(v) => patch("selectable", v)}
            />
          </Row>
          <Row label="Creatable">
            <Toggle
              checked={s.creatable}
              onChange={(v) => patch("creatable", v)}
            />
          </Row>
          <Row label="Max Events">
            <select
              value={s.maxEvents === undefined ? "auto" : String(s.maxEvents)}
              onChange={(e) =>
                patch(
                  "maxEvents",
                  e.target.value === "auto" ? undefined : +e.target.value,
                )
              }
            >
              <option value="auto">Auto</option>
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Row>
        </Section>

        {/* ── Appearance ── */}
        <Section {...sectionProps("appearance", "Appearance")}>
          <Row label="Color Scheme">
            <select
              value={s.colorScheme}
              onChange={(e) =>
                patch("colorScheme", e.target.value as ColorScheme)
              }
            >
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Row>
          <div className={styles.divider} />
          <Row label="Default Color" sub>
            <ColorControl
              value={s.themeDefaultColor}
              onChange={(v) => patch("themeDefaultColor", v)}
            />
          </Row>
          <Row label="Default Bg" sub>
            <ColorControl
              value={s.themeDefaultBg}
              onChange={(v) => patch("themeDefaultBg", v)}
            />
          </Row>
          <Row label="Selected Color" sub>
            <ColorControl
              value={s.themeSelectedColor}
              onChange={(v) => patch("themeSelectedColor", v)}
            />
          </Row>
          <Row label="Selected Bg" sub>
            <ColorControl
              value={s.themeSelectedBg}
              onChange={(v) => patch("themeSelectedBg", v)}
            />
          </Row>
          <Row label="Today Color" sub>
            <ColorControl
              value={s.themeTodayColor}
              onChange={(v) => patch("themeTodayColor", v)}
            />
          </Row>
          <Row label="Today Bg" sub>
            <ColorControl
              value={s.themeTodayBg}
              onChange={(v) => patch("themeTodayBg", v)}
            />
          </Row>
        </Section>

        {/* ── Class Names ── */}
        <Section {...sectionProps("classNames", "Class Names")}>
          {/* Global */}
          <Row label="root" sub>
            <input
              type="text"
              value={s.cnRoot}
              placeholder="CSS class name"
              onChange={(e) => patch("cnRoot", e.target.value)}
            />
          </Row>
          <Row label="header" sub>
            <input
              type="text"
              value={s.cnHeader}
              placeholder="CSS class name"
              onChange={(e) => patch("cnHeader", e.target.value)}
            />
          </Row>
          <div className={styles.divider} />
          {/* Month view */}
          <Row label="table" sub>
            <input
              type="text"
              value={s.cnTable}
              placeholder="CSS class name"
              onChange={(e) => patch("cnTable", e.target.value)}
            />
          </Row>
          <Row label="tableHeader" sub>
            <input
              type="text"
              value={s.cnTableHeader}
              placeholder="CSS class name"
              onChange={(e) => patch("cnTableHeader", e.target.value)}
            />
          </Row>
          <Row label="tableDate" sub>
            <input
              type="text"
              value={s.cnTableDate}
              placeholder="CSS class name"
              onChange={(e) => patch("cnTableDate", e.target.value)}
            />
          </Row>
          <Row label="weekNumber" sub>
            <input
              type="text"
              value={s.cnWeekNumber}
              placeholder="CSS class name"
              onChange={(e) => patch("cnWeekNumber", e.target.value)}
            />
          </Row>
          <div className={styles.divider} />
          {/* Shared events */}
          <Row label="event" sub>
            <input
              type="text"
              value={s.cnEvent}
              placeholder="CSS class name"
              onChange={(e) => patch("cnEvent", e.target.value)}
            />
          </Row>
          <Row label="selected" sub>
            <input
              type="text"
              value={s.cnSelected}
              placeholder="CSS class name"
              onChange={(e) => patch("cnSelected", e.target.value)}
            />
          </Row>
          <Row label="today" sub>
            <input
              type="text"
              value={s.cnToday}
              placeholder="CSS class name"
              onChange={(e) => patch("cnToday", e.target.value)}
            />
          </Row>
          <div className={styles.divider} />
          {/* Week & Day view */}
          <Row label="dayHeader" sub>
            <input
              type="text"
              value={s.cnDayHeader}
              placeholder="CSS class name"
              onChange={(e) => patch("cnDayHeader", e.target.value)}
            />
          </Row>
          <Row label="dayName" sub>
            <input
              type="text"
              value={s.cnDayName}
              placeholder="CSS class name"
              onChange={(e) => patch("cnDayName", e.target.value)}
            />
          </Row>
          <Row label="dayNumber" sub>
            <input
              type="text"
              value={s.cnDayNumber}
              placeholder="CSS class name"
              onChange={(e) => patch("cnDayNumber", e.target.value)}
            />
          </Row>
          <Row label="timeColumn" sub>
            <input
              type="text"
              value={s.cnTimeColumn}
              placeholder="CSS class name"
              onChange={(e) => patch("cnTimeColumn", e.target.value)}
            />
          </Row>
          <Row label="timeSlot" sub>
            <input
              type="text"
              value={s.cnTimeSlot}
              placeholder="CSS class name"
              onChange={(e) => patch("cnTimeSlot", e.target.value)}
            />
          </Row>
          <Row label="dayColumn" sub>
            <input
              type="text"
              value={s.cnDayColumn}
              placeholder="CSS class name"
              onChange={(e) => patch("cnDayColumn", e.target.value)}
            />
          </Row>
          <div className={styles.divider} />
          {/* Schedule view */}
          <Row label="scheduleDateGroup" sub>
            <input
              type="text"
              value={s.cnScheduleDateGroup}
              placeholder="CSS class name"
              onChange={(e) => patch("cnScheduleDateGroup", e.target.value)}
            />
          </Row>
          <Row label="scheduleDateNumber" sub>
            <input
              type="text"
              value={s.cnScheduleDateNumber}
              placeholder="CSS class name"
              onChange={(e) => patch("cnScheduleDateNumber", e.target.value)}
            />
          </Row>
          <Row label="scheduleDateSubInfo" sub>
            <input
              type="text"
              value={s.cnScheduleDateSubInfo}
              placeholder="CSS class name"
              onChange={(e) => patch("cnScheduleDateSubInfo", e.target.value)}
            />
          </Row>
          <Row label="scheduleTime" sub>
            <input
              type="text"
              value={s.cnScheduleTime}
              placeholder="CSS class name"
              onChange={(e) => patch("cnScheduleTime", e.target.value)}
            />
          </Row>
          <Row label="scheduleTitle" sub>
            <input
              type="text"
              value={s.cnScheduleTitle}
              placeholder="CSS class name"
              onChange={(e) => patch("cnScheduleTitle", e.target.value)}
            />
          </Row>
        </Section>

        {/* ── Localization ── */}
        <Section {...sectionProps("localization", "Localization")}>
          <Row label="Locale">
            <select
              value={s.locale}
              onChange={(e) => patch("locale", e.target.value)}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
              <option value="ar">العربية</option>
              <option value="he">עברית</option>
              <option value="fa">فارسی</option>
              <option value="hi-IN">हिन्दी</option>
              <option value="pt-BR">Português</option>
            </select>
          </Row>
          <Row label="Direction">
            <select
              value={s.direction}
              onChange={(e) =>
                patch("direction", e.target.value as PanelState["direction"])
              }
            >
              <option value="auto">Auto</option>
              <option value="ltr">LTR</option>
              <option value="rtl">RTL</option>
            </select>
          </Row>
          <div className={styles.divider} />
          <Row label="Today label" sub>
            <input
              type="text"
              value={s.msgToday}
              placeholder="Today"
              onChange={(e) => patch("msgToday", e.target.value)}
            />
          </Row>
          <Row label="Day label" sub>
            <input
              type="text"
              value={s.msgDay}
              placeholder="Day"
              onChange={(e) => patch("msgDay", e.target.value)}
            />
          </Row>
          <Row label="Week label" sub>
            <input
              type="text"
              value={s.msgWeek}
              placeholder="Week"
              onChange={(e) => patch("msgWeek", e.target.value)}
            />
          </Row>
          <Row label="Month label" sub>
            <input
              type="text"
              value={s.msgMonth}
              placeholder="Month"
              onChange={(e) => patch("msgMonth", e.target.value)}
            />
          </Row>
          <Row label="Schedule label" sub>
            <input
              type="text"
              value={s.msgSchedule}
              placeholder="Schedule"
              onChange={(e) => patch("msgSchedule", e.target.value)}
            />
          </Row>
          <Row label="Days label" sub>
            <input
              type="text"
              value={s.msgDays}
              placeholder="Days"
              onChange={(e) => patch("msgDays", e.target.value)}
            />
          </Row>
        </Section>

        {/* ── Loading ── */}
        <Section {...sectionProps("loading", "Loading")}>
          <Row label="Is Loading">
            <Toggle
              checked={s.isLoading}
              onChange={(v) => patch("isLoading", v)}
            />
          </Row>
          <Row label="Custom Renderer">
            <Toggle
              checked={s.renderLoading}
              onChange={(v) => patch("renderLoading", v)}
            />
          </Row>
        </Section>

        {/* ── Custom Renderers ── */}
        <Section {...sectionProps("renderers", "Renderers")}>
          <Row label="renderEvent">
            <Toggle
              checked={s.renderEvent}
              onChange={(v) => patch("renderEvent", v)}
            />
          </Row>
          <Row label="renderHeader">
            <Toggle
              checked={s.renderHeader}
              onChange={(v) => patch("renderHeader", v)}
            />
          </Row>
          <Row label="renderHourCell">
            <Toggle
              checked={s.renderHourCell}
              onChange={(v) => patch("renderHourCell", v)}
            />
          </Row>
          <Row label="renderDateCell">
            <Toggle
              checked={s.renderDateCell}
              onChange={(v) => patch("renderDateCell", v)}
            />
          </Row>
          <Row label="renderScheduleSep">
            <Toggle
              checked={s.renderScheduleSeparator}
              onChange={(v) => patch("renderScheduleSeparator", v)}
            />
          </Row>
        </Section>

        {/* ── Performance ── */}
        <Section {...sectionProps("performance", "Performance")}>
          <Row label="Enriched Events">
            <Toggle
              checked={s.enableEnrichedEvents}
              onChange={(v) => patch("enableEnrichedEvents", v)}
            />
          </Row>
          <Row label="Events Are Sorted">
            <Toggle
              checked={s.eventsAreSorted}
              onChange={(v) => patch("eventsAreSorted", v)}
            />
          </Row>
          <Row label="Event Ordering">
            <Toggle
              checked={s.isEventOrderingEnabled}
              onChange={(v) => patch("isEventOrderingEnabled", v)}
            />
          </Row>
          <Row label="Month Sort">
            <select
              value={s.sortedMonthView}
              onChange={(e) =>
                patch(
                  "sortedMonthView",
                  e.target.value as PanelState["sortedMonthView"],
                )
              }
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
              <option value="custom">Custom (by id)</option>
            </select>
          </Row>
        </Section>

        {/* ── Layout ── */}
        <Section {...sectionProps("layout", "Layout")}>
          <Row label="Width">
            <select
              value={
                [
                  "",
                  "100%",
                  "800px",
                  "1024px",
                  "1280px",
                  "768px",
                  "480px",
                ].includes(s.width)
                  ? s.width
                  : "custom"
              }
              onChange={(e) =>
                patch(
                  "width",
                  e.target.value === "custom" ? "800px" : e.target.value,
                )
              }
            >
              <option value="">Auto</option>
              <option value="100%">100%</option>
              <option value="1280px">1280px</option>
              <option value="1024px">1024px</option>
              <option value="768px">768px</option>
              <option value="480px">480px</option>
              <option value="custom">Custom…</option>
            </select>
          </Row>
          {!["", "100%", "1280px", "1024px", "768px", "480px"].includes(
            s.width,
          ) && (
            <Row label="">
              <input
                type="text"
                value={s.width}
                placeholder="e.g. 600px"
                onChange={(e) => patch("width", e.target.value)}
              />
            </Row>
          )}
          <Row label="Height">
            <select
              value={
                ["", "600px", "700px", "800px", "100%"].includes(s.height)
                  ? s.height
                  : "custom"
              }
              onChange={(e) =>
                patch(
                  "height",
                  e.target.value === "custom" ? "600px" : e.target.value,
                )
              }
            >
              <option value="">Auto</option>
              <option value="600px">600px</option>
              <option value="700px">700px</option>
              <option value="800px">800px</option>
              <option value="100%">100%</option>
              <option value="custom">Custom…</option>
            </select>
          </Row>
          {!["", "600px", "700px", "800px", "100%"].includes(s.height) && (
            <Row label="">
              <input
                type="text"
                value={s.height}
                placeholder="e.g. 500px"
                onChange={(e) => patch("height", e.target.value)}
              />
            </Row>
          )}
        </Section>

        {/* ── Debug ── */}
        <Section {...sectionProps("debug", "Debug")}>
          <Row label="Test ID">
            <input
              type="text"
              value={s.testId}
              onChange={(e) => patch("testId", e.target.value)}
            />
          </Row>
        </Section>
      </div>
    </div>
  );
}
