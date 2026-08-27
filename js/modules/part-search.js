const initPartSearch = () => {
  const form = document.querySelector("[data-part-search]");
  const example = document.querySelector("[data-part-search-example]");
  const input = form?.querySelector('input[name="part-number"]');
  if (!form || !example || !input) return null;

  example.addEventListener("click", () => {
    input.value = example.dataset.partSearchExample ?? "";
    input.focus();
  });

  return { form, input };
};

export { initPartSearch };
