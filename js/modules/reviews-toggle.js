const initReviewsToggle = () => {
  const toggle = document.querySelector("[data-reviews-toggle]");
  const extraReviews = [...document.querySelectorAll("[data-review-extra]")];
  if (!toggle || !extraReviews.length) return null;

  const setExpanded = (expanded) => {
    extraReviews.forEach((review) => {
      review.hidden = !expanded;
    });
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.textContent = expanded ? "Скрыть" : "Показать еще";
  };

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") !== "true";
    setExpanded(expanded);
    if (expanded) extraReviews[0].querySelector("a, button, input, select, textarea")?.focus();
  });

  setExpanded(false);
  return { setExpanded };
};

export { initReviewsToggle };
