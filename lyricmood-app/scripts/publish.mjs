// Copies the static export (out/) into ../lyricmood so GitHub Pages serves it
// at https://matheoguz.github.io/lyricmood/ — no build step needed on GitHub's side.
import { cpSync, existsSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const out = resolve("out");
const target = resolve("..", "lyricmood");
const repoRoot = resolve("..");

if (!existsSync(out)) throw new Error("Run `next build` first: out/ is missing.");

function walk(dir, fn) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, fn);
    else fn(p, name);
  }
}

// GitHub Pages serves extensionless files as octet-stream, which social apps reject for previews.
const IMAGE_ROUTES = ["opengraph-image"];
walk(out, (p, name) => {
  if (IMAGE_ROUTES.includes(name)) renameSync(p, p + ".png");
});
walk(out, (p, name) => {
  if (!/\.(html|txt|webmanifest)$/.test(name)) return;
  const src = readFileSync(p, "utf8");
  const next = src.replace(/(opengraph-image)(?=[?"])/g, "$1.png");
  if (next !== src) writeFileSync(p, next);
});

rmSync(target, { recursive: true, force: true });
cpSync(out, target, { recursive: true });

// Jekyll (GitHub Pages default) ignores folders starting with "_" such as _next/.
if (!existsSync(join(repoRoot, ".nojekyll"))) writeFileSync(join(repoRoot, ".nojekyll"), "");

console.log(`✓ Published static site to ${target}`);
