import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");
const markup = read("model.html");
const styles = read("model-page.css");
const sceneStyles = read("model-service-detail.css");

test("model page follows Figma node 247:8585 section order", () => {
  const markers = [
    "brand-hero service-detail-hero model-service-hero",
    "model-actions layout-container",
    "brand-services layout-container",
    "brand-prices layout-container",
    "promo-banner layout-container",
    "brand-parts layout-container",
    "model-issues layout-container",
    "team layout-container",
    "benefits layout-container",
    "business-offer layout-container",
    "faq-request layout-container",
    "brand-seo layout-container",
  ];

  let previous = -1;
  for (const marker of markers) {
    const position = markup.indexOf(marker);
    assert.ok(position > previous, `${marker} is missing or out of order`);
    previous = position;
  }
});

test("model page reuses established project blocks and focused ESM", () => {
  for (const block of [
    "brand-service-card",
    "brand-price-row",
    "promo-banner__slider",
    "brand-parts__grid",
    "team-card",
    "benefits-slider",
    "business-offer",
    "faq-item",
    "request-card",
  ]) {
    assert.match(markup, new RegExp(`class="[^"]*${block}`));
  }

  assert.match(markup, /data-scroll-pagination="model-services-pagination"/);
  assert.match(markup, /data-form="booking"/);
  assert.match(markup, /<script src="app\.js" defer><\/script>/);
});

test("model hero reproduces Figma lighting group 298:25365", () => {
  assert.match(markup, /data-node-id="298:25365"/);
  assert.match(markup, /data-node-id="247:9499"/);
  assert.match(markup, /assets\/model-hero-glow-middle\.svg/);
  assert.match(markup, /assets\/brand-hero-wrench-mobile\.png/);
  assert.match(markup, /model-service-hero-scene__accent--short/);
  assert.match(markup, /model-service-hero-scene__accent--tall/);
  assert.match(sceneStyles, /\.model-service-hero-scene__glow--middle\s*\{[^}]*top:\s*263px[^}]*left:\s*min\(38\.958vw, 748px\)[^}]*rotate\(-20\.59deg\)/s);
  assert.match(sceneStyles, /\.model-service-hero-scene__wrench\s*\{[^}]*top:\s*262\.79px[^}]*left:\s*min\(76\.708vw, 1472\.79px\)/s);
  assert.match(sceneStyles, /\.model-service-hero-scene__wrench-image\s*\{[^}]*width:\s*72\.17%[^}]*rotate\(-33\.45deg\)/s);
});

test("model hero reproduces Figma mobile artwork group 348:36432", () => {
  assert.match(markup, /data-node-id="348:36432"/);
  assert.match(markup, /class="model-service-hero__mobile-wrench"/);
  assert.match(markup, /class="model-service-hero__mobile-vehicle-frame"/);
  assert.match(markup, /src="assets\/brand-hero-wrench-mobile\.png"/);
  assert.match(
    styles,
    /@media \(max-width: 767px\)[\s\S]*\.model-service-hero__mobile-wrench\s*\{[^}]*left:\s*min\(258\.8px, 66\.36vw\)[^}]*width:\s*min\(199\.42px, 51\.133vw\)/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 767px\)[\s\S]*\.model-service-hero__mobile-vehicle-frame\s*\{[^}]*left:\s*max\(-6\.51px, -1\.669vw\)[^}]*width:\s*min\(418px, 107\.18vw\)[^}]*height:\s*min\(249\.77px, 64\.044vw\)/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 1199px\) and \(min-width: 768px\)[\s\S]*\.model-page \.model-service-hero-scene__wrench,[\s\S]*\.model-page \.model-service-hero-scene__accent\s*\{[^}]*display:\s*none/s,
  );
});

test("model page reuses the shared promo slider and business offer from Figma", () => {
  assert.equal((markup.match(/class="promo-banner__slide[^\"]*swiper-slide/g) ?? []).length, 3);
  assert.match(markup, /class="promo-banner__pagination swiper-pagination"/);
  assert.match(markup, /src="assets\/promo-tires\.png"/);
  assert.match(markup, /data-node-id="247:10282"/);
  assert.equal((markup.match(/class="business-offer__audience-item"/g) ?? []).length, 6);
  assert.equal((markup.match(/class="business-offer__check-icon"/g) ?? []).length, 6);
  assert.match(markup, /AutoMD помогает компаниям быстрее возвращать автомобили в работу/);
  assert.doesNotMatch(styles, /\.model-page \.business-offer\s*\{[^}]*min-height:\s*0/s);
});

test("model business offer renders one Figma marker per item", () => {
  assert.equal((markup.match(/class="business-offer__user-icon"/g) ?? []).length, 6);
  assert.equal((markup.match(/class="business-offer__check-icon"/g) ?? []).length, 6);
  assert.match(
    styles,
    /\.model-page \.business-offer__audience-item,\s*\.model-page \.business-offer__feature\s*\{[^}]*padding-left:\s*0/s,
  );
  assert.match(
    styles,
    /\.model-page \.business-offer__audience \.business-offer__audience-item::before,\s*\.model-page \.business-offer__features \.business-offer__feature::before\s*\{[^}]*content:\s*none/s,
  );
});

test("unique model blocks match the Figma composition", () => {
  assert.equal((markup.match(/class="model-action-card"/g) ?? []).length, 6);
  assert.equal((markup.match(/class="model-issues__item"/g) ?? []).length, 10);
  assert.match(markup, /Что нужно сделать с \[Марка Модель\]\?/);
  assert.match(markup, /Типовые неисправности \[Марка Модель\]/);
  assert.match(styles, /\.model-actions__grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
  assert.match(styles, /\.model-issues__list\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s);
});

test("model page is fluid and has content-driven mobile layouts", () => {
  assert.doesNotMatch(styles, /\.model-actions\s*\{[^}]*\bheight:\s*\d+px/s);
  assert.doesNotMatch(styles, /\.model-issues\s*\{[^}]*\bheight:\s*\d+px/s);
  assert.doesNotMatch(styles, /\.model-issues__panel\s*\{[^}]*\bheight:\s*\d+px/s);
  assert.match(styles, /@media \(max-width: 767px\)[\s\S]*\.model-actions__grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(styles, /@media \(max-width: 767px\)[\s\S]*\.model-issues__list\s*\{[^}]*grid-template-columns:\s*1fr/s);
});

test("model page uses local assets and all local resources resolve", () => {
  const localSources = [...markup.matchAll(/(?:src|srcset)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((source) => !/^(?:https?:|data:)/u.test(source));

  for (const source of localSources) {
    assert.ok(existsSync(resolve(projectRoot, source)), `missing local resource ${source}`);
  }

  assert.ok(existsSync(resolve(projectRoot, "assets/model-issue-info.svg")));
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
  assert.match(read("brand.html"), /href="model\.html#services"/);
});
