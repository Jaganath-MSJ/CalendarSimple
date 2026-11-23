/// <reference types="node" />
// The package is "type": "module", so Node reads every .js file as an ES
// module: the CommonJS build must end in .cjs for require() to work.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { libFileName } from "../scripts/lib-file-name.mjs";

const pkg = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
) as {
  type: string;
  main: string;
  exports: Record<string, unknown>;
};

describe("CommonJS packaging", () => {
  it("points require() at a .cjs file", () => {
    expect(pkg.type).toBe("module");
    expect(pkg.main).toBe("./dist/index.cjs");
  });

  it("builds the CommonJS bundle as index.cjs", () => {
    expect(libFileName("cjs")).toBe("index.cjs");
    expect(libFileName("es")).toBe("index.es.js");
    expect(libFileName("iife")).toBe("index.iife.js");
  });
});

describe("CommonJS types", () => {
  it("routes require() to a CommonJS copy of the declarations", () => {
    const entry = pkg.exports["."] as {
      import: { types: string; default: string };
      require: { types: string; default: string };
    };
    expect(entry.import).toEqual({
      types: "./dist/src/index.d.ts",
      default: "./dist/index.es.js",
    });
    expect(entry.require).toEqual({
      types: "./dist/cjs-types/index.d.ts",
      default: "./dist/index.cjs",
    });
  });

  it("copies the declarations into a commonjs-typed folder", async () => {
    const {
      mkdtempSync,
      mkdirSync,
      writeFileSync,
      readFileSync: read,
      existsSync,
    } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const { writeCjsTypes } = await import("../scripts/cjs-types.mjs");
    const dist = mkdtempSync(join(tmpdir(), "cal-dist-"));
    mkdirSync(join(dist, "src", "types"), { recursive: true });
    writeFileSync(
      join(dist, "src", "index.d.ts"),
      'export * from "./types";\n',
    );
    writeFileSync(
      join(dist, "src", "types", "index.d.ts"),
      "export type A = 1;\n",
    );
    writeCjsTypes(dist);
    expect(read(join(dist, "cjs-types", "index.d.ts"), "utf8")).toBe(
      'export * from "./types";\n',
    );
    expect(existsSync(join(dist, "cjs-types", "types", "index.d.ts"))).toBe(
      true,
    );
    expect(
      JSON.parse(read(join(dist, "cjs-types", "package.json"), "utf8")),
    ).toEqual({
      type: "commonjs",
    });
  });

  it("runs the step in npm run build", () => {
    const scripts = (
      JSON.parse(
        readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
      ) as {
        scripts: Record<string, string>;
      }
    ).scripts;
    expect(scripts.build).toBe("vite build && node scripts/cjs-types.mjs");
  });
});
