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

test("home hero artwork scales from the 1920px reference composition", () => {
  const markup = read("index.html");
  const styles = read("styles.css");

  for (const [suffix, nodeId] of [
    ["8", "292:20714"],
    ["9", "292:20715"],
    ["12", "297:24336"],
    ["10", "292:20716"],
    ["11", "292:20717"],
  ]) {
    assert.match(
      markup,
      new RegExp(`class="hero__visual-blur hero__visual-blur--${suffix}"[^>]*data-node-id="${nodeId}"`),
    );
  }

  assert.match(
    styles,
    /@media \(min-width:768px\)[\s\S]*\.hero__visual\s*\{[^}]*aspect-ratio:999\/629[\s\S]*\.hero__visual-gear\s*\{[^}]*top:0[^}]*right:0[^}]*width:56\.256%[\s\S]*\.hero__visual-van\s*\{[^}]*top:19\.714%[^}]*left:0[^}]*width:84\.685%[^}]*height:80\.286%/,
  );
  assert.match(
    styles,
    /\.hero__visual-blur--8\{[^}]*top:50\.508558%[^}]*left:58\.524991%[^}]*width:55\.642042%[^}]*height:60\.184897%\}/,
  );
  assert.match(
    styles,
    /@media \(min-width:1200px\)[\s\S]*\.hero__visual\s*\{[^}]*top:calc\(6\.25vw - 140px\)[^}]*right:calc\(1\.615vw - \(100vw - var\(--container\)\)\/2\)[^}]*width:clamp\(519px,calc\(66\.667vw - 281px\),999px\)/,
  );
  assert.match(
    styles,
    /@media \(min-width:992px\) and \(max-width:1199px\)[\s\S]*\.hero__content\s*\{[^}]*display:grid[^}]*grid-template-columns:minmax\(0,620px\) minmax\(280px,1fr\)/,
  );
  assert.match(
    styles,
    /@media \(min-width:768px\) and \(max-width:991px\)[\s\S]*\.hero__content\s*\{[^}]*display:flex[^}]*flex-direction:column/,
  );
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
