import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");
const markup = readFileSync(resolve(projectRoot, "index.html"), "utf8");

test("responsive images preserve their intrinsic proportions", () => {
  assert.match(styles, /img\{display:block;max-width:100%;height:auto\}/);
});

test("service finder artwork keeps the square animated Figma frame", () => {
  assert.match(markup, /data-node-id="337:21453"/);
  assert.match(markup, /class="service-finder__decor-motion" data-node-id="337:21454"/);
  assert.match(
    styles,
    /\.service-finder__decor\{[^}]*width:285px;[^}]*height:285px;[^}]*object-fit:cover;[^}]*animation:mobile-brake-spin 24s linear infinite/,
  );
  assert.match(styles, /\.service-finder--price \.service-finder__decor-motion\{[^}]*z-index:0[^}]*right:-110px[^}]*bottom:-40px[^}]*left:auto[^}]*width:285px[^}]*height:285px[^}]*transform:rotate\(var\(--mobile-brake-rotation\)\)[^}]*animation:mobile-brake-spin 24s linear infinite\}/);
  assert.match(styles, /\.service-finder--price \.service-finder__decor\{[^}]*width:285px[^}]*height:285px[^}]*transform:rotate\(180deg\) scaleY\(-1\)[^}]*animation:none\}/);
});
