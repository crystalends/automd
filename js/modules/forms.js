const messages = {
  finder: "Подходящие варианты найдены — менеджер уточнит детали при записи.",
  price: "Расчёт подготовлен. Точную стоимость подтвердим после диагностики.",
  booking: "Спасибо! Заявка принята, мы скоро свяжемся с вами.",
};

const showStatus = (form) => {
  const status = form.querySelector(".form-status");
  if (!status) return;
  status.textContent = messages[form.dataset.form] ?? "Форма отправлена.";
};

export const initForms = () => {
  document.querySelectorAll("[data-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      showStatus(form);
      if (form.dataset.form === "booking") form.reset();
    });
  });
};
