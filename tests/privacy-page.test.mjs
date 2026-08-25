import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "privacy.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "legal-page.css"), "utf8");

test("privacy page follows the Figma composition", () => {
  const blocks = ["site-header", "articles-breadcrumb", "legal-hero", "legal-content", "site-footer"];
  let previousIndex = -1;

  for (const block of blocks) {
    const blockIndex = markup.indexOf(`class="${block}`);
    assert.ok(blockIndex > previousIndex, `${block} must follow the previous block`);
    previousIndex = blockIndex;
  }

  assert.match(markup, /<h1[^>]*>Политика конфиденциальности<\/h1>/);
  assert.equal((markup.match(/class="legal-content__section(?: |")/g) ?? []).length, 6);
  assert.equal((markup.match(/<h2>Гарантийные обязательства<\/h2>/g) ?? []).length, 3);
});

test("all legal pages share the responsive BEM implementation", () => {
  const legalPages = ["privacy.html", "consent.html", "agreement.html"];

  for (const page of legalPages) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="app\.css"/);
    assert.match(pageMarkup, /class="legal-page"/);
    assert.match(pageMarkup, /class="legal-hero page__container"/);
    assert.match(pageMarkup, /class="legal-content page__container"/);
  }

  assert.match(styles, /\.legal-hero\s*\{[^}]*width:\s*min\(1195px, var\(--container\)\)[^}]*min-height:\s*156px/s);
  assert.match(styles, /\.legal-content\s*\{[^}]*width:\s*min\(1060px, var\(--container\)\)[^}]*gap:\s*40px/s);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
});

test("privacy page uses exact local Figma assets and all resources resolve", () => {
  const checkIcon = readFileSync(resolve(projectRoot, "assets/legal-check.svg"), "utf8");

  assert.match(styles, /assets\/legal-check\.svg/);
  assert.match(styles, /\.legal-check-list li::before\s*\{[^}]*top:\s*0[^}]*left:\s*0[^}]*width:\s*24px[^}]*height:\s*24px[^}]*assets\/legal-check\.svg[^}]*background-size:\s*24px 24px/s);
  assert.doesNotMatch(styles, /\.legal-check-list li::after/);
  assert.match(checkIcon, /viewBox="0 0 24 24"/);
  assert.match(checkIcon, /d="M8 12L11 15L16 9"/);
  assert.doesNotMatch(markup + styles, /figma\.com\/api\/mcp\/asset/);

  const resources = [...(markup + styles).matchAll(/(?:href|src|srcset|url\()=["']?([^"')\s]+)|url\(["']?([^"')]+)["']?\)/g)]
    .map((match) => match[1] ?? match[2])
    .map((value) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:|mailto:|#)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("existing pages expose the privacy route from their legal footer", () => {
  const existingPages = [
    "index.html",
    "cars.html",
    "services.html",
    "brand.html",
    "promotions.html",
    "promotion-detail.html",
    "articles.html",
    "article-detail.html",
    "about.html",
    "contacts.html",
    "reviews.html",
    "client-zone.html",
    "branch.html",
    "service-detail.html",
    "3d-tour.html",
    "404.html",
    "consent.html",
    "agreement.html",
  ];

  for (const page of existingPages) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(
      pageMarkup,
      /href="privacy\.html">Политика конфиденциальности<\/a>/,
      `${page} must link to the privacy page`,
    );
  }
});
