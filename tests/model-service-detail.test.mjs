import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "model-service-detail.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "model-service-detail.css"), "utf8");

test("model service detail follows the Figma section order", () => {
  const sections = [
    "model-service-hero",
    "model-service-summary",
    "service-prices",
    "service-detail-promo",
    "service-detail-parts",
    "service-detail-symptoms",
    "team",
    "benefits",
    "business-offer",
    "faq-request",
    "service-detail-seo",
    "site-footer",
  ];

  let previousIndex = -1;
  for (const section of sections) {
    const escapedSection = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sectionIndex = markup.search(new RegExp(`<(?:section|footer) class="[^"]*\\b${escapedSection}\\b`));
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }
});

test("model-specific hero and service summary match the Figma content", () => {
  assert.match(markup, /\[Услуга\] \[Марка Модель\] в Москве/);
  assert.match(markup, /Ориентировочные цены до визита/);
  assert.equal((markup.match(/class="brand-hero__advantage"/g) ?? []).length, 5);
  assert.match(markup, /Когда нужна \[услуга\] \[Марка Модель\]/);
  assert.match(markup, /Описать проблему мастеру/);
  assert.doesNotMatch(markup, /class="brand-models service-detail-models/);
});

test("model service detail reuses established responsive components", () => {
  for (const component of [
    "service-price-list",
    "promo-banner__slider swiper",
    "brand-parts__grid",
    "service-detail-symptoms",
    "team-card",
    "benefits-slider swiper",
    "business-offer",
    "faq-request",
    "site-footer",
  ]) {
    assert.match(markup, new RegExp(component.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(markup, /src="app\.js" defer/);
  assert.equal((markup.match(/class="service-price-list__item"/g) ?? []).length, 12);
  assert.equal((markup.match(/class="team-card"/g) ?? []).length, 5);
});

test("model service detail keeps all Figma assets local", () => {
  for (const asset of [
    "model-service-hero-vehicle.png",
    "brand-advantage-wallet.svg",
    "business.jpg",
    "benefits.jpg",
    "faq-request-pattern.png",
  ]) {
    assert.match(markup, new RegExp(`assets/${asset.replace(".", "\\.")}`));
  }

  assert.match(markup, /class="promo-banner__slide promo-banner__slide--tires/);
  assert.doesNotMatch(markup, /assets\/promo-tires\.png/);

  assert.match(markup, /class="brand-hero-scene model-service-hero-scene hero-grid"/);
  assert.equal((markup.match(/class="model-service-hero-scene__glow /g) ?? []).length, 4);
  assert.match(markup, /assets\/model-hero-glow-middle\.svg/);
  assert.match(markup, /class="model-service-hero-scene__vehicle" data-node-id="253:10747"/);
  assert.doesNotMatch(markup, /model-service-hero-scene__(?:wrench|accent)/);
  assert.match(styles, /\.model-service-hero-scene__vehicle-image\s*\{[^}]*top:\s*-6\.41%[^}]*left:\s*4\.38%[^}]*width:\s*95\.62%[^}]*height:\s*112\.82%/s);
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-pattern.png")));

  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
});

test("model service layout is fluid and has a mobile reflow", () => {
  assert.match(styles, /\.model-service-summary\s*\{[^}]*display:\s*flex/s);
  assert.match(styles, /\.model-service-summary > \*\s*\{[^}]*width:\s*min\(1060px, 100%\)/s);
  assert.match(styles, /@media \(max-width: 767px\)/);
  assert.match(styles, /\.model-service-hero__mobile-art\s*\{[^}]*display:\s*block/s);
  assert.match(styles, /\.model-service-summary\s*\{[^}]*width:\s*auto/s);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
});

test("all local model service resources resolve", () => {
  const resources = [...markup.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("the parent service page exposes the model-specific route", () => {
  const parentMarkup = readFileSync(resolve(projectRoot, "service-detail.html"), "utf8");
  assert.match(parentMarkup, /href="model-service-detail\.html"/);
});
