import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");

test("business request dialog matches the dedicated Figma form", () => {
  const markup = read("index.html");
  const styles = read("styles.css");
  const entrypoint = read("js/main.js");
  const dialog = markup.match(/<dialog class="request-dialog request-dialog--business"[\s\S]*?<\/dialog>/)?.[0] ?? "";

  assert.match(markup, /class="button business-offer__button"[^>]*data-business-dialog-open>Отправить заявку<\/a>/);
  assert.match(dialog, /data-business-dialog/);
  assert.match(dialog, /Оставьте заявку для юридических лиц/);
  assert.match(dialog, /Расскажите, какие автомобили нужно обслуживать и какая задача стоит сейчас/);
  for (const field of ["name", "phone", "vehicle_count", "comment", "consent"]) {
    assert.match(dialog, new RegExp(`name="${field}"`));
  }
  assert.match(dialog, />Количество автомобилей<\/span>/);
  assert.match(dialog, /name="vehicle_count" inputmode="numeric" pattern="\[0-9\]\+"/);
  for (const asset of ["assets/booking-pattern.png", "assets/booking-bolt.png", "assets/vacancy-detail-close.svg"]) {
    assert.match(dialog, new RegExp(asset.replaceAll("/", "\\/")));
    assert.ok(existsSync(resolve(projectRoot, asset)), `${asset} should exist`);
  }
  assert.match(styles, /\.request-dialog--business \.request-dialog__bolt\s*\{[^}]*top:\s*528\.112px[^}]*left:\s*725\.112px/s);
  assert.match(entrypoint, /initBusinessDialog/);
  assert.doesNotMatch(dialog, /figma\.com\/api\/mcp\/asset/);
});

test("business CTA uses the shared request dialog controller", async (context) => {
  const originalDocument = globalThis.document;
  context.after(() => {
    globalThis.document = originalDocument;
  });

  const closeButton = {
    addEventListener(_type, listener) { this.listener = listener; },
  };
  const dialog = {
    focused: false,
    open: false,
    addEventListener(_type, listener) { this.listener = listener; },
    close() { this.open = false; },
    focus() { this.focused = true; },
    querySelector: () => closeButton,
    showModal() { this.open = true; },
  };
  const opener = {
    prevented: false,
    addEventListener(_type, listener) { this.listener = listener; },
  };
  globalThis.document = {
    querySelector: () => dialog,
    querySelectorAll: () => [opener],
  };

  const { initBusinessDialog } = await import("../js/modules/business-dialog.js");
  initBusinessDialog();
  opener.listener({ preventDefault() { opener.prevented = true; } });

  assert.equal(opener.prevented, true);
  assert.equal(dialog.open, true);
  assert.equal(dialog.focused, true);
  closeButton.listener();
  assert.equal(dialog.open, false);
  assert.match(read("js/modules/business-dialog.js"), /import \{ initRequestDialog \} from "\.\/request-dialog\.js"/);
});
