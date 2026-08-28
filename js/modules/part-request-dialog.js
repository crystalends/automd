import { initRequestDialog } from "./request-dialog.js";

const initPartRequestDialog = () => initRequestDialog({
  dialogSelector: "[data-part-request-dialog]",
  openerSelector: "[data-part-request-open]",
  closeSelector: "[data-part-request-close]",
});

export { initPartRequestDialog };
