import { vehicles } from "./vehicle-menu.js";

const mobileMedia = window.matchMedia("(max-width: 1199px)");

const services = [
  {
    name: "Плановое ТО",
    description: "Регламентное обслуживание, замена масла, фильтров, жидкостей и расходников",
    image: "assets/service-maintenance.png",
    imageModifier: "maintenance",
  },
  {
    name: "Диагностика",
    description: "Компьютерная диагностика, проверка двигателя, ходовой, тормозной системы и электрики",
    image: "assets/service-diagnostics.png",
    imageModifier: "diagnostics",
  },
  {
    name: "Ремонт",
    description: "Ремонтируем основные узлы и системы автомобиля после диагностики и согласования работ",
    image: "assets/service-repair.png",
    imageModifier: "repair",
  },
  {
    name: "Замена",
    description: "Выполняем замену расходников, узлов и деталей с подбором запчастей под конкретную модель",
    image: "assets/service-replacement.png",
    imageModifier: "replacement",
  },
  {
    name: "Форсунки",
    description: "Диагностика, ремонт и восстановление форсунок для коммерческого транспорта",
    image: "assets/service-injectors.png",
    imageModifier: "injectors",
  },
  {
    name: "Дополнительные услуги",
    description: "Дополнительные сервисы для владельцев автомобилей и юридических лиц",
    image: "assets/service-extra.png",
    imageModifier: "extra",
  },
];

const companyItems = [
  { name: "О AutoMD", image: "assets/mobile-menu-about.png", imageModifier: "about", href: "about.html" },
  { name: "3D-тур", image: "assets/mobile-menu-tour.png", imageModifier: "tour", href: "3d-tour.html" },
  { name: "Отзывы", image: "assets/mobile-menu-reviews.png", imageModifier: "reviews", href: "reviews.html" },
  { name: "Вакансии", image: "assets/mobile-menu-vacancies.png", imageModifier: "vacancies", href: "vacancies.html" },
  { name: "Клиентская зона", image: "assets/mobile-menu-client-zone.png", imageModifier: "client-zone", href: "client-zone.html" },
  { name: "Гарантии и сервис", image: "assets/mobile-menu-warranty.png", imageModifier: "warranty", href: "warranty.html" },
];

const promotionItems = [
  { name: "Все акции", image: "assets/mobile-menu-promotions.png", imageModifier: "promotions", href: "promotions.html" },
  { name: "Страховка со скидкой", image: "assets/mobile-menu-insurance.png", imageModifier: "insurance", href: "promotions.html#special-offers-title" },
];

const viewLabels = {
  root: "Основное меню",
  vehicles: "Автомобили",
  services: "Услуги",
  company: "О компании",
  promotions: "Акции",
};

const createImage = ({ className, src, width, height, alt = "" }) => {
  const image = document.createElement("img");
  image.className = className;
  image.src = src;
  image.alt = alt;
  image.width = width;
  image.height = height;
  return image;
};

const createCloseButton = () => {
  const button = document.createElement("button");
  button.className = "mobile-menu__close";
  button.type = "button";
  button.setAttribute("aria-label", "Закрыть меню");
  button.dataset.mobileMenuClose = "";
  button.append(createImage({
    className: "mobile-menu__close-icon",
    src: "assets/mobile-menu-close.svg",
    width: 24,
    height: 24,
  }));
  return button;
};

const createScreenHeader = (title) => {
  const header = document.createElement("header");
  header.className = "mobile-menu__screen-header";

  const heading = document.createElement("h2");
  heading.className = "mobile-menu__title";
  heading.textContent = title;
  header.append(heading, createCloseButton());
  return header;
};

const createRootLink = (sourceLink) => {
  const label = sourceLink.textContent.trim();
  const targetViews = {
    Автомобили: "vehicles",
    Услуги: "services",
    Акции: "promotions",
    "О компании": "company",
  };
  const opensView = targetViews[label] ?? "";
  const hasArrow = Boolean(opensView);
  const item = document.createElement(opensView ? "button" : "a");

  item.className = "mobile-menu__link";
  if (opensView) {
    item.type = "button";
    item.dataset.mobileMenuViewOpen = opensView;
    item.setAttribute("aria-haspopup", "true");
  } else {
    item.href = sourceLink.href;
  }

  const text = document.createElement("span");
  text.className = "mobile-menu__link-text";
  text.textContent = label;
  item.append(text);

  if (hasArrow) {
    item.append(createImage({
      className: "mobile-menu__link-arrow",
      src: "assets/mobile-menu-arrow.svg",
      width: 24,
      height: 24,
    }));
  }

  return item;
};

const createContactRow = ({ icon, text, href }) => {
  const row = document.createElement(href ? "a" : "div");
  row.className = "mobile-menu__contact-row";
  if (href) row.href = href;
  row.append(createImage({
    className: "mobile-menu__contact-icon",
    src: `assets/mobile-menu-${icon}.svg`,
    width: 24,
    height: 24,
  }));

  const value = document.createElement("span");
  value.className = "mobile-menu__contact-text";
  value.textContent = text;
  row.append(value);
  return row;
};

const createRootScreen = (header, navigation) => {
  const screen = document.createElement("section");
  screen.className = "mobile-menu__screen mobile-menu__screen--root";
  screen.dataset.mobileMenuView = "root";

  const screenHeader = document.createElement("header");
  screenHeader.className = "mobile-menu__root-header";

  const logo = header.querySelector(".brand-logo")?.cloneNode(true);
  if (logo) logo.classList.add("mobile-menu__logo");

  const actions = document.createElement("div");
  actions.className = "mobile-menu__header-actions";
  const searchSource = header.querySelector(".site-header__search");
  const search = document.createElement("a");
  search.className = "mobile-menu__search";
  search.href = searchSource?.href ?? "services.html";
  search.setAttribute("aria-label", searchSource?.getAttribute("aria-label") ?? "Поиск");
  search.append(createImage({
    className: "mobile-menu__search-icon",
    src: "assets/mobile-menu-search.svg",
    width: 34,
    height: 34,
  }));
  actions.append(search, createCloseButton());
  if (logo) screenHeader.append(logo, actions);
  else screenHeader.append(actions);

  const links = document.createElement("nav");
  links.className = "mobile-menu__navigation";
  links.setAttribute("aria-label", "Разделы сайта");
  links.append(...[...navigation.querySelectorAll(".site-nav__link")].map(createRootLink));

  const callSource = header.querySelector(".site-header__button");
  const call = document.createElement("a");
  call.className = "mobile-menu__call";
  call.href = callSource?.href ?? "index.html#booking";
  call.textContent = callSource?.textContent.trim() || "Заказать звонок";

  const contact = document.createElement("div");
  contact.className = "mobile-menu__contact";
  contact.append(
    createContactRow({ icon: "pin", text: "ЮАО, метро Пражская" }),
    createContactRow({ icon: "pin", text: "САО, метро Ховрино" }),
    createContactRow({ icon: "time", text: "Ежедневно: 9:00–20:00" }),
    createContactRow({ icon: "phone", text: "+7 (495) 477-50-29", href: "tel:+74954775029" }),
  );

  screen.append(screenHeader, links, call, contact);
  return screen;
};

const createVehicleItem = ({ name, image, width, height, href, all, imageModifier }, index) => {
  const item = document.createElement("a");
  item.className = [
    "mobile-menu__vehicle",
    index === 0 ? "mobile-menu__vehicle--selected" : "",
    all ? "mobile-menu__vehicle--all" : "",
  ].filter(Boolean).join(" ");
  item.href = href;

  const imageFrame = document.createElement("span");
  imageFrame.className = [
    "mobile-menu__vehicle-image-frame",
    all ? "mobile-menu__vehicle-image-frame--all" : "",
  ].filter(Boolean).join(" ");
  imageFrame.append(createImage({
    className: [
      "mobile-menu__vehicle-image",
      imageModifier ? `mobile-menu__vehicle-image--${imageModifier}` : "",
    ].filter(Boolean).join(" "),
    src: image,
    width,
    height,
  }));

  const label = document.createElement("span");
  label.className = "mobile-menu__vehicle-label";
  label.textContent = name;
  const arrowVariant = all ? "red" : index === 0 ? "blue" : "small";
  const arrow = createImage({
    className: "mobile-menu__vehicle-arrow",
    src: `assets/mobile-menu-arrow-${arrowVariant}.svg`,
    width: 16,
    height: 16,
  });

  item.append(imageFrame, label, arrow);
  return item;
};

const createVehiclesScreen = () => {
  const screen = document.createElement("section");
  screen.className = "mobile-menu__screen mobile-menu__screen--catalog";
  screen.dataset.mobileMenuView = "vehicles";
  screen.hidden = true;

  const list = document.createElement("nav");
  list.className = "mobile-menu__vehicles";
  list.setAttribute("aria-label", "Автомобили по маркам");
  list.append(...vehicles.map(createVehicleItem));
  screen.append(createScreenHeader("Автомобили"), list);
  return screen;
};

const createServiceItem = ({ name, description, image, imageModifier }, index) => {
  const item = document.createElement("a");
  item.className = [
    "mobile-menu__service",
    index === 0 ? "mobile-menu__service--selected" : "",
  ].filter(Boolean).join(" ");
  item.href = "services.html#directions";

  const imageFrame = document.createElement("span");
  imageFrame.className = "mobile-menu__service-image-frame";
  imageFrame.append(createImage({
    className: `mobile-menu__service-image mobile-menu__service-image--${imageModifier}`,
    src: image,
    width: 1254,
    height: 1254,
  }));

  const content = document.createElement("span");
  content.className = "mobile-menu__service-content";
  const title = document.createElement("strong");
  title.className = "mobile-menu__service-title";
  title.textContent = name;
  const copy = document.createElement("span");
  copy.className = "mobile-menu__service-description";
  copy.textContent = description;
  content.append(title, copy);

  item.append(imageFrame, content, createImage({
    className: "mobile-menu__service-arrow",
    src: "assets/mobile-menu-arrow.svg",
    width: 24,
    height: 24,
  }));
  return item;
};

const createServicesScreen = () => {
  const screen = document.createElement("section");
  screen.className = "mobile-menu__screen mobile-menu__screen--catalog";
  screen.dataset.mobileMenuView = "services";
  screen.hidden = true;

  const list = document.createElement("nav");
  list.className = "mobile-menu__services";
  list.setAttribute("aria-label", "Каталог услуг");
  list.append(...services.map(createServiceItem));
  screen.append(createScreenHeader("Услуги"), list);
  return screen;
};

const createSimpleItem = ({ name, image, imageModifier, href }, index) => {
  const item = document.createElement("a");
  item.className = [
    "mobile-menu__simple-item",
    index === 0 ? "mobile-menu__simple-item--selected" : "",
  ].filter(Boolean).join(" ");
  item.href = href;

  const imageFrame = document.createElement("span");
  imageFrame.className = "mobile-menu__simple-image-frame";
  imageFrame.append(createImage({
    className: `mobile-menu__simple-image mobile-menu__simple-image--${imageModifier}`,
    src: image,
    width: 1254,
    height: 1254,
  }));

  const label = document.createElement("span");
  label.className = "mobile-menu__simple-label";
  label.textContent = name;
  item.append(imageFrame, label, createImage({
    className: "mobile-menu__simple-arrow",
    src: "assets/mobile-menu-arrow.svg",
    width: 24,
    height: 24,
  }));
  return item;
};

const createSimpleScreen = ({ view, title, items, spacious = false }) => {
  const screen = document.createElement("section");
  screen.className = "mobile-menu__screen mobile-menu__screen--catalog";
  screen.dataset.mobileMenuView = view;
  screen.hidden = true;

  const list = document.createElement("nav");
  list.className = [
    "mobile-menu__simple-list",
    spacious ? "mobile-menu__simple-list--spacious" : "",
  ].filter(Boolean).join(" ");
  list.setAttribute("aria-label", title);
  list.append(...items.map(createSimpleItem));
  screen.append(createScreenHeader(title), list);
  return screen;
};

const initMobileMenu = () => {
  const header = document.querySelector(".site-header");
  const toggle = header?.querySelector(".site-header__menu-toggle");
  const navigation = header?.querySelector(".site-nav");
  if (!header || !toggle || !navigation) return null;

  const dialog = document.createElement("dialog");
  dialog.className = "mobile-menu";
  dialog.id = "mobile-menu";
  dialog.setAttribute("aria-label", "Основное меню");
  dialog.append(
    createRootScreen(header, navigation),
    createVehiclesScreen(),
    createServicesScreen(),
    createSimpleScreen({ view: "company", title: "О компании", items: companyItems }),
    createSimpleScreen({ view: "promotions", title: "Акции", items: promotionItems, spacious: true }),
  );
  document.body.append(dialog);

  const screens = [...dialog.querySelectorAll("[data-mobile-menu-view]")];
  let restoreFocus = true;

  const setView = (view = "root") => {
    screens.forEach((screen) => {
      screen.hidden = screen.dataset.mobileMenuView !== view;
    });
    dialog.dataset.mobileMenuCurrentView = view;
    dialog.setAttribute("aria-label", viewLabels[view] ?? viewLabels.root);
    dialog.querySelector(`[data-mobile-menu-view="${view}"] [data-mobile-menu-close]`)?.focus();
  };

  const open = () => {
    if (!mobileMedia.matches || dialog.open) return;
    restoreFocus = true;
    dialog.showModal();
    setView("root");
    toggle.setAttribute("aria-expanded", "true");
  };

  const close = ({ returnFocus = true } = {}) => {
    if (!dialog.open) return;
    restoreFocus = returnFocus;
    dialog.close();
  };

  const syncNavigation = () => {
    const mobile = mobileMedia.matches;
    navigation.toggleAttribute("inert", mobile);
    if (mobile) navigation.setAttribute("aria-hidden", "true");
    else navigation.removeAttribute("aria-hidden");
    if (!mobile) close({ returnFocus: false });
  };

  toggle.setAttribute("aria-controls", dialog.id);
  toggle.addEventListener("click", open);
  dialog.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-mobile-menu-close]");
    if (closeButton) {
      close();
      return;
    }

    const viewButton = event.target.closest("[data-mobile-menu-view-open]");
    if (viewButton) {
      setView(viewButton.dataset.mobileMenuViewOpen);
      return;
    }

    if (event.target.closest("a")) close({ returnFocus: false });
  });
  dialog.addEventListener("close", () => {
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus && mobileMedia.matches) toggle.focus();
  });
  mobileMedia.addEventListener("change", syncNavigation);
  syncNavigation();

  return { close, open, setView };
};

export { initMobileMenu };
