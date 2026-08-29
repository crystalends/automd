import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "prices.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "prices-page.css"), "utf8");
const module = readFileSync(resolve(projectRoot, "js/modules/price-catalog.js"), "utf8");
const entrypoint = readFileSync(resolve(projectRoot, "js/main.js"), "utf8");

test("prices page follows the Figma section order", () => {
  const sections = ["prices-hero", "price-quote", "price-catalog", "price-details", "team", "business-offer", "benefits", "faq-request", "price-seo", "site-footer"];
  let previousIndex = -1;
  for (const section of sections) {
    const sectionIndex = markup.indexOf(section, previousIndex + 1);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }
});

test("prices page reuses established responsive project blocks", () => {
  assert.equal((markup.match(/<article class="team-card">/g) ?? []).length, 5);
  assert.equal((markup.match(/<details class="faq-item">/g) ?? []).length, 8);
  for (const component of ["booking", "form-field", "business-offer", "benefits", "request-card", "site-footer"]) {
    assert.match(markup, new RegExp(`class="[^"]*${component}`));
  }
  assert.match(markup, /src="app\.js" defer/);
});

test("prices hero matches the dedicated Figma composition", () => {
  const section = markup.match(/<section class="prices-hero[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(section, /class="prices-hero__inner"/);
  assert.equal((section.match(/class="prices-hero__benefit-icon"/g) ?? []).length, 6);
  assert.equal((section.match(/src="assets\/price-hero-check\.svg"/g) ?? []).length, 6);
  assert.match(styles, /\.prices-hero__inner\s*\{[^}]*width:\s*min\(1195px, 75%\)[^}]*gap:\s*40px/s);
  assert.match(styles, /\.prices-hero__content\s*\{[^}]*min-height:\s*253px/s);
  assert.match(styles, /\.prices-hero__benefits\s*\{[^}]*display:\s*flex[^}]*min-height:\s*58px[^}]*gap:\s*10px 20px/s);
  assert.match(styles, /\.prices-hero__benefits-item:is\(li\):nth-child\(1\) \{ width:\s*323px/);
  assert.match(styles, /\.prices-hero__benefits-item:is\(li\):nth-child\(6\) \{ width:\s*210px/);
  assert.match(styles, /\.prices-hero__button\s*\{[^}]*width:\s*280px[^}]*margin:\s*0/s);
});

test("business offer matches the dedicated Figma composition", () => {
  const section = markup.match(/<section class="business-offer business-offer--prices[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.equal((section.match(/business-offer__features business-offer__features--desktop/g) ?? []).length, 1);
  assert.equal((section.match(/<li class="business-offer__feature">/g) ?? []).length, 14);
  assert.doesNotMatch(section, /business-offer__button/);
  assert.match(section, /src="assets\/business\.jpg"/);
  assert.match(styles, /\.business-offer--prices\s*\{[^}]*height:\s*620px[^}]*grid-template-columns:\s*minmax\(0, 1fr\) calc\(\(100% \+ 40px\) \* 0\.4925\)[^}]*gap:\s*20px[^}]*padding-left:\s*40px/s);
  assert.match(styles, /\.business-offer--prices \.business-offer__features--desktop\s*\{[^}]*flex-direction:\s*column[^}]*gap:\s*20px/s);
  assert.match(styles, /\.business-offer--prices \.business-offer__features--desktop \.business-offer__feature\s*\{[^}]*height:\s*29px[^}]*border-bottom:\s*1px solid var\(--muted\)[^}]*font-size:\s*20px/s);
});

test("SEO copy matches the dedicated Figma composition", () => {
  const section = markup.match(/<section class="price-seo[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(section, /<h2 class="price-seo__title"[^>]*>Сео текст<\/h2>/);
  assert.equal((section.match(/<p class="price-seo__copy-text">/g) ?? []).length, 3);
  assert.match(styles, /\.price-seo\s*\{[^}]*display:\s*flex[^}]*width:\s*min\(1060px, var\(--container\)\)[^}]*min-height:\s*282px[^}]*flex-direction:\s*column[^}]*gap:\s*20px/s);
  assert.match(styles, /\.price-seo__copy\s*\{[^}]*min-height:\s*218px[^}]*gap:\s*10px[^}]*color:\s*var\(--ink\)[^}]*font-size:\s*18px/s);
});

test("price catalog matches the Figma composition", () => {
  assert.match(markup, /class="price-catalog__content"/);
  assert.equal((markup.match(/class="price-catalog__tab(?: price-catalog__tab--active)?"/g) ?? []).length, 14);
  assert.equal((markup.match(/class="price-catalog__row"/g) ?? []).length, 12);
  assert.equal((markup.match(/class="price-catalog__row price-catalog__row--extra"/g) ?? []).length, 4);
  assert.match(markup, /role="tablist"/);
  assert.match(markup, /aria-live="polite">Показаны цены/);
  assert.match(markup, /data-price-more aria-expanded="false"/);
});

test("price details match the dedicated Figma composition", () => {
  const section = markup.match(/<section class="price-details[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.equal((section.match(/class="price-details__chip(?: price-details__chip--wide)?"/g) ?? []).length, 9);
  assert.match(section, /price-details__chip price-details__chip--wide/);
  assert.match(section, /src="assets\/prices-details-pattern\.png"/);
  assert.match(section, /src="assets\/prices-parts\.png"/);
  assert.doesNotMatch(section, /price-details__parts-artwork|prices-details-card\.png/);
  const cardRule = styles.match(/\.price-details__card\s*\{[^}]*\}/)?.[0] ?? "";
  const partsCardRule = styles.match(/\.price-details__card--parts\s*\{[^}]*\}/)?.[0] ?? "";
  assert.match(cardRule, /min-height:\s*567px/);
  assert.match(cardRule, /border:\s*1px solid rgba\(227, 227, 227, 0\.5\)/);
  assert.doesNotMatch(cardRule, /(?:^|[;{])\s*height:/);
  assert.match(partsCardRule, /min-height:\s*566px/);
  assert.doesNotMatch(partsCardRule, /(?:^|[;{])\s*height:/);
  assert.match(styles, /\.price-details__card--factors\s*\{[^}]*padding:\s*19px/s);
  assert.match(styles, /\.price-details__chips\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)[^}]*gap:\s*10px 20px/s);
  assert.match(styles, /\.price-details__parts-image\s*\{[^}]*top:\s*200px[^}]*left:\s*281px[^}]*width:\s*581px[^}]*height:\s*388px/s);
  assert.match(styles, /\.price-details__heading--parts\s*\{[^}]*flex:\s*0 0 auto/s);
  assert.match(styles, /\.price-details__actions\s*\{[^}]*width:\s*316px[^}]*flex-direction:\s*column[^}]*gap:\s*10px/s);
  assert.doesNotMatch(styles, /\.price-details__parts-artwork/);
});

test("price catalog interactions are keyboard accessible and initialized defensively", () => {
  assert.match(module, /\["ArrowLeft", "ArrowRight", "Home", "End"\]/);
  assert.match(module, /setAttribute\("aria-selected"/);
  assert.match(module, /if \(!catalog\) return null/);
  assert.match(module, /row\.hidden = !willExpand/);
  assert.match(entrypoint, /import \{ initPriceCatalog \} from "\.\/modules\/price-catalog\.js"/);
  assert.match(entrypoint, /initPriceCatalog\(\)/);
});

test("desktop and mobile quote forms follow the two Figma variants", () => {
  assert.match(markup, /price-quote__heading--desktop[^]*Подберите цену под свой автомобиль/);
  assert.match(markup, /price-quote__heading--mobile[^]*Запишитесь на ремонт или консультацию/);
  assert.match(markup, /src="assets\/price-quote-vehicle\.png"/);
  assert.match(markup, /src="assets\/booking-bearing\.png"/);
  assert.match(markup, /booking-form__field booking-form__field--wide[^>]*><span class="form-field__label booking-form__label">Услуга/);
  assert.match(markup, /booking__pattern booking__pattern--desktop price-quote__pattern/);
  assert.match(markup, /booking__pattern booking__pattern--mobile price-quote__pattern/);
  assert.match(styles, /\.price-quote__form--desktop\s*\{[^}]*width:\s*min\(885px, 60%\)[^}]*gap:\s*40px/s);
  assert.match(styles, /\.price-quote__fields--desktop\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.booking-form__field--wide\.price-quote__field\s*\{[^}]*grid-column:\s*1 \/ -1/s);
  assert.match(styles, /\.price-quote__heading--mobile,[\s\S]*?display:\s*none/);
  assert.match(styles, /@media \(max-width: 767px\)[\s\S]*?\.price-quote__form--mobile \{ display:\s*flex/);
  assert.match(styles, /@media \(max-width: 767px\)[\s\S]*?\.price-quote__heading \{ width:\s*100%/);
});

test("prices layout is fluid and has content-driven mobile reflows", () => {
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
  assert.match(styles, /\.price-catalog__tabs\s*\{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap[^}]*gap:\s*20px 40px/s);
  assert.match(styles, /\.price-catalog__row:nth-child\(odd\)\s*\{[^}]*background:\s*var\(--soft\)/s);
  assert.match(styles, /\.price-catalog__more\s*\{[^}]*width:\s*195px[^}]*min-height:\s*46px[^}]*border:\s*1px solid var\(--blue\)/s);
  assert.match(styles, /@media \(max-width: 767px\)/);
  assert.match(styles, /\.price-catalog__tabs \{ display:\s*grid; grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(styles, /\.price-details \{ display:\s*flex; flex-direction:\s*column/);
  assert.match(styles, /\.business-offer--prices \.business-offer__copy--desktop \{ display:\s*none/);
});

test("prices page uses local assets and every local resource resolves", () => {
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
  const resources = [...markup.matchAll(/(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));
  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("existing pages expose the prices route", () => {
  const pages = ["about.html", "cars.html", "services.html", "parts.html", "contacts.html"];
  for (const page of pages) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="prices\.html">Цены<\/a>/, `${page} must link to prices page`);
  }
});
