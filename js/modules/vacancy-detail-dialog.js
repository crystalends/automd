const initVacancyDetailDialog = () => {
  const dialog = document.querySelector("[data-vacancy-detail-dialog]");
  const openers = [...document.querySelectorAll("[data-vacancy-detail-open]")];
  const closeButton = dialog?.querySelector("[data-vacancy-detail-close]");
  const applyButton = dialog?.querySelector("[data-vacancy-detail-apply]");
  if (!dialog || !openers.length || !closeButton) return null;

  const open = () => dialog.showModal();
  const close = () => dialog.close();

  openers.forEach((opener) => opener.addEventListener("click", open));
  closeButton.addEventListener("click", close);
  applyButton?.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  return { close, open };
};

export { initVacancyDetailDialog };
