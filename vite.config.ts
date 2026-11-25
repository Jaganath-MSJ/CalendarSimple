/// <reference types="vitest" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "path";
import { libFileName } from "./scripts/lib-file-name.mjs";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: "calendar-simple", // Replace with your library name
      formats: ["cjs", "es", "iife"],
      fileName: libFileName,
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ["react", "react-dom"],
      output: {
        // Provide global variables for IIFE/UMD builds
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        extend: true,
      },
    },
    sourcemap: true,
    emptyOutDir: true, // Equivalent to tsup's clean: true
    target: "es2020",
    minify: "esbuild", // or 'terser'
    chunkSizeWarningLimit: 2000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    testTimeout: 20_000,
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
  plugins: [
    // Generates .d.ts files (equivalent to tsup's dts: true)
    process.env.npm_lifecycle_event !== "build-storybook" &&
      !process.env.STORYBOOK &&
      dts({
        include: ["src"],
        exclude: [
          "node_modules",
          "dist",
          "**/*.test.ts",
          "**/*.test.tsx",
          "**/*.test-d.ts",
          "**/*.test-d.tsx",
        ],
        // Keep declarations under dist/src/ to match package.json "types"
        entryRoot: ".",
      }),
    process.env.ANALYZE &&
      visualizer({
        filename: "dist/stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ],
});
