import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "branch.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "branch-page.css"), "utf8");
const scrollPagination = readFileSync(
  resolve(projectRoot, "js/modules/scroll-pagination.js"),
  "utf8",
);

test("branch page follows the Figma desktop section order", () => {
  const sections = [
    "branch-hero",
    "branch-location",
    "branch-overview",
    "branch-directions",
    "branch-directions branch-directions--walking",
    "brand-services branch-services",
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

test("branch page reuses established project blocks and shared ESM", () => {
  assert.match(markup, /class="branch-contact-card location-card"/);
  assert.match(markup, /class="branch-overview__visual benefits__visual"/);
  assert.equal((markup.match(/<article class="brand-service-card/g) ?? []).length, 6);
  assert.match(markup, /class="faq-request /);
  assert.match(markup, /class="request-card"/);
  assert.match(markup, /type="module" src="js\/main\.js(?:\?[^\"]+)?"/);
});

test("branch page implements the route and branch-specific content", () => {
  assert.match(markup, /Как доехать на автомобиле/);
  assert.match(markup, /Как пройти пешком/);
  assert.equal((markup.match(/class="branch-step(?: |")/g) ?? []).length, 9);
  assert.match(markup, /mailto:bma@automd\.ru/);
  assert.equal((markup.match(/class="branch-directions__map"/g) ?? []).length, 2);
  assert.doesNotMatch(markup, /assets\/branch-route-map\.png/);
});

test("branch page uses only local design assets and all resources resolve", () => {
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
  assert.match(markup, /<iframe[\s\S]*?class="branch-location__map"/);
  assert.equal((markup.match(/src="https:\/\/yandex\.ru\/map-widget\/v1\//g) ?? []).length, 3);
  assert.match(markup, /src="assets\/benefits\.jpg"/);

  const resources = [...markup.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#\s]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:|mailto:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("branch layout is fluid and reflows from grids to mobile content", () => {
  assert.match(styles, /--branch-section-gap:\s*clamp\(/);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
  assert.match(styles, /\.branch-location\s*\{[^}]*grid-template-columns:\s*385px minmax\(0, 1fr\)/s);
  assert.match(styles, /\.branch-overview\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/s);

  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  assert.match(mobileStyles, /\.branch-location,[\s\S]*?\.branch-directions\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  assert.match(mobileStyles, /\.branch-directions__steps\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(mobileStyles, /\.branch-page \.brand-service-card\s*\{[^}]*height:\s*auto/s);
});

test("mobile services pagination is interactive and linked to the shared entrypoint", () => {
  assert.match(markup, /data-scroll-pagination="branch-services-pagination"/);
  assert.equal((markup.match(/class="brand-services__dot(?: |")/g) ?? []).length, 6);
  assert.match(scrollPagination, /scroller\.addEventListener\(\s*"scroll"/s);
  assert.match(scrollPagination, /dot\.addEventListener\("click"/);
  assert.match(scrollPagination, /setAttribute\("aria-current", "true"\)/);
  assert.match(scrollPagination, /removeAttribute\("aria-current"\)/);

  const main = readFileSync(resolve(projectRoot, "js/main.js"), "utf8");
  assert.match(main, /initScrollPagination/);
});
