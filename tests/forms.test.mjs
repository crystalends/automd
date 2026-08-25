import assert from "node:assert/strict";
import test from "node:test";

import { initForms } from "../js/modules/forms.js";

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
