document.addEventListener('DOMContentLoaded', () => {
  const flagForm = document.getElementById('flag-submit-form');
  const feedbackEl = document.getElementById('flag-feedback');
  if (!flagForm || !feedbackEl) return;

  flagForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(flagForm);
    feedbackEl.textContent = 'Verifying flag on server...';
    feedbackEl.className = 'alert';

    try {
      const res = await fetch(flagForm.getAttribute('action') || 'submit-flag.php', {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      const data = await res.json();
      feedbackEl.textContent = data.message || 'Verification complete.';
      feedbackEl.className = data.correct ? 'alert alert-success' : 'alert alert-error';
      if (data.correct) {
        setTimeout(() => window.location.reload(), 900);
      }
    } catch {
      feedbackEl.textContent = 'Unable to submit flag right now.';
      feedbackEl.className = 'alert alert-error';
    }
  });
});
