import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");

test("content card groups use hover instead of a permanently selected first card", () => {
  const pages = ["index.html", "cars.html", "services.html", "diagnostics.html"];

  for (const page of pages) {
    assert.doesNotMatch(read(page), /(?:service-card|popular-service-card|diagnostics-type-card)--selected/);
  }

  assert.match(read("styles.css"), /\.service-card--direction:hover\s*\{[^}]*border-color:var\(--line\)[^}]*background:#fff/);
  assert.match(read("services-page.css"), /\.popular-service-card:hover,[\s\S]*?\.popular-service-card:focus-visible\s*\{[^}]*border-color:\s*var\(--line\)[^}]*background:\s*#fff/s);
  assert.match(read("diagnostics-page.css"), /\.diagnostics-type-card:hover\s*\{[^}]*border-color:\s*var\(--line\)[^}]*background:\s*#fff/s);
});
