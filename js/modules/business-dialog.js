import { initRequestDialog } from "./request-dialog.js";

const initBusinessDialog = () => initRequestDialog({
  dialogSelector: "[data-business-dialog]",
  openerSelector: "[data-business-dialog-open]",
  closeSelector: "[data-business-dialog-close]",
});

export { initBusinessDialog };
