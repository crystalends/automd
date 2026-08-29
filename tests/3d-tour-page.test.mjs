import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "3d-tour.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "3d-tour-page.css"), "utf8");

test("3D tour page follows the Figma section order", () => {
  const sections = ["tour-hero", "virtual-tour", "team", "locations", "faq-request", "about-seo", "site-footer"];
  let previousIndex = -1;

  for (const section of sections) {
    const sectionIndex = markup.indexOf(`class="${section}`);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }
});

test("unique tour sections match the Figma composition", () => {
  assert.match(markup, /<h1[^>]*>Посмотрите техцентр AutoMD изнутри<\/h1>/);
  assert.match(markup, /<h2[^>]*>3D-тур по техцентру<\/h2>/);
  assert.equal((markup.match(/class="virtual-tour__tip"/g) ?? []).length, 3);
  assert.equal((markup.match(/class="virtual-tour__dot(?: |")/g) ?? []).length, 6);
  assert.match(styles, /\.virtual-tour\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.virtual-tour__image\s*\{[^}]*height:\s*290px/s);
});

test("page reuses existing project blocks and shared ESM", () => {
  assert.equal((markup.match(/<article class="team-card">/g) ?? []).length, 5);
  assert.equal((markup.match(/<article class="location-card">/g) ?? []).length, 2);
  assert.equal((markup.match(/<details class="faq-item">/g) ?? []).length, 8);
  assert.match(markup, /class="request-card"/);
  assert.match(markup, /href="app\.css"/);
  assert.match(markup, /src="app\.js" defer/);
});

test("tour layout is fluid and has a content-driven mobile reflow", () => {
  assert.match(styles, /--tour-section-gap:\s*clamp\(/);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);

  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  assert.match(mobileStyles, /\.virtual-tour\s*\{[^}]*margin-top:\s*40px/s);
  assert.match(mobileStyles, /\.tour-page \.team__grid\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s);
  assert.match(mobileStyles, /\.tour-page \.faq-request\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(mobileStyles, /\.tour-page \.request-card__fields\s*\{[^}]*grid-template-columns:\s*1fr/s);
});

test("Figma image is local and all local resources resolve", () => {
  assert.match(markup, /src="assets\/virtual-tour\.png"/);
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);

  const resources = [...markup.matchAll(/(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("all primary pages link to the 3D tour", () => {
  const primaryPages = ["index.html", "cars.html", "brand.html", "promotions.html", "promotion-detail.html", "about.html", "client-zone.html", "404.html"];

  for (const page of primaryPages) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="3d-tour\.html">3D-тур<\/a>/, `${page} must link to the 3D tour`);
  }
});
