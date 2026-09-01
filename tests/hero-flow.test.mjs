import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");

test("mobile home hero visual follows copy height", () => {
  const markup = read("index.html");
  const styles = read("styles.css");

  assert.ok(markup.indexOf('class="hero__visual"') > markup.indexOf('class="hero__copy"'));
  assert.match(styles, /\.hero-scene__gear,\.hero-scene__van\{display:none\}/);
  assert.match(styles, /\.hero__content\{[^}]*display:flex[^}]*flex-direction:column[^}]*padding-bottom:0\}/);
  assert.match(styles, /\.hero__visual\{position:relative;display:block[^}]*height:min\(226px,57\.949vw\)/);
});

test("home hero gear keeps the same rotation speed on desktop and mobile", () => {
  const styles = read("styles.css");

  assert.match(styles, /\.hero-scene__gear\{[^}]*animation:hero-gear-rotation 24s linear infinite/);
  assert.match(styles, /\.hero__visual-gear\{[^}]*animation:hero-gear-rotation 24s linear infinite/);
});

test("mobile vehicle heroes keep their artwork in content flow", () => {
  const cases = [
    ["cars.html", "cars-page.css", "cars-hero__visual"],
    ["brand.html", "brand-page.css", "brand-hero-scene__mobile-art"],
    ["parts.html", "parts-page.css", "parts-hero__visual"],
    ["services.html", "services-page.css", "services-hero__visual"],
  ];

  for (const [markupFile, stylesFile, visualClass] of cases) {
    const markup = read(markupFile);
    const styles = read(stylesFile);
    assert.match(markup, new RegExp(`class="${visualClass}`));
    assert.match(styles, new RegExp(`\\.${visualClass}\\s*\\{[^}]*position:\\s*relative`, "s"));
  }
});
