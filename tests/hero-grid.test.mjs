import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sharedStyles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");
const pagesWithHeroGrid = [
  "3d-tour.html",
  "404.html",
  "about.html",
  "agreement.html",
  "article-detail.html",
  "articles.html",
  "branch.html",
  "brand.html",
  "business.html",
  "cars.html",
  "client-zone.html",
  "consent.html",
  "contacts.html",
  "diagnostics.html",
  "index.html",
  "model-service-detail.html",
  "parts.html",
  "prices.html",
  "privacy.html",
  "promotion-detail.html",
  "promotions.html",
  "reviews.html",
  "service-detail.html",
  "services.html",
  "vacancies.html",
  "warranty.html",
];

test("every hero that uses the grid shares one primitive", () => {
  for (const page of pagesWithHeroGrid) {
    const markup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.equal((markup.match(/\bhero-grid\b/g) ?? []).length, 1, `${page} must use one hero-grid host`);
    assert.doesNotMatch(markup, /class="[^"]*(?:hero-scene__pattern|error-page__pattern)[^"]*"/, `${page} must not render a local hero pattern`);
  }
});

test("shared grid uses both exact Figma light layers and one pattern", () => {
  assert.match(sharedStyles, /\.hero-grid::before\s*\{[^}]*height:820px/s);
  assert.match(sharedStyles, /background-image:url\("assets\/hero-grid-light-soft\.svg"\),url\("assets\/hero-grid-light-paper\.svg"\),url\("assets\/hero-pattern\.png"\)/);
  assert.match(sharedStyles, /background-position:clamp\(260px,31\.379vw,602\.477px\) 57\.947px,clamp\(260px,36\.125vw,693\.592px\) 138\.47px,center top/);
  assert.match(sharedStyles, /background-size:1638\.77px 722\.039px,1716\.58px 644\.97px,max\(1920px,100%\) auto/);
  assert.doesNotMatch(sharedStyles, /background-size:[^;]*100% 820px/);
  assert.match(sharedStyles, /@media \(max-width:767px\)\{[\s\S]*?\.hero-grid::before\s*\{[^}]*height:940px[^}]*background-size:cover/s);

  const softLight = readFileSync(resolve(projectRoot, "assets/hero-grid-light-soft.svg"), "utf8");
  const paperLight = readFileSync(resolve(projectRoot, "assets/hero-grid-light-paper.svg"), "utf8");
  assert.match(softLight, /fill="#F6F6F6"/);
  assert.match(paperLight, /fill="#FCFCFC"/);
  assert.ok(existsSync(resolve(projectRoot, "assets/hero-pattern.png")));
});

test("page styles do not keep obsolete hero pattern selectors", () => {
  const sourceStyles = readdirSync(projectRoot)
    .filter((file) => file.endsWith(".css") && file !== "app.css")
    .map((file) => readFileSync(resolve(projectRoot, file), "utf8"))
    .join("\n");

  assert.doesNotMatch(sourceStyles, /(?:hero-scene__pattern|error-page__pattern)/);
});
