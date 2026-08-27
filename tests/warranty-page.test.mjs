import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "warranty.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "warranty-page.css"), "utf8");

test("warranty page follows the Figma section order", () => {
  const sections = [
    "warranty-hero",
    "warranty-overview",
    "warranty-copy",
    "warranty-process",
    "warranty-exclusions",
    "warranty-return",
    "warranty-work",
    "warranty-used",
    "benefits warranty-service",
    "warranty-memo",
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

test("warranty page reuses shared responsive components and ESM", () => {
  for (const component of ["site-header", "benefits", "faq-request", "request-card", "site-footer"]) {
    assert.match(markup, new RegExp(`class="${component}`));
  }
  assert.match(markup, /src="vendor\/swiper\/swiper-bundle\.min\.js"/);
  assert.match(markup, /type="module" src="js\/main\.js"/);
  assert.match(markup, /data-form="booking"/);
});

test("warranty page contains the complete Figma content composition", () => {
  assert.equal((markup.match(/class="warranty-overview__item"/g) ?? []).length, 5);
  assert.equal((markup.match(/class="warranty-process-card"/g) ?? []).length, 3);
  assert.equal((markup.match(/class="warranty-return-card(?: |")/g) ?? []).length, 2);
  assert.equal((markup.match(/class="warranty-return-card__heading"/g) ?? []).length, 2);
  assert.equal((markup.match(/class="warranty-return-card__icon"/g) ?? []).length, 11);
  assert.equal((markup.match(/class="warranty-exclusions__icon"/g) ?? []).length, 6);
  assert.equal((markup.match(/class="warranty-memo-card"/g) ?? []).length, 6);
  assert.equal((markup.match(/class="warranty-memo-card__body"/g) ?? []).length, 6);
  assert.equal((markup.match(/class="warranty-memo-card__title"/g) ?? []).length, 6);
  assert.equal((markup.match(/class="warranty-memo-card__description"/g) ?? []).length, 6);
  assert.match(markup, /Гарантия на работы и сервис после ремонта/);
  assert.match(markup, /На что гарантия не распространяется/);
  assert.match(markup, /Перед покупкой б\/у запчастей/);
});

test("warranty layout is fluid and has a content-driven mobile reflow", () => {
  assert.match(styles, /--warranty-section-gap:\s*clamp\(/);
  assert.match(styles, /\.warranty-hero\s*\{[^}]*width:\s*min\(1195px, var\(--container\)\)[^}]*min-height:\s*302px[^}]*gap:\s*20px[^}]*margin-top:\s*80px/s);
  assert.match(styles, /\.warranty-hero__copy\s*\{[^}]*gap:\s*5px/s);
  assert.match(markup, /class="warranty-hero-scene__pattern hero-scene__pattern" src="assets\/hero-pattern\.png"/);
  assert.match(styles, /\.warranty-hero-scene__grid-window\s*\{[^}]*top:\s*1px[^}]*width:\s*100vw[^}]*height:\s*597px[^}]*overflow:\s*hidden/s);
  assert.match(styles, /\.warranty-hero-scene__light--main\s*\{[^}]*top:\s*246\.954px[^}]*left:\s*863\.668px[^}]*width:\s*1376\.428px[^}]*height:\s*428\.002px/s);
  assert.match(styles, /\.warranty-hero-scene__light--soft\s*\{[^}]*top:\s*158\.189px[^}]*left:\s*-25px[^}]*width:\s*1017px[^}]*height:\s*341\.138px/s);
  assert.match(styles, /\.warranty-overview\s*\{[^}]*min-height:\s*409px/s);
  assert.match(styles, /\.warranty-overview__visual\s*\{[^}]*position:\s*relative/s);
  assert.match(styles, /\.warranty-overview__image\s*\{[^}]*position:\s*absolute[^}]*object-fit:\s*cover/s);
  assert.match(styles, /\.warranty-process__grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s);
  assert.match(markup, /class="warranty-section-heading warranty-process__heading"/);
  assert.match(styles, /\.warranty-process__heading\s*\{[^}]*gap:\s*20px/s);
  assert.match(styles, /\.warranty-process-card\s*\{[^}]*min-height:\s*373px/s);
  assert.match(styles, /\.warranty-process-card__list li\s*\{[^}]*min-height:\s*39px[^}]*warranty-process-pattern\.png[^}]*305px 39px/s);
  assert.match(styles, /@media \(max-width: 1199px\)[\s\S]*?\.warranty-process-card__list li\s*\{[^}]*height:\s*auto[^}]*min-height:\s*39px/s);
  assert.match(styles, /\.warranty-return-card__title\s*\{[^}]*font-size:\s*40px[^}]*font-weight:\s*600[^}]*line-height:\s*1\.1/s);
  assert.match(styles, /\.warranty-return-card__heading\s*\{[^}]*min-height:\s*130px[^}]*gap:\s*10px/s);
  assert.match(styles, /\.warranty-return-card--non-returnable \.warranty-return-card__heading\s*\{[^}]*min-height:\s*120px/s);
  assert.match(styles, /\.warranty-return-card__note\s*\{[^}]*font-size:\s*14px/s);
  assert.match(styles, /\.warranty-return-card__list\s*\{[^}]*gap:\s*10px 20px/s);
  assert.match(styles, /\.warranty-return-card__list li\s*\{[^}]*min-height:\s*64px[^}]*warranty-return-pattern-positive\.png/s);
  assert.match(styles, /\.warranty-return-card__list--negative li\s*\{[^}]*warranty-return-pattern-negative-short\.png/s);
  assert.match(styles, /@media \(max-width: 1199px\)[\s\S]*?\.warranty-return-card,[\s\S]*?height:\s*auto/s);
  assert.match(markup, /class="warranty-check-list warranty-exclusions__list"/);
  assert.match(styles, /\.warranty-exclusions__heading\s*\{[^}]*min-height:\s*98px/s);
  assert.match(styles, /\.warranty-exclusions__list li\s*\{[^}]*display:\s*flex[^}]*min-height:\s*24px/s);
  assert.match(styles, /\.warranty-check-list\.warranty-exclusions__list li::before\s*\{[^}]*content:\s*none/s);
  assert.match(styles, /\.warranty-exclusions__note\s*\{[^}]*font-size:\s*16px/s);
  assert.match(styles, /\.warranty-memo__grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)[^}]*gap:\s*20px/s);
  assert.match(styles, /\.warranty-memo-card\s*\{[^}]*min-height:\s*120px[^}]*padding:\s*20px[^}]*border:\s*1px solid var\(--line\)[^}]*border-radius:\s*var\(--radius\)/s);
  assert.match(styles, /\.warranty-memo-card__body\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column[^}]*gap:\s*5px/s);
  assert.match(styles, /\.warranty-memo-card__title\s*\{[^}]*font-size:\s*24px[^}]*font-weight:\s*400[^}]*line-height:\s*1\.2/s);
  assert.match(styles, /\.warranty-memo-card__description\s*\{[^}]*font-size:\s*14px[^}]*line-height:\s*1\.2/s);
  assert.match(styles, /@media \(max-width: 1199px\)[\s\S]*?\.warranty-memo-card\s*\{[^}]*height:\s*auto[^}]*min-height:\s*120px/s);
  for (const rulePattern of [
    /\.warranty-hero\s*\{[^}]*\}/,
    /\.warranty-overview\s*\{[^}]*\}/,
    /\.warranty-process-card\s*\{[^}]*\}/,
    /\.warranty-process-card__list li\s*\{[^}]*\}/,
    /\.warranty-exclusions__heading\s*\{[^}]*\}/,
    /\.warranty-return-card\s*\{[^}]*\}/,
    /\.warranty-return-card__heading\s*\{[^}]*\}/,
    /\.warranty-return-card__list li\s*\{[^}]*\}/,
    /\.warranty-memo-card\s*\{[^}]*\}/,
  ]) {
    const rule = styles.match(rulePattern)?.[0] ?? "";
    assert.doesNotMatch(rule, /[;{\s]height:\s*\d+px/, `${rulePattern} must grow with its content`);
  }
  assert.doesNotMatch(styles, /min-width:\s*1920px/);

  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);
  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  assert.match(mobileStyles, /\.warranty-overview\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(mobileStyles, /\.warranty-process__grid,[\s\S]*?grid-template-columns:\s*1fr/s);
  assert.match(mobileStyles, /\.warranty-return-card[\s\S]*?min-height:\s*0/s);
});

test("warranty Figma asset is local and every local resource resolves", () => {
  assert.match(markup, /src="assets\/warranty-service\.png"/);
  assert.match(markup, /src="assets\/hero-pattern\.png"/);
  assert.match(markup, /src="assets\/warranty-hero-light-main\.svg"/);
  assert.match(markup, /src="assets\/warranty-hero-light-soft\.svg"/);
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
  assert.ok(existsSync(resolve(projectRoot, "assets/warranty-process-pattern.png")));
  for (const asset of [
    "warranty-return-check.png",
    "warranty-return-close.png",
    "warranty-return-pattern-positive.png",
    "warranty-return-pattern-positive-tall.png",
    "warranty-return-pattern-positive-wide.png",
    "warranty-return-pattern-negative.png",
    "warranty-return-pattern-negative-short.png",
  ]) {
    assert.ok(existsSync(resolve(projectRoot, `assets/${asset}`)), `Missing return asset: ${asset}`);
  }

  const resources = [...markup.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("all site pages expose the warranty route", () => {
  const pages = readdirSync(projectRoot)
    .filter((file) => file.endsWith(".html") && file !== "warranty.html");

  for (const page of pages) {
    const pageMarkup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(
      pageMarkup,
      /href="warranty\.html"[^>]*>Гарантии и сервис<\/a>/,
      `${page} must link to the warranty page`,
    );
  }
});
