import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { initCareerDialog } from "../js/modules/career-dialog.js";
import { initVacancyDetailDialog } from "../js/modules/vacancy-detail-dialog.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");

test("vacancies page follows the Figma section order", () => {
  const markup = read("vacancies.html");
  const sections = [
    'class="careers-hero ',
    'class="vacancies ',
    'class="benefits ',
    'class="careers-conditions ',
    'class="team ',
    'class="careers-callout ',
    'class="about-seo ',
    'class="site-footer ',
  ];

  let previous = -1;
  for (const section of sections) {
    const index = markup.indexOf(section);
    assert.ok(index > previous, `${section} should follow the previous Figma section`);
    previous = index;
  }
});

test("vacancies page reuses shared project blocks and focused ESM", () => {
  const markup = read("vacancies.html");
  const entrypoint = read("js/main.js");
  const dialogModule = read("js/modules/career-dialog.js");
  const detailDialogModule = read("js/modules/vacancy-detail-dialog.js");

  for (const block of ["site-header", "about-breadcrumb", "benefits", "team-card", "team-callout", "about-seo", "site-footer", "button"]) {
    assert.match(markup, new RegExp(`class="[^"]*\\b${block}\\b`));
  }
  assert.match(markup, /<dialog\b[^>]*data-career-dialog/);
  assert.match(markup, /<dialog\b[^>]*data-vacancy-detail-dialog/);
  assert.match(entrypoint, /initCareerDialog/);
  assert.match(entrypoint, /initVacancyDetailDialog/);
  assert.match(dialogModule, /showModal\(\)/);
  assert.match(dialogModule, /event\.target === dialog/);
  assert.match(detailDialogModule, /showModal\(\)/);
  assert.match(detailDialogModule, /event\.target === dialog/);
});

test("vacancy details dialog opens, closes, and hands off to the application dialog", (context) => {
  const originalDocument = globalThis.document;
  context.after(() => {
    globalThis.document = originalDocument;
  });

  const createControl = () => ({ addEventListener(_type, listener) { this.listener = listener; } });
  const closeButton = createControl();
  const applyButton = createControl();
  const opener = createControl();
  const dialog = {
    closeCalled: false,
    listener: null,
    open: false,
    addEventListener(_type, listener) { this.listener = listener; },
    close() { this.closeCalled = true; this.open = false; },
    querySelector(selector) {
      if (selector === "[data-vacancy-detail-close]") return closeButton;
      if (selector === "[data-vacancy-detail-apply]") return applyButton;
      return null;
    },
    showModal() { this.open = true; },
  };

  globalThis.document = {
    querySelector: () => dialog,
    querySelectorAll: () => [opener],
  };

  initVacancyDetailDialog();
  opener.listener();
  assert.equal(dialog.open, true);
  applyButton.listener();
  assert.equal(dialog.closeCalled, true);

  dialog.closeCalled = false;
  dialog.open = true;
  dialog.listener({ target: dialog });
  assert.equal(dialog.closeCalled, true);
});

test("career dialog opens with the selected vacancy and closes accessibly", (context) => {
  const originalDocument = globalThis.document;
  context.after(() => {
    globalThis.document = originalDocument;
  });

  const position = { value: "" };
  const closeButton = { addEventListener(_type, listener) { this.listener = listener; } };
  const dialog = {
    closeCalled: false,
    listener: null,
    open: false,
    addEventListener(_type, listener) { this.listener = listener; },
    close() { this.closeCalled = true; this.open = false; },
    querySelector(selector) {
      if (selector === "[data-career-dialog-close]") return closeButton;
      if (selector === 'select[name="position"]') return position;
      return null;
    },
    showModal() { this.open = true; },
  };
  const opener = {
    dataset: { vacancy: "Мастер-приемщик — Ховрино" },
    addEventListener(_type, listener) { this.listener = listener; },
  };

  globalThis.document = {
    querySelector: () => dialog,
    querySelectorAll: () => [opener],
  };

  initCareerDialog();
  opener.listener();
  assert.equal(dialog.open, true);
  assert.equal(position.value, "Мастер-приемщик — Ховрино");
  closeButton.listener();
  assert.equal(dialog.closeCalled, true);
});

test("vacancies page uses local Figma assets and all resources resolve", () => {
  const markup = read("vacancies.html");
  const localSources = [...markup.matchAll(/\b(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((source) => !source.startsWith("#") && !/^(?:https?:|tel:|data:)/.test(source));

  for (const asset of [
    "assets/careers-hero-team.png",
    "assets/benefits.jpg",
    "assets/benefits-clients.png",
    "assets/benefits-cities.png",
    "assets/careers-callout-team.png",
    "assets/careers-callout-gear.png",
    "assets/vacancy-detail-pin.svg",
    "assets/vacancy-detail-check.svg",
    "assets/vacancy-detail-close.svg",
  ]) {
    assert.match(markup, new RegExp(asset.replaceAll(".", "\\.")));
  }
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
  for (const source of localSources) {
    const file = source.split("#", 1)[0];
    assert.ok(existsSync(resolve(projectRoot, file)), `missing local resource ${source}`);
  }
});

test("vacancies layout is fluid and has a content-driven mobile reflow", () => {
  const careersStyles = read("careers-page.css");
  const sharedStyles = read("styles.css");

  assert.match(sharedStyles, /\.benefits\{display:grid;[^}]*grid-template-columns:repeat\(2/);
  assert.match(sharedStyles, /@media \(max-width:767px\)[\s\S]*\.benefits\{display:flex;[^}]*flex-direction:column/);
  assert.match(careersStyles, /\.careers-conditions\s*\{[^}]*grid-template-columns:\s*repeat\(2/s);
  assert.match(careersStyles, /@media \(max-width: 767px\)[\s\S]*\.careers-conditions\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(careersStyles, /\.vacancy-detail-dialog\s*\{[^}]*width:\s*min\(1330px,[^}]*max-height:\s*calc\(100dvh - 32px\)/s);
  assert.match(careersStyles, /@media \(max-width: 767px\)[\s\S]*\.vacancy-detail-dialog__columns\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.doesNotMatch(careersStyles, /careers-benefits/);
  assert.doesNotMatch(careersStyles, /@media \(max-width: 767px\)[\s\S]*min-width:\s*1920px/);
});

test("vacancy cards preserve the 1600px Figma geometry", () => {
  const markup = read("vacancies.html");
  const styles = read("careers-page.css");

  assert.match(styles, /\.vacancy-card\s*\{[^}]*min-height:\s*158px;[^}]*grid-template-columns:\s*minmax\(360px, 632px\)[^}]*padding:\s*19px;/s);
  assert.match(styles, /\.vacancy-card__summary\s*\{[^}]*min-height:\s*118px;/s);
  assert.match(styles, /\.vacancy-card__aside\s*\{[^}]*width:\s*731px;[^}]*justify-self:\s*end;/s);
  assert.match(styles, /\.vacancy-card__button\s*\{[^}]*width:\s*193px;/s);
  assert.match(styles, /\.vacancy-card__more-toggle\s*\{[^}]*width:\s*172px;[^}]*background:\s*transparent;/s);
  assert.match(styles, /@media \(max-width: 1500px\)[\s\S]*\.vacancy-card\s*\{[^}]*height:\s*auto/);
  assert.match(markup, /assets\/vacancy-detail-pin\.svg/);
  assert.match(markup, /Ховрино г\. Москва, Ижорская улица, 8с1/);
  assert.match(markup, /Заработная плата: 100 000 - 150 000 ₽\/мес\./);
});

test("all existing HTML pages expose the vacancies route", () => {
  const pages = readdirSync(projectRoot)
    .filter((file) => extname(file) === ".html" && file !== "vacancies.html");

  for (const page of pages) {
    assert.match(read(page), /href="vacancies\.html(?:#vacancies)?">(?:Вакансии|Посмотреть вакансии)</, `${page} should link to vacancies.html`);
  }
});
