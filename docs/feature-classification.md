# Feature Classification

Here is the classification of the features based on the current codebase implementation (`src/types/calendar.ts`, `FEATURES.md`, etc.):

## ✅ Implemented / Mapped

**📌 Core Features**
*   Fully TypeScript-based and type-safe.
*   Lightweight library with minimal dependencies (`luxon`, `calendarize`). *(Migrated from dayjs to luxon)*
*   Highly customizable (themes, styles, custom renderers).

**🗓️ Multiple Calendar Views**
*   day view (single day with hourly grid).
*   week view (7-day calendar).
*   3days view (3-day span) - *Implemented dynamically via `customDays` (flexible N-day view).*
*   month (classic month grid).
*   schedule (list / agenda-style view).

**🎨 Customization**
*   Customize event appearance with static/dynamic `style` property (corresponds to `eventCellStyle`).
*   Custom event rendering via `renderEvent`.
*   Custom calendar header with `renderHeader`.
*   Custom hour and date cell rendering (via `renderHourCell`, `renderDateCell`).
*   Theming support through props (`theme` and `classNames`).

**📅 Date & Time Controls**
*   Set current date (`selectedDate`), min/max hour for time views (`minHour`, `maxHour`).
*   12-hour (ampm) or 24-hour formats (`is12Hour`).
*   Define week start/end days (`weekStartsOn`, `weekEndsOn`).
*   Locale customization - *Implemented as Full Localization Support (`locale`, `localeMessages`).*
*   Show or hide “Now” indicator (`showCurrentTime`).

**🔁 Navigation & Interaction**
*   Handlers for interactions:
    *   onPressEvent (tap an event) - *Mapped to `onEventClick`*.
    *   onPressCell (tap a calendar cell) - *Mapped to `onDateClick`*.
    *   onChangeDate (range changes) - *Mapped to `onNavigate`*.
*   Slot creation for event intent: `creatable` flag + `onSlotClick(startDate, endDate)` callback — fires a 1-hour window in Day/Week/CustomDays views and a full-day window in Month view.

**📊 Month View Enhancements**
*   Control visibility of adjacent months (`showAdjacentMonths`).
*   Show a “more…” label when too many events in a day (`onMoreClick`).
*   Set max number of visible events in month cells (`maxEvents`).
*   Show week numbers in the month view leftmost column (`showWeekNumbers`). *(ISO 8601 week numbers via Luxon; column width via `--week-number-width` CSS variable)*

**⚡ Performance Options**
*   Pre-enriched events for optimized rendering (`enrichedEventsByDate`).
*   Enable enriched events logic (`enableEnrichedEvents`).
*   Skip internal sorting if events are pre-sorted (`eventsAreSorted`).
*   Control event ordering (`isEventOrderingEnabled`, `sortedMonthView`).

**📌 Layout & Extra Controls**
*   Adjust overlap offset for concurrent events (`eventOverlapOffset`).
*   Custom separator for schedule view (`renderScheduleSeparator`).
*   Toggle showing all-day event row (`showAllDayRow`).
*   Controls related to scroll behavior (`autoScrollToCurrentTime`) and pager resets on view change (`resetDateOnViewChange`).

---

## ❌ Not Implemented (Or Not Applicable)

**🗓️ Multiple Calendar Views**
*   Custom mode for user-defined render logic. *(Not needed, handled via view combinations & renderers)*

**🎨 Customization**
*   Control text color and accessibility props (`eventCellTextColor`, `eventCellAccessibilityProps`). *(Handled via standard HTML/CSS and ARIA attributes in web)*

**🔁 Navigation & Interaction**
*   Swipe navigation between date ranges (e.g., days/weeks). *(Not typical for desktop web, often handled natively by touch devices if enabled)*
*   onLongPressCell (long-press a calendar cell). *(Native mobile concept, not currently mapped)*
*   onPressDateHeader (tap header dates). *(Not explicitly mapped)*

**📊 Month View Enhancements**
*   Option to disable pressing of month event cells.
*   Option to always show 6 weeks in month mode.

---

## 🔍 Implemented But Not In Provided List (Extra Features)
*   **Selectable Visual State (`selectable`)**: Enables a visual highlight state when interacting with dates.
*   **Day Name Formatting (`dayType`)**: Option to format day names as `"full"` (e.g. Monday) or `"half"` (e.g. Mon).
*   **Customizable Year Dropdowns (`pastYearLength`, `futureYearLength`)**: Control the exact number of past and future years displayed in the calendar header dropdowns.
*   **View Change Callback (`onViewChange`)**: Dedicated handler that triggers specifically when switching between month/week/day/schedule views.
*   **Responsive Auto-sizing (`width`, `height`)**: Ability to explicitly set dimensions or allow the calendar to use a `ResizeObserver` to auto-calculate layouts perfectly inside any container.
