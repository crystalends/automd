import { initRequestDialog } from "./request-dialog.js";

const estimateFields = ["brand", "model", "service"];

const initEstimateDialog = () => {
  const sourceForm = document.querySelector("[data-estimate-form]");
  const dialog = document.querySelector("[data-estimate-dialog]");

  const syncEstimate = () => {
    if (!sourceForm?.reportValidity() || !dialog) return false;

    estimateFields.forEach((name) => {
      const source = sourceForm.elements.namedItem(name);
      const target = dialog.querySelector(`[data-estimate-value="${name}"]`);
      if (source && target) target.value = source.value;
    });

    return true;
  };

  return initRequestDialog({
    dialogSelector: "[data-estimate-dialog]",
    openerSelector: "[data-estimate-dialog-open]",
    closeSelector: "[data-estimate-dialog-close]",
    beforeOpen: syncEstimate,
  });
};

export { initEstimateDialog };
