import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");

test("estimate dialog matches the dedicated Figma form", () => {
  const markup = read("index.html");
  const styles = read("styles.css");
  const entrypoint = read("js/main.js");
  const dialog = markup.match(/<dialog class="request-dialog request-dialog--estimate"[\s\S]*?<\/dialog>/)?.[0] ?? "";

  assert.match(markup, /data-estimate-form[\s\S]*?type="button" data-estimate-dialog-open>Посмотреть цены<\/button>/);
  assert.match(dialog, /data-estimate-dialog/);
  assert.match(dialog, /Получите расчет стоимости/);
  assert.match(dialog, /менеджер сориентирует по стоимости работ, запчастям и ближайшему времени записи/);
  for (const field of ["name", "phone", "consent"]) {
    assert.match(dialog, new RegExp(`name="${field}"`));
  }
  for (const field of ["brand", "model", "service"]) {
    assert.match(dialog, new RegExp(`type="hidden" name="${field}" data-estimate-value="${field}"`));
  }
  for (const asset of ["assets/booking-pattern.png", "assets/booking-bolt.png", "assets/vacancy-detail-close.svg"]) {
    assert.match(dialog, new RegExp(asset.replaceAll("/", "\\/")));
    assert.ok(existsSync(resolve(projectRoot, asset)), `${asset} should exist`);
  }
  assert.match(styles, /\.request-dialog--estimate \.request-dialog__bolt\s*\{[^}]*top:\s*263\.109px[^}]*left:\s*719\.109px[^}]*rotate\(-18\.83deg\)/s);
  assert.match(entrypoint, /initEstimateDialog/);
  assert.doesNotMatch(dialog, /figma\.com\/api\/mcp\/asset/);
});

test("estimate dialog validates and carries the selected service context", async (context) => {
  const originalDocument = globalThis.document;
  context.after(() => {
    globalThis.document = originalDocument;
  });

  const values = { brand: "Fiat", model: "Ducato", service: "ТО" };
  const hiddenFields = Object.fromEntries(Object.keys(values).map((name) => [name, { value: "" }]));
  const sourceForm = {
    valid: false,
    elements: { namedItem: (name) => ({ value: values[name] }) },
    reportValidity() { return this.valid; },
  };
  const closeButton = {
    addEventListener(_type, listener) { this.listener = listener; },
  };
  const dialog = {
    focused: false,
    open: false,
    addEventListener(_type, listener) { this.listener = listener; },
    close() { this.open = false; },
    focus() { this.focused = true; },
    querySelector(selector) {
      if (selector === "[data-estimate-dialog-close]") return closeButton;
      const name = selector.match(/data-estimate-value="([^"]+)"/)?.[1];
      return hiddenFields[name] ?? null;
    },
    showModal() { this.open = true; },
  };
  const opener = {
    addEventListener(_type, listener) { this.listener = listener; },
  };
  globalThis.document = {
    querySelector(selector) {
      if (selector === "[data-estimate-form]") return sourceForm;
      if (selector === "[data-estimate-dialog]") return dialog;
      return null;
    },
    querySelectorAll: () => [opener],
  };

  const { initEstimateDialog } = await import("../js/modules/estimate-dialog.js");
  initEstimateDialog();

  opener.listener({ preventDefault() {} });
  assert.equal(dialog.open, false);

  sourceForm.valid = true;
  opener.listener({ preventDefault() {} });
  assert.equal(dialog.open, true);
  assert.equal(dialog.focused, true);
  assert.deepEqual(Object.fromEntries(Object.entries(hiddenFields).map(([name, field]) => [name, field.value])), values);
  closeButton.listener();
  assert.equal(dialog.open, false);
});
