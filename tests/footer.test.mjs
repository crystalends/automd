import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");

test("desktop footer matches Figma node 149:5078 geometry", () => {
  assert.match(styles, /\.site-footer\{[^}]*height:515px[^}]*gap:20px/);
  assert.match(styles, /\.site-footer__intro\{[^}]*gap:40px[^}]*padding:20px/);
  assert.match(styles, /\.site-footer__logo-box\{[^}]*width:294px[^}]*height:56px/);
  assert.match(styles, /\.site-footer__column\{[^}]*width:16\.75%[^}]*gap:20px/);
  assert.match(styles, /\.site-footer__button\s*\{[^}]*width:\s*278px[^}]*flex:\s*0 0 278px/s);
});

test("footer typography preserves Figma text widths and positions", () => {
  assert.match(styles, /\.site-footer\s*\{[^}]*font-weight:\s*400/s);
  assert.match(styles, /\.site-footer__legal,\s*\.site-footer__developer\s*\{[^}]*letter-spacing:\s*0/s);
});

test("mobile footer intro matches Figma node 346:22900", () => {
  assert.match(
    styles,
    /@media \(max-width: 767px\)[\s\S]*?\.site-footer__intro\s*\{[^}]*justify-content:\s*center/s,
  );
  assert.match(styles, /\.site-footer__description\s*\{[^}]*flex:\s*0 0 auto[^}]*letter-spacing:\s*0/s);
  assert.match(
    styles,
    /\.site-footer__button\s*\{[^}]*height:\s*56px[^}]*min-height:\s*56px[^}]*flex-basis:\s*56px/s,
  );
});
