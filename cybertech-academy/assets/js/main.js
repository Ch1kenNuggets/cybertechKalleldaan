document.addEventListener('DOMContentLoaded', () => {
  const filterInputs = document.querySelectorAll('[data-live-filter]');
  filterInputs.forEach((input) => {
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const targetSelector = input.getAttribute('data-live-filter');
      if (!targetSelector) return;
      document.querySelectorAll(targetSelector).forEach((el) => {
        const text = (el.textContent || '').toLowerCase();
        el.style.display = text.includes(q) ? '' : 'none';
      });
    });
  });
});
