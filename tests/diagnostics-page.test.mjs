import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "diagnostics.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "diagnostics-page.css"), "utf8");
const sharedStyles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");
const buildScript = readFileSync(resolve(projectRoot, "scripts/build-css.mjs"), "utf8");

const getRule = (selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return styles.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "s"))?.[1] ?? "";
};

test("diagnostics page follows Figma node 256:19429 section order", () => {
  const sections = [
    "diagnostics-hero",
    "diagnostics-picker",
    "diagnostics-types",
    "diagnostics-need",
    "diagnostics-process",
    "diagnostics-vehicles",
    "service-detail-promo",
    "service-prices",
    "diagnostics-parts",
    "team",
    "benefits",
    "business-offer",
    "related-services",
    "faq-request",
    "service-detail-seo",
    "site-footer",
  ];

  let previousIndex = -1;
  for (const section of sections) {
    const sectionIndex = markup.indexOf(section);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }
});

test("diagnostics page reproduces the Figma content and composition", () => {
  assert.match(markup, /Диагностика автомобиля в Москве/);
  assert.match(markup, /Диагностика для вашего автомобиля/);
  assert.match(markup, /Какие виды диагностики выполняем/);
  assert.equal((markup.match(/class="diagnostics-type-card(?: |")/g) ?? []).length, 6);
  assert.equal((markup.match(/class="diagnostics-process__grid"/g) ?? []).length, 1);
  assert.equal((markup.match(/<article class="diagnostics-vehicle-card"/g) ?? []).length, 11);
  assert.equal((markup.match(/class="service-price-list__item"/g) ?? []).length, 12);
  assert.equal((markup.match(/class="related-service-card"/g) ?? []).length, 6);
});

test("diagnostics page reuses established responsive project blocks", () => {
  for (const component of [
    "services-hero-scene",
    "service-finder",
    "promo-banner__slider swiper",
    "service-price-list",
    "team-card",
    "benefits-slider swiper",
    "business-offer",
    "faq-request",
    "site-footer",
  ]) {
    assert.match(markup, new RegExp(component.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(markup, /type="module" src="js\/main\.js"/);
  assert.match(buildScript, /diagnostics-page\.css/);
});

test("diagnostics-specific content cards have no hard pixel height", () => {
  for (const selector of [
    ".diagnostics-type-card",
    ".diagnostics-need__signs",
    ".diagnostics-process__grid li",
    ".diagnostics-vehicle-card",
    ".related-service-card",
  ]) {
    const rule = getRule(selector);
    assert.ok(rule, `Missing rule for ${selector}`);
    assert.doesNotMatch(rule, /(?:^|[;\\s])(?:min-|max-)?height:\s*\d+px/);
  }

  assert.match(styles, /\.diagnostics-page \.team-card,[\s\S]*height:\s*auto;[\s\S]*min-height:\s*0;/);
  assert.match(styles, /\.diagnostics-vehicle-card img\s*\{[^}]*aspect-ratio:\s*21 \/ 20/s);
});

test("diagnostics layout reflows without a fixed desktop canvas", () => {
  assert.match(styles, /--diagnostics-section-gap:\s*clamp\(/);
  assert.match(styles, /\.diagnostics-types__grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
  assert.match(styles, /\.diagnostics-process__grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,/s);
  assert.match(styles, /@media \(max-width: 767px\)/);
  assert.match(markup, /services-hero__visual diagnostics-hero__visual/);
  assert.match(markup, /services-hero__image diagnostics-hero__image/);
  assert.match(styles, /\.diagnostics-hero__visual\s*\{[^}]*aspect-ratio:\s*359 \/ 214\.514/s);
  assert.match(styles, /\.diagnostics-picker__form,[\s\S]*grid-template-columns:\s*1fr/s);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
});

test("diagnostics mobile hero follows Figma node 353:27276", () => {
  assert.match(styles, /\.diagnostics-page \.services-breadcrumb\s*\{[^}]*margin-top:\s*10px;[^}]*line-height:\s*1;/s);
  assert.match(styles, /\.diagnostics-hero__content\s*\{[^}]*gap:\s*40px;/s);
  assert.match(styles, /\.diagnostics-hero__content \.services-hero__intro\s*\{[^}]*gap:\s*20px;/s);
  assert.match(styles, /\.diagnostics-hero__content \.services-hero__description\s*\{[^}]*line-height:\s*19px;/s);
  assert.match(styles, /\.diagnostics-hero__actions\s*\{[^}]*width:\s*min\(305px, 100%\);[^}]*align-items:\s*flex-start;/s);
  assert.match(styles, /\.diagnostics-hero__actions \.button,[\s\S]*min-height:\s*56px;[\s\S]*font-size:\s*16px;/s);
  assert.match(styles, /\.diagnostics-hero__actions \.button\s*\{[^}]*width:\s*100%;/s);
  assert.match(styles, /\.diagnostics-hero__actions \.brand-outline-button\s*\{[^}]*width:\s*min\(253px, 100%\);/s);
  assert.match(styles, /\.diagnostics-hero__visual\s*\{[^}]*width:\s*92\.0513vw;[^}]*margin:\s*-0\.686px 0 0 25\.8974vw;/s);
  assert.doesNotMatch(getRule(".diagnostics-hero__visual"), /height:\s*\d+px/);
});

test("diagnostics hero reuses the home page grid primitive", () => {
  assert.match(markup, /class="services-hero-scene diagnostics-hero-scene hero-grid"/);
  assert.doesNotMatch(markup, /services-hero-scene__pattern/);
  assert.doesNotMatch(styles, /diagnostics-hero-grid/);
  assert.doesNotMatch(styles, /services-hero-scene::(?:before|after)/);
  assert.match(sharedStyles, /\.hero-grid::before\s*\{[^}]*hero-grid-light-soft\.svg[^}]*hero-grid-light-paper\.svg[^}]*hero-pattern\.png/s);
});

test("diagnostics uses local exact Figma assets and all resources resolve", () => {
  for (const asset of [
    "services-hero.png",
    "diagnostics-computer.png",
    "diagnostics-engine.png",
    "diagnostics-suspension.png",
    "diagnostics-brakes.png",
    "diagnostics-fuel.png",
    "diagnostics-electrical.png",
    "promo-tires.png",
    "benefits.jpg",
    "business.jpg",
  ]) {
    assert.match(markup, new RegExp(`assets/${asset.replace(".", "\\.")}`));
  }

  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);

  const resources = [...markup.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});
