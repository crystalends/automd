import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { initSliders } from "../js/modules/sliders.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("browser bundle exposes the vendored Swiper runtime to shared modules", () => {
  const buildScript = readFileSync(resolve(projectRoot, "scripts/build-js.mjs"), "utf8");
  assert.match(buildScript, /window\.Swiper = Swiper/u);
});

test("every benefits carousel uses real Swiper slides and pagination", () => {
  const pages = readdirSync(projectRoot)
    .filter((file) => extname(file) === ".html")
    .map((file) => ({ file, markup: readFileSync(resolve(projectRoot, file), "utf8") }))
    .filter(({ markup }) => markup.includes('class="benefits-slider swiper"'));

  assert.ok(pages.length > 0);
  for (const { file, markup } of pages) {
    const sliders = markup.match(/class="benefits-slider swiper"/gu) ?? [];
    const paginations = markup.match(/class="benefits-slider__pagination swiper-pagination(?: [^"]+)?"/gu) ?? [];
    assert.equal(paginations.length, sliders.length, `${file}: every benefits slider needs pagination`);
    assert.match(markup, /benefits-slider__slide swiper-slide/u, `${file}: missing Swiper slides`);
    assert.doesNotMatch(markup, /benefits-slider__pagination--/u, `${file}: pagination must reflect real slides`);
  }
});

test("shared slider module initializes every benefits carousel with its own clickable pagination", (context) => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  context.after(() => {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  });

  const instances = [];
  const createElement = (pagination) => ({
    parentElement: { querySelector: () => pagination },
    addEventListener() {},
    contains: () => false,
  });
  const paginations = [{ id: "first-pagination" }, { id: "second-pagination" }];
  const elements = paginations.map(createElement);

  class SwiperMock {
    constructor(element, options) {
      this.element = element;
      this.options = options;
      this.keyboard = { disable() {}, enable() {} };
      instances.push(this);
    }
  }

  globalThis.window = {
    Swiper: SwiperMock,
    matchMedia: () => ({ matches: true }),
  };
  globalThis.document = {
    querySelector: (selector) => (selector === ".swiper" ? elements[0] : null),
    querySelectorAll: (selector) => (selector === ".benefits-slider" ? elements : []),
  };

  const initialized = initSliders();

  assert.equal(instances.length, 2);
  assert.equal(initialized.length, 2);
  assert.equal(instances[0].options.pagination.el, paginations[0]);
  assert.equal(instances[1].options.pagination.el, paginations[1]);
  assert.equal(instances[0].options.pagination.clickable, true);
  assert.equal(instances[1].options.pagination.clickable, true);
});
