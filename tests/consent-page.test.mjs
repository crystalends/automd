import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "consent.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "legal-page.css"), "utf8");

test("consent page follows the Figma composition", () => {
  const sections = ["site-header", "articles-breadcrumb", "legal-hero", "legal-content", "site-footer"];
  let previousIndex = -1;

  for (const section of sections) {
    const sectionIndex = markup.indexOf(`class="${section}`);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous block`);
    previousIndex = sectionIndex;
  }

  assert.match(markup, /<h1[^>]*>Согласие на обработку данных<\/h1>/);
  assert.equal((markup.match(/class="legal-content__section(?: |")/g) ?? []).length, 6);
  assert.equal((markup.match(/<h2>Гарантийные обязательства<\/h2>/g) ?? []).length, 3);
});

test("consent page reuses shared components and exact local Figma assets", () => {
  for (const component of ["site-header", "articles-hero-scene", "articles-breadcrumb", "site-footer"]) {
    assert.match(markup, new RegExp(`class="${component}`));
  }

  assert.match(styles, /assets\/legal-check\.svg/);
  assert.doesNotMatch(markup + styles, /figma\.com\/api\/mcp\/asset/);
  assert.match(markup, /src="app\.js" defer/);
});

test("consent desktop geometry and mobile layout are content-driven", () => {
  assert.match(styles, /\.legal-hero\s*\{[^}]*width:\s*min\(1195px, var\(--container\)\)[^}]*min-height:\s*156px/s);
  assert.match(styles, /\.legal-content\s*\{[^}]*width:\s*min\(1060px, var\(--container\)\)[^}]*gap:\s*40px[^}]*margin-top:\s*40px/s);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);

  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);
  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  assert.match(mobileStyles, /\.legal-hero\s*\{[^}]*min-height:\s*0/s);
  assert.match(mobileStyles, /\.legal-content__section--highlights,[\s\S]*min-height:\s*0/s);
});

test("all consent page local resources resolve", () => {
  const resources = [...(markup + styles).matchAll(/(?:href|src|srcset|url\()=["']?([^"')\s]+)|url\(["']?([^"')]+)["']?\)/g)]
    .map((match) => match[1] ?? match[2])
    .map((value) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:|mailto:|#)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("existing pages expose the consent route from their legal footer", () => {
  const existingPages = [
    "index.html",
    "cars.html",
    "services.html",
    "brand.html",
    "promotions.html",
    "articles.html",
    "about.html",
    "contacts.html",
    "reviews.html",
    "client-zone.html",
    "3d-tour.html",
    "404.html",
    "agreement.html",
    "privacy.html",
  ];

  for (const page of existingPages) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(
      pageMarkup,
      /href="consent\.html">Согласие на обработку персональных данных<\/a>/,
      `${page} must link to the consent page`,
    );
  }
});
