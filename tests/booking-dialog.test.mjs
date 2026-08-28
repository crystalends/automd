import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(resolve(projectRoot, file), "utf8");

test("tech center booking dialog matches the dedicated Figma form", () => {
  const markup = read("index.html");
  const styles = read("styles.css");
  const entrypoint = read("js/main.js");
  const dialog = markup.match(/<dialog class="request-dialog request-dialog--booking"[\s\S]*?<\/dialog>/)?.[0] ?? "";

  assert.match(markup, /data-booking-dialog-open>Записаться на ремонт<\/a>/);
  assert.match(dialog, /data-booking-dialog/);
  assert.match(dialog, /Запишитесь в AutoMD/);
  assert.match(dialog, /менеджер уточнит автомобиль, задачу и предложит удобное время/);
  for (const field of ["name", "phone", "date", "location", "comment", "consent"]) {
    assert.match(dialog, new RegExp(`name="${field}"`));
  }
  assert.match(dialog, /name="date" type="date" required/);
  assert.match(dialog, />Удобный техцентр<\/span>/);
  for (const asset of ["assets/booking-pattern.png", "assets/booking-bolt.png", "assets/vacancy-detail-close.svg"]) {
    assert.match(dialog, new RegExp(asset.replaceAll("/", "\\/")));
    assert.ok(existsSync(resolve(projectRoot, asset)), `${asset} should exist`);
  }
  assert.match(styles, /\.request-dialog--booking \.request-dialog__bolt\s*\{[^}]*top:\s*439px[^}]*left:\s*706px/s);
  assert.match(styles, /\.request-dialog__field--wide\s*\{[^}]*grid-column:\s*1 \/ -1/s);
  assert.match(styles, /\.request-dialog__date-placeholder\s*\{[^}]*left:\s*20px/s);
  assert.match(entrypoint, /initBookingDialog/);
  assert.doesNotMatch(dialog, /figma\.com\/api\/mcp\/asset/);
});

test("request dialogs share one focused ESM controller", async (context) => {
  const originalDocument = globalThis.document;
  context.after(() => {
    globalThis.document = originalDocument;
  });

  const closeButton = {
    addEventListener(_type, listener) {
      this.listener = listener;
    },
  };
  const dialog = {
    focused: false,
    listener: null,
    open: false,
    addEventListener(_type, listener) {
      this.listener = listener;
    },
    close() {
      this.open = false;
    },
    focus() {
      this.focused = true;
    },
    querySelector() {
      return closeButton;
    },
    showModal() {
      this.open = true;
    },
  };
  const opener = {
    prevented: false,
    addEventListener(_type, listener) {
      this.listener = listener;
    },
  };
  globalThis.document = {
    querySelector: () => dialog,
    querySelectorAll: () => [opener],
  };

  const { initBookingDialog } = await import("../js/modules/booking-dialog.js");
  const controls = initBookingDialog();
  const event = { preventDefault() { opener.prevented = true; } };

  opener.listener(event);
  assert.equal(opener.prevented, true);
  assert.equal(dialog.open, true);
  assert.equal(dialog.focused, true);
  closeButton.listener();
  assert.equal(dialog.open, false);
  controls.open();
  dialog.listener({ target: dialog });
  assert.equal(dialog.open, false);
  assert.match(read("js/modules/part-request-dialog.js"), /import \{ initRequestDialog \} from "\.\/request-dialog\.js"/);
  assert.match(read("js/modules/booking-dialog.js"), /import \{ initRequestDialog \} from "\.\/request-dialog\.js"/);
});
