import html2canvas from 'html2canvas';

function autoSaveForm() {
  const formData = new FormData(document.getElementById('investment-form'));
  localStorage.setItem('investmentForm', JSON.stringify(Object.fromEntries(formData)));
}

async function captureScreenshot(screenshotTarget) {
  const canvas = await html2canvas(screenshotTarget);
  const screenshotDataURL = canvas.toDataURL();
  // שלח את ה-screenshotDataURL לשרת כאן
}

// הפעל שמירה אוטומטית בכל שינוי בשדות הטופס
document.getElementById('investment-form').addEventListener('input', autoSaveForm);

// צלם מסך בשלבים הרצויים
document.getElementById('step2-submit').addEventListener('click', () => {
  captureScreenshot(document.getElementById('step2-container'));
});

document.getElementById('submit-form').addEventListener('click', () => {
  captureScreenshot(document.getElementById('investment-form'));
});
