const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setActiveDot = (dots, activeIndex) => {
  dots.forEach((dot, index) => {
    const isActive = index === activeIndex;
    dot.classList.toggle("brand-services__dot--active", isActive);
    if (isActive) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
};

const initScrollPagination = () => {
  const scrollers = [...document.querySelectorAll("[data-scroll-pagination]")];

  return scrollers.flatMap((scroller) => {
    const paginationId = scroller.dataset.scrollPagination;
    const pagination = paginationId ? document.getElementById(paginationId) : null;
    const items = [...scroller.children];
    const dots = pagination ? [...pagination.querySelectorAll("button")] : [];
    if (!items.length || items.length !== dots.length) return [];

    let animationFrame = 0;
    const update = () => {
      const scrollerLeft = scroller.getBoundingClientRect().left;
      const activeIndex = items.reduce((closestIndex, item, index) => {
        const distance = Math.abs(item.getBoundingClientRect().left - scrollerLeft);
        const closestDistance = Math.abs(
          items[closestIndex].getBoundingClientRect().left - scrollerLeft,
        );
        return distance < closestDistance ? index : closestIndex;
      }, 0);
      setActiveDot(dots, activeIndex);
    };

    scroller.addEventListener(
      "scroll",
      () => {
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(update);
      },
      { passive: true },
    );

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        const scrollerRect = scroller.getBoundingClientRect();
        const itemRect = items[index].getBoundingClientRect();
        scroller.scrollTo({
          left: scroller.scrollLeft + itemRect.left - scrollerRect.left,
          behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
      });
    });

    setActiveDot(dots, 0);
    return [{ update }];
  });
};

export { initScrollPagination };
