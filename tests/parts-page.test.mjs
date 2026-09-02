import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");

test("parts page follows the Figma section order", () => {
  const markup = read("parts.html");
  const sections = [
    "parts-hero",
    "part-search",
    "booking",
    "parts-promo",
    "parts-categories",
    "part-options",
    "parts-cars",
    "parts-installation",
    "parts-delivery",
    "parts-locations",
    "benefits",
    "team",
    "faq-request",
    "parts-seo",
  ];

  let previous = -1;
  for (const block of sections) {
    const index = markup.indexOf(`class="${block}`);
    assert.ok(index > previous, `${block} should follow the previous Figma section`);
    previous = index;
  }
});

test("parts page reuses shared project components and ESM", () => {
  const markup = read("parts.html");
  const entrypoint = read("js/main.js");

  for (const block of ["site-header", "booking", "benefits", "team", "faq-request", "site-footer"]) {
    assert.match(markup, new RegExp(`class="${block}`));
  }
  assert.match(markup, /src="app\.js" defer/);
  assert.match(entrypoint, /initPartSearch/);
  assert.match(entrypoint, /initForms/);
  assert.match(entrypoint, /initSliders/);
});

test("parts paginated scrollers support mouse dragging", () => {
  const module = read("js/modules/scroll-pagination.js");
  const styles = read("parts-page.css");

  assert.match(module, /addEventListener\("pointerdown"/);
  assert.match(module, /addEventListener\("pointermove"/);
  assert.match(module, /setPointerCapture/);
  assert.match(module, /scrollToItem\(scroller, items\[targetIndex\]\)/);
  assert.match(styles, /\[data-scroll-pagination\]\[data-pointer-dragging="true"\][^{]*\{[^}]*cursor:\s*grabbing[^}]*scroll-snap-type:\s*none/s);
});

test("parts page uses local Figma assets and all resources resolve", () => {
  const markup = read("parts.html");
  for (const asset of [
    "assets/parts-hero-transparent.png",
    "assets/parts-original.png",
    "assets/parts-analog.png",
    "assets/parts-restored.png",
    "assets/parts-used.png",
  ]) {
    assert.match(markup, new RegExp(asset.replaceAll("/", "\\/")));
    assert.ok(existsSync(resolve(projectRoot, asset)), `${asset} should exist`);
  }
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
});

test("parts page is fluid and has a content-driven mobile layout", () => {
  const styles = read("parts-page.css");
  const mobileStyles = styles.slice(styles.indexOf("@media (max-width: 767px)"));

  assert.match(styles, /grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /@media \(max-width:\s*1199px\)/);
  assert.match(styles, /@media \(max-width:\s*767px\)/);
  assert.match(styles, /\.parts-hero\s*\{[^}]*min-height:/s);
  assert.doesNotMatch(styles, /min-width:\s*1920px/);
  assert.match(mobileStyles, /\.parts-promo\s*\{[^}]*min-height:\s*0/s);
});

test("parts hero uses the shared in-flow visual on desktop", () => {
  const markup = read("parts.html");
  const styles = read("parts-page.css");

  assert.match(markup, /class="parts-hero__visual" data-node-id="258:28181"[^>]*>[\s\S]*?class="parts-hero__image" src="assets\/parts-hero-transparent\.png"/);
  assert.match(styles, /\.parts-hero\s*\{[^}]*min-height:\s*565px/s);
  assert.match(styles, /\.parts-hero__visual\s*\{[^}]*display:\s*block[^}]*max-width:\s*540px[^}]*aspect-ratio:\s*540 \/ 403[^}]*align-self:\s*start[^}]*margin-top:\s*21px/s);
  assert.match(styles, /\.parts-hero__image\s*\{[^}]*display:\s*block[^}]*width:\s*100%[^}]*height:\s*100%[^}]*object-fit:\s*cover/s);
  assert.doesNotMatch(styles, /\.parts-hero__image\s*\{[^}]*position:\s*absolute/s);
  assert.doesNotMatch(styles, /\.parts-hero__image\s*\{[^}]*mix-blend-mode/s);
  assert.doesNotMatch(markup, /parts-hero-scene__(?:composition|mobile-composition)/);
});

test("parts hero keeps the same proportional visual in the mobile content flow", () => {
  const markup = read("parts.html");
  const styles = read("parts-page.css");
  const mobileStyles = styles.slice(styles.indexOf("@media (max-width: 767px)"));

  assert.match(markup, /class="parts-hero__image" src="assets\/parts-hero-transparent\.png"/);
  assert.match(mobileStyles, /\.parts-hero\s*\{[^}]*display:\s*flex[^}]*min-height:\s*0[^}]*flex-direction:\s*column/s);
  assert.match(mobileStyles, /\.parts-hero__description\s*\{[^}]*font-size:\s*16px[^}]*line-height:\s*19px/s);
  assert.match(mobileStyles, /\.parts-hero__button\s*\{[^}]*width:\s*min\(316px, 100%\)/s);
  assert.match(mobileStyles, /\.parts-hero__visual\s*\{[^}]*display:\s*block[^}]*aspect-ratio:\s*540 \/ 403[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(mobileStyles, /parts-hero-scene__mobile-composition/);
});

test("parts booking matches the Figma parts request form", () => {
  const markup = read("parts.html");
  const styles = read("parts-page.css");

  assert.match(markup, /class="booking booking--parts layout-container"/);
  assert.match(markup, />Марка<\/span>/);
  assert.match(markup, />Модель<\/span>/);
  assert.match(markup, />Название детали или артикул<\/span>/);
  assert.match(markup, /<span class="booking__bearing-glow" aria-hidden="true"><\/span>/);
  assert.match(styles, /\.booking--parts\s*\{[^}]*height:\s*auto[^}]*min-height:\s*601px[^}]*padding:\s*39px/s);
  assert.match(styles, /@media \(max-width: 767px\)[\s\S]*?\.parts-page \.booking\s*\{[^}]*height:\s*auto[^}]*min-height:\s*799px/s);
  assert.match(styles, /\.booking--parts \.booking__vehicle\s*\{[^}]*width:\s*40\.875%[^}]*height:\s*auto/s);
  assert.match(styles, /\.booking--parts \.booking__bearing\s*\{[^}]*animation:\s*none[^}]*transform:\s*rotate\(0\.321rad\)/s);
  assert.match(styles, /\.booking--parts \.booking__bolt\s*\{[^}]*animation:\s*none/s);
  assert.match(styles, /\.booking__bearing-glow\s*\{[^}]*background:\s*radial-gradient/s);
  assert.match(styles, /\.booking-form__field--wide\.booking__field\s*\{[^}]*grid-column:\s*1 \/ -1/s);
  assert.match(styles, /@media \(max-width: 767px\)[\s\S]*?\.booking--parts \.booking__bearing\s*\{[^}]*top:\s*663px[^}]*left:\s*240px[^}]*width:\s*197px[^}]*transform:\s*none/s);
});

test("parts picker dialog matches the dedicated Figma form", () => {
  const markup = read("parts.html");
  const styles = read("styles.css");
  const entrypoint = read("js/main.js");
  const dialog = markup.match(/<dialog class="request-dialog request-dialog--parts"[\s\S]*?<\/dialog>/)?.[0] ?? "";

  assert.match(markup, /data-part-request-open>Подобрать запчасть<\/button>/);
  assert.match(dialog, /data-part-request-dialog/);
  assert.match(dialog, /Подберите запчасть для своего автомобиля/);
  assert.match(dialog, /Укажите автомобиль и нужную деталь/);
  for (const field of ["name", "phone", "model", "brand", "year", "vin", "part", "consent"]) {
    assert.match(dialog, new RegExp(`name="${field}"`));
  }
  for (const asset of ["assets/booking-pattern.png", "assets/booking-bolt.png", "assets/vacancy-detail-close.svg"]) {
    assert.match(dialog, new RegExp(asset.replaceAll("/", "\\/")));
    assert.ok(existsSync(resolve(projectRoot, asset)), `${asset} should exist`);
  }
  assert.match(styles, /\.request-dialog\s*\{[^}]*width:\s*min\(864px,[^}]*border-radius:\s*var\(--radius\)/s);
  assert.match(styles, /\.request-dialog__content\s*\{[^}]*gap:\s*40px[^}]*padding:\s*40px/s);
  assert.match(styles, /\.request-dialog__fields\s*\{[^}]*grid-template-columns:\s*repeat\(2,[^}]*gap:\s*20px/s);
  assert.match(styles, /\.request-dialog--parts \.request-dialog__bolt\s*\{[^}]*top:\s*593px[^}]*left:\s*699px/s);
  assert.match(styles, /\.request-dialog__bolt\s*\{[^}]*width:\s*198\.254px/s);
  assert.match(styles, /@media \(max-width: 767px\)[\s\S]*?\.request-dialog__fields\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(entrypoint, /initPartRequestDialog/);
  assert.doesNotMatch(dialog, /figma\.com\/api\/mcp\/asset/);
});

test("parts picker dialog opens and closes through its focused ESM", async (context) => {
  const originalDocument = globalThis.document;
  context.after(() => {
    globalThis.document = originalDocument;
  });

  const closeButton = {
    addEventListener(_type, listener) {
      this.listener = listener;
    },
  };
  const dialog = {
    focused: false,
    listener: null,
    open: false,
    addEventListener(_type, listener) {
      this.listener = listener;
    },
    close() {
      this.open = false;
    },
    focus() {
      this.focused = true;
    },
    querySelector() {
      return closeButton;
    },
    showModal() {
      this.open = true;
    },
  };
  const opener = {
    addEventListener(_type, listener) {
      this.listener = listener;
    },
  };
  globalThis.document = {
    querySelector: () => dialog,
    querySelectorAll: () => [opener],
  };

  const { initPartRequestDialog } = await import("../js/modules/part-request-dialog.js");
  const controls = initPartRequestDialog();

  opener.listener();
  assert.equal(dialog.open, true);
  assert.equal(dialog.focused, true);
  closeButton.listener();
  assert.equal(dialog.open, false);
  controls.open();
  dialog.listener({ target: dialog });
  assert.equal(dialog.open, false);
});

test("parts store promo matches the Figma desktop geometry and icon", () => {
  const markup = read("parts.html");
  const styles = read("parts-page.css");

  assert.match(markup, /class="parts-promo layout-container"/);
  assert.match(markup, /class="parts-promo__image" src="assets\/business\.jpg"/);
  assert.ok(existsSync(resolve(projectRoot, "assets/parts-promo-check.svg")));
  assert.match(styles, /\.parts-promo\s*\{[^}]*min-height:\s*490px[^}]*grid-template-columns:[^;]*788px[^}]*padding-left:\s*40px/s);
  assert.match(styles, /\.parts-promo__content\s*\{[^}]*gap:\s*30px[^}]*padding:\s*60px 0/s);
  assert.match(styles, /\.parts-promo__features-item:is\(li\)::before\s*\{[^}]*width:\s*24px[^}]*height:\s*24px[^}]*parts-promo-check\.svg/s);
});

test("parts categories match the Figma grid, content, and icon", () => {
  const markup = read("parts.html");
  const styles = read("parts-page.css");
  const section = markup.match(/<section class="parts-categories[\s\S]*?<\/section>/)?.[0] ?? "";
  const labels = [...section.matchAll(/<li class="parts-category"><img[^>]+\/>([^<]+)<\/li>/g)].map((match) => match[1]);

  assert.deepEqual(labels, [
    "Фильтры", "Масла", "Тормозные колодки", "Тормозные диски", "Амортизаторы", "Подвеска",
    "Двигатель", "КПП", "Генераторы", "Двигатель", "КПП", "Генераторы",
    "Стартеры", "Оптика", "Электрика", "Стартеры", "Оптика", "Электрика",
  ]);
  assert.ok(existsSync(resolve(projectRoot, "assets/parts-category-check.svg")));
  assert.match(styles, /\.parts-categories\s*\{[^}]*gap:\s*20px/s);
  assert.match(styles, /\.parts-categories__list\s*\{[^}]*grid-template-columns:\s*repeat\(6,[^}]*gap:\s*20px/s);
  assert.match(styles, /\.parts-category\s*\{[^}]*min-height:\s*44px[^}]*gap:\s*10px[^}]*padding:\s*10px/s);
  assert.match(styles, /\.parts-category__icon\s*\{[^}]*width:\s*24px[^}]*height:\s*24px/s);
});

test("parts installation matches the Figma composition", () => {
  const markup = read("parts.html");
  const styles = read("parts-page.css");
  const section = markup.match(/<section class="parts-installation[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.match(section, /class="parts-section-heading parts-installation__heading"/);
  assert.equal((section.match(/src="assets\/parts-process-pattern\.png"/g) ?? []).length, 6);
  assert.match(section, /class="parts-installation__image" src="assets\/business\.jpg"/);
  assert.ok(existsSync(resolve(projectRoot, "assets/parts-process-pattern.png")));
  assert.match(styles, /\.parts-installation\s*\{[^}]*min-height:\s*518px[^}]*grid-template-columns:[^;]*925px[^;]*655px[^}]*gap:\s*20px/s);
  assert.match(styles, /\.parts-installation__heading\s*\{[^}]*gap:\s*20px/s);
  assert.match(styles, /\.parts-process\s*\{[^}]*grid-template-columns:\s*repeat\(2,[^}]*gap:\s*20px/s);
  assert.match(styles, /\.parts-process__item\s*\{[^}]*min-height:\s*84px[^}]*border-radius:\s*var\(--radius\)[^}]*background:\s*var\(--soft\)/s);
  assert.match(styles, /\.parts-process__pattern\s*\{[^}]*width:\s*195px[^}]*height:\s*84px/s);
  assert.match(styles, /\.parts-process__item > span\s*\{[^}]*z-index:\s*1/s);
  assert.match(styles, /\.parts-installation__image\s*\{[^}]*height:\s*518px/s);
});

test("parts delivery matches the Figma card grid", () => {
  const markup = read("parts.html");
  const styles = read("parts-page.css");
  const section = markup.match(/<section class="parts-delivery[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.equal((section.match(/class="parts-delivery__item"/g) ?? []).length, 6);
  assert.equal((section.match(/src="assets\/parts-delivery-pattern\.png"/g) ?? []).length, 6);
  assert.ok(existsSync(resolve(projectRoot, "assets/parts-delivery-pattern.png")));
  assert.match(styles, /\.parts-delivery\s*\{[^}]*min-height:\s*292px[^}]*gap:\s*20px[^}]*padding:\s*20px[^}]*background:\s*#cfdaea/s);
  assert.match(styles, /\.parts-delivery__list\s*\{[^}]*grid-template-columns:\s*repeat\(3,[^;]*506px[^}]*gap:\s*10px 20px/s);
  assert.match(styles, /\.parts-delivery__item\s*\{[^}]*min-height:\s*62px[^}]*padding:\s*20px[^}]*border-radius:\s*var\(--radius\)[^}]*background:\s*var\(--soft\)/s);
  assert.match(styles, /\.parts-delivery__pattern\s*\{[^}]*width:\s*195px[^}]*height:\s*62px/s);
});

test("parts locations match the Figma content and list geometry", () => {
  const markup = read("parts.html");
  const styles = read("parts-page.css");
  const section = markup.match(/<section class="parts-locations[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.match(section, /Получите консультацию и заберите запчасти в удобной точке<\/p>/);
  assert.match(section, /В AutoMD можно получить консультацию по запчастям, уточнить наличие, оформить заказ или записаться на установку в техцентр\./);
  assert.equal((section.match(/class="parts-locations__item"/g) ?? []).length, 6);
  assert.equal((section.match(/src="assets\/parts-locations-check\.svg"/g) ?? []).length, 6);
  assert.ok(existsSync(resolve(projectRoot, "assets/parts-locations-check.svg")));
  assert.match(styles, /\.parts-locations\s*\{[^}]*gap:\s*20px/s);
  assert.match(styles, /\.parts-locations__heading\s*\{[^}]*min-height:\s*120px/s);
  assert.match(styles, /\.parts-locations__list\s*\{[^}]*gap:\s*10px/s);
  assert.match(styles, /\.parts-locations__description\s*\{[^}]*color:\s*var\(--ink\)/s);
  assert.match(styles, /\.parts-locations__item\s*\{[^}]*min-height:\s*24px[^}]*color:\s*var\(--muted\)[^}]*font-size:\s*16px/s);
  assert.match(styles, /\.parts-locations__icon\s*\{[^}]*width:\s*24px[^}]*height:\s*24px[^}]*flex:\s*0 0 24px/s);
});

test("part number example fills and focuses the search field", async (context) => {
  const originalDocument = globalThis.document;
  context.after(() => {
    globalThis.document = originalDocument;
  });

  const input = { focused: false, value: "", focus() { this.focused = true; } };
  const form = { querySelector: () => input };
  const example = {
    dataset: { partSearchExample: "5801407375" },
    addEventListener(_type, listener) { this.listener = listener; },
  };
  globalThis.document = {
    querySelector(selector) {
      if (selector === "[data-part-search]") return form;
      if (selector === "[data-part-search-example]") return example;
      return null;
    },
  };

  const { initPartSearch } = await import("../js/modules/part-search.js");
  initPartSearch();
  example.listener();

  assert.equal(input.value, "5801407375");
  assert.equal(input.focused, true);
});

test("existing pages expose the parts route", () => {
  for (const file of ["index.html", "cars.html", "services.html", "about.html", "contacts.html"]) {
    assert.match(read(file), /class="site-nav__link[^\"]*" href="parts\.html"[^>]*>Запчасти<\/a>/);
  }
});
