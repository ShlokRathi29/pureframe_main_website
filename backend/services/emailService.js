/**
 * emailService.js — Pureframe Labs
 * Configures the Nodemailer Gmail SMTP transporter and exposes
 * two functions: sendContactEmail() and sendCareerEmail().
 *
 * Credentials are read exclusively from environment variables.
 * NEVER hardcode credentials here.
 */

const nodemailer = require('nodemailer');

// ── TRANSPORTER ──
// Created once and reused across requests (connection pooling).
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,   // Gmail App Password, not your login password
  },
});

/**
 * Verify the transporter is properly configured at startup.
 * Logs a warning rather than crashing so the server still starts
 * during development without valid credentials.
 */
async function verifyTransporter() {
  try {
    await transporter.verify();
    console.log('[EmailService] SMTP transporter ready');
  } catch (err) {
    console.warn('[EmailService] SMTP transporter not ready — check EMAIL_USER / EMAIL_PASS in .env');
    console.warn('[EmailService]', err.message);
  }
}

verifyTransporter();

// ── CONTACT EMAIL ──

/**
 * Send a contact-form submission email.
 *
 * @param {{ fullName, email, company, service, message }} data
 */
async function sendContactEmail({ fullName, email, company, service, message }) {
  const recipient = process.env.EMAIL_RECIPIENT || 'pureframelabs@gmail.com';

  const mailOptions = {
    from:     `"Pureframe Labs Website" <${process.env.EMAIL_USER}>`,
    to:       recipient,
    replyTo:  email,
    subject:  `New Contact Inquiry - ${fullName}`,
    text: [
      `Name:     ${fullName}`,
      `Email:    ${email}`,
      `Company:  ${company  || 'Not provided'}`,
      `Service:  ${service  || 'Not specified'}`,
      '',
      'Message:',
      message,
    ].join('\n'),
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#0F172A;">
        <div style="background:#2563EB;padding:24px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">New Contact Inquiry</h1>
          <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:14px;">Pureframe Labs Website</p>
        </div>
        <div style="background:#fff;border:1px solid #E2E8F0;border-top:none;padding:32px;border-radius:0 0 12px 12px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;width:110px;">Name</td><td style="padding:10px 0;font-size:15px;font-weight:600;">${escapeHtml(fullName)}</td></tr>
            <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Email</td><td style="padding:10px 0;font-size:15px;"><a href="mailto:${escapeHtml(email)}" style="color:#2563EB;">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Company</td><td style="padding:10px 0;font-size:15px;">${escapeHtml(company || 'Not provided')}</td></tr>
            <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Service</td><td style="padding:10px 0;font-size:15px;">${escapeHtml(service || 'Not specified')}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #E2E8F0;margin:20px 0;">
          <p style="font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Message</p>
          <p style="font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
        </div>
        <p style="text-align:center;font-size:12px;color:#94A3B8;margin-top:20px;">Pureframe Labs Pvt. Ltd. · Parbhani, India</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// ── CAREER EMAIL ──

/**
 * Send a job-application email with the resume attached.
 * The resume file is attached and then deleted from disk.
 *
 * @param {{ firstName, lastName, email, phone, role, exp, linkedin, portfolio, cover }} data
 * @param {{ path, originalname, mimetype }} resumeFile - from Multer
 */
async function sendCareerEmail(data, resumeFile) {
  const { firstName, lastName, email, phone, role, exp, linkedin, portfolio, cover } = data;
  const fullName  = `${firstName} ${lastName}`;
  const recipient = process.env.EMAIL_RECIPIENT || 'pureframelabs@gmail.com';

  const mailOptions = {
    from:     `"Pureframe Labs Website" <${process.env.EMAIL_USER}>`,
    to:       recipient,
    replyTo:  email,
    subject:  `New Job Application - ${fullName}`,
    text: [
      `Applicant Name: ${fullName}`,
      `Email:          ${email}`,
      `Phone:          ${phone}`,
      `Position:       ${role}`,
      `Experience:     ${exp}`,
      '',
      `LinkedIn:       ${linkedin  || 'Not provided'}`,
      `Portfolio:      ${portfolio || 'Not provided'}`,
      '',
      'Message:',
      cover || 'Not provided',
    ].join('\n'),
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#0F172A;">
        <div style="background:#2563EB;padding:24px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">New Job Application</h1>
          <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:14px;">Pureframe Labs Careers</p>
        </div>
        <div style="background:#fff;border:1px solid #E2E8F0;border-top:none;padding:32px;border-radius:0 0 12px 12px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;width:130px;">Name</td><td style="padding:10px 0;font-size:15px;font-weight:600;">${escapeHtml(fullName)}</td></tr>
            <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Email</td><td style="padding:10px 0;font-size:15px;"><a href="mailto:${escapeHtml(email)}" style="color:#2563EB;">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Phone</td><td style="padding:10px 0;font-size:15px;">${escapeHtml(phone)}</td></tr>
            <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Position</td><td style="padding:10px 0;font-size:15px;">${escapeHtml(role)}</td></tr>
            <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Experience</td><td style="padding:10px 0;font-size:15px;">${escapeHtml(exp)}</td></tr>
            <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">LinkedIn</td><td style="padding:10px 0;font-size:15px;">${linkedin ? `<a href="${escapeHtml(linkedin)}" style="color:#2563EB;">${escapeHtml(linkedin)}</a>` : 'Not provided'}</td></tr>
            <tr><td style="padding:10px 0;font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Portfolio</td><td style="padding:10px 0;font-size:15px;">${portfolio ? `<a href="${escapeHtml(portfolio)}" style="color:#2563EB;">${escapeHtml(portfolio)}</a>` : 'Not provided'}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #E2E8F0;margin:20px 0;">
          <p style="font-size:13px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Cover Message</p>
          <p style="font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(cover || 'Not provided')}</p>
          <hr style="border:none;border-top:1px solid #E2E8F0;margin:20px 0;">
          <p style="font-size:13px;color:#64748B;">📎 Resume attached as <strong>${escapeHtml(resumeFile.originalname)}</strong></p>
        </div>
        <p style="text-align:center;font-size:12px;color:#94A3B8;margin-top:20px;">Pureframe Labs Pvt. Ltd. · Parbhani, India</p>
      </div>
    `,
    attachments: [
      {
        filename: resumeFile.originalname,
        path:     resumeFile.path,
        contentType: resumeFile.mimetype,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
}

// ── UTILITY ──

/** Basic HTML entity escaping to prevent injection in email HTML bodies. */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

module.exports = { sendContactEmail, sendCareerEmail };
