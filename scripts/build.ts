/// <reference lib="deno.ns" />

import { build, type BuildOptions, emptyDir } from "@deno/dnt";

import denoJson from "../deno.json" with { type: "json" };

const { name, description, version, license } = denoJson;
const packageJson: BuildOptions["package"] = {
  name,
  description,
  version,
  license,
  repository: {
    type: "git",
    url: "git+https://github.com/Seelen-Corp/sl-translation-toolkit.git",
  },
  bugs: {
    url: "https://github.com/Seelen-Corp/sl-translation-toolkit/issues",
  },
};

await emptyDir("./npm");

await build({
  typeCheck: "both",
  compilerOptions: {
    lib: ["DOM", "DOM.Iterable", "ESNext"],
    target: "ES2023",
  },
  test: false,
  entryPoints: [{
    name: ".",
    path: "./src/lib.ts",
  }],
  outDir: "./npm",
  shims: {},
  importMap: "deno.json",
  package: packageJson,
  postBuild(): void {
    Deno.copyFileSync("license.md", "npm/license.md");
    Deno.copyFileSync("readme.md", "npm/readme.md");
  },
});
