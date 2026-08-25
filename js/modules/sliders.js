const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getSpeed = () => (prefersReducedMotion() ? 0 : 400);

const getBenefitsAutoplay = () =>
  prefersReducedMotion()
    ? false
    : {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      };

const getPromoAutoplay = () =>
  prefersReducedMotion()
    ? false
    : {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      };

const getCommonOptions = () => ({
  speed: getSpeed(),
  rewind: true,
  roundLengths: true,
  watchOverflow: true,
  preventInteractionOnTransition: true,
  keyboard: {
    enabled: false,
    onlyInViewport: false,
    pageUpDown: false,
  },
  a11y: {
    enabled: true,
    prevSlideMessage: "Предыдущий слайд",
    nextSlideMessage: "Следующий слайд",
    firstSlideMessage: "Первый слайд",
    lastSlideMessage: "Последний слайд",
    paginationBulletMessage: "Перейти к слайду {{index}}",
  },
});

const bindKeyboardToFocus = (swiper, element) => {
  element.addEventListener("focusin", () => swiper.keyboard?.enable());
  element.addEventListener("focusout", (event) => {
    if (!element.contains(event.relatedTarget)) swiper.keyboard?.disable();
  });
  return swiper;
};

const createExtraServicesCarousel = () => {
  const scroller = document.querySelector(".extra-services__grid");
  const dots = [...document.querySelectorAll(".extra-services__dot")];
  const cards = [...document.querySelectorAll(".extra-services .service-card--extra")];
  if (!scroller || dots.length !== cards.length) return null;

  let animationFrame = 0;
  const setActiveSlide = (activeIndex) => {
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("extra-services__dot--active", isActive);
      if (isActive) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    cards.forEach((card, index) =>
      card.classList.toggle("service-card--extra-selected", index === activeIndex),
    );
  };

  const updateActiveSlide = () => {
    const scrollerLeft = scroller.getBoundingClientRect().left;
    const activeIndex = cards.reduce((closestIndex, card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - scrollerLeft);
      const closestDistance = Math.abs(
        cards[closestIndex].getBoundingClientRect().left - scrollerLeft,
      );
      return distance < closestDistance ? index : closestIndex;
    }, 0);
    setActiveSlide(activeIndex);
  };

  const handleScroll = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(updateActiveSlide);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      const scrollerRect = scroller.getBoundingClientRect();
      const cardRect = cards[index].getBoundingClientRect();
      scroller.scrollTo({
        left: scroller.scrollLeft + cardRect.left - scrollerRect.left,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    });
  });
  scroller.addEventListener("scroll", handleScroll, { passive: true });
  setActiveSlide(0);

  return { update: updateActiveSlide };
};

const createCarBrandsCarousel = () => {
  const scroller = document.querySelector(".car-brands__grid");
  const cards = [...document.querySelectorAll(".car-brands .vehicle-card")];
  const dots = [...document.querySelectorAll(".car-brands__dot")];
  if (!scroller || !cards.length || !dots.length) return null;

  let animationFrame = 0;
  const setActivePage = (activeIndex) => {
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("car-brands__dot--active", isActive);
      if (isActive) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  const updateActivePage = () => {
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    const progress = maxScroll > 0 ? scroller.scrollLeft / maxScroll : 0;
    setActivePage(Math.round(progress * (dots.length - 1)));
  };

  const handleScroll = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(updateActivePage);
  };

  dots.forEach((dot, pageIndex) => {
    dot.addEventListener("click", () => {
      const targetCard = cards[Math.min(pageIndex * 2, cards.length - 1)];
      scroller.scrollTo({
        left: targetCard.offsetLeft - scroller.offsetLeft,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    });
  });
  scroller.addEventListener("scroll", handleScroll, { passive: true });
  setActivePage(0);

  return { update: updateActivePage };
};

const createBenefitsSlider = (Swiper) => {
  const element = document.querySelector(".benefits-slider");
  if (!element) return null;

  const swiper = new Swiper(element, {
    ...getCommonOptions(),
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: 0,
    grabCursor: false,
    simulateTouch: true,
    touchStartPreventDefault: true,
    autoplay: getBenefitsAutoplay(),
    pagination: {
      el: element.parentElement.querySelector(".benefits-slider__pagination"),
      clickable: true,
    },
  });
  return bindKeyboardToFocus(swiper, element);
};

const createPromoSlider = (Swiper) => {
  const element = document.querySelector(".promo-banner__slider");
  if (!element) return null;

  const pagination = element.parentElement?.querySelector(".promo-banner__pagination");
  const swiper = new Swiper(element, {
    ...getCommonOptions(),
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: 0,
    grabCursor: true,
    simulateTouch: true,
    touchStartPreventDefault: false,
    autoplay: getPromoAutoplay(),
    pagination: {
      el: pagination,
      clickable: true,
    },
  });

  return bindKeyboardToFocus(swiper, element);
};

const bindReviewsPagination = (swiper, element) => {
  const dots = [...element.querySelectorAll(".reviews__dot")];
  if (!dots.length) return swiper;

  const updatePagination = () => {
    const progress = Math.min(1, Math.max(0, swiper.progress || 0));
    const activeIndex = Math.round(progress * (dots.length - 1));
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("reviews__dot--active", isActive);
      if (isActive) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      const targetIndex = Math.round(
        (index * (swiper.slides.length - 1)) / (dots.length - 1),
      );
      swiper.slideTo(targetIndex);
    });
  });
  swiper.on("progress", updatePagination);
  swiper.on("breakpoint", updatePagination);
  updatePagination();
  return swiper;
};

const createReviewsSlider = (Swiper) => {
  const element = document.querySelector(".reviews__slider");
  if (!element) return null;

  const swiper = new Swiper(element, {
    ...getCommonOptions(),
    slidesPerView: "auto",
    slidesPerGroup: 1,
    spaceBetween: 20,
    grabCursor: true,
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 16,
      },
      1200: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
  });
  return bindKeyboardToFocus(bindReviewsPagination(swiper, element), element);
};

export const initSliders = () => {
  const extraServicesCarousel = createExtraServicesCarousel();
  const carBrandsCarousel = createCarBrandsCarousel();
  const swiperRoot = document.querySelector(".swiper");
  if (!swiperRoot) return [extraServicesCarousel, carBrandsCarousel].filter(Boolean);

  const Swiper = window.Swiper;
  if (typeof Swiper !== "function") {
    console.warn("Swiper не загружен: слайдеры оставлены в статичном состоянии.");
    return [extraServicesCarousel, carBrandsCarousel].filter(Boolean);
  }

  return [
    extraServicesCarousel,
    carBrandsCarousel,
    createPromoSlider(Swiper),
    createBenefitsSlider(Swiper),
    createReviewsSlider(Swiper),
  ].filter(Boolean);
};
