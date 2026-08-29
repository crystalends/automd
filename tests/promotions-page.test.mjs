import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "promotions.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "promotions-page.css"), "utf8");
const sharedStyles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");

test("promotions page keeps the Figma desktop section order", () => {
  const sections = [
    "promotions-hero",
    "promotions-catalog",
    "special-offers",
    "faq-request",
    "promotions-seo",
  ];

  let previousIndex = -1;
  for (const section of sections) {
    const sectionIndex = markup.indexOf(`class="${section}`);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }
});

test("promotions catalog and special offers match the Figma composition", () => {
  assert.equal((markup.match(/<article class="promotion-card">/g) ?? []).length, 16);
  assert.equal((markup.match(/<article class="special-offer-card">/g) ?? []).length, 2);
  assert.match(styles, /\.promotions-catalog__grid\s*\{[^}]*repeat\(4, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.special-offers__grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.promotion-card\s*\{[^}]*min-height:\s*371px/s);
  assert.match(styles, /\.special-offer-card\s*\{[^}]*min-height:\s*340px/s);
});

test("desktop layout stays fluid without a viewport width lock", () => {
  assert.match(styles, /--promotions-section-gap:\s*clamp\(/);
  assert.match(styles, /aspect-ratio:\s*385 \/ 190/);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
  assert.doesNotMatch(styles, /\.promotions-page\s*\{[^}]*min-width:\s*1200px/s);
});

test("mobile layout reflows unique and reused sections", () => {
  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  assert.match(mobileStyles, /\.promotions-page \.layout-container,[\s\S]*?width:\s*calc\(100vw - 32px\)/);
  assert.match(mobileStyles, /\.promotions-catalog__grid\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto[^}]*scroll-snap-type:\s*x mandatory/s);
  assert.match(mobileStyles, /\.promotion-card\s*\{[^}]*flex:\s*0 0 100%[^}]*scroll-snap-align:\s*start/s);
  assert.match(mobileStyles, /\.special-offer-card\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(mobileStyles, /\.faq-request\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(mobileStyles, /\.request-card__fields\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(mobileStyles, /\.request-card\s*\{[^}]*min-height:\s*auto/s);
});

test("promotions hero reuses the home page grid primitive", () => {
  assert.match(markup, /class="promotions-hero-scene hero-grid"/);
  assert.doesNotMatch(markup, /promotions-hero-scene__pattern/);
  assert.doesNotMatch(styles, /promotions-hero-scene__pattern/);
  assert.doesNotMatch(markup, /hero-scene__glow/);
  assert.match(sharedStyles, /\.hero-grid::before\s*\{[^}]*hero-grid-light-soft\.svg[^}]*hero-grid-light-paper\.svg[^}]*hero-pattern\.png/s);
});

test("promotions page uses local Figma assets and all local resources resolve", () => {
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-pattern.png")));
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-grid-light-soft.svg")));
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-grid-light-paper.svg")));
  assert.match(markup, /src="assets\/promotions-card\.png"/);
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);

  const resources = [...markup.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map(([, value]) => value.split("#")[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("site navigation exposes the new promotions page", () => {
  for (const page of ["index.html", "cars.html", "brand.html", "404.html"]) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="promotions\.html">Акции<\/a>/, `${page} must link to promotions`);
  }
});
