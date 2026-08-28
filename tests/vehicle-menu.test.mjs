import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");

test("shared entrypoints initialize the vehicle dropdown", () => {
  for (const file of ["js/main.js", "js/error-page.js"]) {
    const source = read(file);
    assert.match(source, /import \{ initVehicleMenu \} from "\.\/modules\/vehicle-menu\.js";/);
    assert.match(source, /initVehicleMenu\(\);/);
  }
});

test("vehicle dropdown reuses every local brand asset from the Figma menu", () => {
  const source = read("js/modules/vehicle-menu.js");

  for (const brand of ["fiat", "ford", "peugeot", "citroen", "iveco", "renault", "jac", "sollers", "mercedes"]) {
    assert.match(source, new RegExp(`assets/car-logo-${brand}\\.png`));
  }

  assert.match(source, /assets\/hero-vehicles\.png/);
  assert.doesNotMatch(source, /figma\.com\/api\/mcp\/asset/);
});

test("vehicle dropdown supports hover and keyboard interaction", () => {
  const source = read("js/modules/vehicle-menu.js");

  assert.doesNotMatch(source, /vehicle-menu__item--current|current:\s*true/);
  assert.match(source, /addEventListener\("mouseenter", open\)/);
  assert.match(source, /addEventListener\("mouseleave", scheduleClose\)/);
  assert.match(source, /addEventListener\("focus", open\)/);
  assert.match(source, /event\.key !== "Escape"/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /toggleAttribute\("inert", !nextOpen\)/);
});

test("vehicle dropdown keeps the desktop Figma geometry and mobile fallback", () => {
  const styles = read("styles.css");

  assert.match(styles, /\.site-header\.site-header--vehicle-menu-ready\.site-header--vehicles-open\{z-index:100\}/);
  assert.doesNotMatch(styles, /\.site-header--vehicles-open \.site-header__main/);
  assert.match(styles, /\.vehicle-menu\{[^}]*isolation:isolate[^}]*top:calc\(100% \+ 10px\)[^}]*height:382px[^}]*padding:40px[^}]*border-radius:20px[^}]*background-color:#fff/s);
  assert.match(styles, /\.vehicle-menu::before\{[^}]*height:11px[^}]*content:""/);
  assert.doesNotMatch(styles, /\.vehicle-menu::before\{[^}]*background/);
  assert.doesNotMatch(styles, /\.vehicle-menu\{[^}]*(?:opacity|backdrop-filter|background:[^;}]*rgba)/s);
  assert.match(styles, /\.vehicle-menu__grid\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)[^}]*grid-template-rows:repeat\(2,141px\)[^}]*gap:20px/s);
  assert.match(styles, /\.vehicle-menu__item:hover \.vehicle-menu__label,[^{]+\{[^}]*border-bottom:1px solid var\(--blue\)[^}]*color:var\(--blue\)/s);
  assert.match(styles, /@media \(max-width:1199px\)\{\.vehicle-menu\{display:none\}\}/);
});
