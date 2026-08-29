import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "article-detail.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "article-detail.css"), "utf8");
const articlesMarkup = readFileSync(resolve(projectRoot, "articles.html"), "utf8");

test("article detail follows the Figma section order", () => {
  const sections = ["article-hero", "article-layout", "related-articles", "faq-request", "site-footer"];
  let previousIndex = -1;

  for (const section of sections) {
    const sectionIndex = markup.indexOf(`class="${section}`);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }
});

test("article detail matches the desktop content composition", () => {
  assert.match(styles, /grid-template-columns:\s*minmax\(0, 925px\) minmax\(0, 655px\)/);
  assert.match(styles, /grid-template-columns:\s*minmax\(0, 1060px\) minmax\(320px, 520px\)/);
  assert.equal((markup.match(/class="article-content__section(?: |")/g) ?? []).length, 5);
  const tocMarkup = markup.slice(
    markup.indexOf('class="article-toc__list"'),
    markup.indexOf("</ol>", markup.indexOf('class="article-toc__list"')),
  );
  assert.equal((tocMarkup.match(/<li class="article-toc__list-item">/g) ?? []).length, 7);
  assert.equal((markup.match(/<article class="article-card">/g) ?? []).length, 3);
  assert.match(markup, /<h2>Главное в материале<\/h2>/);
  assert.match(markup, /<h2>Условия возврата<\/h2>/);
  assert.match(markup, /<h2>Что нельзя вернуть<\/h2>/);
});

test("article detail reuses shared project components and modules", () => {
  for (const component of ["site-header", "article-card", "faq-request", "request-card", "site-footer"]) {
    assert.match(markup, new RegExp(`class="${component}`));
  }
  assert.match(markup, /src="app\.js" defer/);
  assert.match(markup, /data-form="booking"/);
  assert.equal((articlesMarkup.match(/href="article-detail\.html">Читать статью<\/a>/g) ?? []).length, 12);
});

test("article detail has a fluid mobile reflow", () => {
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  assert.match(mobileStyles, /\.article-hero\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(mobileStyles, /\.article-layout\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(mobileStyles, /\.article-toc\s*\{[^}]*position:\s*relative[^}]*order:\s*-1[^}]*width:\s*100%/s);
  assert.match(mobileStyles, /\.article-detail-page \.faq-item__question\s*\{[^}]*min-height:\s*0/s);
  assert.match(mobileStyles, /\.related-articles__grid\s*\{[^}]*overflow-x:\s*auto/s);
});

test("article detail uses local assets and every local resource resolves", () => {
  assert.match(markup, /src="assets\/articles-card\.png"/);
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);

  const resources = [...markup.matchAll(/(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:|mailto:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});
