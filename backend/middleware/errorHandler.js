/**
 * errorHandler.js — Pureframe Labs
 * Global Express error-handling middleware.
 * Must be registered AFTER all routes in server.js.
 */

const multer = require('multer');

/**
 * Formats Multer errors into user-friendly messages.
 */
function multerErrorMessage(err) {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return 'File is too large. Maximum size is 10 MB.';
    case 'LIMIT_UNEXPECTED_FILE':
      return err.message || 'Invalid file type. Only PDF, DOC, and DOCX are allowed.';
    default:
      return 'File upload error. Please try again.';
  }
}

/**
 * Global error handler.
 * Express identifies this as an error handler because it has 4 parameters.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log the full error server-side
  console.error('[ErrorHandler]', err.message || err);

  // Multer errors
  if (err instanceof multer.MulterError || err.code?.startsWith('LIMIT_')) {
    return res.status(400).json({
      success: false,
      message: multerErrorMessage(err),
    });
  }

  // Validation errors (thrown manually with status 400)
  if (err.status === 400) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Invalid request.',
    });
  }

  // Default 500
  const statusCode = err.status || 500;
  const message    = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal server error.';

  res.status(statusCode).json({ success: false, message });
}

module.exports = errorHandler;
