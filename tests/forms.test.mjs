import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { initForms } from "../js/modules/forms.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const createForm = ({ endpoint, method = null }) => {
  const status = { dataset: {}, textContent: "" };
  const controls = [
    { disabled: false, name: "phone", value: "+79990000000" },
    { disabled: true, name: "internal", value: "ignore" },
  ];

  return {
    controls,
    dataset: { endpoint, form: "booking" },
    listener: null,
    resetCalled: false,
    addEventListener(_type, listener) {
      this.listener = listener;
    },
    getAttribute(name) {
      if (name === "method") return method;
      if (name === "action") return null;
      return null;
    },
    querySelector(selector) {
      return selector === ".form-status" ? status : null;
    },
    querySelectorAll() {
      return controls;
    },
    reportValidity() {
      return true;
    },
    reset() {
      this.resetCalled = true;
    },
    toggleAttribute() {},
  };
};

test("forms serialize enabled controls before locking the UI and support GET query strings", async (context) => {
  const originalDocument = globalThis.document;
  const originalFetch = globalThis.fetch;
  const OriginalFormData = globalThis.FormData;
  context.after(() => {
    globalThis.document = originalDocument;
    globalThis.fetch = originalFetch;
    globalThis.FormData = OriginalFormData;
  });

  class FormDataMock {
    constructor(form) {
      this.entries = form.controls
        .filter((control) => !control.disabled && control.name)
        .map((control) => [control.name, control.value]);
    }

    forEach(callback) {
      this.entries.forEach(([key, value]) => callback(value, key));
    }
  }

  const postForm = createForm({ endpoint: "/api/request" });
  const getForm = createForm({ endpoint: "/api/search", method: "get" });
  const requests = [];

  globalThis.FormData = FormDataMock;
  globalThis.document = {
    baseURI: "https://example.test/page.html",
    querySelectorAll: () => [postForm, getForm],
  };
  globalThis.fetch = async (url, options) => {
    requests.push({ options, url: url.toString() });
    return { ok: true };
  };

  initForms();
  const event = { preventDefault() {} };
  await postForm.listener(event);
  await getForm.listener(event);

  assert.equal(requests[0].url, "https://example.test/api/request");
  assert.equal(requests[0].options.method, "POST");
  assert.deepEqual(requests[0].options.body.entries, [["phone", "+79990000000"]]);
  assert.equal(requests[1].url, "https://example.test/api/search?phone=%2B79990000000");
  assert.equal(requests[1].options.method, "GET");
  assert.equal(requests[1].options.body, undefined);
  assert.equal(postForm.controls[0].disabled, false);
  assert.equal(postForm.controls[1].disabled, true);
  assert.equal(postForm.resetCalled, true);
  assert.equal(getForm.resetCalled, true);
});

test("consent checkboxes share one checked-state implementation", () => {
  const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");
  const indexMarkup = readFileSync(resolve(projectRoot, "index.html"), "utf8");
  const articlesMarkup = readFileSync(resolve(projectRoot, "articles.html"), "utf8");

  assert.match(indexMarkup, /class="booking-form__checkbox"[^>]*type="checkbox"/);
  assert.match(articlesMarkup, /class="request-card__checkbox"[^>]*type="checkbox"/);
  assert.match(
    styles,
    /\.booking-form__checkbox:checked,\s*\.request-card__checkbox:checked\s*\{[^}]*legal-check\.svg/s,
  );
  assert.ok(existsSync(resolve(projectRoot, "assets/legal-check.svg")));

  for (const file of ["about-page.css", "brand-page.css", "cars-page.css", "promotions-page.css"]) {
    const pageStyles = readFileSync(resolve(projectRoot, file), "utf8");
    assert.doesNotMatch(pageStyles, /\.request-card__checkbox(?::checked)?\s*\{/);
  }
});

test("homepage finder selects use the Figma chevron instead of native controls", () => {
  const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");
  const indexMarkup = readFileSync(resolve(projectRoot, "index.html"), "utf8");
  const finderMarkup = indexMarkup.match(/<form class="finder-form"[\s\S]*?<\/form>/)?.[0] ?? "";

  assert.equal((finderMarkup.match(/form-field--select finder-form__form-field/g) ?? []).length, 3);
  assert.equal((finderMarkup.match(/form-field__control finder-form__control/g) ?? []).length, 3);
  assert.match(
    styles,
    /\.form-field--select\.finder-form__form-field::after\{[^}]*width:24px[^}]*height:24px[^}]*select-arrow\.svg[^}]*pointer-events:none/s,
  );
  assert.match(
    styles,
    /\.form-field__control\.finder-form__control\{[^}]*background-image:none[^}]*-webkit-appearance:none[^}]*appearance:none/s,
  );
  assert.ok(existsSync(resolve(projectRoot, "assets/select-arrow.svg")));
});

test("all shared custom selects suppress the native browser arrow", () => {
  const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");

  assert.match(
    styles,
    /\.form-field--select \.form-field__control:is\(select\)\s*\{[^}]*background-image:\s*none[^}]*-webkit-appearance:\s*none[^}]*-moz-appearance:\s*none[^}]*appearance:\s*none/s,
  );
});

test("vehicle service links use the shared red interactive state", () => {
  const styles = readFileSync(resolve(projectRoot, "styles.css"), "utf8");

  assert.match(
    styles,
    /\.vehicle-card__links-link:hover,\s*\.vehicle-card__links-link:focus-visible\s*\{[^}]*border-color:\s*var\(--red\)[^}]*box-shadow:\s*inset 0 -1px var\(--red\)[^}]*color:\s*var\(--red\)/s,
  );
});
