import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "client-zone.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "client-zone-page.css"), "utf8");

test("client zone page follows the Figma section order", () => {
  const sections = [
    "client-zone-hero",
    "client-zone-amenities",
    "locations",
    "benefits",
    "faq-request",
    "about-seo",
    "site-footer",
  ];

  let previousIndex = -1;
  for (const section of sections) {
    const sectionIndex = markup.indexOf(`class="${section}`);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }
});

test("unique client zone content matches the Figma composition", () => {
  assert.match(markup, /<h1[^>]*>Клиентская зона AutoMD<\/h1>/);
  assert.equal((markup.match(/<article class="client-zone-card">/g) ?? []).length, 8);
  assert.equal((markup.match(/<li>/g) ?? []).length, 6);
  assert.match(styles, /grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(styles, /\.client-zone-card\s*\{[^}]*height:\s*368px/s);
  assert.match(styles, /\.client-zone-card__image\s*\{[^}]*height:\s*290px/s);
});

test("page reuses existing responsive components and shared ESM", () => {
  for (const component of ["locations", "location-card", "benefits", "faq-request", "request-card", "site-footer"]) {
    assert.match(markup, new RegExp(`class="[^"]*${component}`));
  }
  assert.match(markup, /href="app\.css"/);
  assert.match(markup, /type="module" src="js\/main\.js"/);
});

test("locations use the existing embedded Yandex map", () => {
  assert.match(markup, /<iframe[\s\S]*?class="locations__map"/);
  assert.match(markup, /src="https:\/\/yandex\.ru\/map-widget\/v1\//);
  assert.match(markup, /title="Яндекс Карта расположения техцентров AutoMD в Москве"/);
  assert.doesNotMatch(markup, /class="locations__map"[^>]*src="assets\/map\.png"/);
});

test("client zone layout is fluid and scrollable on mobile", () => {
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
  assert.match(styles, /@media \(max-width: 767px\)/);

  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.match(mobileStyles, /\.client-zone-amenities__grid\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto[^}]*scroll-snap-type:\s*x mandatory/s);
  assert.match(mobileStyles, /\.client-zone-card\s*\{[^}]*flex:\s*0 0 100%[^}]*scroll-snap-align:\s*start/s);
  assert.match(mobileStyles, /\.client-zone-hero__benefits li\s*\{[^}]*width:\s*100%/s);
});

test("Figma images are local and every local resource resolves", () => {
  for (const asset of [
    "client-zone-service.png",
    "client-zone-manager.png",
    "client-zone-status.png",
    "client-zone-parts.png",
    "client-zone-diagnostics.png",
  ]) {
    assert.match(markup, new RegExp(`assets/${asset.replace(".", "\\.")}`));
    assert.ok(existsSync(resolve(projectRoot, "assets", asset)));
  }

  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
  assert.doesNotMatch(markup, /Рыбатекст|Сео текст/);

  const resources = [...markup.matchAll(/(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("primary pages link to the client zone", () => {
  for (const page of ["index.html", "cars.html", "brand.html", "promotions.html", "promotion-detail.html", "about.html", "404.html"]) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="client-zone\.html">Клиентская зона<\/a>/, `${page} must link to client zone`);
  }
});
