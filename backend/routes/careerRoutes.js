/**
 * careerRoutes.js — Pureframe Labs
 * Mounts the careers / job-application route at POST /api/careers.
 * The Multer upload middleware runs before the controller so the
 * file is available on req.file by the time submitCareer() runs.
 */

const express             = require('express');
const { upload }          = require('../middleware/uploadMiddleware');
const { submitCareer }    = require('../controllers/careerController');

const router = express.Router();

// POST /api/careers
// upload.single('resume') — field name must match the FormData key in careers-form.js
router.post('/', upload.single('resume'), submitCareer);

module.exports = router;
