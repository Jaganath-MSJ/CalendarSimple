# Contributing to Calendar Simple

First off, thank you for considering contributing to `calendar-simple`! It's people like you that make open source such a great community to learn, inspire, and create.

This document explains how to set up the project, the workflow we follow, and the standards we expect. By participating, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Where do I go from here?

If you've noticed a bug or have a feature request, [open an issue](https://github.com/Jaganath-MSJ/CalendarSimple/issues/new/choose) first. It's generally best to get confirmation of a bug or approval for a feature request before you start coding — it saves everyone time.

For security vulnerabilities, **do not** open a public issue. Follow the process in our [Security Policy](./SECURITY.md) instead.

## Setting up your environment

This is a React 19 + TypeScript library bundled with Vite. You'll need **Node.js ≥ 18 LTS** (the CI matrix runs on 20.x and 22.x).

1. **Fork the repo** and clone your fork:

   ```bash
   git clone https://github.com/YOUR-USERNAME/CalendarSimple.git
   cd CalendarSimple
   ```

2. **Install dependencies** with `npm` (used in CI and for the lockfile):

   ```bash
   npm install
   ```

3. **Run the local environment**. Storybook is the primary way to develop and visually test components:

   ```bash
   # Storybook — develop and visually test components (port 6006)
   npm run storybook
   ```

   The **Playground → "Kitchen Sink"** story is an interactive sandbox exposing every Calendar prop with a full set of event fixtures.

## Development Workflow

1. **Create a branch off `dev`.** All work branches from and merges back into `dev` — not `main`.

   ```bash
   git checkout dev
   git pull
   git checkout -b feature/your-feature-name   # or fix/your-fix-name
   ```

2. **Make your changes**, following the existing structure and conventions (TypeScript, React hooks, CSS Modules, Luxon for all date logic). See [CLAUDE.md](./CLAUDE.md) for a detailed architecture overview.

3. **Write tests.** This project follows a test-driven approach. Add or update tests alongside your change (see [Testing](#testing) below).

4. **Commit using Conventional Commits.** We use `semantic-release` and `commitlint`, so commit messages drive versioning and the changelog. Malformed messages are rejected by the commit hook.
   - `feat: add new schedule view`
   - `fix: resolve timezone rendering bug`
   - `docs: update README with usage examples`
   - `test: add coverage for all-day banner collapse`
   - `refactor: extract day-event layout hook`
   - `chore: bump storybook to v10`

   A Husky + lint-staged pre-commit hook auto-formats and lints staged files.

5. **Verify everything passes locally** before pushing. These are the same checks CI runs:

   ```bash
   npm run format:check   # Prettier formatting
   npm run lint           # tsc --noEmit + ESLint
   npm test               # Vitest test suite
   npm run build          # Verify the bundle builds (CJS, ESM, IIFE)
   ```

6. **Push and open a Pull Request against `dev`.** Fill out the PR template, link the issue it resolves, and describe how you tested the change.

## Testing

Tests run with [Vitest](https://vitest.dev/) in a `jsdom` environment.

```bash
npm test                       # Run the full suite once
npm run test:watch             # Watch mode while developing
npm test -- MonthView          # Run a single file by pattern
npm test -- useEvents          # Run tests matching a pattern
```

Guidelines:

- **Co-locate tests** next to the code they cover (`Component.test.tsx`, `useHook.test.ts`).
- **Use realistic event fixtures** rather than generic mock factories.
- **Render with `<CalendarProvider>`** and React Testing Library queries; we don't use external mocking libraries for context.
- **Add a Storybook story** demonstrating any new feature or edge case — stories double as integration tests and QA scenarios.

## Coding Guidelines

- **TypeScript**: Strictly typed throughout. No implicit `any`; export new public types from `src/index.ts`.
- **Dates**: Use Luxon `DateTime` for all internal date logic. Only convert to/from a JS `Date` at API boundaries.
- **CSS**: Vanilla CSS Modules co-located with components (`Component.module.css`). No Tailwind or SCSS.
- **Folder naming**: Component folders use `snake_case` (e.g. `src/components/views/schedule_view/`, `src/components/core/day_event_item/`); component and hook files keep their PascalCase / `use*` names.
- **Accessibility**: Preserve semantic roles, ARIA attributes, keyboard navigation, and color-contrast utilities.
- **Documentation**: When you add or change a prop or feature, update the relevant docs — [`README.md`](./README.md) and [`FEATURES.md`](./FEATURES.md).

Thank you for contributing! 🎉
