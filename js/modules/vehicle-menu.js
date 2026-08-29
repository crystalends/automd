const desktopMedia = window.matchMedia("(min-width: 1200px)");

export const vehicles = [
  { name: "Fiat", image: "assets/car-logo-fiat.png", width: 1366, height: 768, href: "cars.html#cars" },
  { name: "Ford", image: "assets/car-logo-ford.png", width: 1672, height: 941, href: "brand.html", imageModifier: "ford" },
  { name: "Peugeot", image: "assets/car-logo-peugeot.png", width: 1672, height: 941, href: "cars.html#cars" },
  { name: "Citroen", image: "assets/car-logo-citroen.png", width: 1672, height: 941, href: "cars.html#cars" },
  { name: "Iveco", image: "assets/car-logo-iveco.png", width: 1672, height: 941, href: "cars.html#cars", imageModifier: "iveco" },
  { name: "Renault", image: "assets/car-logo-renault.png", width: 1672, height: 941, href: "cars.html#cars" },
  { name: "JAC", image: "assets/car-logo-jac.png", width: 1672, height: 941, href: "cars.html#cars" },
  { name: "Sollers", image: "assets/car-logo-sollers.png", width: 1672, height: 941, href: "cars.html#cars" },
  { name: "Mercedes", image: "assets/car-logo-mercedes.png", width: 1672, height: 941, href: "cars.html#cars" },
  { name: "Все автомобили", image: "assets/hero-vehicles.png", width: 1448, height: 1086, href: "cars.html", all: true, imageModifier: "all" },
];

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

const initVehicleMenu = () => {
  const header = document.querySelector(".site-header");
  const navigation = header?.querySelector(".site-nav");
  const trigger = [...(navigation?.querySelectorAll(".site-nav__link") ?? [])]
    .find((link) => link.textContent.trim() === "Автомобили");
  if (!header || !navigation || !trigger) return null;

  const menu = createVehicleMenu();
  let closeTimer = 0;

  const setOpen = (open) => {
    const nextOpen = open && desktopMedia.matches;
    window.clearTimeout(closeTimer);
    header.classList.toggle("site-header--vehicles-open", nextOpen);
    trigger.setAttribute("aria-expanded", String(nextOpen));
    menu.setAttribute("aria-hidden", String(!nextOpen));
    menu.toggleAttribute("inert", !nextOpen);
  };

  const open = () => setOpen(true);
  const scheduleClose = () => {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => setOpen(false), 120);
  };

  header.classList.add("site-header--vehicle-menu-ready");
  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-controls", menu.id);
  header.append(menu);

  trigger.addEventListener("mouseenter", open);
  trigger.addEventListener("mouseleave", scheduleClose);
  trigger.addEventListener("focus", open);
  menu.addEventListener("mouseenter", open);
  menu.addEventListener("mouseleave", scheduleClose);
  menu.addEventListener("focusin", open);

  document.addEventListener("focusin", (event) => {
    if (event.target === trigger || menu.contains(event.target)) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || trigger.getAttribute("aria-expanded") !== "true") return;
    setOpen(false);
    trigger.focus();
  });

  desktopMedia.addEventListener("change", () => setOpen(false));
  setOpen(false);
  return { close: () => setOpen(false) };
};

export { initVehicleMenu };
