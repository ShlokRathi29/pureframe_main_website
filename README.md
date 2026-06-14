# Pureframe Labs — Website

Production-grade website for **Pureframe Labs Pvt. Ltd.** with a Node.js/Express backend handling contact and career form submissions via Gmail SMTP (Nodemailer).

---

## Project Structure

```
pureframe-labs/
├── frontend/
│   ├── index.html          # Single-page app shell (all four pages)
│   ├── css/
│   │   ├── global.css      # Variables, resets, shared utilities, buttons, forms
│   │   ├── navbar.css      # Navigation, page-transition overlay, mobile menu
│   │   ├── footer.css      # Footer grid and social links
│   │   ├── home.css        # Hero, services, why-us, testimonials, process
│   │   ├── projects.css    # Projects page, search bar, project cards
│   │   ├── careers.css     # Careers hero, perks grid, application form
│   │   └── about.css       # About section, team grid, contact section
│   ├── js/
│   │   ├── main.js         # Entry point — imports and initialises all modules
│   │   ├── navigation.js   # SPA page transitions, navbar scroll, mobile menu
│   │   ├── animations.js   # Scroll-reveal IntersectionObserver
│   │   ├── projects.js     # Live search/filter for the projects grid
│   │   ├── contact-form.js # Contact form → fetch → POST /api/contact
│   │   └── careers-form.js # Careers form → FormData → POST /api/careers
│   └── assets/
│       ├── images/
│       ├── logos/
│       └── icons/
│
├── backend/
│   ├── server.js                       # Express app — security, middleware, routes
│   ├── routes/
│   │   ├── contactRoutes.js            # POST /api/contact
│   │   └── careerRoutes.js             # POST /api/careers (with Multer)
│   ├── controllers/
│   │   ├── contactController.js        # Validates + sends contact email
│   │   └── careerController.js         # Validates + sends career email + cleans up file
│   ├── middleware/
│   │   ├── uploadMiddleware.js         # Multer: disk storage, file filter, size limit
│   │   └── errorHandler.js             # Global Express error handler
│   ├── services/
│   │   └── emailService.js             # Nodemailer transporter + sendContactEmail/sendCareerEmail
│   ├── uploads/                        # Transient resume storage (auto-deleted after email)
│   ├── .env                            # ← copy from .env and fill in your values
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## Quick Start

### 1. Clone & install backend dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

```bash
cp .env .env          # .env is already the template — just edit it
```

Open `backend/.env` and fill in:

| Variable              | Description                                      |
|-----------------------|--------------------------------------------------|
| `PORT`                | Port the Express server listens on (default 5000)|
| `EMAIL_USER`          | Your Gmail address (e.g. `pureframelabs@gmail.com`) |
| `EMAIL_PASS`          | Gmail **App Password** (see below)               |
| `EMAIL_RECIPIENT`     | Where submissions are delivered (defaults to `EMAIL_USER`) |
| `CORS_ORIGIN`         | Comma-separated list of allowed frontend origins |
| `RATE_LIMIT_WINDOW_MS`| Rate-limit window in ms (default 900000 = 15 min)|
| `RATE_LIMIT_MAX`      | Max requests per window per IP (default 20)      |

#### Getting a Gmail App Password

1. Enable 2-Step Verification on your Google account.
2. Go to **Google Account → Security → App passwords**.
3. Create a new app password (select "Mail" and your device).
4. Paste the 16-character password as `EMAIL_PASS`.

### 3. Start the backend

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:5000` and serves the `frontend/` directory as static files.

### 4. Open the site

Navigate to `http://localhost:5000` in your browser.

For local frontend-only development (no backend), open `frontend/index.html` with VS Code Live Server on port 5500, then update `CORS_ORIGIN` in `.env` to include `http://127.0.0.1:5500`.

---

## API Reference

All endpoints return JSON.

### `POST /api/contact`

**Content-Type:** `application/json`

**Body:**

```json
{
  "fullName": "Arjun Kapoor",
  "email":    "arjun@startup.com",
  "company":  "Startup Inc.",
  "service":  "Web Application",
  "message":  "We'd love to discuss a project."
}
```

**Success `200`:**

```json
{ "success": true, "message": "Form submitted successfully" }
```

**Failure `400` / `500`:**

```json
{ "success": false, "message": "Error message" }
```

---

### `POST /api/careers`

**Content-Type:** `multipart/form-data`

**Fields:**

| Field       | Type   | Required | Notes                             |
|-------------|--------|----------|-----------------------------------|
| `firstName` | string | ✓        |                                   |
| `lastName`  | string | ✓        |                                   |
| `email`     | string | ✓        |                                   |
| `phone`     | string | ✓        |                                   |
| `role`      | string | ✓        | Dropdown value from the form      |
| `exp`       | string | ✓        | Experience level dropdown value   |
| `linkedin`  | string |          |                                   |
| `portfolio` | string |          |                                   |
| `cover`     | string |          |                                   |
| `resume`    | file   | ✓        | PDF / DOC / DOCX, max 10 MB      |

**Success `200`:**

```json
{ "success": true, "message": "Form submitted successfully" }
```

### `GET /api/health`

```json
{ "success": true, "message": "Server is running." }
```

---

## Deployment

### Render

1. Create a new **Web Service** on [render.com](https://render.com).
2. Connect your GitHub repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add all environment variables from `.env` in the **Environment** tab.
7. Set `CORS_ORIGIN` to your production domain (e.g. `https://pureframe.in`).

> For a static-file frontend on Render, create a separate **Static Site** service pointing to `frontend/`.

### Railway

1. Create a new project and connect your repository.
2. Set the service root to `backend/`.
3. Add environment variables in the **Variables** tab.
4. Railway auto-detects Node.js and runs `npm start`.

### Vercel (backend as serverless)

Vercel works best with the frontend. For the Express backend, use Render or Railway, then update `API_BASE` in `contact-form.js` and `careers-form.js` to point to the backend URL.

### VPS (Ubuntu/Debian)

```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and install
git clone https://github.com/your-org/pureframe-labs.git
cd pureframe-labs/backend
npm install --omit=dev

# Copy and configure .env
cp .env .env && nano .env

# Run with PM2
npm install -g pm2
pm2 start server.js --name pureframe-backend
pm2 save
pm2 startup
```

Configure Nginx to reverse-proxy port 5000 and serve the `frontend/` directory.

---

## Security

- **Helmet** sets secure HTTP headers (HSTS, X-Frame-Options, etc.)
- **CORS** restricts cross-origin requests to `CORS_ORIGIN` in `.env`
- **Rate limiting** — 20 API requests per IP per 15 minutes (configurable)
- **Multer** validates file type (MIME + extension) and enforces 10 MB limit
- **HTML escaping** in email bodies prevents injection attacks
- **No credentials in source** — all secrets live in `.env` (git-ignored)
- **File cleanup** — resume files are deleted from disk after email delivery

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | HTML5, CSS3 (modular), Vanilla JS (ES modules) |
| Backend   | Node.js 18+, Express 4                 |
| Email     | Nodemailer + Gmail SMTP                 |
| Upload    | Multer (disk storage)                   |
| Security  | Helmet, CORS, express-rate-limit        |
| Logging   | Morgan                                  |

---

## Contact

**Pureframe Labs Pvt. Ltd.**  
Koregaon Park, Pune, Maharashtra 411001  
pureframelabs@gmail.com
