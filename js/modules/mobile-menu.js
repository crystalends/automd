const desktopMedia = window.matchMedia("(min-width: 1200px)");

const initMobileMenu = () => {
  const header = document.querySelector(".site-header");
  const toggle = header?.querySelector(".site-header__menu-toggle");
  const navigation = header?.querySelector(".site-nav");
  if (!header || !toggle || !navigation) return null;

  const label = toggle.querySelector(".visually-hidden");

  const setOpen = (open) => {
    header.classList.toggle("site-header--menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    navigation.toggleAttribute("inert", !open && !desktopMedia.matches);
    if (desktopMedia.matches) navigation.removeAttribute("aria-hidden");
    else navigation.setAttribute("aria-hidden", String(!open));
    if (label) label.textContent = open ? "Закрыть меню" : "Открыть меню";
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || toggle.getAttribute("aria-expanded") !== "true") return;
    setOpen(false);
    toggle.focus();
  });

  desktopMedia.addEventListener("change", (event) => {
    setOpen(false);
  });

  setOpen(false);
  return { close: () => setOpen(false) };
};

export { initMobileMenu };
