import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("shared location blocks use the interactive Yandex map", () => {
  for (const page of ["index.html", "about.html", "3d-tour.html", "client-zone.html", "contacts.html"]) {
    const markup = readFileSync(resolve(projectRoot, page), "utf8");
    assert.match(markup, /<iframe\b[\s\S]*?class="[^"]*\blocations__map\b[^"]*"[\s\S]*?yandex\.ru\/map-widget\/v1\//);
    assert.match(markup, /<iframe\b[\s\S]*?class="[^"]*\blocations__map\b[^"]*"[\s\S]*?loading="lazy"/);
    assert.doesNotMatch(markup, /<img\b[^>]*class="[^"]*\blocations__map\b[^"]*"/);
  }
});

test("location maps keep responsive content-driven sizing", () => {
  const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");

  assert.match(styles, /\.locations__layout\{height:auto;min-height:303px/);
  assert.match(styles, /\.locations__map\{height:100%;min-height:303px\}/);
  assert.match(styles, /@media \(max-width:767px\)[\s\S]*?\.locations__map\{grid-column:1\/-1;height:250px;min-height:250px/);
});

test("location map links use the shared red interactive state", () => {
  const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");

  assert.match(
    styles,
    /\.location-card__link:hover,\s*\.location-card__link:focus-visible\s*\{[^}]*color:\s*var\(--red\)[^}]*box-shadow:\s*inset 0 -1px var\(--red\)/,
  );
});
