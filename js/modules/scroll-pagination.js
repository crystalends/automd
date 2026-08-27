const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const mouseDragThreshold = 40;

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

const getClosestItemIndex = (scroller, items) => {
  const scrollerLeft = scroller.getBoundingClientRect().left;

  return items.reduce((closestIndex, item, index) => {
    const distance = Math.abs(item.getBoundingClientRect().left - scrollerLeft);
    const closestDistance = Math.abs(
      items[closestIndex].getBoundingClientRect().left - scrollerLeft,
    );
    return distance < closestDistance ? index : closestIndex;
  }, 0);
};

const scrollToItem = (scroller, item, behavior = "smooth") => {
  const scrollerRect = scroller.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  scroller.scrollTo({
    left: scroller.scrollLeft + itemRect.left - scrollerRect.left,
    behavior: prefersReducedMotion() ? "auto" : behavior,
  });
};

const initMouseDrag = (scroller, items, update) => {
  let dragState = null;

  const finishDrag = (event, shouldSnap) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    const distance = event.clientX - dragState.startX;
    const moved = Math.abs(distance) >= mouseDragThreshold;
    const direction = distance < 0 ? 1 : -1;
    const targetIndex = moved
      ? Math.max(0, Math.min(items.length - 1, dragState.startIndex + direction))
      : getClosestItemIndex(scroller, items);

    if (scroller.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }
    delete scroller.dataset.pointerDragging;
    dragState = null;

    if (shouldSnap) scrollToItem(scroller, items[targetIndex]);
    requestAnimationFrame(update);
  };

  scroller.addEventListener("pointerdown", (event) => {
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      scroller.scrollWidth <= scroller.clientWidth
    ) {
      return;
    }

    dragState = {
      pointerId: event.pointerId,
      startIndex: getClosestItemIndex(scroller, items),
      startScrollLeft: scroller.scrollLeft,
      startX: event.clientX,
    };
    scroller.dataset.pointerDragging = "true";
    scroller.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  scroller.addEventListener("pointermove", (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    scroller.scrollLeft = dragState.startScrollLeft + dragState.startX - event.clientX;
    event.preventDefault();
  });

  scroller.addEventListener("pointerup", (event) => finishDrag(event, true));
  scroller.addEventListener("pointercancel", (event) => finishDrag(event, false));
  scroller.addEventListener("dragstart", (event) => event.preventDefault());
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
      setActiveDot(dots, getClosestItemIndex(scroller, items));
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
        scrollToItem(scroller, items[index]);
      });
    });

    initMouseDrag(scroller, items, update);
    setActiveDot(dots, 0);
    return [{ update }];
  });
};

export { initScrollPagination };
