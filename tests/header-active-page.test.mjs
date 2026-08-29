import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");

test("active header link matches the Figma text and underline treatment", () => {
  const styles = read("styles.css");

  assert.match(styles, /\.site-nav__link\{[^}]*position:relative[^}]*display:flex[^}]*min-height:46px[^}]*align-items:center[^}]*\}/);
  assert.match(styles, /\.site-nav__link--active\{[^}]*color:var\(--red\)[^}]*\}/);
  assert.match(styles, /\.site-nav__link--active::after\{[^}]*right:0[^}]*bottom:0[^}]*left:0[^}]*height:1px[^}]*background:var\(--red\)[^}]*\}/);
});

test("primary and detail pages identify the active navigation destination", () => {
  const cases = [
    ["cars.html", "Автомобили"],
    ["brand.html", "Автомобили"],
    ["service-detail.html", "Автомобили"],
    ["model-service-detail.html", "Автомобили"],
    ["services.html", "Услуги"],
    ["diagnostics.html", "Услуги"],
    ["promotions.html", "Акции"],
    ["promotion-detail.html", "Акции"],
    ["about.html", "О компании"],
    ["contacts.html", "Контакты"],
    ["branch.html", "Контакты"],
  ];

  for (const [file, label] of cases) {
    const markup = read(file);
    const activeLink = new RegExp(
      `<a class="site-nav__link site-nav__link--active"[^>]*aria-current="page"[^>]*>${label}</a>`,
    );

    assert.match(markup, activeLink, `${file} should mark ${label} as the current page`);
  }
});

test("legal entities header link opens the dedicated business page", () => {
  const htmlFiles = readdirSync(projectRoot).filter((file) => file.endsWith(".html") && file !== "business.html");

  for (const file of htmlFiles) {
    const markup = read(file);
    if (!markup.includes('class="site-nav"')) continue;

    assert.match(
      markup,
      /<a class="site-nav__link" href="business\.html">Для юр\.лиц<\/a>/,
      `${file} should link its header to business.html`,
    );
    assert.doesNotMatch(markup, /<a class="site-nav__link" href="index\.html#business">Для юр\.лиц<\/a>/);
  }
});
