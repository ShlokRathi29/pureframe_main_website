/**
 * contact-form.js — Pureframe Labs
 * Handles the Contact form on the About/Contact page.
 * Submits via fetch() to POST /api/contact on the Express backend.
 */

const API_BASE = ''; // same origin in production; set to backend URL if hosted separately

// ── HELPERS ──

function setStatus(id, type, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'form-status ' + type;
  el.textContent = message;
}

function clearStatus(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'form-status';
  el.textContent = '';
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function clearField(id) {
  const el = document.getElementById(id);
  if (el) el.value = '';
}

// ── SUBMIT HANDLER ──

async function handleContactSubmit() {
  const fullName = getVal('cf-name');
  const email    = getVal('cf-email');
  const company  = getVal('cf-company');
  const service  = getVal('cf-service');
  const message  = getVal('cf-message');

  // Client-side validation
  if (!fullName || !email || !message) {
    setStatus('contactFormStatus', 'error', '⚠️ Please fill in your name, email, and message.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setStatus('contactFormStatus', 'error', '⚠️ Please enter a valid email address.');
    return;
  }

  // UI state: loading
  const btn = document.getElementById('contactSubmitBtn');
  if (btn) {
    btn.disabled    = true;
    btn.textContent = 'Sending…';
  }
  setStatus('contactFormStatus', 'loading', '⏳ Sending your message…');

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, company, service, message }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setStatus('contactFormStatus', 'success', '✓ Message sent! We\u2019ll be in touch within 24 hours.');
      // Reset form fields
      ['cf-name', 'cf-email', 'cf-company', 'cf-message'].forEach(clearField);
      const serviceEl = document.getElementById('cf-service');
      if (serviceEl) serviceEl.selectedIndex = 0;
      // Re-enable button after a delay
      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Send Message →';
        }
        clearStatus('contactFormStatus');
      }, 5000);
    } else {
      throw new Error(data.message || 'Submission failed.');
    }
  } catch (err) {
    console.error('[ContactForm]', err);
    setStatus('contactFormStatus', 'error', '✗ Something went wrong. Please try again or email us at pureframelabs@gmail.com');
    if (btn) {
      btn.disabled    = false;
      btn.textContent = 'Send Message →';
    }
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('contactSubmitBtn');
  if (btn) {
    btn.addEventListener('click', handleContactSubmit);
  }
});
