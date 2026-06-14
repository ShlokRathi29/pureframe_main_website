/**
 * contactController.js — Pureframe Labs
 * Business logic for the contact form endpoint.
 * Validates input then sends email via emailService.
 */

const { sendContactEmail } = require('../services/emailService');

/**
 * POST /api/contact
 *
 * Body (JSON):
 *   fullName  {string} required
 *   email     {string} required
 *   company   {string} optional
 *   service   {string} optional
 *   message   {string} required
 */
async function submitContact(req, res, next) {
  try {
    const {
      fullName = '',
      email    = '',
      company  = '',
      service  = '',
      message  = '',
    } = req.body;

    // ── Validation ──
    const errors = [];

    if (!fullName.trim()) errors.push('Full name is required.');
    if (!email.trim())    errors.push('Email address is required.');
    if (!message.trim())  errors.push('Message is required.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      errors.push('A valid email address is required.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0] });
    }

    // ── Sanitise (trim) ──
    const payload = {
      fullName: fullName.trim(),
      email:    email.trim(),
      company:  company.trim(),
      service:  service.trim(),
      message:  message.trim(),
    };

    // ── Send email ──
    await sendContactEmail(payload);

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
    });

  } catch (err) {
    next(err);
  }
}

module.exports = { submitContact };
