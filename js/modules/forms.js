const demoMessages = {
  finder: "Параметры заполнены корректно. Подбор на сайте работает в демонстрационном режиме.",
  price: "Параметры заполнены корректно. Расчёт на сайте работает в демонстрационном режиме.",
  booking: "Форма заполнена корректно. Онлайн-отправка станет доступна после подключения сервера.",
  career: "Анкета заполнена корректно. Отправка резюме станет доступна после подключения сервера.",
};

const setStatus = (form, message, state = "info") => {
  const status = form.querySelector(".form-status");
  if (!status) return;
  status.textContent = message;
  status.dataset.status = state;
};

const setSubmitting = (form, controls, submitting) => {
  form.toggleAttribute("aria-busy", submitting);
  controls.forEach((control) => {
    control.disabled = submitting;
  });
};

const submitForm = async (endpoint, method, formData) => {
  const requestUrl = new URL(endpoint, document.baseURI);
  if (method === "GET") {
    formData.forEach((value, key) => requestUrl.searchParams.append(key, String(value)));
  }

  const response = await fetch(requestUrl, {
    method,
    body: method === "GET" ? undefined : formData,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
};

const handleSubmit = async (form, event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const endpoint = form.dataset.endpoint || form.getAttribute("action");
  if (!endpoint) {
    setStatus(form, demoMessages[form.dataset.form] ?? demoMessages.booking);
    return;
  }

  const method = form.getAttribute("method")?.toUpperCase() ?? "POST";
  const formData = new FormData(form);
  const enabledControls = [...form.querySelectorAll("button, input, select, textarea")]
    .filter((control) => !control.disabled);

  setSubmitting(form, enabledControls, true);
  setStatus(form, "Отправляем…");

  try {
    await submitForm(endpoint, method, formData);
    setStatus(form, "Спасибо! Заявка отправлена, мы скоро свяжемся с вами.", "success");
    form.reset();
  } catch (error) {
    console.error("Не удалось отправить форму", error);
    setStatus(form, "Не удалось отправить форму. Попробуйте ещё раз или позвоните нам.", "error");
  } finally {
    setSubmitting(form, enabledControls, false);
  }
};

export const initForms = () => {
  const forms = [...document.querySelectorAll("[data-form]")];
  forms.forEach((form) => form.addEventListener("submit", (event) => handleSubmit(form, event)));
  return forms;
};
