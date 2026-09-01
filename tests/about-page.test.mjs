import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "about.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "about-page.css"), "utf8");

test("about page keeps the Figma desktop section order", () => {
  const sections = [
    "about-hero",
    "about-intro",
    "about-specialization",
    "team",
    "about-parts",
    "benefits",
    "about-process",
    "business-offer",
    "locations",
    "about-service",
    "faq-request",
    "about-seo",
    "site-footer",
  ];

  let previousIndex = -1;
  for (const section of sections) {
    const sectionIndex = markup.indexOf(`class="${section}`);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }
});

test("about page reuses project components for repeated design blocks", () => {
  assert.equal((markup.match(/<article class="[^"]*\bvehicle-card\b[^"]*">/g) ?? []).length, 12);
  assert.equal((markup.match(/<article class="team-card">/g) ?? []).length, 5);
  for (const component of ["benefits", "business-offer", "locations", "faq-request", "site-footer"]) {
    assert.match(markup, new RegExp(`class="${component}`));
  }
  assert.match(markup, /src="app\.js" defer/);
});

test("about page is fluid and includes a mobile reflow", () => {
  assert.match(styles, /--about-section-gap:\s*clamp\(/);
  assert.match(styles, /grid-template-columns:\s*repeat\(6, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);

  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  assert.match(mobileStyles, /\.about-page \.layout-container,[\s\S]*?width:\s*auto[\s\S]*?margin-right:\s*16px[\s\S]*?margin-left:\s*16px/);
  assert.match(mobileStyles, /\.about-specialization__grid\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s);
  assert.match(mobileStyles, /\.about-process__list\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(mobileStyles, /\.faq-request\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(mobileStyles, /\.request-card__fields\s*\{[^}]*grid-template-columns:\s*1fr/s);
});

test("unique about blocks use content-driven mobile layouts", () => {
  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.match(markup, /class="commercial-hero-scene__mobile-vehicle"[^>]*src="assets\/about-hero-vehicle\.png"/);
  assert.match(mobileStyles, /\.commercial-hero-scene__vehicle\s*\{[^}]*display:\s*none/s);
  assert.match(mobileStyles, /\.commercial-hero-scene__mobile-vehicle\s*\{[^}]*display:\s*block/s);
  assert.match(mobileStyles, /\.about-hero\s*\{[^}]*min-height:\s*0/s);
  assert.match(mobileStyles, /\.about-hero__actions\s*\{[^}]*margin-top:\s*0/s);
  assert.doesNotMatch(mobileStyles, /\.about-hero__actions\s*\{[^}]*margin-top:\s*[1-9]\d+px/s);
  assert.match(mobileStyles, /\.about-parts__grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(mobileStyles, /\.about-decision\s*\{[^}]*min-height:\s*0[^}]*padding-bottom:\s*190px/s);
  assert.match(mobileStyles, /\.about-button-secondary\.about-guarantees__about-button-secondary\s*\{[^}]*width:\s*100%/s);
});

test("service process cards match the Figma node", () => {
  assert.equal((markup.match(/class="about-process__item"/g) ?? []).length, 8);
  assert.equal((markup.match(/class="about-process__item-text"/g) ?? []).length, 8);
  assert.match(styles, /\.about-process__list\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)[^}]*gap:\s*20px/s);
  assert.match(styles, /\.about-process__item\s*\{[^}]*height:\s*84px[^}]*align-items:\s*center[^}]*gap:\s*20px[^}]*padding:\s*20px[^}]*border-radius:\s*20px[^}]*background:\s*#f6f6f6 url\("assets\/about-process-pattern\.png"\)[^}]*font-size:\s*18px/s);
  assert.match(styles, /\.about-process__item-value:is\(span\)\s*\{[^}]*flex:\s*0 0 26px[^}]*font-family:\s*Geologica[^}]*font-size:\s*20px/s);
  assert.match(styles, /\.about-process__item-text:is\(span\)\s*\{[^}]*min-width:\s*0[^}]*flex:\s*1 0 0/s);
  assert.ok(existsSync(resolve(projectRoot, "assets/about-process-pattern.png")));
});

test("decision and guarantees cards match Figma nodes 267:75531 and 267:72345", () => {
  assert.match(markup, /class="about-decision__pattern" src="assets\/service-assurance-pattern\.png"/);
  assert.match(styles, /\.about-decision__content\s*\{[^}]*width:\s*min\(614px, 100%\)[^}]*gap:\s*10px/s);
  assert.match(styles, /\.about-decision__content-text:is\(p\)\s*\{[^}]*max-width:\s*614px[^}]*font-size:\s*16px/s);
  assert.match(styles, /\.about-decision__nut\s*\{[^}]*top:\s*227px[^}]*left:\s*479px[^}]*width:\s*437px[^}]*height:\s*437px/s);
  assert.match(styles, /\.about-guarantees__list\s*\{[^}]*gap:\s*10px 20px/s);
  assert.match(styles, /\.about-guarantees__list-item:is\(li\)\s*\{[^}]*min-height:\s*59px[^}]*border-radius:\s*20px[^}]*service-assurance-item-pattern\.png/s);
  assert.match(styles, /\.about-button-secondary\.about-guarantees__about-button-secondary\s*\{[^}]*width:\s*172px[^}]*min-height:\s*46px/s);
});

test("location cards preserve Figma node 267:72277 typography", () => {
  const sharedStyles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");
  assert.match(sharedStyles, /\.location-card__title\s*\{[^}]*font-family:Geologica,sans-serif[^}]*font-size:20px[^}]*font-weight:400[^}]*line-height:1\.2/s);
  assert.match(sharedStyles, /\.location-card__value\s*\{[^}]*font-family:"AA Stetica",sans-serif[^}]*font-size:14px[^}]*font-weight:400[^}]*line-height:1\.2/s);
  assert.match(sharedStyles, /\.location-card__link\s*\{[^}]*font-family:Geologica,sans-serif[^}]*font-size:16px[^}]*font-weight:500[^}]*line-height:1/s);

  const mobileStart = sharedStyles.indexOf("@media (max-width:767px)");
  const narrowStart = sharedStyles.indexOf("@media (max-width:359px)");
  const mobileStyles = sharedStyles.slice(mobileStart, narrowStart);
  assert.match(mobileStyles, /\.location-card__title\s*\{[^}]*font-size:20px[^}]*line-height:1\.2/s);
  assert.match(mobileStyles, /\.location-card__value\s*\{[^}]*font-size:14px[^}]*line-height:1\.2/s);
  assert.match(mobileStyles, /\.location-card__link\s*\{[^}]*font-size:16px[^}]*line-height:1/s);
});

test("about page uses local Figma assets and all local resources resolve", () => {
  assert.match(markup, /class="commercial-hero-scene hero-grid"/);
  assert.match(markup, /src="assets\/about-hero-vehicle\.png"/);
  assert.match(styles, /\.commercial-hero-scene__vehicle\s*\{[^}]*mix-blend-mode:\s*darken/s);
  assert.match(styles, /\.commercial-hero-scene__mobile-vehicle\s*\{[^}]*mix-blend-mode:\s*darken/s);
  assert.match(markup, /src="assets\/about-decision-nut\.png"/);
  assert.match(markup, /src="assets\/service-assurance-pattern\.png"/);
  assert.match(styles, /service-assurance-item-pattern\.png/);
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);

  const resources = [...markup.matchAll(/(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("all primary pages link to the about page", () => {
  const primaryPages = ["index.html", "cars.html", "brand.html", "promotions.html", "promotion-detail.html", "404.html"]
    .filter((page) => existsSync(resolve(projectRoot, page)));

  for (const page of primaryPages) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="about\.html">О компании<\/a>/, `${page} must link to about page`);
  }
});
