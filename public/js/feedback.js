function showFeedback(message, type) {
  const feedback = document.createElement('div');
  feedback.classList.add('feedback-message', type);
  feedback.textContent = message;
  document.body.appendChild(feedback);
  setTimeout(() => {
    feedback.remove();
  }, 3000);
}

// הצג הודעות משוב במקומות הרלוונטיים
// למשל, אחרי שמירת החתימה:
document.getElementById('save-signature').addEventListener('click', () => {
  if (!signaturePad.isEmpty()) {
    const signatureDataURL = signaturePad.toDataURL();
    document.getElementById('signature-data').value = signatureDataURL;
    showFeedback('החתימה נשמרה בהצלחה!', 'success');
  }
});
