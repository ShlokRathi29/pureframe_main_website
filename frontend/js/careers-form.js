/**
 * careers-form.js — Pureframe Labs
 * Handles the Careers / Job Application form.
 * Submits via FormData (multipart) to POST /api/careers on the Express backend.
 * Supports PDF, DOC, DOCX resume uploads up to 10 MB.
 */

const API_BASE            = ''; // same origin in production
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES       = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTS        = ['.pdf', '.doc', '.docx'];

// ── HELPERS ──

function setStatus(type, message) {
  const el = document.getElementById('careersFormStatus');
  if (!el) return;
  el.className    = 'form-status ' + type;
  el.textContent  = message;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// ── FILE VALIDATION & DISPLAY ──

function handleFileSelect(input) {
  const display = document.getElementById('fileNameDisplay');

  if (!input.files || !input.files[0]) {
    if (display) display.style.display = 'none';
    return;
  }

  const file = input.files[0];
  const ext  = '.' + file.name.split('.').pop().toLowerCase();

  if (!ALLOWED_EXTS.includes(ext)) {
    setStatus('error', '⚠️ Invalid file type. Please upload a PDF, DOC, or DOCX file.');
    input.value            = '';
    if (display) display.style.display = 'none';
    return;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    setStatus('error', '⚠️ File is too large. Maximum size is 10 MB.');
    input.value            = '';
    if (display) display.style.display = 'none';
    return;
  }

  if (display) {
    display.textContent  = '✓ ' + file.name;
    display.style.display = 'block';
  }
}

// ── DRAG & DROP HIGHLIGHT ──

function initDropZone() {
  const zone = document.getElementById('resumeDropZone');
  if (!zone) return;

  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
  zone.addEventListener('drop',      ()  => zone.classList.remove('drag-over'));
}

// ── SUBMIT HANDLER ──

async function handleCareerSubmit() {
  const firstName = getVal('c-first');
  const lastName  = getVal('c-last');
  const email     = getVal('c-email');
  const phone     = getVal('c-phone');
  const role      = getVal('c-role');
  const exp       = getVal('c-exp');
  const linkedin  = getVal('c-linkedin');
  const portfolio = getVal('c-portfolio');
  const cover     = getVal('c-cover');
  const fileInput = document.getElementById('c-resume');

  // Validation
  if (!firstName || !lastName || !email || !phone || !role || !exp) {
    setStatus('error', '⚠️ Please fill in all required fields.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setStatus('error', '⚠️ Please enter a valid email address.');
    return;
  }

  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    setStatus('error', '⚠️ Please upload your resume (PDF, DOC, or DOCX).');
    return;
  }

  // Build FormData for multipart upload
  const formData = new FormData();
  formData.append('firstName', firstName);
  formData.append('lastName',  lastName);
  formData.append('email',     email);
  formData.append('phone',     phone);
  formData.append('role',      role);
  formData.append('exp',       exp);
  formData.append('linkedin',  linkedin);
  formData.append('portfolio', portfolio);
  formData.append('cover',     cover);
  formData.append('resume',    fileInput.files[0]);

  // UI state: loading
  const btn = document.getElementById('careersSubmitBtn');
  if (btn) {
    btn.disabled    = true;
    btn.textContent = 'Submitting…';
  }
  setStatus('loading', '⏳ Uploading your resume and submitting application…');

  try {
    const res  = await fetch(`${API_BASE}/api/careers`, {
      method: 'POST',
      body:   formData, // browser sets multipart/form-data with boundary automatically
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setStatus('success', '✓ Application submitted! We\'ll review your resume and be in touch within 3 business days.');
      // Reset form
      ['c-first','c-last','c-email','c-phone','c-linkedin','c-portfolio','c-cover'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      ['c-role','c-exp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.selectedIndex = 0;
      });
      if (fileInput) fileInput.value = '';
      const display = document.getElementById('fileNameDisplay');
      if (display) display.style.display = 'none';
      // Re-enable button after a delay
      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Submit Application →';
        }
        setStatus('', '');
      }, 5000);
    } else {
      throw new Error(data.message || 'Submission failed.');
    }
  } catch (err) {
    console.error('[CareersForm]', err);
    setStatus('error', '✗ Submission failed. Please try again or email your resume directly to pureframelabs@gmail.com');
    if (btn) {
      btn.disabled    = false;
      btn.textContent = 'Submit Application →';
    }
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initDropZone();

  const btn = document.getElementById('careersSubmitBtn');
  if (btn) {
    btn.addEventListener('click', handleCareerSubmit);
  }

  const fileInput = document.getElementById('c-resume');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => handleFileSelect(e.target));
  }
});
