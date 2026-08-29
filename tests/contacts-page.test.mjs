import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "contacts.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "contacts-page.css"), "utf8");
const sharedStyles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");

test("contacts page follows the Figma section order", () => {
  const sections = [
    "contacts-hero",
    "contacts-locations",
    "quick-actions",
    "service-centers",
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

test("contacts page reuses shared project blocks and ESM", () => {
  assert.equal((markup.match(/class="[^"]*\blocation-card\b[^"]*"/g) ?? []).length, 2);
  assert.equal((markup.match(/class="quick-action-card"/g) ?? []).length, 4);
  assert.equal((markup.match(/class="service-center-card"/g) ?? []).length, 2);
  assert.match(markup, /class="faq-request /);
  assert.match(markup, /class="request-card"/);
  assert.match(markup, /src="app\.js" defer/);
});

test("contacts page uses embedded Yandex maps and existing design assets", () => {
  assert.match(markup, /class="contacts-hero-scene hero-grid"/);
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-pattern.png")));
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-grid-light-soft.svg")));
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-grid-light-paper.svg")));
  assert.equal((markup.match(/<iframe/g) ?? []).length, 3);
  assert.equal((markup.match(/src="https:\/\/yandex\.ru\/map-widget\/v1\//g) ?? []).length, 3);
  assert.doesNotMatch(markup, /class="(?:locations__map|service-center-card__map)"[^>]*src="assets\/map\.png"/);
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);

  const resources = [...markup.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("contacts hero reuses the shared grid and Figma light layers", () => {
  assert.match(markup, /class="contacts-hero-scene hero-grid"/);
  assert.doesNotMatch(markup, /contacts-hero-scene__pattern/);
  assert.doesNotMatch(styles, /contacts-hero-scene__pattern/);
  assert.doesNotMatch(styles, /contacts-hero-scene__light/);
  assert.match(sharedStyles, /\.hero-grid::before\s*\{[^}]*height:820px[^}]*hero-grid-light-soft\.svg[^}]*hero-grid-light-paper\.svg[^}]*hero-pattern\.png/s);
  assert.match(sharedStyles, /background-position:clamp\(260px,31\.379vw,602\.477px\) 57\.947px,clamp\(260px,36\.125vw,693\.592px\) 138\.47px,center top/);
});

test("contacts layout is fluid and has a content-driven mobile reflow", () => {
  assert.match(styles, /--contacts-section-gap:\s*clamp\(/);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
  assert.match(styles, /\.service-center-card__map\s*\{[^}]*border:\s*0[^}]*outline:\s*0[^}]*box-shadow:\s*none/s);
  assert.match(styles, /\.quick-actions__grid\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.service-centers__grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);

  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  assert.match(mobileStyles, /\.quick-actions__grid\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s);
  assert.match(mobileStyles, /\.service-centers__grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(mobileStyles, /\.service-center-card__actions\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.doesNotMatch(mobileStyles, /\.service-center-card\s*\{[^}]*min-height:\s*\d/s);
});

test("primary pages expose the contacts page", () => {
  const primaryPages = [
    "index.html",
    "cars.html",
    "brand.html",
    "promotions.html",
    "promotion-detail.html",
    "about.html",
    "client-zone.html",
    "3d-tour.html",
    "404.html",
  ].filter((page) => existsSync(resolve(projectRoot, page)));

  for (const page of primaryPages) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="contacts\.html(?:#locations)?">Контакты<\/a>/, `${page} must link to contacts page`);
  }
});
