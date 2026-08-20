const setActiveFilter = (root, category) => {
  const buttons = [...root.querySelectorAll("[data-article-category]")];
  const cards = [...document.querySelectorAll("[data-article-card]")];
  const status = document.querySelector("[data-article-filter-status]");
  let visibleCount = 0;

  buttons.forEach((button) => {
    const isActive = button.dataset.articleCategory === category;
    button.classList.toggle("article-filter__button--active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  cards.forEach((card) => {
    const isVisible = category === "all" || card.dataset.category === category;
    card.hidden = !isVisible;
    visibleCount += Number(isVisible);
  });

  if (status) {
    status.textContent = `Показано статей: ${visibleCount}`;
  }
};

export const initArticleFilter = () => {
  const root = document.querySelector("[data-article-filter]");
  if (!root) return;

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-article-category]");
    if (!button || !root.contains(button)) return;

    setActiveFilter(root, button.dataset.articleCategory);
  });
};
