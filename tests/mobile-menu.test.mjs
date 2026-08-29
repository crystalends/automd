import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");
const moduleSource = read("js/modules/mobile-menu.js");
const styles = read("styles.css");

test("mobile menu implements all five Figma screens from shared site data", () => {
  assert.match(moduleSource, /dataset\.mobileMenuView = "root"/);
  assert.match(moduleSource, /dataset\.mobileMenuView = "vehicles"/);
  assert.match(moduleSource, /dataset\.mobileMenuView = "services"/);
  assert.match(moduleSource, /view: "company"/);
  assert.match(moduleSource, /view: "promotions"/);
  assert.match(moduleSource, /import \{ vehicles \} from "\.\/vehicle-menu\.js"/);

  for (const label of [
    "Плановое ТО",
    "Диагностика",
    "Ремонт",
    "Замена",
    "Форсунки",
    "Дополнительные услуги",
    "О AutoMD",
    "3D-тур",
    "Отзывы",
    "Вакансии",
    "Клиентская зона",
    "Гарантии и сервис",
    "Все акции",
    "Страховка со скидкой",
  ]) {
    assert.match(moduleSource, new RegExp(label));
  }
});

test("mobile menu uses a modal dialog with accessible focus and navigation state", () => {
  assert.match(moduleSource, /document\.createElement\("dialog"\)/);
  assert.match(moduleSource, /dialog\.showModal\(\)/);
  assert.match(moduleSource, /dialog\.close\(\)/);
  assert.match(moduleSource, /toggle\.setAttribute\("aria-expanded", "true"\)/);
  assert.match(moduleSource, /navigation\.toggleAttribute\("inert", mobile\)/);
  assert.match(moduleSource, /toggle\.focus\(\)/);
  assert.match(moduleSource, /aria-haspopup/);
  assert.doesNotMatch(moduleSource, /site-header--menu-open/);
});

test("mobile menu preserves the 390px Figma geometry and responsive overflow", () => {
  assert.match(styles, /\.mobile-menu\[open\]\s*\{[^}]*position:fixed;[^}]*width:100vw;[^}]*height:100dvh;[^}]*overflow:auto;/s);
  assert.match(styles, /\.mobile-menu__screen\s*\{[^}]*min-height:100dvh;[^}]*padding:20px 16px;/s);
  assert.match(styles, /\.mobile-menu__navigation\s*\{[^}]*gap:30px;[^}]*margin-top:40px;/s);
  assert.match(styles, /\.mobile-menu__call\s*\{[^}]*min-height:46px;[^}]*margin-top:auto;/s);
  assert.match(styles, /\.mobile-menu__vehicles\{gap:20px\}/);
  assert.match(styles, /\.mobile-menu__services\{gap:10px\}/);
  assert.match(styles, /\.mobile-menu__service\s*\{[^}]*gap:20px;[^}]*padding:20px;[^}]*border-radius:20px;/s);
  assert.match(styles, /\.mobile-menu__simple-list\{gap:10px\}/);
  assert.match(styles, /\.mobile-menu__simple-list--spacious\{gap:20px\}/);
  assert.match(styles, /\.mobile-menu__simple-item\s*\{[^}]*min-height:90px;[^}]*padding:20px;[^}]*border-radius:20px;/s);
});

test("all exact Figma interface icons are stored locally", () => {
  for (const asset of [
    "mobile-menu-arrow-blue.svg",
    "mobile-menu-arrow-red.svg",
    "mobile-menu-arrow-small.svg",
    "mobile-menu-arrow.svg",
    "mobile-menu-close.svg",
    "mobile-menu-phone.svg",
    "mobile-menu-pin.svg",
    "mobile-menu-search.svg",
    "mobile-menu-time.svg",
    "mobile-menu-about.png",
    "mobile-menu-client-zone.png",
    "mobile-menu-insurance.png",
    "mobile-menu-promotions.png",
    "mobile-menu-reviews.png",
    "mobile-menu-tour.png",
    "mobile-menu-vacancies.png",
    "mobile-menu-warranty.png",
  ]) {
    assert.ok(existsSync(resolve(projectRoot, `assets/${asset}`)), `missing local Figma asset ${asset}`);
  }
  assert.doesNotMatch(moduleSource, /figma\.com\/api\/mcp\/asset/);
});

test("the shared site entrypoint initializes the mobile menu", () => {
  const source = read("js/main.js");
  assert.match(source, /import \{ initMobileMenu \} from "\.\/modules\/mobile-menu\.js"/);
  assert.match(source, /initMobileMenu\(\)/);
});
