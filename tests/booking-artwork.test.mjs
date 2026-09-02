import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");
const markup = readFileSync(resolve(projectRoot, "index.html"), "utf8");

test("booking artwork preserves the square Figma asset proportions", () => {
  assert.match(
    styles,
    /\.booking__bearing,\.booking__bolt,\.booking__vehicle\{height:auto;aspect-ratio:1\}/,
  );
});

test("mobile booking matches Figma node 339:22292 structure and spacing", () => {
  assert.match(markup, /class="booking layout-container"[^>]*data-node-id="339:22292"/);
  assert.match(markup, /class="booking__artwork" aria-hidden="true"/);
  assert.match(markup, /class="booking__bolt-motion" data-node-id="339:22245"/);
  assert.match(markup, /class="booking__bearing"[^>]*data-node-id="339:22246"/);
  assert.match(styles, /\.booking\{[^}]*min-height:799px[^}]*gap:40px[^}]*padding:20px[^}]*\}/);
  assert.match(styles, /\.booking-form\{gap:20px\}/);
  assert.match(styles, /\.booking-form__fields\{[^}]*gap:20px\}/);
});

test("mobile booking loops continuously and clips its artwork to the card", () => {
  assert.match(styles, /@keyframes mobile-bearing-turn\{from\{--booking-bearing-rotation:0turn\}to\{--booking-bearing-rotation:1turn\}\}/);
  assert.match(styles, /\.booking\{[^}]*min-height:799px[^}]*overflow:hidden\}/);
  assert.match(styles, /\.booking__bearing\{[^}]*top:663px[^}]*right:-63px[^}]*left:auto[^}]*width:197px[^}]*animation:mobile-bearing-turn 39\.123144s linear infinite\}/);
  assert.match(styles, /\.booking__artwork\{[^}]*inset:-1px -17px -1px -1px[^}]*overflow:hidden/);
  assert.match(styles, /@keyframes mobile-bolt-drift\{0%\{animation-timing-function:ease-in-out;translate:0 0\}50%,100%\{translate:0 -\.206px\}\}/);
  assert.match(styles, /\.booking__bolt-motion\{[^}]*top:685px[^}]*right:-28\.478px[^}]*left:auto[^}]*width:238\.478px[^}]*height:238\.478px[^}]*animation:mobile-bolt-drift 39\.123144s linear infinite\}/);
  assert.match(styles, /\.booking__bolt-motion \.booking__bolt\{[^}]*width:198\.254px[^}]*transform:rotate\(-76\.73deg\)[^}]*animation:none\}/);
  assert.match(styles, /@media \(prefers-reduced-motion:reduce\)[\s\S]*?\.booking__bolt-motion\{animation:none\}/);
});
