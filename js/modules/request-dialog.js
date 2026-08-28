const initRequestDialog = ({ dialogSelector, openerSelector, closeSelector, beforeOpen }) => {
  const dialog = document.querySelector(dialogSelector);
  const openers = [...document.querySelectorAll(openerSelector)];
  const closeButton = dialog?.querySelector(closeSelector);
  if (!dialog || !openers.length || !closeButton) return null;

  const open = (event) => {
    event?.preventDefault();
    if (beforeOpen?.(event) === false) return;
    if (dialog.open) return;
    dialog.showModal();
    dialog.focus({ preventScroll: true });
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  openers.forEach((opener) => opener.addEventListener("click", open));
  closeButton.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  return { close, open };
};

export { initRequestDialog };
