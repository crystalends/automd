import { companyItems, services, vehicles } from "./navigation-data.js";

const desktopMedia = window.matchMedia("(min-width: 1200px)");

export { vehicles };

const createVehicleItem = ({ name, image, width, height, href, all, imageModifier }) => {
  const item = document.createElement("a");
  item.className = [
    "vehicle-menu__item",
    all ? "vehicle-menu__item--all" : "",
  ].filter(Boolean).join(" ");
  item.href = href;

  const imageFrame = document.createElement("span");
  imageFrame.className = [
    "vehicle-menu__image-frame",
    all ? "vehicle-menu__image-frame--all" : "",
  ].filter(Boolean).join(" ");

  const imageElement = document.createElement("img");
  imageElement.className = [
    "vehicle-menu__image",
    imageModifier ? `vehicle-menu__image--${imageModifier}` : "",
  ].filter(Boolean).join(" ");
  imageElement.src = image;
  imageElement.alt = "";
  imageElement.width = width;
  imageElement.height = height;
  imageElement.loading = "lazy";
  imageFrame.append(imageElement);

  const label = document.createElement("span");
  label.className = "vehicle-menu__label";
  label.append(document.createTextNode(name));

  const arrow = document.createElement("span");
  arrow.className = "vehicle-menu__arrow";
  arrow.setAttribute("aria-hidden", "true");
  label.append(arrow);

  item.append(imageFrame, label);
  return item;
};

const createVehicleMenu = () => {
  const menu = document.createElement("nav");
  menu.className = "vehicle-menu";
  menu.id = "vehicle-menu";
  menu.setAttribute("aria-label", "Автомобили по маркам");

  const grid = document.createElement("div");
  grid.className = "vehicle-menu__grid";
  grid.append(...vehicles.map(createVehicleItem));
  menu.append(grid);
  return menu;
};

const createCardMenuItem = ({ name, description, image, imageModifier, href }) => {
  const item = document.createElement("a");
  item.className = "desktop-card-menu__item";
  item.href = href;

  const imageFrame = document.createElement("span");
  imageFrame.className = "desktop-card-menu__image-frame";
  const imageElement = document.createElement("img");
  imageElement.className = `desktop-card-menu__image desktop-card-menu__image--${imageModifier}`;
  imageElement.src = image;
  imageElement.alt = "";
  imageElement.width = 1254;
  imageElement.height = 1254;
  imageElement.loading = "lazy";
  imageFrame.append(imageElement);

  const content = document.createElement("span");
  content.className = "desktop-card-menu__content";
  const title = document.createElement("span");
  title.className = "desktop-card-menu__title";
  title.textContent = name;
  content.append(title);

  if (description) {
    const copy = document.createElement("span");
    copy.className = "desktop-card-menu__description";
    copy.textContent = description;
    content.append(copy);
  }

  const arrow = document.createElement("img");
  arrow.className = "desktop-card-menu__arrow";
  arrow.src = "assets/mobile-menu-arrow.svg";
  arrow.alt = "";
  arrow.width = 24;
  arrow.height = 24;

  item.append(imageFrame, content, arrow);
  return item;
};

const createCardMenu = ({ id, label, items, modifier }) => {
  const menu = document.createElement("nav");
  menu.className = `desktop-card-menu desktop-card-menu--${modifier}`;
  menu.id = id;
  menu.setAttribute("aria-label", label);

  const grid = document.createElement("div");
  grid.className = "desktop-card-menu__grid";
  grid.append(...items.map(createCardMenuItem));
  menu.append(grid);
  return menu;
};

const initVehicleMenu = () => {
  const header = document.querySelector(".site-header");
  const navigation = header?.querySelector(".site-nav");
  if (!header || !navigation) return null;

  const definitions = [
    { triggerLabel: "Автомобили", menu: createVehicleMenu() },
    {
      triggerLabel: "Услуги",
      menu: createCardMenu({ id: "services-menu", label: "Каталог услуг", items: services, modifier: "services" }),
    },
    {
      triggerLabel: "О компании",
      menu: createCardMenu({ id: "company-menu", label: "О компании", items: companyItems, modifier: "company" }),
    },
  ];
  const links = [...navigation.querySelectorAll(".site-nav__link")];
  const controls = definitions.map(({ triggerLabel, menu }) => ({
    menu,
    trigger: links.find((link) => link.textContent.trim() === triggerLabel),
  })).filter(({ trigger }) => trigger);
  if (!controls.length) return null;

  let closeTimer = 0;

  const setOpen = (activeControl = null) => {
    const nextControl = desktopMedia.matches ? activeControl : null;
    window.clearTimeout(closeTimer);
    header.classList.toggle("site-header--desktop-menu-open", Boolean(nextControl));
    controls.forEach((control) => {
      const open = control === nextControl;
      control.trigger.setAttribute("aria-expanded", String(open));
      control.menu.setAttribute("aria-hidden", String(!open));
      control.menu.toggleAttribute("inert", !open);
    });
  };

  const scheduleClose = () => {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => setOpen(), 120);
  };

  header.classList.add("site-header--desktop-menu-ready");
  controls.forEach((control) => {
    const open = () => setOpen(control);
    control.trigger.setAttribute("aria-haspopup", "true");
    control.trigger.setAttribute("aria-controls", control.menu.id);
    header.append(control.menu);
    control.trigger.addEventListener("mouseenter", open);
    control.trigger.addEventListener("mouseleave", scheduleClose);
    control.trigger.addEventListener("focus", open);
    control.menu.addEventListener("mouseenter", open);
    control.menu.addEventListener("mouseleave", scheduleClose);
    control.menu.addEventListener("focusin", open);
  });

  document.addEventListener("focusin", (event) => {
    if (controls.some(({ trigger, menu }) => event.target === trigger || menu.contains(event.target))) return;
    setOpen();
  });

  document.addEventListener("keydown", (event) => {
    const activeControl = controls.find(({ trigger }) => trigger.getAttribute("aria-expanded") === "true");
    if (event.key !== "Escape" || !activeControl) return;
    setOpen();
    activeControl.trigger.focus();
  });

  desktopMedia.addEventListener("change", () => setOpen());
  setOpen();
  return { close: () => setOpen() };
};

export { initVehicleMenu };
