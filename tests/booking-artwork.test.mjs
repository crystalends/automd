import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");

test("booking artwork preserves the square Figma asset proportions", () => {
  assert.match(
    styles,
    /\.booking__bearing,\.booking__bolt,\.booking__vehicle\{height:auto;aspect-ratio:1\}/,
  );
});
