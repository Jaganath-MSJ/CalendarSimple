import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: resolve("./node_modules/react"),
      "react-dom": resolve("./node_modules/react-dom"),
    },
  },
  server: {
    open: true,
  },
});
