import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");

test("desktop team sections grow from content so the following section keeps the configured gap", () => {
  const rules = [
    ["3d-tour-page.css", ".tour-page"],
    ["brand-page.css", ".brand-page"],
    ["cars-page.css", ".cars-page"],
  ];

  for (const [file, page] of rules) {
    const escapedPage = page.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.doesNotMatch(
      read(file),
      new RegExp(`${escapedPage} \\.team\\s*\\{[^}]*(?:height|min-height):\\s*\\d+px`, "s"),
      `${file} must not add empty space below the team content`,
    );
  }
});
