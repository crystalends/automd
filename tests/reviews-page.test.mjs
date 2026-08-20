import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "reviews.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "reviews-page.css"), "utf8");
const entrypoint = readFileSync(resolve(projectRoot, "js/main.js"), "utf8");
const toggleModule = readFileSync(resolve(projectRoot, "js/modules/reviews-toggle.js"), "utf8");

test("reviews page follows the Figma desktop section order", () => {
  const sections = [
    "reviews-hero",
    "reviews-rating",
    "review-catalog",
    "review-book",
    "reviews-guide",
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

test("reviews page reuses established project components", () => {
  assert.ok((markup.match(/<article class="review-card"/g) ?? []).length >= 12);
  assert.equal((markup.match(/<figure class="review-book__card">/g) ?? []).length, 12);
  for (const component of ["site-header", "faq-request", "request-card", "about-seo", "site-footer"]) {
    assert.match(markup, new RegExp(`class="${component}`));
  }
  assert.match(markup, /href="about-page\.css"/);
  assert.match(markup, /type="module" src="js\/main\.js"/);
});

test("reviews page implements responsive content-driven layouts", () => {
  assert.match(styles, /--reviews-section-gap:\s*clamp\(/);
  assert.match(styles, /\.review-catalog__grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s);
  assert.match(styles, /\.review-book__grid\s*\{[^}]*grid-template-columns:\s*repeat\(6, minmax\(0, 1fr\)\)/s);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);

  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);
  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  assert.match(mobileStyles, /\.review-catalog__grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(mobileStyles, /\.review-book__grid\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s);
  assert.match(mobileStyles, /\.reviews-guide__list,[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(mobileStyles, /\.rating-platform\s*\{[^}]*width:\s*295px[^}]*height:\s*98px/s);
});

test("reviews guide matches the Figma card geometry and visual variants", () => {
  assert.match(markup, /reviews-guide__card reviews-guide__card--related related-sections/);
  assert.match(styles, /\.reviews-guide__card--related\s*\{[^}]*background:\s*#fff[^}]*box-shadow:\s*inset 0 0 0 1px var\(--soft\)/s);
  assert.match(styles, /\.reviews-guide__list li\s*\{[^}]*height:\s*59px[^}]*reviews-guide-pattern-right\.png/s);
  assert.match(styles, /\.related-sections__links a\s*\{[^}]*height:\s*64px[^}]*reviews-guide-pattern-left\.png/s);
  assert.match(styles, /\.related-sections__button\s*\{[^}]*width:\s*265px/s);
  assert.match(styles, /border-radius:\s*var\(--radius\)/);
  for (const asset of ["reviews-guide-pattern-right.png", "reviews-guide-pattern-left.png", "reviews-guide-arrow.svg"]) {
    assert.ok(existsSync(resolve(projectRoot, "assets", asset)), `Missing guide asset: ${asset}`);
  }
});

test("show-more reviews control has a focused ESM implementation", () => {
  assert.match(markup, /data-reviews-toggle[^>]*aria-expanded="false"/);
  assert.equal((markup.match(/data-review-extra hidden/g) ?? []).length, 3);
  assert.match(entrypoint, /import \{ initReviewsToggle \} from "\.\/modules\/reviews-toggle\.js"/);
  assert.match(entrypoint, /initReviewsToggle\(\)/);
  assert.match(toggleModule, /review\.hidden = !expanded/);
  assert.match(toggleModule, /toggle\.setAttribute\("aria-expanded", String\(expanded\)\)/);
});

test("reviews page uses local Figma assets and all local resources resolve", () => {
  assert.equal((markup.match(/<article class="rating-platform"/g) ?? []).length, 2);
  assert.match(markup, /class="reviews-rating__platforms" role="region" tabindex="0"/);
  assert.match(markup, /class="rating-platform__stars" style="--rating-fill: 94%"/);
  assert.doesNotMatch(markup, /src="assets\/reviews-rating\.png"/);
  assert.match(styles, /\.rating-platform\s*\{[^}]*width:\s*385px[^}]*height:\s*128px/s);
  assert.match(markup, /src="assets\/review-avatar\.png"/);
  assert.match(markup, /src="assets\/team-mechanics\.png"/);
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);

  const resources = [...markup.matchAll(/(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("primary pages link to the reviews page", () => {
  const primaryPages = [
    "index.html",
    "cars.html",
    "brand.html",
    "promotions.html",
    "promotion-detail.html",
    "about.html",
    "3d-tour.html",
    "branch.html",
    "client-zone.html",
    "contacts.html",
    "404.html",
  ];

  for (const page of primaryPages) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(pageMarkup, /href="reviews\.html">Отзывы<\/a>/, `${page} must link to reviews page`);
  }
});
