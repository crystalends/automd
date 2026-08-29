import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "promotion-detail.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "promotion-detail.css"), "utf8");
const fontStyles = readFileSync(resolve(projectRoot, "fonts.css"), "utf8");

test("promotion detail keeps the Figma section order and composition", () => {
  const sections = ["promotion-hero", "promotion-includes", "related-promotions", "site-footer"];
  let previousIndex = -1;

  for (const section of sections) {
    const sectionIndex = markup.indexOf(`class="${section}`);
    assert.ok(sectionIndex > previousIndex, `${section} must follow the previous section`);
    previousIndex = sectionIndex;
  }

  assert.equal((markup.match(/<article class="promotion-card related-promotions__promotion-card">/g) ?? []).length, 4);
  assert.match(styles, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(styles, /\.related-promotions__grid\s*\{[^}]*repeat\(4, minmax\(0, 1fr\)\)/s);
});

test("promotion detail is fluid and has a mobile reflow", () => {
  assert.match(styles, /--promotion-detail-gap:\s*clamp\(/);
  assert.match(styles, /aspect-ratio:\s*790 \/ 399/);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);

  const mobileStart = styles.indexOf("@media (max-width: 767px)");
  const narrowStart = styles.indexOf("@media (max-width: 359px)");
  const mobileStyles = styles.slice(mobileStart, narrowStart);

  assert.ok(mobileStart >= 0, "mobile breakpoint must exist");
  assert.match(mobileStyles, /\.promotion-hero__meta\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(mobileStyles, /\.related-promotions__grid\s*\{[^}]*overflow-x:\s*auto[^}]*scroll-snap-type:\s*x mandatory/s);
});

test("promotion detail uses local assets and all resources resolve", () => {
  assert.match(markup, /src="assets\/promotion-detail-hero\.png"/);
  assert.match(markup, /src="assets\/promotion-detail-glow\.svg"/);
  for (const node of ["56057", "56058", "56059", "56060", "56061"]) {
    assert.match(markup, new RegExp(`data-node-id="267:${node}"`));
  }
  assert.match(styles, /\.promotion-detail-fade--6 \.promotion-detail-fade__image\s*\{[^}]*top:\s*-45\.56%[^}]*left:\s*-15\.61%/s);
  assert.match(markup, /src="assets\/promotion-detail-user-body\.svg"/);
  assert.match(markup, /src="assets\/promotion-detail-time-ring\.svg"/);
  assert.match(markup, /src="assets\/promotion-detail-check\.svg"/);
  assert.doesNotMatch(styles, /radial-gradient/);
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
  assert.match(fontStyles, /assets\/fonts\/aa-stetica-regular\.ttf/);
  assert.ok(existsSync(resolve(projectRoot, "assets/fonts/aa-stetica-regular.ttf")));

  const resources = [...markup.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map(([, value]) => value.split(/[?#]/)[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});

test("promotion cards link to the detail template", () => {
  const listing = readFileSync(resolve(projectRoot, "promotions.html"), "utf8");
  assert.equal((listing.match(/href="promotion-detail\.html">Подробнее<\/a>/g) ?? []).length, 16);
});
