import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "services.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "services-page.css"), "utf8");
const brandStyles = readFileSync(resolve(projectRoot, "brand-page.css"), "utf8");

test("services page follows the Figma section order", () => {
  const sections = [
    "services-hero",
    "services-finder",
    "services-promo",
    "services-directions",
    "popular-services",
    "services-vehicles",
    "service-prices",
    "team",
    "business-offer",
    "benefits",
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

test("services page reuses shared components and focused ESM", () => {
  assert.match(markup, /class="services-finder service-finder/);
  assert.match(markup, /href="app\.css"/);
  assert.equal((markup.match(/<article class="brand-service-card/g) ?? []).length, 6);
  assert.match(markup, /data-scroll-pagination="services-directions-pagination"/);
  assert.equal((markup.match(/class="vehicle-card(?: |")/g) ?? []).length, 12);
  assert.equal((markup.match(/class="team-card"/g) ?? []).length, 5);
  for (const component of ["promo-banner", "business-offer", "benefits", "faq-request", "site-footer"]) {
    assert.match(markup, new RegExp(`class="${component}`));
  }
  assert.match(markup, /type="module" src="js\/main\.js"/);
});

test("new services blocks preserve the Figma composition", () => {
  assert.equal((markup.match(/<article class="brand-service-card/g) ?? []).length, 6);
  assert.equal((markup.match(/class="popular-service-card(?: |")/g) ?? []).length, 9);
  assert.equal((markup.match(/class="service-price-list__item"/g) ?? []).length, 12);
  assert.match(markup, /Услуги AutoMD/);
  assert.match(markup, /Найдите услугу для своего автомобиля/);
  assert.match(markup, /Основные направления/);
  assert.match(markup, /Цены на популярные услуги/);
});

test("services hero reuses the exact layered Figma advantage icons", () => {
  assert.equal((markup.match(/class="brand-hero__advantage"/g) ?? []).length, 4);
  for (const asset of [
    "brand-advantage-check-ring.svg",
    "brand-advantage-check-mark.svg",
    "brand-advantage-settings.svg",
    "brand-advantage-home.svg",
    "brand-advantage-home-door.svg",
    "brand-advantage-user-body.svg",
    "brand-advantage-user-head.svg",
  ]) {
    assert.match(markup, new RegExp(`assets/${asset.replace(".", "\\.")}`));
  }
  assert.doesNotMatch(styles, /\.services-hero__advantage(?::|\s|\{)/);
});

test("services hero follows the layered responsive scene used on the home page", () => {
  assert.match(markup, /class="services-hero-scene__pattern" src="assets\/hero-pattern\.png"/);
  assert.match(markup, /class="services-hero-scene__vehicle" src="assets\/services-hero\.png"/);
  assert.match(markup, /class="services-hero-scene__glow-asset" src="assets\/hero-glow-middle\.svg"/);
  assert.match(markup, /class="services-hero-scene__accent" src="assets\/services-hero-glow-accent\.svg"/);
  assert.match(styles, /\.services-hero-scene__vehicle\s*\{[^}]*top:\s*min\(12\.1875vw,[^}]*right:\s*calc\(7\.34375vw[^}]*width:\s*clamp\(480px, 43\.177083vw, 829px\)[^}]*mix-blend-mode:\s*darken/s);
  assert.match(styles, /@media \(max-width: 991px\)[\s\S]*\.services-hero-scene__vehicle\s*\{[^}]*display:\s*none/s);
  assert.match(styles, /@media \(max-width: 991px\)[\s\S]*\.services-hero__visual\s*\{[^}]*position:\s*relative[^}]*display:\s*block[^}]*width:\s*min\(82vw, 829px\)/s);
  assert.match(styles, /@media \(max-width: 991px\)[\s\S]*\.services-hero__image\s*\{[^}]*position:\s*absolute[^}]*visibility:\s*visible/s);
  assert.doesNotMatch(markup, /services-hero-scene\.png/);
});

test("services mobile hero matches the dedicated 390px Figma composition", () => {
  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.match(mobileStyles, /\.services-hero-scene\s*\{[^}]*height:\s*1031px/s);
  assert.match(mobileStyles, /\.services-hero-scene__pattern\s*\{[^}]*left:\s*calc\(100vw - 1733\.132px\)[^}]*width:\s*1920px[^}]*height:\s*820px/s);
  assert.match(styles, /\.services-hero__visual\s*\{[^}]*width:\s*106\.0415vw[^}]*height:\s*63\.3631vw[^}]*margin:\s*-38px 0 10px 34\.771vw/s);
  assert.match(styles, /\.services-hero__glow--left\s*\{[^}]*top:\s*-2\.733px[^}]*left:\s*-486\.563px/s);
  assert.match(styles, /\.services-hero__accent\s*\{[^}]*top:\s*2\.219px[^}]*left:\s*155\.598px/s);
});

test("services layout is fluid and has content-driven mobile layouts", () => {
  assert.match(styles, /--services-section-gap:\s*clamp\(/);
  assert.match(brandStyles, /\.brand-services__grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(brandStyles, /\.brand-service-card\s*\{[^}]*height:\s*364px[^}]*grid-template-columns:/s);
  assert.match(styles, /\.popular-services__grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);

  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  const brandMobileStart = brandStyles.indexOf("@media (max-width: 767px)");
  const brandMobileStyles = brandStyles.slice(brandMobileStart);
  assert.match(brandMobileStyles, /\.brand-services__grid\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s);
  assert.match(brandMobileStyles, /\.brand-service-card\s*\{[^}]*flex:\s*0 0 100%[^}]*scroll-snap-align:\s*start/s);
  assert.match(mobileStyles, /\.popular-services__grid\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s);
  assert.match(mobileStyles, /\.services-vehicles \.vehicle-list__grid\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s);
  assert.match(mobileStyles, /\.services-page \.business-offer\s*\{[^}]*flex-direction:\s*column/s);
});

test("services page uses local Figma assets and every local resource resolves", () => {
  assert.match(markup, /assets\/services-hero\.png/);
  assert.equal((markup.match(/assets\/brand-service-[^" ]+\.png/g) ?? []).length, 6);
  assert.equal((markup.match(/assets\/services-popular-[^" ]+\.png/g) ?? []).length, 9);
  assert.doesNotMatch(markup, /assets\/services-category-/);
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);

  const resources = [...markup.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("primary page navigation exposes the services route", () => {
  const primaryPages = [
    "index.html",
    "cars.html",
    "brand.html",
    "promotions.html",
    "promotion-detail.html",
    "about.html",
    "contacts.html",
    "client-zone.html",
    "3d-tour.html",
    "404.html",
  ];

  for (const page of primaryPages) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="services\.html">Услуги<\/a>/, `${page} must link to services page`);
  }
});
