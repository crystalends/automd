import assert from "node:assert/strict";
import test from "node:test";
import { initFaqAccordions } from "../js/modules/faq-accordions.js";

const createItem = (open = false) => {
  const listeners = new Map();
  return {
    open,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type) {
      listeners.get(type)?.();
    },
  };
};

test("FAQ accordion keeps only one item open in each group", () => {
  const first = createItem(true);
  const second = createItem(true);
  const third = createItem(false);
  const group = { querySelectorAll: () => [first, second, third] };
  const previousDocument = globalThis.document;
  globalThis.document = { querySelectorAll: () => [group] };

  try {
    initFaqAccordions();
    assert.equal(first.open, true);
    assert.equal(second.open, false);

    third.open = true;
    third.dispatch("toggle");
    assert.equal(first.open, false);
    assert.equal(second.open, false);
    assert.equal(third.open, true);
  } finally {
    globalThis.document = previousDocument;
  }
});
