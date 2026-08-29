import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "articles.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "articles-page.css"), "utf8");
const sharedStyles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");
const filterModule = readFileSync(resolve(projectRoot, "js/modules/article-filter.js"), "utf8");
const mainModule = readFileSync(resolve(projectRoot, "js/main.js"), "utf8");

test("articles page keeps the Figma desktop section order", () => {
  const sections = ["articles-hero", "article-filter", "articles-catalog", "faq-request", "articles-seo"];
  let previousIndex = -1;

  for (const section of sections) {
    const sectionIndex = markup.indexOf(`class="${section}`);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }
});

test("articles catalog matches the Figma card composition", () => {
  assert.equal((markup.match(/<article class="article-card"/g) ?? []).length, 12);
  assert.equal((markup.match(/class="article-filter__button/g) ?? []).length, 7);
  assert.match(styles, /\.articles-catalog__grid\s*\{[^}]*repeat\(3, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.article-card\s*\{[^}]*min-height:\s*391px/s);
  assert.match(styles, /aspect-ratio:\s*520 \/ 210/);
  assert.match(styles, /\.article-filter\s*\{[^}]*min-height:\s*72px/s);
});

test("hero background keeps both Figma fade ellipses above the grid pattern", () => {
  const patternIndex = markup.indexOf("articles-hero-scene hero-grid");
  const rightGlowIndex = markup.indexOf("articles-hero-scene__glow--right");
  const leftGlowIndex = markup.indexOf("articles-hero-scene__glow--left");

  assert.ok(patternIndex >= 0);
  assert.ok(rightGlowIndex > patternIndex);
  assert.ok(leftGlowIndex > rightGlowIndex);
  assert.match(sharedStyles, /\.hero-grid::before\s*\{[^}]*z-index:0[^}]*hero-grid-light-soft\.svg[^}]*hero-grid-light-paper\.svg[^}]*hero-pattern\.png/s);
  assert.match(styles, /\.articles-hero-scene__glow\s*\{[^}]*z-index:\s*1/s);
  assert.match(styles, /\.articles-hero-scene__glow--right\s*\{[^}]*top:\s*304px[^}]*width:\s*1316\.58px[^}]*height:\s*531\.412px/s);
  assert.match(styles, /\.articles-hero-scene__glow--left\s*\{[^}]*top:\s*439px[^}]*width:\s*1017px[^}]*height:\s*341\.138px/s);
});

test("articles layout is responsive without locking the viewport", () => {
  const tabletStart = styles.indexOf("@media (max-width: 1199px)");
  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const tabletStyles = styles.slice(tabletStart, mobileStart);
  const mobileStyles = styles.slice(mobileStart);

  assert.doesNotMatch(styles, /min-width:\s*1920px/);
  assert.match(tabletStyles, /\.articles-catalog__grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(mobileStyles, /\.articles-catalog__grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(mobileStyles, /\.article-filter\s*\{[^}]*overscroll-behavior-inline:\s*contain/s);
  assert.match(mobileStyles, /\.articles-page \.page__container,[\s\S]*?width:\s*calc\(100vw - 32px\)/);
});

test("article filter is accessible and initialized defensively", () => {
  assert.match(markup, /data-article-filter role="group" aria-label="[^"]+"/);
  assert.match(markup, /data-article-filter-status aria-live="polite"/);
  assert.match(filterModule, /if \(!root\) return/);
  assert.match(filterModule, /card\.hidden = !isVisible/);
  assert.match(filterModule, /setAttribute\("aria-pressed"/);
  assert.match(mainModule, /import \{ initArticleFilter \}/);
  assert.match(mainModule, /initArticleFilter\(\)/);
});

test("articles page uses local assets and all local resources resolve", () => {
  assert.match(markup, /src="assets\/articles-card\.png"/);
  assert.match(markup, /class="articles-hero-scene hero-grid"/);
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-pattern.png")));
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-grid-light-soft.svg")));
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-grid-light-paper.svg")));
  assert.match(markup, /src="assets\/articles-glow-right\.svg"/);
  assert.match(markup, /src="assets\/articles-glow-left\.svg"/);
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);

  const resources = [...markup.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map(([, value]) => value.split("#")[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("existing primary pages expose the articles route", () => {
  for (const page of ["index.html", "cars.html", "404.html", "promotion-detail.html"]) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="articles\.html">Статьи<\/a>/, `${page} must link to articles`);
  }
});
