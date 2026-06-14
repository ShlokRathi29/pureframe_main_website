/**
 * server.js — Pureframe Labs Backend
 * Express application: security headers, CORS, rate-limiting,
 * logging, API routes, and global error handler.
 */

'use strict';

// ── Load environment variables first ──
require('dotenv').config();

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const morgan       = require('morgan');
const path         = require('path');

const contactRoutes = require('./routes/contactRoutes');
const careerRoutes  = require('./routes/careerRoutes');
const errorHandler  = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ══════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ══════════════════════════════════════════════════════════

// Helmet sets secure HTTP response headers
// Customise CSP to allow inline event handlers and module scripts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "https:"],
      connectSrc:  ["'self'"],
    },
  },
}));

// CORS — allow only the origins listed in .env
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Always allow the server's own origin so same-origin module requests work
const serverOrigin = `http://localhost:${PORT}`;
if (!allowedOrigins.includes(serverOrigin)) {
  allowedOrigins.push(serverOrigin);
}

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (e.g. same-origin, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" is not allowed.`));
  },
  methods:     ['GET', 'POST', 'OPTIONS'],
  credentials: false,
}));

// ══════════════════════════════════════════════════════════
// RATE LIMITING
// ══════════════════════════════════════════════════════════

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 min
const max      = parseInt(process.env.RATE_LIMIT_MAX,        10) || 20;

const limiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

// Apply rate limiting to all API routes only
app.use('/api', limiter);

// ══════════════════════════════════════════════════════════
// GENERAL MIDDLEWARE
// ══════════════════════════════════════════════════════════

// HTTP request logging (skip in test environments)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Parse JSON and URL-encoded bodies (for contact form)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ══════════════════════════════════════════════════════════
// SERVE FRONTEND (production)
// ══════════════════════════════════════════════════════════
// When deployed as a single server, Express serves the static
// frontend files. During development the frontend is served
// separately (e.g. Live Server on port 5500).

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// ══════════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════════

app.use('/api/contact', contactRoutes);
app.use('/api/careers', careerRoutes);

// Health-check endpoint (useful for Render / Railway / UptimeRobot)
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is running.' });
});

// ── 404 handler for unmatched routes ──
app.use('*', (req, res) => {
  res.status(404).send('404 Not Found');
});

// ══════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// Must be registered AFTER all routes.
// ══════════════════════════════════════════════════════════

app.use(errorHandler);

// ══════════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`\n🚀 Pureframe Labs backend running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app; // exported for testing
