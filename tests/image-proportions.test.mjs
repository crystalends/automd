import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");

test("responsive images preserve their intrinsic proportions", () => {
  assert.match(styles, /img\{display:block;max-width:100%;height:auto\}/);
});

test("service finder artwork keeps the square animated Figma frame", () => {
  assert.match(
    styles,
    /\.service-finder__decor\{[^}]*width:285px;[^}]*height:285px;[^}]*object-fit:cover;[^}]*animation:mobile-brake-spin 24s linear infinite/,
  );
});
