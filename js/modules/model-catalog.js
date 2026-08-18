const initModelCatalog = () => {
  const toggle = document.querySelector("[data-models-toggle]");
  const extraModels = [...document.querySelectorAll("[data-extra-model]")];
  if (!toggle || !extraModels.length) return null;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") !== "true";
    extraModels.forEach((model) => {
      model.hidden = !expanded;
    });
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.textContent = expanded ? "Скрыть" : "Показать ещё";
  });

  return toggle;
};

export { initModelCatalog };
