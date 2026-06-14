/**
 * uploadMiddleware.js — Pureframe Labs
 * Multer configuration for resume file uploads.
 *
 * Allowed types : PDF, DOC, DOCX
 * Max file size : 10 MB
 * Storage path  : backend/uploads/
 *
 * Files are stored temporarily; emailService deletes them
 * after the email has been sent successfully.
 */

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ── STORAGE ──
// Ensure the uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename(_req, file, cb) {
    // Sanitise original name and prepend a timestamp to avoid collisions
    const safe      = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    cb(null, `${timestamp}-${safe}`);
  },
});

// ── FILE FILTER ──
const ALLOWED_MIMETYPES = new Set([
  'application/pdf',
  'application/msword',                                                           // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',     // .docx
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_MIMETYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        'Only PDF, DOC, and DOCX files are allowed.'
      ),
      false
    );
  }
}

// ── MULTER INSTANCE ──
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

module.exports = { upload };
