import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");

test("the shared entrypoint initializes the vehicle dropdown", () => {
  const source = read("js/main.js");
  assert.match(source, /import \{ initVehicleMenu \} from "\.\/modules\/vehicle-menu\.js";/);
  assert.match(source, /initVehicleMenu\(\);/);
});

test("vehicle dropdown reuses every local brand asset from the Figma menu", () => {
  const source = read("js/modules/navigation-data.js");

  for (const brand of ["fiat", "ford", "peugeot", "citroen", "iveco", "renault", "jac", "sollers", "mercedes"]) {
    assert.match(source, new RegExp(`assets/car-logo-${brand}\\.png`));
  }

  assert.match(source, /assets\/vehicle-menu-all\.png", width: 1254, height: 1254/);
  assert.doesNotMatch(source, /figma\.com\/api\/mcp\/asset/);
});

test("vehicle dropdown supports hover and keyboard interaction", () => {
  const source = read("js/modules/vehicle-menu.js");

  assert.doesNotMatch(source, /vehicle-menu__item--current|current:\s*true/);
  assert.match(source, /addEventListener\("mouseenter", open\)/);
  assert.match(source, /addEventListener\("mouseleave", scheduleClose\)/);
  assert.match(source, /addEventListener\("focus", open\)/);
  assert.match(source, /event\.key !== "Escape"/);
  assert.match(source, /aria-expanded/);
  assert.match(source, /toggleAttribute\("inert", !open\)/);
});

test("desktop navigation builds the Figma service and company dropdowns from shared data", () => {
  const menuSource = read("js/modules/vehicle-menu.js");
  const mobileSource = read("js/modules/mobile-menu.js");
  const dataSource = read("js/modules/navigation-data.js");

  assert.match(menuSource, /triggerLabel: "Услуги"/);
  assert.match(menuSource, /id: "services-menu"/);
  assert.match(menuSource, /triggerLabel: "О компании"/);
  assert.match(menuSource, /id: "company-menu"/);
  assert.doesNotMatch(menuSource, /desktop-card-menu__item--selected|index === 0/);
  assert.match(mobileSource, /import \{ companyItems, services, vehicles \} from "\.\/navigation-data\.js"/);

  for (const asset of [
    "service-maintenance.png", "service-diagnostics.png", "service-repair.png",
    "service-replacement.png", "service-injectors.png", "service-extra.png",
    "mobile-menu-about.png", "mobile-menu-tour.png", "mobile-menu-reviews.png",
    "mobile-menu-vacancies.png", "mobile-menu-client-zone.png", "mobile-menu-warranty.png",
  ]) {
    assert.match(dataSource, new RegExp(`assets/${asset.replace(".", "\\.")}`));
  }
  assert.doesNotMatch(dataSource, /figma\.com\/api\/mcp\/asset/);
});

test("desktop dropdowns keep the Figma geometry and mobile fallback", () => {
  const styles = read("styles.css");

  assert.match(styles, /\.site-header\.site-header--desktop-menu-ready\.site-header--desktop-menu-open\{z-index:100\}/);
  assert.match(styles, /\.vehicle-menu\{[^}]*isolation:isolate[^}]*top:calc\(100% \+ 10px\)[^}]*height:382px[^}]*padding:40px[^}]*border-radius:20px[^}]*background-color:#fff/s);
  assert.match(styles, /\.vehicle-menu::before\{[^}]*height:11px[^}]*content:""/);
  assert.doesNotMatch(styles, /\.vehicle-menu::before\{[^}]*background/);
  assert.doesNotMatch(styles, /\.vehicle-menu\{[^}]*(?:opacity|backdrop-filter|background:[^;}]*rgba)/s);
  assert.match(styles, /\.vehicle-menu__grid\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)[^}]*grid-template-rows:repeat\(2,141px\)[^}]*gap:20px/s);
  assert.match(styles, /\.vehicle-menu__image-frame--all\{[^}]*width:175px[^}]*height:105px/s);
  assert.match(styles, /\.vehicle-menu__image--all\{[^}]*top:-38\.05%[^}]*left:-3\.55%[^}]*width:106\.67%[^}]*height:177\.78%/s);
  assert.match(styles, /\.vehicle-menu__item:hover \.vehicle-menu__label,[^{]+\{[^}]*border-bottom:1px solid var\(--blue\)[^}]*color:var\(--blue\)/s);
  assert.match(styles, /\.desktop-card-menu\{[^}]*top:calc\(100% \+ 10px\)[^}]*padding:40px[^}]*border:1px solid var\(--line\)[^}]*border-radius:20px[^}]*background-color:#fff/s);
  assert.match(styles, /\.desktop-card-menu--services\{height:auto;min-height:352px\}/);
  assert.match(styles, /\.desktop-card-menu--company\{height:auto;min-height:302px\}/);
  assert.match(styles, /\.desktop-card-menu__grid\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)[^}]*grid-template-rows:repeat\(2,minmax\(0,1fr\)\)[^}]*gap:20px/s);
  assert.match(styles, /\.desktop-card-menu__item\{[^}]*gap:20px[^}]*padding:20px[^}]*border:1px solid var\(--soft\)[^}]*border-radius:20px/s);
  assert.doesNotMatch(styles, /\.desktop-card-menu__item--selected/);
  assert.match(styles, /\.desktop-card-menu__item:hover,\.desktop-card-menu__item:focus-visible\{[^}]*border-color:var\(--line\)[^}]*background:var\(--paper\)/s);
  assert.match(styles, /\.desktop-card-menu__image-frame\{[^}]*width:60px[^}]*height:60px[^}]*border-radius:10px/s);
  assert.match(styles, /\.desktop-card-menu__title\{[^}]*font-family:Geologica[^}]*font-size:18px[^}]*line-height:1\.2/s);
  assert.match(styles, /\.desktop-card-menu__description\{[^}]*color:var\(--muted\)[^}]*font-size:14px[^}]*line-height:1\.2/s);
  assert.match(styles, /@media \(max-width:1199px\)\{\.vehicle-menu\{display:none\}\}/);
  assert.match(styles, /@media \(max-width:1199px\)\{\.desktop-card-menu\{display:none\}\}/);
});
