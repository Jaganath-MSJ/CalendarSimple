/**
 * Output file names of the library build. The package is
 * `"type": "module"`, so the CommonJS bundle ends in `.cjs` (Node reads
 * every `.js` file there as an ES module).
 *
 * @param {string} format Vite library format (`es`, `cjs`, `iife`).
 * @returns {string}
 */
export function libFileName(format) {
  if (format === "cjs") return "index.cjs";
  return `index.${format}.js`;
}
