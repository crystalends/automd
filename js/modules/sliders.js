const getSpeed = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 400);

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
  element.addEventListener("focusin", () => swiper.keyboard.enable());
  element.addEventListener("focusout", (event) => {
    if (!element.contains(event.relatedTarget)) swiper.keyboard.disable();
  });
  return swiper;
};

const createBenefitsSlider = (Swiper) => {
  const element = document.querySelector(".benefits-slider");
  if (!element) return null;

  const swiper = new Swiper(element, {
    ...getCommonOptions(),
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: 0,
    grabCursor: true,
    simulateTouch: true,
    touchStartPreventDefault: true,
    pagination: {
      el: element.parentElement.querySelector(".benefits-slider__pagination"),
      clickable: true,
    },
  });
  return bindKeyboardToFocus(swiper, element);
};

const createReviewsSlider = (Swiper) => {
  const element = document.querySelector(".reviews__slider");
  if (!element) return null;

  const swiper = new Swiper(element, {
    ...getCommonOptions(),
    slidesPerView: 3,
    slidesPerGroup: 1,
    spaceBetween: 20,
    grabCursor: true,
    pagination: {
      el: element.querySelector(".reviews__pagination"),
      clickable: true,
    },
  });
  return bindKeyboardToFocus(swiper, element);
};

export const initSliders = () => {
  const Swiper = window.Swiper;
  if (typeof Swiper !== "function") {
    console.warn("Swiper не загружен: слайдеры оставлены в статичном состоянии.");
    return [];
  }

  return [createBenefitsSlider(Swiper), createReviewsSlider(Swiper)].filter(Boolean);
};
