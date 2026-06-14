/**
 * careerController.js — Pureframe Labs
 * Business logic for the careers / job-application endpoint.
 * Validates input, sends email with resume attachment, then
 * deletes the uploaded file from disk.
 */

const fs                          = require('fs');
const { sendCareerEmail }         = require('../services/emailService');

/**
 * POST /api/careers
 *
 * Body (multipart/form-data):
 *   firstName {string} required
 *   lastName  {string} required
 *   email     {string} required
 *   phone     {string} required
 *   role      {string} required
 *   exp       {string} required
 *   linkedin  {string} optional
 *   portfolio {string} optional
 *   cover     {string} optional
 *   resume    {file}   required — PDF / DOC / DOCX, max 10 MB
 */
async function submitCareer(req, res, next) {
  // Grab any uploaded file so we can clean it up even on failure
  const resumeFile = req.file || null;

  try {
    const {
      firstName = '',
      lastName  = '',
      email     = '',
      phone     = '',
      role      = '',
      exp       = '',
      linkedin  = '',
      portfolio = '',
      cover     = '',
    } = req.body;

    // ── Validation ──
    const errors = [];

    if (!firstName.trim()) errors.push('First name is required.');
    if (!lastName.trim())  errors.push('Last name is required.');
    if (!email.trim())     errors.push('Email address is required.');
    if (!phone.trim())     errors.push('Phone number is required.');
    if (!role.trim())      errors.push('Please select the role you are applying for.');
    if (!exp.trim())       errors.push('Please select your experience level.');
    if (!resumeFile)       errors.push('Please upload your resume (PDF, DOC, or DOCX).');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      errors.push('A valid email address is required.');
    }

    if (errors.length > 0) {
      // Remove orphaned upload if validation fails
      if (resumeFile) deleteFile(resumeFile.path);
      return res.status(400).json({ success: false, message: errors[0] });
    }

    // ── Sanitise (trim) ──
    const payload = {
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email:     email.trim(),
      phone:     phone.trim(),
      role:      role.trim(),
      exp:       exp.trim(),
      linkedin:  linkedin.trim(),
      portfolio: portfolio.trim(),
      cover:     cover.trim(),
    };

    // ── Send email with resume attached ──
    await sendCareerEmail(payload, resumeFile);

    // ── Delete file after successful delivery ──
    deleteFile(resumeFile.path);

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
    });

  } catch (err) {
    // Always clean up the uploaded file, even on unexpected errors
    if (resumeFile) deleteFile(resumeFile.path);
    next(err);
  }
}

/** Silently deletes a file; logs a warning on failure. */
function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) console.warn('[CareerController] Could not delete uploaded file:', filePath, err.message);
    else     console.log('[CareerController] Deleted uploaded file:', filePath);
  });
}

module.exports = { submitCareer };
