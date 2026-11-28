/**
 * Files left out of the published type declarations (vite-plugin-dts):
 * tests, type tests, Storybook stories and the test setup are not part of
 * the library's API.
 */
export const DTS_EXCLUDE = [
  "node_modules",
  "dist",
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.test-d.ts",
  "**/*.test-d.tsx",
  "src/stories/**",
  "src/setupTests.ts",
];
