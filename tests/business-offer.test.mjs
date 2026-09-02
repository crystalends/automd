import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sharedStyles = readFileSync(resolve(projectRoot, "business-offer.css"), "utf8");
const buildScript = readFileSync(resolve(projectRoot, "scripts/build-css.mjs"), "utf8");
const pricesStyles = readFileSync(resolve(projectRoot, "prices-page.css"), "utf8");
const carsStyles = readFileSync(resolve(projectRoot, "cars-page.css"), "utf8");

test("every mobile business offer follows its content across the project", () => {
  assert.match(sharedStyles, /@media \(max-width: 767px\)/);
  assert.match(
    sharedStyles,
    /\.business-offer,\s*\.business-offer__content\s*\{[^}]*height:\s*auto[^}]*min-height:\s*0/s,
  );
  assert.ok(
    buildScript.indexOf('{ file: "business-offer.css" }') >
      buildScript.indexOf('{ file: "diagnostics-page.css", scopes: ["diagnostics-page"] }'),
  );
});

test("page-specific mobile offers do not restore artificial minimum heights", () => {
  assert.match(pricesStyles, /\.business-offer--prices \{ height:\s*auto; min-height:\s*0;/);
  assert.match(carsStyles, /\.cars-page \.business-offer\s*\{[^}]*min-height:\s*0/s);
  assert.match(carsStyles, /\.cars-page \.business-offer__content\s*\{[^}]*min-height:\s*0/s);
  assert.doesNotMatch(pricesStyles, /\.business-offer--prices \{[^}]*min-height:\s*813px/s);
  assert.doesNotMatch(carsStyles, /\.cars-page \.business-offer\s*\{[^}]*min-height:\s*1041px/s);
});
