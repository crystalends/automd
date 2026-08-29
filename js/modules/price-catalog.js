const activateTab = (tabs, tab, status) => {
  tabs.forEach((item) => {
    const isActive = item === tab;
    item.classList.toggle("price-catalog__tab--active", isActive);
    item.setAttribute("aria-selected", String(isActive));
    item.tabIndex = isActive ? 0 : -1;
  });
  status.textContent = `Показаны цены для ${tab.textContent.trim()}`;
};

const initTabs = (catalog) => {
  const tabs = [...catalog.querySelectorAll("[role='tab']")];
  const status = catalog.querySelector("[data-price-status]");
  if (!tabs.length || !status) return;

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tabs, tab, status));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      activateTab(tabs, tabs[nextIndex], status);
      tabs[nextIndex].focus();
    });
  });
};

const initMoreButton = (catalog) => {
  const button = catalog.querySelector("[data-price-more]");
  const extraRows = [...catalog.querySelectorAll(".price-catalog__row--extra")];
  if (!button || !extraRows.length) return;

  button.addEventListener("click", () => {
    const willExpand = button.getAttribute("aria-expanded") !== "true";
    extraRows.forEach((row) => { row.hidden = !willExpand; });
    button.setAttribute("aria-expanded", String(willExpand));
    button.textContent = willExpand ? "Скрыть" : "Показать еще";
  });
};

export const initPriceCatalog = () => {
  const catalog = document.querySelector(".price-catalog");
  if (!catalog) return null;
  initTabs(catalog);
  initMoreButton(catalog);
  return catalog;
};
