const closeOtherFaqItems = (items, activeItem) => {
  items.forEach((item) => {
    if (item !== activeItem) item.open = false;
  });
};

const initFaqAccordions = () => {
  const groups = [...document.querySelectorAll(".faq-request__list")];

  groups.forEach((group) => {
    const items = [...group.querySelectorAll(".faq-item")];
    const initiallyOpenItem = items.find((item) => item.open);

    if (initiallyOpenItem) closeOtherFaqItems(items, initiallyOpenItem);

    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (item.open) closeOtherFaqItems(items, item);
      });
    });
  });

  return groups;
};

export { closeOtherFaqItems, initFaqAccordions };
