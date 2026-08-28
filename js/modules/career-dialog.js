const initCareerDialog = () => {
  const dialog = document.querySelector("[data-career-dialog]");
  const openers = [...document.querySelectorAll("[data-career-dialog-open]")];
  const closeButton = dialog?.querySelector("[data-career-dialog-close]");
  const position = dialog?.querySelector('select[name="position"]');
  if (!dialog || !openers.length || !closeButton) return null;

  const open = (opener) => {
    const vacancy = opener.dataset.vacancy ?? "Рассмотреть для будущих вакансий";
    if (position) position.value = vacancy;
    dialog.showModal();
  };

  openers.forEach((opener) => opener.addEventListener("click", () => open(opener)));
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  return { close: () => dialog.close(), open };
};

export { initCareerDialog };
