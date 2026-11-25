/**
 * Writes a CommonJS copy of the type declarations for `require()` users.
 *
 * The package is `"type": "module"`, so TypeScript (module node16/nodenext)
 * treats `dist/src/*.d.ts` as ES-module types and rejects them from a
 * CommonJS file (TS1479). The same declarations in a folder whose
 * package.json says `"type": "commonjs"` are read as CommonJS types; the
 * `require` condition in package.json points there.
 *
 * Usage: `node scripts/cjs-types.mjs [distDir]` (default `dist`).
 */
import { cpSync, existsSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Copies `<dist>/src` to `<dist>/cjs-types` and marks it CommonJS. */
export function writeCjsTypes(dist) {
  const from = join(dist, "src");
  const to = join(dist, "cjs-types");
  if (!existsSync(from)) {
    throw new Error(`cjs-types: ${from} not found (run vite build first)`);
  }
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, {
    recursive: true,
    filter: (path) => !path.endsWith(".map"),
  });
  writeFileSync(join(to, "package.json"), '{ "type": "commonjs" }\n');
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  writeCjsTypes(resolve(process.argv[2] ?? "dist"));
}
