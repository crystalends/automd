import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "brand.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "brand-page.css"), "utf8");
const catalogModule = readFileSync(resolve(projectRoot, "js/modules/model-catalog.js"), "utf8");

test("brand page contains the complete desktop Figma section order", () => {
  const sections = [
    "brand-hero",
    "brand-models",
    "brand-finder",
    "brand-promo",
    "brand-services",
    "brand-parts",
    "brand-prices",
    "benefits",
    "team",
    "business-offer",
    "faq-request",
    "brand-seo",
  ];

  let previousIndex = -1;
  for (const section of sections) {
    const sectionIndex = markup.indexOf(`class="${section}`);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }
});

test("brand page uses a fluid four-column desktop model grid", () => {
  assert.match(styles, /\.brand-models__grid\s*\{[^}]*repeat\(4, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /--brand-section-gap:\s*clamp\(/);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
  assert.equal((markup.match(/<article class="brand-model-card"/g) ?? []).length, 12);
});

test("brand page implements the 390px Figma composition without changing desktop", () => {
  assert.match(styles, /@media \(max-width: 767px\)/);
  assert.match(styles, /\.brand-page \.layout-container,[\s\S]*?width:\s*calc\(100vw - 32px\)/);
  assert.match(styles, /\.brand-page \.site-header\s*\{[^}]*z-index:\s*20/s);
  assert.match(styles, /\.brand-models__grid\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.brand-service-card\s*\{[^}]*flex:\s*0 0 100%[^}]*scroll-snap-align:\s*start/s);
  assert.equal((markup.match(/class="brand-services__dot(?: |")/g) ?? []).length, 6);
  assert.doesNotMatch(styles, /@media \(max-width: 767px\)[\s\S]*?\.brand-page \.site-footer\s*\{[^}]*min-height:\s*\d/s);
});

test("mobile page sections are not pinned with numeric minimum heights", () => {
  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const mobileEnd = styles.indexOf("@media (prefers-reduced-motion: reduce)");
  const mobileStyles = styles.slice(mobileStart, mobileEnd);
  const sections = [
    ".brand-models",
    ".brand-promo",
    ".brand-services",
    ".brand-parts",
    ".brand-prices",
    ".brand-page .team",
    ".brand-page .business-offer",
    ".faq-request",
    ".brand-seo",
    ".brand-page .site-footer",
  ];

  for (const selector of sections) {
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.doesNotMatch(
      mobileStyles,
      new RegExp(`${escapedSelector}\\s*\\{[^}]*min-height:\\s*\\d`, "s"),
      `${selector} must size from its content on mobile`,
    );
  }
});

test("show-more model control has a focused ESM implementation", () => {
  assert.match(markup, /data-models-toggle aria-expanded="false"/);
  assert.match(catalogModule, /model\.hidden = !expanded/);
  assert.match(catalogModule, /toggle\.setAttribute\("aria-expanded"/);
});

test("hero advantages use the exact layered Figma SVG exports", () => {
  const iconParts = [
    "check-ring",
    "check-mark",
    "settings",
    "home",
    "home-door",
    "user-body",
    "user-head",
  ];

  for (const part of iconParts) {
    assert.match(markup, new RegExp(`brand-hero__advantage-icon-part--${part}`));
    assert.match(markup, new RegExp(`assets/brand-advantage-${part}\\.svg`));
  }

  assert.doesNotMatch(styles, /brand-hero__advantage-icon img:(?:only-child|first-child|last-child)/);
  assert.match(styles, /brand-hero__advantage-icon-part--settings\s*\{[^}]*width:\s*21px[^}]*height:\s*21px/s);
  assert.match(styles, /brand-hero__advantage-icon-part--home-door\s*\{[^}]*width:\s*6px[^}]*height:\s*7px/s);
});

test("mobile hero uses the dedicated Figma vehicle and wrench layers", () => {
  assert.match(markup, /assets\/brand-hero-wrench-mobile\.png/);
  assert.match(markup, /assets\/brand-hero-vehicle-mobile\.png/);
  assert.ok(markup.indexOf('class="brand-hero-scene__mobile-art"') > markup.indexOf('class="brand-hero__content"'));
  assert.match(styles, /\.brand-hero-scene__mobile-art\s*\{[^}]*position:\s*relative[^}]*height:\s*min\(263px, 67\.436vw\)[^}]*margin-top:\s*min\(59px, 15\.128vw\)/s);
  assert.match(styles, /\.brand-hero-scene__mobile-wrench\s*\{[^}]*top:\s*max\(-76px, -19\.487vw\)[^}]*left:\s*min\(199px, 51\.026vw\)/s);
  assert.match(styles, /\.brand-hero-scene__mobile-vehicle\s*\{[^}]*top:\s*0[^}]*left:\s*min\(67px, 17\.179vw\)[^}]*width:\s*min\(340px, 87\.179vw\)/s);
  assert.match(styles, /\.brand-hero-scene__mobile-vehicle-image\s*\{[^}]*top:\s*-15\.96%[^}]*left:\s*-1\.98%[^}]*width:\s*102\.14%[^}]*height:\s*131\.91%/s);
});

test("mobile services carousel matches the complete Figma cards", () => {
  const serviceImages = [
    "diagnostics",
    "maintenance",
    "repair",
    "replacement",
    "injectors",
    "extra",
  ];

  for (const image of serviceImages) {
    assert.match(markup, new RegExp(`assets/brand-service-${image}\\.png`));
  }

  for (const item of [
    "Записаться на диагностику",
    "ТО перед рейсом",
    "Замена ремней и роликов",
    "Проверка работы топливной системы",
    "Установка и проверка после работ",
  ]) {
    assert.match(markup, new RegExp(item));
  }

  assert.match(styles, /assets\/brand-service-check\.svg/);
  assert.match(styles, /assets\/brand-service-expand\.svg/);
  assert.match(styles, /\.brand-service-card\s*\{[^}]*height:\s*auto[^}]*min-height:\s*657px/s);
  assert.match(styles, /\.brand-service-card--injectors \.brand-service-card__details-item:nth-child\(7\)\s*\{[^}]*flex:\s*0 0 auto/s);
  assert.match(styles, /\.brand-service-card--injectors \.brand-service-card__details-item\s*\{[^}]*white-space:\s*normal/s);
  assert.match(styles, /\.brand-service-card--links \.brand-service-card__details-item\s*\{[^}]*min-height:\s*24px/s);
});

test("brand and services pages share interactive 6px service pagination", () => {
  assert.match(markup, /data-scroll-pagination="brand-services-pagination"/);
  assert.equal((markup.match(/<button class="brand-services__dot(?: |")/g) ?? []).length, 6);
  assert.match(styles, /\.brand-services__dot\s*\{[^}]*width:\s*6px[^}]*height:\s*6px[^}]*flex:\s*0 0 6px[^}]*padding:\s*0[^}]*border:\s*0/s);
});

test("mobile benefits block follows the Figma content with natural height", () => {
  for (const text of [
    "После ремонта объясняем, что было сделано, и фиксируем условия обслуживания.",
    "Профильная экспертиза",
    "Основной фокус — Fiat Ducato, Ford Transit, Citroen Jumper, Iveco Daily, Peugeot Boxer, Peugeot Partner, Citroen Berlingo, Sollers Atlant и JAC Sunray",
    "Сервис и запчасти в одном месте",
    "Обслуживаем личные автомобили, коммерческий транспорт и автопарки компаний",
  ]) {
    assert.match(markup, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(styles, /\.brand-page \.benefits\s*\{[^}]*min-height:\s*996px/s);
  assert.match(styles, /\.brand-page \.benefits__visual\s*\{[^}]*height:\s*296px/s);
  assert.match(styles, /\.brand-page \.benefits-slider__slide\s*\{[^}]*padding:\s*20px/s);
  assert.match(styles, /\.brand-page \.benefits-slider__pagination\s*\{[^}]*width:\s*28px[^}]*height:\s*6px/s);
  assert.doesNotMatch(markup, /benefits-slider__pagination--six-dots/);
});

test("price list matches the Figma desktop section", () => {
  assert.equal((markup.match(/class="brand-price-row"/g) ?? []).length, 12);
  assert.match(markup, /ГРМ \(ремень\) замена \(а\/м без конд\., без защиты ДВС\)/);
  assert.match(markup, /Колодки ручного тормоза дисковые R15\/16 регулировка/);
  assert.match(styles, /\.brand-prices__list\s*\{[^}]*gap:\s*5px/s);
  assert.match(styles, /\.brand-price-row\s*\{[^}]*height:\s*42px[^}]*font-size:\s*18px/s);
  assert.match(styles, /\.brand-price-row:nth-child\(odd\)/);
});

test("all brand page Figma assets are local and resolve", () => {
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
  assert.match(markup, /class="brand-hero-scene hero-grid"/);
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-pattern.png")));
  assert.match(markup, /class="brand-hero-scene__desktop-art" data-node-id="298:25361"/);
  assert.doesNotMatch(markup, /src="assets\/brand-hero-art\.png"/);
  for (const asset of ["light-5.svg", "light-6.svg", "light-7.svg", "light-8.svg", "light-9.svg", "light-10.svg", "wrench.png", "vehicle.png"]) {
    assert.match(markup, new RegExp(`assets/brand-hero-${asset.replace(".", "\\.")}`));
  }
  for (const nodeId of ["228:21109", "228:21110", "228:21111", "228:21112", "228:21114", "248:6108", "298:25351", "298:25352", "228:22359"]) {
    assert.match(markup, new RegExp(`data-node-id="${nodeId}"`));
  }
  assert.match(styles, /\.brand-hero-scene\.hero-grid::before\s*\{[^}]*background-image:\s*url\("assets\/hero-pattern\.png"\)[^}]*opacity:\s*0\.5/s);
  assert.match(styles, /\.brand-hero-scene__vehicle\s*\{[^}]*mix-blend-mode:\s*darken/s);
  assert.doesNotMatch(markup, /brand-hero-scene__orb/);
  const resources = [...markup.matchAll(/\b(?:href|src)="([^"]+)"/g)]
    .map(([, value]) => value.split("#")[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});
