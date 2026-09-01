import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "cars.html"), "utf8");
const pageStyles = readFileSync(resolve(projectRoot, "cars-page.css"), "utf8");
const sliderModule = readFileSync(resolve(projectRoot, "js/modules/sliders.js"), "utf8");

test("cars page contains the Figma desktop sections", () => {
  assert.match(markup, /class="cars-hero layout-container"/);
  assert.match(markup, /class="car-brands layout-container"/);
  assert.match(markup, /class="faq-request layout-container"/);
  assert.equal((markup.match(/<article class="vehicle-card">/g) ?? []).length, 10);
});

test("FAQ request section keeps the Figma structure and local pattern asset", () => {
  assert.equal((markup.match(/<details class="faq-item">/g) ?? []).length, 8);
  assert.match(markup, /class="request-card__actions"/);
  assert.match(markup, /src="assets\/faq-request-pattern\.png"/);
  assert.match(markup, /srcset="assets\/faq-request-pattern-mobile\.png"/);
  assert.match(pageStyles, /radial-gradient\(/);
  assert.ok(existsSync(resolve(projectRoot, "assets/faq-request-pattern-mobile.png")));
});

test("cars page implements the mobile Figma structure without a desktop width lock", () => {
  assert.match(markup, /class="cars-breadcrumb layout-container"/);
  assert.equal((markup.match(/class="car-brands__dot(?: car-brands__dot--active)?"/g) ?? []).length, 5);
  assert.match(pageStyles, /@media \(max-width: 767px\)/);
  assert.match(pageStyles, /--container: calc\(100vw - 32px\)/);
  assert.doesNotMatch(pageStyles, /min-width:\s*1200px/);
  assert.equal((markup.match(/class="cars-hero-scene__fade cars-hero-scene__fade--/g) ?? []).length, 4);
  assert.equal((markup.match(/class="cars-hero__visual-fade cars-hero__visual-fade--/g) ?? []).length, 4);
  assert.match(pageStyles, /\.cars-hero__visual\s*\{[^}]*position:\s*relative[^}]*display:\s*block[^}]*margin-top:\s*24px/s);
  assert.match(pageStyles, /\.cars-hero-scene__gear,[\s\S]*?\.cars-hero-scene__vehicles\s*\{[^}]*display:\s*none/s);
});

test("mobile FAQ keeps its gaps while item heights follow wrapped content", () => {
  const mobileStyles = pageStyles.match(/@media \(max-width: 767px\) \{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(mobileStyles, /\.faq-request\s*\{[^}]*min-height:\s*0[^}]*gap:\s*20px/s);
  assert.match(mobileStyles, /\.faq-request__faq\s*\{[^}]*min-height:\s*0/s);
  assert.match(mobileStyles, /\.faq-item__question\s*\{[^}]*min-height:\s*0[^}]*padding:\s*15px 54px 15px 20px/s);
  assert.match(mobileStyles, /\.request-card\s*\{[^}]*min-height:\s*0[^}]*gap:\s*20px/s);
  assert.match(mobileStyles, /\.request-card__heading\s*\{[^}]*min-height:\s*0[^}]*gap:\s*10px/s);
  assert.match(mobileStyles, /\.request-card__fields\s*\{[^}]*min-height:\s*0[^}]*gap:\s*10px/s);
  assert.match(mobileStyles, /\.request-card__consent\s*\{[^}]*min-height:\s*0/s);
});

test("mobile car brand pagination is interactive", () => {
  assert.match(sliderModule, /const createCarBrandsCarousel = \(\) =>/);
  assert.match(sliderModule, /car-brands__dot--active/);
  assert.match(sliderModule, /behavior: prefersReducedMotion\(\) \? "auto" : "smooth"/);
});

test("cars page contains no expiring Figma asset URLs", () => {
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
});

test("desktop vehicle light separates the cars from the animated gear", () => {
  assert.match(markup, /class="cars-hero-scene__vehicle-light" data-node-id="227:16146"/);
  assert.match(markup, /src="assets\/cars-hero-vehicle-light\.svg"/);
  assert.match(pageStyles, /\.cars-hero-scene__gear\s*\{[^}]*z-index:\s*2/s);
  assert.match(pageStyles, /\.cars-hero-scene__vehicle-light\s*\{[^}]*z-index:\s*3/s);
  assert.match(pageStyles, /\.cars-hero-scene__vehicles\s*\{[^}]*z-index:\s*4/s);
  assert.ok(existsSync(resolve(projectRoot, "assets/cars-hero-vehicle-light.svg")));
});

test("all local resources referenced by the cars page exist", () => {
  const resources = [...markup.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map(([, value]) => value.split("#")[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});
