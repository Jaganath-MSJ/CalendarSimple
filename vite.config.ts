import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "calendar-simple", // Replace with your library name
      formats: ["cjs", "es", "iife"],
      fileName: (format) => {
        const ext = format === "iife" ? "iife.js" : `${format}.js`;
        return `index.${ext}`;
      },
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ["react", "react-dom"],
      output: {
        // Provide global variables for IIFE/UMD builds
        exports: 'named',
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
    minify: "terser", // or 'esbuild'
  },
  plugins: [
    // Generates .d.ts files (equivalent to tsup's dts: true)
    dts({
      include: ["src"],
      exclude: ["node_modules", "dist"],
      rollupTypes: true,
    }),
  ],
});
