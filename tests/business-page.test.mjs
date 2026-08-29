import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "business.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "business-page.css"), "utf8");

test("business page follows the Figma section order", () => {
  const sections = [
    "business-hero",
    "business-audience",
    "vehicle-list",
    "brand-services",
    "work-modes",
    "team",
    "business-insights",
    "business-documents",
    "business-price-list",
    "business-seo",
    "faq-request",
    "site-footer",
  ];

  let previousIndex = -1;
  for (const section of sections) {
    const sectionIndex = markup.indexOf(`class="${section}`);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }
});

test("business page reuses established responsive components", () => {
  for (const component of [
    "site-header",
    "vehicle-list",
    "brand-services",
    "team",
    "faq-request",
    "request-card",
    "site-footer",
  ]) {
    assert.match(markup, new RegExp(`class="${component}`));
  }

  assert.equal((markup.match(/<article class="vehicle-card">/g) ?? []).length, 12);
  assert.equal((markup.match(/<article class="brand-service-card(?: |")/g) ?? []).length, 6);
  assert.equal((markup.match(/<article class="team-card">/g) ?? []).length, 5);
  assert.match(markup, /src="app\.js" defer/);
  assert.match(markup, /class="commercial-hero-scene hero-grid"/);
  assert.match(markup, /class="commercial-hero-scene__mobile-vehicle business-hero__vehicle-mobile"/);
});

test("business page has fluid, content-driven layouts", () => {
  assert.match(styles, /--business-section-gap:\s*clamp\(/);
  assert.match(styles, /\.business-audience__grid\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.business-hero\s*\{[^}]*min-height:\s*697px[^}]*padding-bottom:\s*80px/s);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);

  for (const selector of [
    "business-audience-card",
    "work-mode-card",
    "business-insights__panel",
    "business-insights__grid",
    "business-insight-card",
    "business-documents",
    "business-price-list__row",
    "business-seo",
  ]) {
    const rule = styles.match(new RegExp(`\\.${selector}\\s*\\{[^}]*\\}`, "s"))?.[0] ?? "";
    assert.doesNotMatch(rule, /[;{\s](?:min-|max-)?height:\s*\d+px/, `${selector} must grow with its content`);
  }

  const tabletStart = styles.indexOf("@media (max-width: 1199px)");
  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const tabletStyles = styles.slice(tabletStart, mobileStart);
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.ok(tabletStart >= 0, "tablet breakpoint must exist");
  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  assert.match(tabletStyles, /\.business-hero\s*\{[^}]*flex-direction:\s*column[^}]*min-height:\s*0/s);
  assert.match(tabletStyles, /\.business-page \.commercial-hero-scene__vehicle\s*\{[^}]*display:\s*none/s);
  assert.match(tabletStyles, /\.business-hero__vehicle-mobile\s*\{[^}]*display:\s*block[^}]*width:\s*min\(82vw, 674px\)[^}]*height:\s*auto[^}]*object-fit:\s*contain/s);
  assert.match(tabletStyles, /\.business-documents\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(mobileStyles, /\.business-audience__grid,[\s\S]*?display:\s*flex[\s\S]*?overflow-x:\s*auto/s);
  assert.match(mobileStyles, /\.business-page \.brand-services__grid\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s);
  assert.match(mobileStyles, /\.business-insights__grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.doesNotMatch(styles, /\.business-hero__vehicle-mobile\s*\{[^}]*transform:/s);
});

test("business insights match Figma node 267:29533", () => {
  assert.match(styles, /\.business-insights__panel\s*\{[^}]*display:\s*flex[^}]*padding:\s*20px/s);
  assert.match(styles, /\.business-insights__title\s*\{[^}]*margin:\s*0 0 20px[^}]*font-size:\s*32px[^}]*line-height:\s*38px/s);
  assert.match(styles, /\.business-insights__grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)[^}]*gap:\s*10px 20px/s);
  assert.match(styles, /\.business-insight-card\s*\{[^}]*padding:\s*20px[^}]*border-radius:\s*var\(--radius\)/s);
  assert.doesNotMatch(styles.match(/\.business-insights__panel\s*\{[^}]*\}/s)?.[0] ?? "", /(?:min-|max-)?height:/);
  assert.doesNotMatch(styles.match(/\.business-insights__grid\s*\{[^}]*\}/s)?.[0] ?? "", /(?:min-|max-)?height:|grid-template-rows:/);
  assert.doesNotMatch(styles.match(/\.business-insight-card\s*\{[^}]*\}/s)?.[0] ?? "", /(?:min-|max-)?height:/);
  assert.match(styles, /\.business-insight-card__title\s*\{[^}]*font-family:\s*inherit[^}]*font-size:\s*18px[^}]*font-weight:\s*400/s);
  assert.match(styles, /url\("assets\/business-insight-pattern\.png"\)/);
  assert.match(styles, /url\("assets\/business-insight-pattern-right\.png"\)/);
  assert.match(markup, /Автомобиль после ДТП или серьезной поломки/);
  assert.match(markup, /Поможем выстроить понятный график диагностики, ТО и ремонта <\/span><span class="business-insight-card__text-line">Нужны запчасти для нескольких машин/);
  assert.ok(existsSync(resolve(projectRoot, "assets/business-insight-pattern.png")));
  assert.ok(existsSync(resolve(projectRoot, "assets/business-insight-pattern-right.png")));

  assert.match(styles, /\.business-insight-card::after\s*\{[^}]*top:\s*0[^}]*bottom:\s*0[^}]*background:[^}]*195px auto/s);
});

test("business documents list matches Figma node 267:29475", () => {
  assert.equal((markup.match(/<li class="business-documents__item">/g) ?? []).length, 6);
  assert.match(styles, /\.business-documents__list\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column[^}]*gap:\s*20px/s);
  assert.match(styles, /\.business-documents__item\s*\{[^}]*padding:\s*0 0 5px[^}]*border-bottom:\s*1px solid var\(--muted\)[^}]*font-size:\s*20px[^}]*line-height:\s*1\.2/s);
  assert.doesNotMatch(styles, /\.business-documents__item \+ \.business-documents__item/);
  assert.match(styles, /\.business-documents__item:last-child\s*\{[^}]*border-bottom:\s*0/s);
});

test("business page uses local assets and all local resources resolve", () => {
  assert.match(markup, /class="commercial-hero-scene hero-grid"/);
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-pattern.png")));
  assert.match(markup, /src="assets\/about-hero-vehicle\.png"/);
  assert.match(markup, /src="assets\/business\.jpg"/);
  assert.doesNotMatch(markup, /business-hero-scene\.png/);
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);

  const resources = [...markup.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("existing primary pages expose the business route", () => {
  for (const page of [
    "index.html",
    "cars.html",
    "brand.html",
    "services.html",
    "service-detail.html",
    "model-service-detail.html",
    "prices.html",
    "about.html",
  ]) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="business\.html"[^>]*>Для юридических лиц<\/a>/, `${page} must link to business page`);
  }
});
