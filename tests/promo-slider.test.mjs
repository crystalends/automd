import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "index.html"), "utf8");
const sliderModule = readFileSync(resolve(projectRoot, "js/modules/sliders.js"), "utf8");
const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");

test("promo carousel uses the Swiper DOM contract", () => {
  assert.match(markup, /class="promo-banner__slider swiper"/);
  assert.match(markup, /class="swiper-wrapper"/);
  assert.equal((markup.match(/promo-banner__slide[^"\n]*swiper-slide/g) ?? []).length, 3);
  assert.match(markup, /promo-banner__pagination swiper-pagination/);
  assert.doesNotMatch(markup, /carousel-dots/);
});

test("promo carousel is initialized by the shared slider module", () => {
  assert.match(sliderModule, /const createPromoSlider = \(Swiper\) =>/);
  assert.match(sliderModule, /createPromoSlider\(Swiper\)/);
  assert.match(sliderModule, /autoplay: getPromoAutoplay\(\)/);
});

test("tire promotion is a content-based clickable banner", () => {
  assert.match(markup, /<a class="promo-banner__slide promo-banner__slide--tires swiper-slide" href="promotion-detail\.html"/);
  assert.match(markup, /class="promo-banner__title promo-banner__title--tires">Закажи шиномонтаж/);
  assert.match(markup, /class="promo-banner__features"/);
  assert.match(markup, /class="promo-banner__link">Подробнее<\/span>/);
  assert.doesNotMatch(markup, /src="assets\/promo-tires\.png"/);
});

test("mobile promo slides use a slightly taller fluid ratio", () => {
  assert.match(styles, /@media \(max-width:767px\)[\s\S]*?\.promo-banner__slide\{aspect-ratio:16\/6\}/);
  assert.doesNotMatch(styles, /\.promo-banner__slide\{[^}]*height:\s*144px/);
});
