import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(projectRoot, "404.html"), "utf8");
const styles = readFileSync(resolve(projectRoot, "error-page.css"), "utf8");

test("404 page keeps its primary recovery actions and accessible heading", () => {
  assert.match(markup, /<h1[^>]+id="error-title"/);
  assert.match(markup, /href="index\.html#booking">Оставить заявку<\/a>/);
  assert.match(markup, /href="index\.html">На главную<\/a>/);
});

test("404 page contains no expiring Figma asset URLs", () => {
  assert.doesNotMatch(markup, /figma\.com\/api\/mcp\/asset/);
});

test("404 illustration keeps its intrinsic aspect ratio", () => {
  assert.doesNotMatch(styles, /\.error-hero__image\s*\{[^}]*object-fit:\s*fill/s);
  assert.match(styles, /\.error-hero__image\s*\{[^}]*width:\s*auto/s);
});

test("all local resources referenced by the 404 page exist", () => {
  const resources = [...markup.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map(([, value]) => value.split("#")[0])
    .filter((value) => value && !/^(?:data:|https?:|tel:)/.test(value));

  for (const resource of resources) {
    assert.ok(existsSync(resolve(projectRoot, resource)), `Missing resource: ${resource}`);
  }
});
