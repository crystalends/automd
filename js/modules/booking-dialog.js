import { initRequestDialog } from "./request-dialog.js";

const initBookingDialog = () => initRequestDialog({
  dialogSelector: "[data-booking-dialog]",
  openerSelector: "[data-booking-dialog-open]",
  closeSelector: "[data-booking-dialog-close]",
});

export { initBookingDialog };
