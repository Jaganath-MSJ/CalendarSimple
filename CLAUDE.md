# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building & Bundling

- `npm run build` — Build the library with Vite (outputs CJS, ESM, IIFE formats to `dist/`)
- `npm run build-storybook` — Build Storybook static site

### Testing

- `npm test` — Run all tests once
- `npm run test:watch` — Run tests in watch mode

### Code Quality

- `npm run lint` — Type-check (`tsc --noEmit`) **and** check for ESLint violations (there is no standalone typecheck script — `lint` covers it)
- `npm run lint:fix` — Type-check, then fix ESLint violations automatically
- `npm run format` — Format all code with Prettier
- `npm run format:check` — Check if code is formatted correctly

### Documentation & Stories

- `npm run storybook` — Start Storybook dev server on port 6006
- Live demo: http://calendarsimple.netlify.app

### Single Test Execution

Use `npm test -- <pattern>` to run specific tests:

```bash
npm test -- MonthView.test.tsx     # Run one test file
npm test -- useEvents              # Run tests matching pattern
```

## High-Level Architecture

### Compound Component Pattern

The Calendar is a compound component using a **Provider + Hook** pattern:

- **`Calendar`** — Root component that wraps content in `CalendarProvider`
- **`CalendarProvider`** — Context provider managing calendar state via reducer
- **`useCalendar()`** — Hook consuming the context for state access and dispatch
- **Child components** (views, header, etc.) use `useCalendarProps()` to merge config with local overrides

### State Management (CalendarContext)

- **State shape**: `{ selectedDate: DateTime, view: ECalendarViewType, customDays?: number }`
- **Actions**: `SET_DATE`, `SET_VIEW`, `NEXT`, `PREV`, `TODAY` (defined in `CALENDAR_ACTIONS`)
- **Reducer logic**: Handles navigation math (e.g., next month, previous week) based on current view
- **Date handling**: Uses `DateType` (Luxon `DateTime`) throughout—never raw JS `Date` in internal logic

### Views Architecture

Each view is a separate component receiving props via `useCalendarProps()`:

- **MonthView** — Grid layout showing full month with day cells
- **WeekView** — Time-grid layout with hourly slots across 7 days
- **DayView** — Single day in time-grid with hourly slots
- **CustomDaysView** — Configurable multi-day time-grid (e.g., 3-day view)
- **ScheduleView** — Continuous scrollable list of events grouped by date
- **View** — Wrapper component that renders the appropriate view based on context state

### Loading & Error Handling

- **Loading states**: The `isLoading` prop has two behaviours. With **no events**, it replaces the body with a view-specific skeleton (`src/components/ui/skeleton/` — `MonthSkeleton`, `TimeGridSkeleton`, `ScheduleSkeleton`) or `renderLoading()` if provided. With **events present**, it keeps the calendar visible behind a non-interactive overlay so stale data stays on screen during a refresh.
- **Error boundary**: `CalendarErrorBoundary` (`src/components/ui/`) wraps the calendar; on a render error it shows an empty `data-testid="calendar-error-boundary"` element and stays silent (the host app's error reporting is expected to handle logging).

### Prop Distribution Pattern

**`useCalendarProps<T>(localProps: T)`** merges context config with local overrides:

1. Reads config from `CalendarContext`
2. Overlays local props (undefined values don't override)
3. Returns merged `CalendarContentProps` with type safety

This enables prop composition: global calendar props + view-specific overrides.

### Layout & Styling

- **CSS Modules**: All styles co-located in `Component.module.css` files
- **Theme system**: `CalendarTheme` provides `default`/`selected`/`today` color overrides. It is **scheme-aware**: flat keys apply to both schemes, while `dark` / `light` sub-objects take precedence when the resolved scheme matches. `width` / `height` props accept a number (px) or any CSS length string.
- **Custom classes**: `CalendarClassNames` type allows targeting specific elements
- **Color scheme / dark mode**: The `colorScheme` prop (`'light'`/`'dark'`/`'auto'`, default `auto`) is resolved by `useColorScheme` (listens to `prefers-color-scheme`). The resolved value is written as `data-color-scheme="light"|"dark"` on the calendar root, which swaps the CSS custom-property palette defined in `src/styles/variables.css` (`:root` = light, `[data-color-scheme="dark"]` = dark). The `theme` prop still wins over the palette.
- **RTL**: The `direction` prop (`'ltr'`/`'rtl'`) defaults to `rtl` when `locale` is an RTL locale (ar, he, fa, ur, ps, sd, ckb, yi), else `ltr`. An explicit `direction` overrides auto-detection.
- **No Tailwind/SCSS**: Vanilla CSS modules + the global `variables.css` palette only

### Core Hooks (Event & Layout Logic)

- **`useEvents`** — Filters and enriches events for the current date range; supports O(1) lookup via `enrichedEventsByDate`
- **`useAllDayBanner`** — Extracts all-day events from event list; handles multi-day spanning
- **`useDayEventLayout`** — Implements "Tetris" collision detection for overlapping timed events; returns positioning data
- **`useMonthGrid`** — Builds month calendar grid with week rows; handles adjacent month visibility
- **`useScheduleView`** — Groups events by date for schedule layout; handles sorting
- **`useResizeObserver`** — Observes container resize; provides width/height for responsive layout
- **`useColorScheme`** — Resolves the `colorScheme` prop to a concrete `'light'`/`'dark'` value, subscribing to the OS `prefers-color-scheme` media query when `auto`

### Event Types & Interfaces

**`CalendarEvent`** — The core event shape:

```typescript
{
  id?: string;
  startDate: string;         // ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  endDate?: string;          // Same format; undefined = same day as startDate
  title: string;
  style?: CSSProperties;
  [key: string]: unknown;    // Extensible for custom fields
}
```

Multi-day events use `startDate` and `endDate` without time components; timed events include `Txx:xx:xx` in ISO format.

### Date Handling (Luxon-Only)

- **Internal representation**: `DateTime` from Luxon library (not JS `Date`)
- **Utilities in `src/utils/date.ts`**: `dateFn()` normalizes inputs (JS Date, ISO string, timestamp) → `DateTime`
- **No raw `Date` in components**: Convert at boundaries (props input/output) using `toJSDate()` / `dateFn()`
- **Localization**: Full Luxon support via `locale` prop; date formatting respects language

### Accessibility

- **Keyboard Navigation**: Tab focus management, Enter/Space activation, Escape to close popovers
- **ARIA Support**: Semantic roles, labels, and attributes on interactive elements
- **Color Contrast**: Utility functions in `src/utils/contrast.ts` ensure WCAG compliance
- See `src/stories/Accessibility.stories.tsx` for examples

## Testing Patterns

### Setup & Mocks

- **Test entry**: `src/setupTests.ts` — Configures Vitest globals, DOM assertions, and mocks
- **ResizeObserver mock**: `useResizeObserver` is mocked as a hook returning fixed `{ width: 1200, height: 600 }`
- **Context mocking**: Tests use `<CalendarProvider>` with initial state; no external mock library needed
- **JSDOM environment**: `vitest.config.ts` specifies `jsdom` for DOM testing

### Test Structure

- **Unit tests**: Hooks and utilities tested in isolation (e.g., `useEvents.test.ts`)
- **Component tests**: Render with `<CalendarProvider>` and RTL queries
- **Stories as tests**: Storybook stories serve as integration tests; manually run in Storybook dev mode
- **Test data**: Use realistic event fixtures; avoid generic mock factories

### Common Assertions

- Query elements: `getByRole`, `getByTestId`, `queryByText`
- Interaction: `userEvent.click()`, `userEvent.keyboard()`
- State: Check rendered output after dispatch (no direct state inspection)

## Implementation Patterns

### Adding a New Feature

1. **Plan first** (using /writing-plans if non-trivial)
2. **Use TDD**: Write test, then component/hook
3. **Type everything**: No implicit `any`; leverage TypeScript
4. **Co-locate styles**: Create `Component.module.css` alongside `.tsx`
5. **Use Luxon**: Never raw `Date` in internal logic
6. **Test in Storybook**: Create stories demonstrating the feature
7. **Update exports**: Add new types/components to `src/index.ts`

### Naming Conventions

- **Hooks**: Lowercase `use*` (e.g., `useEvents`, `useDayEventLayout`)
- **Components**: PascalCase, feature-focused (e.g., `MonthEventItem`, `DayColumn`)
- **Utilities**: Lowercase, exported individually (e.g., `dateFn`, `getStartOfMonth`)
- **Types**: PascalCase prefix + descriptive (e.g., `CalendarProps`, `RenderDateCellProps`)
- **Enums**: UPPERCASE with `E` prefix (e.g., `ECalendarViewType`, `EDayType`)

### CSS Patterns

- **Selectors**: Use CSS classes defined in module; avoid element selectors for encapsulation
- **Responsive**: Container query style — width/height props + ResizeObserver; built-in breakpoints at 768px (tablet) and 480px (phone)
- **Color palette**: Light/dark colors live as CSS custom properties in `src/styles/variables.css`, swapped via the `[data-color-scheme="dark"]` attribute selector. Per-event/per-state `theme` prop colors are applied via inline `style`, overriding the palette.
- **Layout**: Flexbox/Grid; no absolute positioning except for current-time line

### Git & Commits

- **Branch strategy**: Feature branches off `dev`; PR to `dev` (not `main`)
- **Commit style**: Conventional Commits (feat:, fix:, test:, docs:, refactor:, chore:)
- **Pre-commit hooks**: Husky + lint-staged auto-fixes code on commit
- **Semantic Release**: Automatic versioning from commit messages

## Key Files & Directory Structure

| Path                              | Purpose                                                                    |
| --------------------------------- | -------------------------------------------------------------------------- |
| `src/Calendar.tsx`                | Root component; wraps in provider and dispatches to View                   |
| `src/context/CalendarContext.tsx` | State management, reducer, provider, and `useCalendar()` hook              |
| `src/components/views/`           | View implementations (Month, Week, Day, Schedule, CustomDays)              |
| `src/components/core/`            | Reusable core components (AllDayBanner, DayColumn, EventItems, etc.)       |
| `src/components/ui/`              | Popover, `CalendarErrorBoundary`, and loading skeletons (`skeleton/`)      |
| `src/hooks/`                      | Custom hooks (useEvents, useCalendarProps, useColorScheme, layout hooks)   |
| `src/utils/date.ts`               | Luxon wrappers and date calculations                                       |
| `src/utils/common.ts`             | General utilities (event filtering, sorting, etc.)                         |
| `src/utils/formatting.ts`         | UI string formatting (tooltip text, GMT offset, localized day/month names) |
| `src/utils/contrast.ts`           | WCAG contrast helpers for accessible theme colors                          |
| `src/types/`                      | TypeScript interfaces and type definitions                                 |
| `src/constants/`                  | Theme defaults, action types, layout constants                             |
| `src/styles/variables.css`        | Global CSS custom properties + light/dark palette (`data-color-scheme`)    |
| `src/stories/`                    | Storybook stories for all features and QA scenarios                        |
| `dist/`                           | Build output (auto-generated)                                              |

## Important Context from Memory

This project uses specific patterns documented in prior sessions:

- **Luxon-only dates**: All internal date handling uses `DateTime`; convert to/from JS `Date` at API boundaries
- **CSS co-location**: Styles live alongside components in `.module.css` files
- **Context mocks in tests**: No Vitest mock() calls; use `CalendarProvider` with test props
- **ResizeObserver mock**: Mocked in `setupTests.ts` for consistent test sizes
- **Compound components + prop distribution**: Central `useCalendarProps()` hook merges context config with local overrides
- **Event layout hooks**: Sophisticated math for collision detection (Tetris algorithm) and multi-day rendering

## Common Development Tasks

### Running Tests for a Feature

```bash
npm test -- Month         # All month-related tests
npm test -- events        # All event-related tests
```

### Adding a Custom Renderer

1. Add the render prop to `CalendarProps` type
2. Pass through `useCalendarProps()`
3. In the component, check if prop exists; fallback to default render
4. Document in README and create a Storybook story

### Fixing a Bug in Event Layout

1. Add test case reproducing the issue (MonthEventItem.test.tsx or DayWeekEventItem.test.tsx)
2. Debug using event data and expected positioning
3. Update `useDayEventLayout` or `useMonthGrid` logic
4. Verify in Storybook with edge case stories (see `src/stories/QA/LayoutLimits.stories.tsx`)

### Extending Theme System

1. Add new color key to `CalendarTheme` type
2. Add default value to `defaultTheme` in `src/constants/theme.ts`
3. Update components to use the new color
4. Create Storybook story showing the customization
