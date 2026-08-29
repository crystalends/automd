import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "agreement.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "legal-page.css"), "utf8");

test("agreement page follows the Figma composition", () => {
  const blocks = ["site-header", "articles-breadcrumb", "legal-hero", "legal-content", "site-footer"];
  let previousIndex = -1;

  for (const block of blocks) {
    const blockIndex = markup.indexOf(`class="${block}`);
    assert.ok(blockIndex > previousIndex, `${block} must follow the previous block`);
    previousIndex = blockIndex;
  }

  assert.match(markup, /<h1[^>]*>Пользовательское соглашение<\/h1>/);
  assert.equal((markup.match(/class="legal-content__section(?: |")/g) ?? []).length, 6);
  assert.equal((markup.match(/<h2>Гарантийные обязательства<\/h2>/g) ?? []).length, 3);
});

test("legal pages share one responsive BEM implementation", () => {
  const consentMarkup = readFileSync(resolve(projectRoot, "consent.html"), "utf8");

  for (const pageMarkup of [markup, consentMarkup]) {
    assert.match(pageMarkup, /href="app\.css"/);
    assert.match(pageMarkup, /class="legal-page"/);
    assert.match(pageMarkup, /class="legal-hero layout-container"/);
    assert.match(pageMarkup, /class="legal-content layout-container"/);
  }

  assert.match(styles, /\.legal-hero\s*\{[^}]*width:\s*min\(1195px, var\(--container\)\)[^}]*min-height:\s*156px/s);
  assert.match(styles, /\.legal-content\s*\{[^}]*width:\s*min\(1060px, var\(--container\)\)[^}]*gap:\s*40px/s);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
});

test("agreement uses exact local Figma assets and all resources resolve", () => {
  assert.match(styles, /assets\/legal-check\.svg/);
  assert.doesNotMatch(markup + styles, /figma\.com\/api\/mcp\/asset/);

  const resources = [...(markup + styles).matchAll(/(?:href|src|srcset|url\()=["']?([^"')\s]+)|url\(["']?([^"')]+)["']?\)/g)]
    .map((match) => match[1] ?? match[2])
    .map((value) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:|mailto:|#)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("existing pages expose the agreement route from their legal footer", () => {
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
    "consent.html",
    "privacy.html",
  ];

  for (const page of existingPages) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(
      pageMarkup,
      /href="agreement\.html">Пользовательское соглашение<\/a>/,
      `${page} must link to the agreement page`,
    );
  }
});
