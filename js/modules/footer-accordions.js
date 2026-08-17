const mobileMedia = window.matchMedia("(max-width: 767px)");

const initFooterAccordions = () => {
  const toggles = [...document.querySelectorAll(".site-footer__accordion-toggle")];
  if (!toggles.length) return [];

  const setOpen = (toggle, open) => {
    const column = toggle.closest(".site-footer__column--collapsible");
    column?.classList.toggle("site-footer__column--open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      if (!mobileMedia.matches) return;
      setOpen(toggle, toggle.getAttribute("aria-expanded") !== "true");
    });
  });

  const syncMode = () => {
    toggles.forEach((toggle) => {
      toggle.tabIndex = mobileMedia.matches ? 0 : -1;
      setOpen(toggle, !mobileMedia.matches);
    });
  };

  mobileMedia.addEventListener("change", syncMode);
  syncMode();
  return toggles;
};

export { initFooterAccordions };
