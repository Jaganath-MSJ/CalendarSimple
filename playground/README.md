# Calendar Simple — Playground

A local Vite + React 19 dev harness for exercising the [`calendar-simple`](../) library
against the **real published build** (not the source). It renders a live `<Calendar>`
next to an interactive control panel that lets you toggle nearly every prop and swap
between curated event fixtures.

Use it to reproduce bugs, eyeball layout/theming changes, and sanity-check the public
API the way a consumer would actually import it.

## Relationship to the library

The playground depends on the parent package via `"calendar-simple": "file:.."`, so it
imports from the library's **`dist/` output**, exactly like an external consumer:

```ts
import Calendar from "calendar-simple";
import type { CalendarProps } from "calendar-simple";
import "calendar-simple/dist/styles.css";
```

Because of this, **you must build the library before running the playground.** `dist/`
is git-ignored and not committed.

## Getting started

From the repository root, build the library first:

```bash
npm install
npm run build          # produces dist/ that the playground imports
```

Then run the playground:

```bash
cd playground
npm install
npm run dev            # opens the app in your browser
```

> After changing library source, re-run `npm run build` in the root (or `npm run build -- --watch`)
> so the playground picks up your changes.

## Scripts

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the Vite dev server (auto-opens)         |
| `npm run build`   | Type-check (`tsc -b`) and build the playground |
| `npm run preview` | Preview the production build                   |
| `npm run lint`    | Run ESLint                                     |

## What's in here

- **`src/App.tsx`** — Lays out the live `<Calendar>` and the control panel. Wires every
  event callback (`onEventClick`, `onDateClick`, `onMoreClick`, `onNavigate`,
  `onViewChange`, `onSlotClick`) to `console.log` so interactions are observable in the
  browser console.
- **`src/ControlPanel.tsx`** — A collapsible, sectioned panel of controls that maps UI
  state to `Partial<CalendarProps>`. Sections cover **View, Time Grid, Year Picker,
  Interaction, Appearance, Class Names, Localization, Loading, Renderers, Performance,
  Layout, and Debug.** Each section shows a badge counting modified props and has its own
  reset; "Reset All" restores defaults.
- **`src/TestFixtures.ts`** — Curated `CalendarEvent[]` fixtures selectable from the
  panel's **Events** dropdown: Edge Cases, Empty, Single Timed, Single All-Day, All-Day
  Banner Stress, Month Overflow, Large Dataset (1k / 10k), DST Spring/Fall, Year/Month
  Boundary, Unicode Titles, Custom Metadata, and HTML Injection.

## Tips

- The custom **Renderers** toggles (`renderEvent`, `renderHeader`, `renderHourCell`,
  `renderDateCell`, `renderScheduleSeparator`) and **Loading** renderer swap in small demo
  implementations so you can see custom-render hooks fire without writing code.
- The **Large Dataset** fixtures (1k / 10k events) are useful for spot-checking rendering
  performance and the `enableEnrichedEvents` / `eventsAreSorted` / `sortedMonthView`
  performance props.
- The **HTML Injection** and **Unicode Titles** fixtures are handy for verifying escaping
  and i18n/RTL behavior alongside the **Localization** section.

This is an internal dev tool — it is private (`"private": true`) and is not published.
