import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  args: {
    colorScheme: "light",
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    options: {
      storySort: {
        // Reading order: sandbox → per-view demos → cross-cutting features → tests.
        // Nested arrays control sub-order inside a group (e.g. "Tests").
        // "*" catches any future top-level title we forget to list.
        order: [
          "Playground",
          "Day View",
          "Week View",
          "Month View",
          "Schedule View",
          "Custom Day View",
          "Features & Interactions",
          "Customization",
          "Localization",
          "Accessibility",
          "Tests",
          [
            // Broad → specific → perf: Views covers the most surface, then
            // narrower concerns, with Performance Engine last (heaviest run).
            "Views",
            "Edge Cases",
            "Time Formatting",
            "Layout Limits",
            "Interactions",
            "Performance Engine",
          ],
          "*",
        ],
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
