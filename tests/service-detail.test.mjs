import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "service-detail.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "service-detail.css"), "utf8");

test("service detail page follows the Figma section order", () => {
  const sections = [
    "service-detail-hero",
    "service-detail-models",
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

test("service detail reuses established project components and ESM", () => {
  for (const component of [
    "brand-model-card",
    "service-price-list",
    "promo-banner__slider swiper",
    "brand-parts__grid",
    "team-card",
    "business-offer",
    "benefits-slider swiper",
    "faq-request",
    "site-footer",
  ]) {
    assert.match(markup, new RegExp(component.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(markup, /type="module" src="js\/main\.js"/);
  assert.match(markup, /data-models-toggle aria-expanded="false"/);
  assert.equal((markup.match(/<article class="brand-model-card/g) ?? []).length, 12);
  assert.equal((markup.match(/class="service-price-list__item"/g) ?? []).length, 12);
  assert.equal((markup.match(/class="team-card"/g) ?? []).length, 5);
});

test("service detail uses the exact local Figma assets", () => {
  for (const asset of [
    "brand-hero-pattern.png",
    "brand-hero-art.png",
    "brand-hero-wrench-mobile.png",
    "brand-hero-vehicle-mobile.png",
    "brand-model.png",
    "promo-tires.png",
    "business.jpg",
    "benefits.jpg",
    "faq-request-pattern.png",
  ]) {
    assert.match(markup, new RegExp(`assets/${asset.replace(".", "\\.")}`));
  }

  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
});

test("service detail is fluid and has a content-driven mobile layout", () => {
  assert.match(styles, /--brand-section-gap:\s*clamp\(/);
  assert.match(styles, /\.service-detail-symptoms\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:/s);
  assert.match(styles, /@media \(max-width: 767px\)/);
  assert.match(styles, /\.service-detail-hero__actions\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(styles, /\.service-detail-symptoms\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
});

test("service detail keeps mobile overrides scoped to its unique blocks", () => {
  assert.doesNotMatch(markup, /class="service-detail-parts__mobile-break"/);
  assert.match(styles, /\.service-detail-hero__actions\s*\{[^}]*align-items:\s*flex-start[^}]*gap:\s*20px/s);
  assert.match(styles, /\.service-detail-hero__actions \.brand-hero__button\s*\{[^}]*width:\s*261px/s);
  assert.match(styles, /\.service-detail-symptoms__visual\s*\{[^}]*height:\s*246px/s);
  assert.doesNotMatch(styles, /\.service-detail-page \.brand-model-card/);
  assert.doesNotMatch(styles, /\.service-detail-page \.service-price-list__item/);
  assert.doesNotMatch(styles, /\.service-detail-promo \.promo-banner__slider/);
  assert.doesNotMatch(styles, /\.service-detail-page \.brand-parts__grid/);
  assert.doesNotMatch(styles, /\.service-detail-page \.business-offer__visual/);
  assert.doesNotMatch(styles, /\.service-detail-page \.faq-item__question/);
  assert.doesNotMatch(styles, /\.service-detail-page \.service-detail-seo \.brand-seo__copy/);
  assert.doesNotMatch(styles, /\.service-detail-page \.site-footer__intro/);
});

test("all local service detail resources resolve", () => {
  const resources = [...markup.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("brand and services pages expose the service detail route", () => {
  for (const page of ["brand.html", "services.html"]) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="service-detail\.html"/);
  }
});
